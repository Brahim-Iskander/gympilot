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
    private final VoucherService voucherService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        MailService mailService,
                        VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.voucherService = voucherService;
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

        // Apply Voucher Discount if provided (optional)
        String appliedVoucherCode = null;
        if (request.voucherCode() != null && !request.voucherCode().isBlank()) {
            double voucherDiscount = voucherService.applyAndConsumeVoucher(request.voucherCode(), subtotal);
            appliedVoucherCode = request.voucherCode().trim().toUpperCase();
            discountAmount = Math.round((discountAmount + voucherDiscount) * 100.0) / 100.0;
            if (discountAmount > subtotal) {
                discountAmount = subtotal;
            }
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
        order.setVoucherCode(appliedVoucherCode);
        order.setPointsEarned(pointsEarned);
        order.setNotes(request.notes());

        if ("D17".equalsIgnoreCase(request.paymentMethod())) {
            order.setPaymentStatus("PENDING_VERIFICATION");
            order.setStatus("PENDING_VERIFICATION");
        }

        Order saved = orderRepository.save(order);
        log.info("Created order {} for user {} with total {} TND (shipping: {} TND)", orderNumber, buyerEmail, finalTotal, shippingFee);

        // Send order confirmation email to buyer asynchronously (failure should not break order)
        try {
            mailService.sendOrderConfirmationEmail(saved);
        } catch (Exception ex) {
            log.error("Failed to send order confirmation email for order {}: {}", orderNumber, ex.getMessage());
        }

        // Send notification email to each seller involved in this order
        try {
            // Group items by sellerId
            java.util.Map<String, List<OrderItem>> itemsBySeller = saved.getItems().stream()
                    .filter(item -> item.getSellerId() != null && !item.getSellerId().isBlank())
                    .collect(Collectors.groupingBy(OrderItem::getSellerId));

            for (var entry : itemsBySeller.entrySet()) {
                String sellerId = entry.getKey();
                List<OrderItem> sellerItems = entry.getValue();

                userRepository.findById(sellerId).ifPresentOrElse(
                    seller -> {
                        String sellerDisplayName = seller.getStoreName() != null && !seller.getStoreName().isBlank()
                                ? seller.getStoreName()
                                : (seller.getFirstName() + " " + (seller.getLastName() != null ? seller.getLastName() : "")).trim();
                        mailService.sendNewOrderNotificationToSeller(saved, seller.getEmail(), sellerDisplayName, sellerItems);
                        log.info("Queued seller notification email for order {} to seller {} ({})", orderNumber, sellerId, seller.getEmail());
                    },
                    () -> log.warn("Seller {} not found for order {} notification", sellerId, orderNumber)
                );
            }
        } catch (Exception ex) {
            log.error("Failed to send seller notification emails for order {}: {}", orderNumber, ex.getMessage());
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

        var totalProductsFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> productRepository.countBySellerId(sellerId));
        var activeProductsFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> productRepository.countBySellerIdAndActiveTrue(sellerId));
        var outOfStockFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> productRepository.countBySellerIdAndStockQuantityLessThanEqual(sellerId, 0));
        var allOrdersFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> orderRepository.findAllOrdersBySellerId(sellerId));
        var productsFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> productRepository.findBySellerId(sellerId));

        PageRequest pr = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        var recentOrdersFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> orderRepository.findOrdersBySellerId(sellerId, pr));

        java.util.concurrent.CompletableFuture.allOf(
                totalProductsFuture, activeProductsFuture, outOfStockFuture, allOrdersFuture, productsFuture, recentOrdersFuture
        ).join();

        long totalProducts = totalProductsFuture.join();
        long activeProducts = activeProductsFuture.join();
        long outOfStock = outOfStockFuture.join();

        List<Order> allOrders = allOrdersFuture.join();
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
        List<Product> products = productsFuture.join();
        String bestSellingProduct = products.stream()
                .max((p1, p2) -> Integer.compare(p1.getUnitsSold(), p2.getUnitsSold()))
                .map(Product::getName)
                .orElse("None yet");

        List<OrderResponse> recentOrders = recentOrdersFuture.join().getContent().stream()
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

    public Order markOrderPaidByD17(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new InvalidCredentialsException("Order not found: " + orderId));
        order.setPaymentStatus("PAID");
        order.setStatus("PROCESSING");
        order.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(order);
        log.info("Order {} marked as PAID via D17 verification", order.getOrderNumber());
        return saved;
    }

    public Order markOrderD17Rejected(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new InvalidCredentialsException("Order not found: " + orderId));
        order.setPaymentStatus("FAILED");
        order.setStatus("PAYMENT_FAILED");
        if (reason != null && !reason.isBlank()) {
            String currentNotes = order.getNotes() != null ? order.getNotes() + " | " : "";
            order.setNotes(currentNotes + "D17 payment verification rejected: " + reason);
        }
        order.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(order);
        log.info("Order {} payment rejected: {}", order.getOrderNumber(), reason);
        return saved;
    }
}
