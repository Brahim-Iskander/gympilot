package com.gymtrack.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtrack.dto.CreateOrderRequest;
import com.gymtrack.dto.OrderItemRequest;
import com.gymtrack.dto.OrderResponse;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.dto.SellerDashboardStatsResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.Order;
import com.gymtrack.model.OrderItem;
import com.gymtrack.model.Product;
import com.gymtrack.model.User;
import com.gymtrack.repository.OrderRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    /** Standard delivery fee in TND */
    private static final double STANDARD_SHIPPING_FEE = 7.0;
    /** Orders with subtotal >= this threshold get free delivery */
    private static final double FREE_SHIPPING_THRESHOLD = 150.0;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        MailService mailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Buyer not found"));

        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new InvalidCredentialsException("Product not found: " + itemReq.productId()));

            if (!product.isActive()) {
                throw new IllegalArgumentException("Product " + product.getName() + " is currently unavailable.");
            }

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new IllegalArgumentException("Insufficient stock for " + product.getName() + " (Only " + product.getStockQuantity() + " available).");
            }

            // Deduct stock and increment units sold
            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            product.setUnitsSold(product.getUnitsSold() + itemReq.quantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0) : null,
                    product.getPrice(),
                    itemReq.quantity(),
                    product.getSellerId(),
                    product.getSellerName()
            );

            orderItems.add(orderItem);
            subtotal += orderItem.getSubtotal();
        }

        // Apply Points Discount if requested (e.g. 10 points = $1 discount, max 50% of order)
        double discountAmount = 0.0;
        int pointsToDeduct = 0;
        if (request.pointsToUse() > 0 && buyer.getPoints() > 0) {
            int availablePoints = buyer.getPoints();
            int pointsApplicable = Math.min(request.pointsToUse(), availablePoints);
            double maxDiscount = subtotal * 0.5; // Up to 50% with reward points
            double calculatedDiscount = pointsApplicable * 0.10; // 10 pts = $1

            if (calculatedDiscount > maxDiscount) {
                calculatedDiscount = maxDiscount;
                pointsToDeduct = (int) (maxDiscount / 0.10);
            } else {
                pointsToDeduct = pointsApplicable;
            }

            discountAmount = Math.round(calculatedDiscount * 100.0) / 100.0;
            buyer.setPoints(buyer.getPoints() - pointsToDeduct);
        }

        // Compute shipping fee: free if subtotal >= 150 TND, otherwise 7 TND
        double shippingFee = (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal == 0) ? 0.0 : STANDARD_SHIPPING_FEE;

        double finalTotal = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100.0) / 100.0);

        // Award 5% points reward on completed purchase
        int pointsEarned = (int) Math.round(finalTotal * 0.5); // 1 point per $2 spent
        buyer.setPoints(buyer.getPoints() + pointsEarned);
        userRepository.save(buyer);

        String orderNumber = "GP-" + (System.currentTimeMillis() % 1000000) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String buyerDisplayName = (buyer.getFirstName() + " " + (buyer.getLastName() != null ? buyer.getLastName() : "")).trim();

        Order order = new Order(
                orderNumber,
                buyer.getId(),
                buyerDisplayName,
                buyer.getEmail(),
                orderItems,
                finalTotal,
                discountAmount,
                pointsToDeduct,
                request.shippingAddress(),
                request.paymentMethod() != null ? request.paymentMethod() : "CASH_ON_DELIVERY"
        );
        order.setShippingFee(shippingFee);
        order.setPointsEarned(pointsEarned);
        order.setNotes(request.notes());

        Order saved = orderRepository.save(order);
        log.info("Created order {} for user {} with total {} TND (shipping: {} TND)", orderNumber, buyerEmail, finalTotal, shippingFee);

        // Send order confirmation email asynchronously (failure should not break order)
        try {
            mailService.sendOrderConfirmationEmail(saved);
        } catch (Exception ex) {
            log.error("Failed to send order confirmation email for order {}: {}", orderNumber, ex.getMessage());
        }

        return OrderResponse.from(saved);
    }

    public PagedResponse<OrderResponse> getBuyerOrders(String buyerEmail, int page, int size) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageRequest);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    public OrderResponse getOrderById(String orderId, String userEmail, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new InvalidCredentialsException("Order not found: " + orderId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSellerOfItem = order.getItems().stream().anyMatch(i -> user.getId().equals(i.getSellerId()));

        if (!isAdmin && !isBuyer && !isSellerOfItem) {
            throw new IllegalArgumentException("You are not authorized to view this order.");
        }

        return OrderResponse.from(order);
    }

    public PagedResponse<OrderResponse> getSellerOrders(String sellerEmail, int page, int size) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findOrdersBySellerId(seller.getId(), pageRequest);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    public OrderResponse updateOrderStatus(String orderId, String status, String notes, String userEmail, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new InvalidCredentialsException("Order not found: " + orderId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        boolean isSellerOfItem = order.getItems().stream().anyMatch(i -> user.getId().equals(i.getSellerId()));

        if (!isAdmin && !isSellerOfItem) {
            throw new IllegalArgumentException("You are not authorized to update this order's status.");
        }

        order.setStatus(status.toUpperCase());
        if (notes != null && !notes.isBlank()) {
            order.setNotes(notes);
        }
        if ("DELIVERED".equalsIgnoreCase(status)) {
            order.setPaymentStatus("PAID");
        }
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);
        log.info("Updated order {} status to {}", order.getOrderNumber(), status.toUpperCase());
        return OrderResponse.from(saved);
    }

    public SellerDashboardStatsResponse getSellerStats(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        String sellerId = seller.getId();

        long totalProducts = productRepository.countBySellerId(sellerId);
        long activeProducts = productRepository.countBySellerIdAndActiveTrue(sellerId);
        long outOfStock = productRepository.countBySellerIdAndStockQuantityLessThanEqual(sellerId, 0);

        List<Order> allOrders = orderRepository.findAllOrdersBySellerId(sellerId);
        long totalOrders = allOrders.size();

        double totalRevenue = 0.0;
        double thisMonthRevenue = 0.0;

        Instant monthStart = Instant.now().minus(30, ChronoUnit.DAYS);

        for (Order o : allOrders) {
            for (OrderItem item : o.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    totalRevenue += item.getSubtotal();
                    if (o.getCreatedAt() != null && o.getCreatedAt().isAfter(monthStart)) {
                        thisMonthRevenue += item.getSubtotal();
                    }
                }
            }
        }

        // Find best selling product
        List<Product> products = productRepository.findBySellerId(sellerId);
        String bestSellingProduct = products.stream()
                .max((p1, p2) -> Integer.compare(p1.getUnitsSold(), p2.getUnitsSold()))
                .map(Product::getName)
                .orElse("None yet");

        // Top 5 recent orders
        PageRequest pr = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<OrderResponse> recentOrders = orderRepository.findOrdersBySellerId(sellerId, pr).getContent().stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());

        return new SellerDashboardStatsResponse(
                totalProducts,
                activeProducts,
                outOfStock,
                totalOrders,
                Math.round(totalRevenue * 100.0) / 100.0,
                Math.round(thisMonthRevenue * 100.0) / 100.0,
                bestSellingProduct,
                recentOrders
        );
    }
}
