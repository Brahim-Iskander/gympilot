package com.gymtrack.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.AdminSellerOverviewResponse;
import com.gymtrack.dto.RecordPayoutRequest;
import com.gymtrack.dto.SellerEarningsDetailResponse;
import com.gymtrack.dto.SellerEarningsSummaryResponse;
import com.gymtrack.dto.SellerOrderTransactionResponse;
import com.gymtrack.dto.SellerProductSaleSummary;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.Order;
import com.gymtrack.model.OrderItem;
import com.gymtrack.model.Product;
import com.gymtrack.model.SellerPayout;
import com.gymtrack.model.User;
import com.gymtrack.repository.OrderRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.SellerPayoutRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class SellerEarningsService {

    private static final Logger log = LoggerFactory.getLogger(SellerEarningsService.class);
    private static final double DEFAULT_COMMISSION_RATE = 10.0;

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SellerPayoutRepository sellerPayoutRepository;

    public SellerEarningsService(UserRepository userRepository,
                                 OrderRepository orderRepository,
                                 ProductRepository productRepository,
                                 SellerPayoutRepository sellerPayoutRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.sellerPayoutRepository = sellerPayoutRepository;
    }

    /**
     * Compute platform-wide overview and per-seller earnings summaries.
     */
    public AdminSellerOverviewResponse getOverview(String period, String sort, String search) {
        Instant periodStart = calculatePeriodStart(period);
        Map<String, User> sellerMap = findAllKnownSellers();

        List<Order> allOrders = orderRepository.findAll();
        List<SellerPayout> allPayouts = sellerPayoutRepository.findAllByOrderByCreatedAtDesc();

        Map<String, List<SellerPayout>> payoutsBySeller = allPayouts.stream()
                .collect(Collectors.groupingBy(SellerPayout::getSellerId));

        List<SellerEarningsSummaryResponse> summaries = new ArrayList<>();

        for (Map.Entry<String, User> entry : sellerMap.entrySet()) {
            String sellerId = entry.getKey();
            User user = entry.getValue();

            SellerMetrics metrics = calculateSellerMetrics(sellerId, user, allOrders, periodStart, payoutsBySeller.getOrDefault(sellerId, Collections.emptyList()));

            // Optional search filter
            if (search != null && !search.isBlank()) {
                String q = search.trim().toLowerCase();
                boolean matchesName = (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(q)) ||
                                      (user.getLastName() != null && user.getLastName().toLowerCase().contains(q));
                boolean matchesEmail = user.getEmail() != null && user.getEmail().toLowerCase().contains(q);
                boolean matchesStore = user.getStoreName() != null && user.getStoreName().toLowerCase().contains(q);

                if (!matchesName && !matchesEmail && !matchesStore) {
                    continue;
                }
            }

            summaries.add(metrics.toSummary());
        }

        // Sorting
        applySorting(summaries, sort);

        // Platform-wide totals
        double totalPlatformGross = round(summaries.stream().mapToDouble(SellerEarningsSummaryResponse::grossRevenue).sum());
        double totalPlatformCommission = round(summaries.stream().mapToDouble(SellerEarningsSummaryResponse::platformCommission).sum());
        double totalNetSellerPayouts = round(summaries.stream().mapToDouble(SellerEarningsSummaryResponse::netEarnings).sum());
        double totalPaidOut = round(summaries.stream().mapToDouble(SellerEarningsSummaryResponse::totalPaidOut).sum());
        double totalPending = round(summaries.stream().mapToDouble(SellerEarningsSummaryResponse::pendingPayout).sum());
        long totalActiveSellers = summaries.stream().filter(s -> !s.banned()).count();
        long totalProductsSold = summaries.stream().mapToLong(SellerEarningsSummaryResponse::totalUnitsSold).sum();

        return new AdminSellerOverviewResponse(
                totalPlatformGross,
                totalPlatformCommission,
                totalNetSellerPayouts,
                totalPaidOut,
                totalPending,
                totalActiveSellers,
                totalProductsSold,
                summaries
        );
    }

    /**
     * Deep dive detail for a single seller, including products breakdown, order transactions, and payout history.
     */
    public SellerEarningsDetailResponse getSellerDetail(String sellerId, String period) {
        User user = resolveSellerUser(sellerId);
        Instant periodStart = calculatePeriodStart(period);

        List<Order> sellerOrders = orderRepository.findAllOrdersBySellerId(sellerId);
        List<SellerPayout> payouts = sellerPayoutRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);

        SellerMetrics metrics = calculateSellerMetrics(sellerId, user, sellerOrders, periodStart, payouts);
        SellerEarningsSummaryResponse summary = metrics.toSummary();

        // Build product breakdown
        List<SellerProductSaleSummary> products = new ArrayList<>(metrics.productSalesMap.values());
        products.sort((a, b) -> Double.compare(b.totalRevenue(), a.totalRevenue()));

        // Build transaction responses
        List<SellerOrderTransactionResponse> transactions = new ArrayList<>(metrics.transactions);
        transactions.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));

        return new SellerEarningsDetailResponse(summary, products, transactions, payouts);
    }

    /**
     * Record a payout made to a seller by admin.
     */
    public SellerPayout recordPayout(String sellerId, RecordPayoutRequest request, String adminEmail) {
        User user = resolveSellerUser(sellerId);

        String sellerName = (user.getFirstName() != null ? user.getFirstName() + " " : "") +
                            (user.getLastName() != null ? user.getLastName() : "");
        if (sellerName.isBlank() && user.getStoreName() != null) {
            sellerName = user.getStoreName();
        }

        SellerPayout payout = new SellerPayout(
                sellerId,
                sellerName.trim(),
                user.getEmail(),
                round(request.amount()),
                request.paymentMethod(),
                request.referenceNumber(),
                request.notes(),
                adminEmail != null ? adminEmail : "admin@gympilot.com"
        );

        SellerPayout saved = sellerPayoutRepository.save(payout);
        log.info("Admin {} recorded payout of {} TND for seller {}", adminEmail, saved.getAmount(), sellerId);
        return saved;
    }

    /**
     * Update seller's custom commission rate.
     */
    public User updateCommissionRate(String sellerId, double commissionRate) {
        User user = userRepository.findById(sellerId)
                .orElseThrow(() -> new InvalidCredentialsException("Seller user not found: " + sellerId));

        user.setCommissionRate(commissionRate);
        User saved = userRepository.save(user);
        log.info("Updated commission rate for seller {} ({}) to {}%", sellerId, saved.getEmail(), commissionRate);
        return saved;
    }

    // ---------------- Helper Methods ----------------

    private Instant calculatePeriodStart(String period) {
        if (period == null || period.isBlank() || "all".equalsIgnoreCase(period)) {
            return null;
        }
        Instant now = Instant.now();
        return switch (period.toLowerCase()) {
            case "today" -> now.truncatedTo(ChronoUnit.DAYS);
            case "week" -> now.minus(7, ChronoUnit.DAYS);
            case "month" -> now.minus(30, ChronoUnit.DAYS);
            case "year" -> now.minus(365, ChronoUnit.DAYS);
            default -> null;
        };
    }

    private Map<String, User> findAllKnownSellers() {
        Map<String, User> sellerMap = new HashMap<>();

        // 1. All users with SELLER role
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (u.isSeller() || (u.getRoles() != null && u.getRoles().contains("SELLER")) || "SELLER".equalsIgnoreCase(u.getRole())) {
                sellerMap.put(u.getId(), u);
            }
        }

        // 2. Discover any additional seller IDs referenced in products
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            if (p.getSellerId() != null && !sellerMap.containsKey(p.getSellerId())) {
                Optional<User> uOpt = userRepository.findById(p.getSellerId());
                if (uOpt.isPresent()) {
                    sellerMap.put(p.getSellerId(), uOpt.get());
                } else {
                    // Fallback synthetic seller record if external/official seeder
                    User synthetic = createSyntheticSeller(p.getSellerId(), p.getSellerName(), p.getSellerStoreName(), p.getSellerStoreLogo());
                    sellerMap.put(p.getSellerId(), synthetic);
                }
            }
        }

        return sellerMap;
    }

    private User resolveSellerUser(String sellerId) {
        Optional<User> opt = userRepository.findById(sellerId);
        if (opt.isPresent()) {
            return opt.get();
        }

        // Try lookup by official store or product seller info
        List<Product> products = productRepository.findBySellerId(sellerId);
        if (!products.isEmpty()) {
            Product p = products.get(0);
            return createSyntheticSeller(sellerId, p.getSellerName(), p.getSellerStoreName(), p.getSellerStoreLogo());
        }

        throw new InvalidCredentialsException("Seller not found: " + sellerId);
    }

    private User createSyntheticSeller(String id, String sellerName, String storeName, String storeLogo) {
        User u = new User();
        u.setId(id);
        u.setFirstName(sellerName != null ? sellerName : "Seller");
        u.setLastName("");
        u.setEmail(id.contains("@") ? id : id + "@gympilot-seller.com");
        u.setStoreName(storeName != null ? storeName : "Official Store");
        u.setStoreLogo(storeLogo);
        u.setRole("SELLER");
        u.setRoles(new HashSet<>(Set.of("SELLER")));
        u.setCreatedAt(Instant.now().minus(90, ChronoUnit.DAYS));
        return u;
    }

    private SellerMetrics calculateSellerMetrics(String sellerId, User user, List<Order> orders, Instant periodStart, List<SellerPayout> payouts) {
        SellerMetrics m = new SellerMetrics();
        m.sellerId = sellerId;
        m.user = user;
        m.commissionRate = user.getCommissionRate() != null ? user.getCommissionRate() : DEFAULT_COMMISSION_RATE;

        Set<String> processedOrderIds = new HashSet<>();

        for (Order o : orders) {
            // Check date filter
            if (periodStart != null && o.getCreatedAt() != null && o.getCreatedAt().isBefore(periodStart)) {
                continue;
            }

            // Check if this order has items for this seller
            List<OrderItem> sellerItems = new ArrayList<>();
            double orderSellerRevenue = 0.0;
            int orderSellerUnits = 0;

            for (OrderItem item : o.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    sellerItems.add(item);
                    orderSellerRevenue += item.getSubtotal();
                    orderSellerUnits += item.getQuantity();
                }
            }

            if (sellerItems.isEmpty()) {
                continue;
            }

            boolean isCancelled = "CANCELLED".equalsIgnoreCase(o.getStatus()) || "REFUNDED".equalsIgnoreCase(o.getPaymentStatus());

            if (isCancelled) {
                m.cancelledOrdersCount++;
                m.refundedAmount += orderSellerRevenue;
            } else {
                m.totalOrdersCount++;
                m.grossRevenue += orderSellerRevenue;
                m.totalUnitsSold += orderSellerUnits;

                if (o.getCreatedAt() != null) {
                    if (m.lastSaleAt == null || o.getCreatedAt().isAfter(m.lastSaleAt)) {
                        m.lastSaleAt = o.getCreatedAt();
                    }
                }

                // Aggregate product sales breakdown
                for (OrderItem item : sellerItems) {
                    String pKey = item.getProductId() != null ? item.getProductId() : item.getProductName();
                    SellerProductSaleSummary existing = m.productSalesMap.get(pKey);
                    if (existing == null) {
                        m.productSalesMap.put(pKey, new SellerProductSaleSummary(
                                item.getProductId(),
                                item.getProductName(),
                                item.getProductImage(),
                                item.getPrice(),
                                item.getQuantity(),
                                round(item.getSubtotal())
                        ));
                    } else {
                        m.productSalesMap.put(pKey, new SellerProductSaleSummary(
                                existing.productId(),
                                existing.productName(),
                                existing.productImage() != null ? existing.productImage() : item.getProductImage(),
                                item.getPrice(),
                                existing.unitsSold() + item.getQuantity(),
                                round(existing.totalRevenue() + item.getSubtotal())
                        ));
                    }
                }
            }

            double orderCommission = round(orderSellerRevenue * (m.commissionRate / 100.0));
            double orderNet = round(orderSellerRevenue - orderCommission);

            m.transactions.add(new SellerOrderTransactionResponse(
                    o.getId(),
                    o.getOrderNumber(),
                    o.getCreatedAt() != null ? o.getCreatedAt() : Instant.now(),
                    o.getBuyerName(),
                    o.getBuyerEmail(),
                    o.getStatus(),
                    o.getPaymentStatus(),
                    o.getPaymentMethod(),
                    sellerItems,
                    orderSellerUnits,
                    round(orderSellerRevenue),
                    orderCommission,
                    orderNet,
                    isCancelled
            ));
        }

        m.grossRevenue = round(m.grossRevenue);
        m.refundedAmount = round(m.refundedAmount);
        m.platformCommission = round(m.grossRevenue * (m.commissionRate / 100.0));
        m.netEarnings = round(m.grossRevenue - m.platformCommission);

        m.totalPaidOut = round(payouts.stream().mapToDouble(SellerPayout::getAmount).sum());
        m.pendingPayout = Math.max(0.0, round(m.netEarnings - m.totalPaidOut));

        return m;
    }

    private void applySorting(List<SellerEarningsSummaryResponse> list, String sort) {
        if (sort == null || sort.isBlank() || "revenue_desc".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparingDouble(SellerEarningsSummaryResponse::grossRevenue).reversed());
        } else if ("revenue_asc".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparingDouble(SellerEarningsSummaryResponse::grossRevenue));
        } else if ("sales_desc".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparingLong(SellerEarningsSummaryResponse::totalUnitsSold).reversed());
        } else if ("orders_desc".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparingLong(SellerEarningsSummaryResponse::totalOrdersCount).reversed());
        } else if ("pending_desc".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparingDouble(SellerEarningsSummaryResponse::pendingPayout).reversed());
        } else if ("newest".equalsIgnoreCase(sort)) {
            list.sort((a, b) -> {
                if (a.joinedAt() == null && b.joinedAt() == null) return 0;
                if (a.joinedAt() == null) return 1;
                if (b.joinedAt() == null) return -1;
                return b.joinedAt().compareTo(a.joinedAt());
            });
        }
    }

    private static double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private static class SellerMetrics {
        String sellerId;
        User user;
        double commissionRate;
        long totalOrdersCount = 0;
        long totalUnitsSold = 0;
        double grossRevenue = 0.0;
        double platformCommission = 0.0;
        double netEarnings = 0.0;
        double totalPaidOut = 0.0;
        double pendingPayout = 0.0;
        long cancelledOrdersCount = 0;
        double refundedAmount = 0.0;
        Instant lastSaleAt = null;

        Map<String, SellerProductSaleSummary> productSalesMap = new HashMap<>();
        List<SellerOrderTransactionResponse> transactions = new ArrayList<>();

        SellerEarningsSummaryResponse toSummary() {
            String sellerName = ((user.getFirstName() != null ? user.getFirstName() + " " : "") +
                                (user.getLastName() != null ? user.getLastName() : "")).trim();
            if (sellerName.isBlank() && user.getStoreName() != null) {
                sellerName = user.getStoreName();
            }

            return new SellerEarningsSummaryResponse(
                    sellerId,
                    sellerName,
                    user.getEmail(),
                    user.getPhone(),
                    user.getStoreName(),
                    user.getStoreBio(),
                    user.getStoreLogo(),
                    user.getAvatar(),
                    user.isVerified(),
                    user.isBanned(),
                    user.getCreatedAt(),
                    lastSaleAt,
                    totalOrdersCount,
                    totalUnitsSold,
                    grossRevenue,
                    commissionRate,
                    platformCommission,
                    netEarnings,
                    totalPaidOut,
                    pendingPayout,
                    cancelledOrdersCount,
                    refundedAmount
            );
        }
    }
}
