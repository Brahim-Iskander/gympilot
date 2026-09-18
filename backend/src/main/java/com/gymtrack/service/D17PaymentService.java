package com.gymtrack.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtrack.dto.payment.ApprovePaymentRequest;
import com.gymtrack.dto.payment.D17ConfigResponse;
import com.gymtrack.dto.payment.D17PaymentResponse;
import com.gymtrack.dto.payment.RejectPaymentRequest;
import com.gymtrack.dto.payment.SubmitD17PaymentRequest;
import com.gymtrack.dto.ticket.TicketReplyRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.D17PaymentTicket;
import com.gymtrack.model.Order;
import com.gymtrack.model.SupportTicket;
import com.gymtrack.model.User;
import com.gymtrack.repository.D17PaymentTicketRepository;
import com.gymtrack.repository.OrderRepository;
import com.gymtrack.repository.SupportTicketRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class D17PaymentService {

    private static final Logger log = LoggerFactory.getLogger(D17PaymentService.class);

    private final D17PaymentTicketRepository paymentRepo;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SupportTicketRepository supportTicketRepo;
    private final SupportTicketService supportTicketService;
    private final MembershipService membershipService;
    private final OrderService orderService;
    private final SystemSettingService settingService;
    private final MailService mailService;
    private final CloudinaryService cloudinaryService;
    private final AiCreditService aiCreditService;
    private final PaymentConfigService paymentConfigService;

    public D17PaymentService(D17PaymentTicketRepository paymentRepo,
                             OrderRepository orderRepository,
                             UserRepository userRepository,
                             SupportTicketRepository supportTicketRepo,
                             SupportTicketService supportTicketService,
                             MembershipService membershipService,
                             OrderService orderService,
                             SystemSettingService settingService,
                             MailService mailService,
                             CloudinaryService cloudinaryService,
                             AiCreditService aiCreditService) {
        this(paymentRepo, orderRepository, userRepository, supportTicketRepo, supportTicketService,
                membershipService, orderService, settingService, mailService, cloudinaryService,
                aiCreditService, null);
    }

    @Autowired
    public D17PaymentService(D17PaymentTicketRepository paymentRepo,
                             OrderRepository orderRepository,
                             UserRepository userRepository,
                             SupportTicketRepository supportTicketRepo,
                             SupportTicketService supportTicketService,
                             MembershipService membershipService,
                             OrderService orderService,
                             SystemSettingService settingService,
                             MailService mailService,
                             CloudinaryService cloudinaryService,
                             AiCreditService aiCreditService,
                             @Autowired(required = false) PaymentConfigService paymentConfigService) {
        this.paymentRepo = paymentRepo;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.supportTicketRepo = supportTicketRepo;
        this.supportTicketService = supportTicketService;
        this.membershipService = membershipService;
        this.orderService = orderService;
        this.settingService = settingService;
        this.mailService = mailService;
        this.cloudinaryService = cloudinaryService;
        this.aiCreditService = aiCreditService;
        this.paymentConfigService = paymentConfigService;
    }

    /**
     * Get public / dynamic D17 payment configuration.
     */
    public D17ConfigResponse getConfig() {
        return new D17ConfigResponse(
                settingService.getD17PhoneNumber(),
                settingService.getD17RecipientName(),
                settingService.getD17Instructions(),
                48,
                "TND"
        );
    }

    /**
     * Submit a manual payment proof (D17, USDT TRC20, BTC, ETH).
     */
    @Transactional
    public D17PaymentResponse submitPayment(User user, SubmitD17PaymentRequest req) {
        String paymentMethod = (req.paymentMethod() != null && !req.paymentMethod().isBlank())
                ? req.paymentMethod().trim().toUpperCase()
                : "D17";

        boolean isCrypto = !"D17".equals(paymentMethod);

        if (isCrypto) {
            boolean hasScreenshot = req.screenshotBase64() != null && !req.screenshotBase64().isBlank();
            boolean hasTxid = req.txid() != null && !req.txid().isBlank();
            if (!hasScreenshot && !hasTxid) {
                throw new IllegalArgumentException("For cryptocurrency payments, please provide a payment screenshot and/or transaction hash (TXID).");
            }
            if (hasScreenshot) {
                validateImage(req.screenshotBase64(), req.screenshotType());
            }
        } else {
            validateImage(req.screenshotBase64(), req.screenshotType());
        }

        String type = req.type().trim().toUpperCase();
        if (!"SUBSCRIPTION".equals(type) && !"ORDER".equals(type) && !"AI_CREDIT".equals(type)) {
            throw new IllegalArgumentException("Invalid payment type. Must be SUBSCRIPTION, ORDER, or AI_CREDIT.");
        }

        String orderId = null;
        String orderNumber = null;
        String subscriptionTier = null;
        int aiCredits = 0;

        // 1. Validate & Check Duplicates
        if ("ORDER".equals(type)) {
            if (req.orderId() == null || req.orderId().isBlank()) {
                throw new IllegalArgumentException("orderId is required for order payments.");
            }
            Order order = orderRepository.findById(req.orderId())
                    .orElseThrow(() -> new InvalidCredentialsException("Order not found: " + req.orderId()));

            // Ensure caller owns this order
            if (!order.getBuyerId().equals(user.getId())) {
                throw new IllegalArgumentException("You are not authorized to submit payment for this order.");
            }

            // Check duplicate submission
            if (paymentRepo.existsByUserIdAndOrderIdAndStatus(user.getId(), order.getId(), "PENDING_VERIFICATION")) {
                throw new IllegalStateException("A verification request is already pending for Order " + order.getOrderNumber() + ". Please wait for our team to verify it.");
            }

            orderId = order.getId();
            orderNumber = order.getOrderNumber();

            // Update order status to reflect pending payment verification
            order.setPaymentMethod(paymentMethod);
            order.setPaymentStatus("PENDING_VERIFICATION");
            order.setStatus("PENDING_VERIFICATION");
            orderRepository.save(order);

        } else if ("AI_CREDIT".equals(type)) {
            aiCredits = (req.aiCredits() != null && req.aiCredits() > 0) ? req.aiCredits() : 3;
        } else {
            if (req.subscriptionTier() == null || req.subscriptionTier().isBlank()) {
                throw new IllegalArgumentException("subscriptionTier is required for subscription payments (BASIC or PREMIUM).");
            }
            subscriptionTier = req.subscriptionTier().trim().toUpperCase();
            if (!"BASIC".equals(subscriptionTier) && !"PREMIUM".equals(subscriptionTier)) {
                throw new IllegalArgumentException("Invalid subscription tier. Choose BASIC or PREMIUM.");
            }

            // Check duplicate submission
            if (paymentRepo.existsByUserIdAndTypeAndSubscriptionTierAndStatus(
                    user.getId(), "SUBSCRIPTION", subscriptionTier, "PENDING_VERIFICATION")) {
                throw new IllegalStateException("You already have a pending verification request for the " + subscriptionTier + " plan. Our team will verify it within 24-48h.");
            }

            // Mark user status
            user.setMembershipStatus("PENDING_VERIFICATION");
            userRepository.save(user);
        }

        // 2. Generate unique human-readable ticket number
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shortId = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String prefix = "D17";
        if ("USDT_TRC20".equals(paymentMethod) || "USDT".equals(paymentMethod)) {
            prefix = "USDT";
        } else if ("BTC".equals(paymentMethod)) {
            prefix = "BTC";
        } else if ("ETH".equals(paymentMethod)) {
            prefix = "ETH";
        }
        String ticketNumber = prefix + "-" + dateStr + "-" + shortId;

        // 3. Optional Cloudinary upload (if configured, else keep base64)
        String screenshotUrl = null;
        if (cloudinaryService.isConfigured() && req.screenshotBase64() != null && !req.screenshotBase64().isBlank()) {
            try {
                String folder = isCrypto ? "gympilot/crypto_payments" : "gympilot/d17_payments";
                screenshotUrl = cloudinaryService.uploadBase64Image(req.screenshotBase64(), folder);
            } catch (Exception e) {
                log.warn("Cloudinary upload failed for payment, falling back to embedded data: {}", e.getMessage());
            }
        }

        // 4. Create Payment Record
        String userFullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
        D17PaymentTicket ticket = new D17PaymentTicket(
                ticketNumber,
                user.getId(),
                userFullName,
                user.getEmail(),
                user.getPhone(),
                type,
                orderId,
                orderNumber,
                subscriptionTier,
                req.amount(),
                req.senderPhoneNumber(),
                req.userNotes(),
                req.screenshotBase64(),
                req.screenshotType() != null ? req.screenshotType() : "image/jpeg"
        );

        ticket.setPaymentMethod(paymentMethod);
        String currency = isCrypto ? "USD" : "TND";
        ticket.setCurrency(currency);

        if (req.txid() != null && !req.txid().isBlank()) {
            ticket.setTxid(req.txid().trim());
        }
        if (req.walletAddress() != null && !req.walletAddress().isBlank()) {
            ticket.setWalletAddress(req.walletAddress().trim());
        }
        if (req.cryptoAmount() != null && !req.cryptoAmount().isBlank()) {
            ticket.setCryptoAmount(req.cryptoAmount().trim());
        }
        if (screenshotUrl != null) {
            ticket.setScreenshotUrl(screenshotUrl);
        }
        if ("AI_CREDIT".equals(type)) {
            ticket.setAiCredits(aiCredits);
        }

        // Add initial audit entry
        String displayMethod = isCrypto ? paymentMethod.replace("_", " ") : "D17";
        ticket.addAuditLog(null, "PENDING_VERIFICATION", user.getId(), user.getEmail(), "SUBMITTED",
                "Payment proof (" + displayMethod + ") of " + req.amount() + " " + currency + " submitted by customer.");

        // 5. Automatically create linked SupportTicket for unified customer experience
        try {
            String targetLabel = "SUBSCRIPTION".equals(type)
                    ? ("Subscription Upgrade (" + subscriptionTier + ")")
                    : ("AI_CREDIT".equals(type)
                    ? (aiCredits + " AI Credits Pack")
                    : ("Order #" + orderNumber));
            String subject = "[" + displayMethod + " Payment] " + targetLabel + " - " + String.format("%.2f", req.amount()) + " " + currency;

            StringBuilder msgBuilder = new StringBuilder();
            msgBuilder.append(displayMethod).append(" manual payment submitted for verification.\n\n");
            msgBuilder.append("• Ticket Reference: ").append(ticketNumber).append("\n");
            msgBuilder.append("• Method: ").append(displayMethod).append("\n");
            msgBuilder.append("• Type: ").append(type).append("\n");
            if ("SUBSCRIPTION".equals(type)) {
                msgBuilder.append("• Plan: ").append(subscriptionTier).append("\n");
            } else if ("AI_CREDIT".equals(type)) {
                msgBuilder.append("• AI Credits: ").append(aiCredits).append(" Scans\n");
            } else {
                msgBuilder.append("• Order: #").append(orderNumber).append("\n");
            }
            msgBuilder.append("• Amount: ").append(String.format("%.2f", req.amount())).append(" ").append(currency).append("\n");
            if (ticket.getCryptoAmount() != null) {
                msgBuilder.append("• Crypto Amount: ").append(ticket.getCryptoAmount()).append("\n");
            }
            if (ticket.getWalletAddress() != null) {
                msgBuilder.append("• Receiving Address/Phone: ").append(ticket.getWalletAddress()).append("\n");
            }
            if (ticket.getTxid() != null) {
                msgBuilder.append("• Transaction Hash (TXID): ").append(ticket.getTxid()).append("\n");
                if ("USDT_TRC20".equalsIgnoreCase(paymentMethod)) {
                    msgBuilder.append("• Explorer: https://tronscan.org/#/transaction/").append(ticket.getTxid()).append("\n");
                } else if ("BTC".equalsIgnoreCase(paymentMethod)) {
                    msgBuilder.append("• Explorer: https://www.blockchain.com/explorer/transactions/btc/").append(ticket.getTxid()).append("\n");
                } else if ("ETH".equalsIgnoreCase(paymentMethod)) {
                    msgBuilder.append("• Explorer: https://etherscan.io/tx/").append(ticket.getTxid()).append("\n");
                }
            }
            if (req.senderPhoneNumber() != null && !req.senderPhoneNumber().isBlank()) {
                msgBuilder.append("• Sender Phone: ").append(req.senderPhoneNumber()).append("\n");
            }
            if (req.userNotes() != null && !req.userNotes().isBlank()) {
                msgBuilder.append("• User Note / Ref: ").append(req.userNotes()).append("\n");
            }
            msgBuilder.append("\nPayment verification turnaround is within 24-48 hours.");

            SupportTicket supportTicket = new SupportTicket(
                    user.getId(),
                    userFullName,
                    user.getEmail(),
                    subject,
                    "PAYMENT",
                    msgBuilder.toString(),
                    req.screenshotBase64(),
                    req.screenshotType() != null ? req.screenshotType() : "image/jpeg"
            );
            supportTicket = supportTicketRepo.save(supportTicket);
            ticket.setSupportTicketId(supportTicket.getId());
        } catch (Exception ex) {
            log.error("Failed to create linked support ticket for payment {}: {}", ticketNumber, ex.getMessage());
        }

        D17PaymentTicket savedTicket = paymentRepo.save(ticket);
        log.info("{} Payment ticket {} created for user {} (amount: {} {}, type: {})",
                displayMethod, ticketNumber, user.getEmail(), req.amount(), currency, type);

        // 6. Send email confirmation to user
        try {
            if (isCrypto) {
                mailService.sendManualPaymentProofReceived(
                        user.getEmail(),
                        user.getFirstName(),
                        ticketNumber,
                        req.amount(),
                        currency,
                        type,
                        displayMethod
                );
            } else {
                mailService.sendD17PaymentProofReceived(
                        user.getEmail(),
                        user.getFirstName(),
                        ticketNumber,
                        req.amount(),
                        type
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to send payment confirmation email: {}", ex.getMessage());
        }

        return D17PaymentResponse.from(savedTicket);
    }

    /**
     * Get all payment tickets submitted by the authenticated user.
     */
    public List<D17PaymentResponse> getUserPayments(String userId) {
        return paymentRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(D17PaymentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Admin: Filterable list of all payment tickets.
     */
    public List<D17PaymentResponse> getAdminPayments(String statusFilter, String searchQuery, String sortBy) {
        return getAdminPayments(statusFilter, searchQuery, sortBy, null);
    }

    /**
     * Admin: Filterable list of all payment tickets with method filtering.
     */
    public List<D17PaymentResponse> getAdminPayments(String statusFilter, String searchQuery, String sortBy, String methodFilter) {
        List<D17PaymentTicket> tickets;

        Sort sort = Sort.by(Sort.Direction.ASC, "createdAt"); // default oldest pending first for SLA triage
        if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            tickets = paymentRepo.findByStatus(statusFilter.toUpperCase(), sort);
        } else {
            tickets = paymentRepo.findAll(sort);
        }

        // Method filter (D17, USDT_TRC20, BTC, ETH)
        if (methodFilter != null && !methodFilter.isBlank() && !"ALL".equalsIgnoreCase(methodFilter)) {
            String targetMethod = methodFilter.toUpperCase();
            tickets = tickets.stream()
                    .filter(t -> {
                        String m = t.getPaymentMethod() != null ? t.getPaymentMethod().toUpperCase() : "D17";
                        return m.equalsIgnoreCase(targetMethod);
                    })
                    .collect(Collectors.toList());
        }

        // Apply in-memory search filter if provided
        if (searchQuery != null && !searchQuery.isBlank()) {
            String q = searchQuery.toLowerCase().trim();
            tickets = tickets.stream()
                    .filter(t -> (t.getTicketNumber() != null && t.getTicketNumber().toLowerCase().contains(q))
                            || (t.getUserEmail() != null && t.getUserEmail().toLowerCase().contains(q))
                            || (t.getUserFullName() != null && t.getUserFullName().toLowerCase().contains(q))
                            || (t.getOrderNumber() != null && t.getOrderNumber().toLowerCase().contains(q))
                            || (t.getSenderPhoneNumber() != null && t.getSenderPhoneNumber().contains(q))
                            || (t.getTxid() != null && t.getTxid().toLowerCase().contains(q))
                            || (t.getWalletAddress() != null && t.getWalletAddress().toLowerCase().contains(q))
                            || (t.getPaymentMethod() != null && t.getPaymentMethod().toLowerCase().contains(q))
                            || (t.getUserNotes() != null && t.getUserNotes().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return tickets.stream()
                .map(D17PaymentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Admin: Aggregate metrics including SLA urgency tracking.
     */
    public Map<String, Object> getAdminStats() {
        long pending = paymentRepo.countByStatus("PENDING_VERIFICATION");
        long approved = paymentRepo.countByStatus("APPROVED");
        long rejected = paymentRepo.countByStatus("REJECTED");
        long total = paymentRepo.count();

        // SLA calculation: tickets pending longer than 24h and 48h
        Instant threshold24h = Instant.now().minus(24, ChronoUnit.HOURS);
        Instant threshold48h = Instant.now().minus(48, ChronoUnit.HOURS);

        long slaWarnings = paymentRepo.countByStatusAndCreatedAtBefore("PENDING_VERIFICATION", threshold24h);
        long slaBreached = paymentRepo.countByStatusAndCreatedAtBefore("PENDING_VERIFICATION", threshold48h);

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingCount", pending);
        stats.put("approvedCount", approved);
        stats.put("rejectedCount", rejected);
        stats.put("total", total);
        stats.put("totalCount", total);
        stats.put("slaWarningCount", slaWarnings);
        stats.put("slaBreachCount", slaBreached);

        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("slaWarnings", slaWarnings);
        stats.put("slaBreached", slaBreached);
        return stats;
    }

    /**
     * Get real-time count of pending verifications for notification badges.
     */
    public long getPendingCount() {
        return paymentRepo.countByStatus("PENDING_VERIFICATION");
    }

    /**
     * Admin: Approve a pending payment ticket.
     */
    @Transactional
    public D17PaymentResponse approvePayment(String ticketId, User admin, ApprovePaymentRequest req) {
        D17PaymentTicket ticket = paymentRepo.findById(ticketId)
                .orElseThrow(() -> new InvalidCredentialsException("Payment ticket not found: " + ticketId));

        if ("APPROVED".equals(ticket.getStatus())) {
            throw new IllegalStateException("Ticket " + ticket.getTicketNumber() + " has already been approved.");
        }

        String previousStatus = ticket.getStatus();
        ticket.setStatus("APPROVED");
        ticket.setVerifiedByAdminId(admin.getId());
        ticket.setVerifiedByAdminEmail(admin.getEmail());
        ticket.setVerifiedAt(Instant.now());
        if (req != null && req.adminNotes() != null) {
            ticket.setAdminNotes(req.adminNotes());
        }

        String displayMethod = ticket.getPaymentMethod() != null ? ticket.getPaymentMethod().replace("_", " ") : "D17";

        // Add Audit Log
        ticket.addAuditLog(previousStatus, "APPROVED", admin.getId(), admin.getEmail(), "APPROVED",
                req != null && req.adminNotes() != null ? req.adminNotes() : "Payment approved and verified by admin.");

        String activationDetails = "";

        // Activate based on type
        if ("SUBSCRIPTION".equals(ticket.getType())) {
            membershipService.activateMembershipFromPayment(
                    ticket.getUserId(),
                    ticket.getSubscriptionTier(),
                    30,
                    ticket.getTicketNumber()
            );
            activationDetails = "Your " + ticket.getSubscriptionTier() + " plan has been activated for 30 days.";
        } else if ("ORDER".equals(ticket.getType())) {
            orderService.markOrderPaidByD17(ticket.getOrderId());
            activationDetails = "Your order #" + ticket.getOrderNumber() + " has been marked as PAID and is now in processing.";
        } else if ("AI_CREDIT".equals(ticket.getType())) {
            int credits = ticket.getAiCredits() > 0 ? ticket.getAiCredits() : 3;
            User updatedUser = aiCreditService.addCredits(ticket.getUserId(), credits);
            activationDetails = credits + " AI Credits have been deposited to your account. Your new balance is " + updatedUser.getAiCredits() + " AI Credits.";
        }

        // Update linked support ticket with resolution message and close it
        if (ticket.getSupportTicketId() != null) {
            try {
                String replyMsg = "Your " + displayMethod + " payment of " + String.format("%.2f", ticket.getAmount())
                        + " " + (ticket.getCurrency() != null ? ticket.getCurrency() : "TND")
                        + " has been verified and approved by admin " + admin.getFirstName() + ".\n\n"
                        + activationDetails + "\n\nThank you for choosing GymPilot!";

                TicketReplyRequest replyReq = new TicketReplyRequest();
                replyReq.setMessage(replyMsg);
                supportTicketService.adminReply(ticket.getSupportTicketId(), admin, replyReq);
                supportTicketService.adminCloseTicket(ticket.getSupportTicketId());
            } catch (Exception ex) {
                log.warn("Could not update linked support ticket {}: {}", ticket.getSupportTicketId(), ex.getMessage());
            }
        }

        D17PaymentTicket saved = paymentRepo.save(ticket);
        log.info("{} Payment {} approved by admin {}", displayMethod, ticket.getTicketNumber(), admin.getEmail());

        // Send approval confirmation email
        try {
            if (!"D17".equalsIgnoreCase(ticket.getPaymentMethod())) {
                mailService.sendManualPaymentApproved(
                        ticket.getUserEmail(),
                        ticket.getUserFullName(),
                        ticket.getTicketNumber(),
                        ticket.getAmount(),
                        ticket.getCurrency() != null ? ticket.getCurrency() : "USD",
                        ticket.getType(),
                        displayMethod,
                        activationDetails
                );
            } else {
                mailService.sendD17PaymentApproved(
                        ticket.getUserEmail(),
                        ticket.getUserFullName(),
                        ticket.getTicketNumber(),
                        ticket.getAmount(),
                        ticket.getType(),
                        activationDetails
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to send approval email for ticket {}: {}", ticket.getTicketNumber(), ex.getMessage());
        }

        return D17PaymentResponse.from(saved);
    }

    /**
     * Admin: Reject a pending payment ticket with a mandatory reason.
     */
    @Transactional
    public D17PaymentResponse rejectPayment(String ticketId, User admin, RejectPaymentRequest req) {
        D17PaymentTicket ticket = paymentRepo.findById(ticketId)
                .orElseThrow(() -> new InvalidCredentialsException("Payment ticket not found: " + ticketId));

        if ("REJECTED".equals(ticket.getStatus())) {
            throw new IllegalStateException("Ticket " + ticket.getTicketNumber() + " has already been rejected.");
        }

        String displayMethod = ticket.getPaymentMethod() != null ? ticket.getPaymentMethod().replace("_", " ") : "D17";

        String previousStatus = ticket.getStatus();
        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(req.reason());
        ticket.setAdminNotes(req.adminNotes());
        ticket.setVerifiedByAdminId(admin.getId());
        ticket.setVerifiedByAdminEmail(admin.getEmail());
        ticket.setVerifiedAt(Instant.now());

        // Add Audit Log
        ticket.addAuditLog(previousStatus, "REJECTED", admin.getId(), admin.getEmail(), "REJECTED",
                "Rejected: " + req.reason() + (req.adminNotes() != null ? " (" + req.adminNotes() + ")" : ""));

        // Roll back pending status
        if ("ORDER".equals(ticket.getType())) {
            orderService.markOrderD17Rejected(ticket.getOrderId(), req.reason());
        } else if ("SUBSCRIPTION".equals(ticket.getType())) {
            userRepository.findById(ticket.getUserId()).ifPresent(u -> {
                if ("PENDING_VERIFICATION".equalsIgnoreCase(u.getMembershipStatus())) {
                    u.setMembershipStatus("INACTIVE");
                    userRepository.save(u);
                }
            });
        }

        // Add rejection message into linked SupportTicket
        if (ticket.getSupportTicketId() != null) {
            try {
                String replyMsg = "Unable to verify " + displayMethod + " payment proof.\n\n"
                        + "Reason: " + req.reason() + "\n"
                        + (req.adminNotes() != null && !req.adminNotes().isBlank() ? "Notes: " + req.adminNotes() + "\n" : "")
                        + "\nPlease reply to this ticket with a clear payment screenshot or valid transaction hash (TXID).";

                TicketReplyRequest replyReq = new TicketReplyRequest();
                replyReq.setMessage(replyMsg);
                supportTicketService.adminReply(ticket.getSupportTicketId(), admin, replyReq);
            } catch (Exception ex) {
                log.warn("Could not update linked support ticket on rejection: {}", ex.getMessage());
            }
        }

        D17PaymentTicket saved = paymentRepo.save(ticket);
        log.info("{} Payment {} rejected by admin {}: {}", displayMethod, ticket.getTicketNumber(), admin.getEmail(), req.reason());

        // Send rejection email to user
        try {
            if ("D17".equalsIgnoreCase(ticket.getPaymentMethod())) {
                mailService.sendD17PaymentRejected(
                        ticket.getUserEmail(),
                        ticket.getUserFullName(),
                        ticket.getTicketNumber(),
                        ticket.getAmount(),
                        req.reason()
                );
            } else {
                mailService.sendManualPaymentRejected(
                        ticket.getUserEmail(),
                        ticket.getUserFullName(),
                        ticket.getTicketNumber(),
                        ticket.getAmount(),
                        ticket.getCurrency() != null ? ticket.getCurrency() : "USD",
                        displayMethod,
                        req.reason()
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to send rejection email for ticket {}: {}", ticket.getTicketNumber(), ex.getMessage());
        }

        return D17PaymentResponse.from(saved);
    }

    private void validateImage(String imageBase64, String imageType) {
        if (imageBase64 == null || imageBase64.isBlank()) {
            throw new IllegalArgumentException("Payment screenshot is required.");
        }

        // ~5MB limit in Base64 (approx 6.8M characters)
        if (imageBase64.length() > 6_800_000) {
            throw new IllegalArgumentException("Screenshot image size exceeds 5MB limit. Please compress or take another screenshot.");
        }

        if (imageType != null && !imageType.isBlank()) {
            String type = imageType.toLowerCase();
            if (!type.equals("image/jpeg") && !type.equals("image/png") && !type.equals("image/webp") && !type.equals("image/jpg")) {
                throw new IllegalArgumentException("Invalid image format. Only JPEG, PNG, and WebP are allowed.");
            }
        }
    }
}
