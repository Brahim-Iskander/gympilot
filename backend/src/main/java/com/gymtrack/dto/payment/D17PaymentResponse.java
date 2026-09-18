package com.gymtrack.dto.payment;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.gymtrack.model.D17PaymentTicket;

public record D17PaymentResponse(
        String id,
        String ticketNumber,
        String userId,
        String userFullName,
        String userEmail,
        String userPhone,
        String type,
        String orderId,
        String orderNumber,
        String subscriptionTier,
        int aiCredits,
        double amount,
        String currency,
        String paymentMethod,
        String txid,
        String walletAddress,
        String cryptoAmount,
        String explorerUrl,
        String senderPhoneNumber,
        String userNotes,
        String screenshotBase64,
        String screenshotType,
        String screenshotUrl,
        String status,
        String rejectionReason,
        String adminNotes,
        String verifiedByAdminId,
        String verifiedByAdminEmail,
        Instant verifiedAt,
        String supportTicketId,
        List<D17PaymentTicket.PaymentStatusAuditLog> auditLogs,
        long elapsedHours,
        String slaStatus, // WITHIN_SLA (<24h), SLA_WARNING (24-48h), SLA_BREACHED (>48h)
        Instant createdAt,
        Instant updatedAt
) {
    public static D17PaymentResponse from(D17PaymentTicket ticket) {
        return from(ticket, null);
    }

    public static D17PaymentResponse from(D17PaymentTicket ticket, String customExplorerBaseUrl) {
        long elapsedHours = 0;
        String slaStatus = "WITHIN_SLA";

        if (ticket.getCreatedAt() != null) {
            Instant end = ticket.getVerifiedAt() != null ? ticket.getVerifiedAt() : Instant.now();
            elapsedHours = Duration.between(ticket.getCreatedAt(), end).toHours();
            if ("PENDING_VERIFICATION".equalsIgnoreCase(ticket.getStatus())) {
                if (elapsedHours >= 48) {
                    slaStatus = "SLA_BREACHED";
                } else if (elapsedHours >= 24) {
                    slaStatus = "SLA_WARNING";
                } else {
                    slaStatus = "WITHIN_SLA";
                }
            } else {
                slaStatus = "RESOLVED";
            }
        }

        String method = ticket.getPaymentMethod() != null ? ticket.getPaymentMethod() : "D17";
        String explorerUrl = null;
        String txid = ticket.getTxid();
        if (txid != null && !txid.isBlank()) {
            String trimmedTxid = txid.trim();
            if (customExplorerBaseUrl != null && !customExplorerBaseUrl.isBlank()) {
                explorerUrl = customExplorerBaseUrl.endsWith("/")
                        ? customExplorerBaseUrl + trimmedTxid
                        : customExplorerBaseUrl + "/" + trimmedTxid;
            } else if ("USDT_TRC20".equalsIgnoreCase(method) || "USDT".equalsIgnoreCase(method)) {
                explorerUrl = "https://tronscan.org/#/transaction/" + trimmedTxid;
            } else if ("BTC".equalsIgnoreCase(method)) {
                explorerUrl = "https://www.blockchain.com/explorer/transactions/btc/" + trimmedTxid;
            } else if ("ETH".equalsIgnoreCase(method)) {
                explorerUrl = "https://etherscan.io/tx/" + trimmedTxid;
            }
        }

        return new D17PaymentResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getUserId(),
                ticket.getUserFullName(),
                ticket.getUserEmail(),
                ticket.getUserPhone(),
                ticket.getType(),
                ticket.getOrderId(),
                ticket.getOrderNumber(),
                ticket.getSubscriptionTier(),
                ticket.getAiCredits(),
                ticket.getAmount(),
                ticket.getCurrency() != null ? ticket.getCurrency() : "TND",
                method,
                txid,
                ticket.getWalletAddress(),
                ticket.getCryptoAmount(),
                explorerUrl,
                ticket.getSenderPhoneNumber(),
                ticket.getUserNotes(),
                ticket.getScreenshotBase64(),
                ticket.getScreenshotType(),
                ticket.getScreenshotUrl(),
                ticket.getStatus(),
                ticket.getRejectionReason(),
                ticket.getAdminNotes(),
                ticket.getVerifiedByAdminId(),
                ticket.getVerifiedByAdminEmail(),
                ticket.getVerifiedAt(),
                ticket.getSupportTicketId(),
                ticket.getAuditLogs(),
                elapsedHours,
                slaStatus,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
