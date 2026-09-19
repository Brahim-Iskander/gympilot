package com.gymtrack.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.payment.AdminPaymentMethodResponse;
import com.gymtrack.dto.payment.PaymentMethodResponse;
import com.gymtrack.dto.payment.UpdatePaymentMethodRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.PaymentMethodConfig;
import com.gymtrack.model.User;
import com.gymtrack.repository.PaymentMethodConfigRepository;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentConfigService {

    private static final Logger log = LoggerFactory.getLogger(PaymentConfigService.class);

    public static final String METHOD_D17 = "D17";
    public static final String METHOD_CARD = "CARD";
    public static final String METHOD_USDT = "USDT_TRC20";
    public static final String METHOD_BTC = "BTC";
    public static final String METHOD_ETH = "ETH";

    private final PaymentMethodConfigRepository configRepo;
    private final SystemSettingService systemSettingService;

    public PaymentConfigService(PaymentMethodConfigRepository configRepo,
                                SystemSettingService systemSettingService) {
        this.configRepo = configRepo;
        this.systemSettingService = systemSettingService;
    }

    @PostConstruct
    public void initDefaultPaymentMethods() {
        try {
            // 1. D17 Mobile Payment (Tunisia default: active; International default: inactive)
            initMethodIfMissing(
                    METHOD_D17,
                    "D17 Mobile Payment",
                    "D17",
                    systemSettingService.getD17PhoneNumber(),
                    systemSettingService.getD17RecipientName(),
                    systemSettingService.getD17Instructions(),
                    "Tunisian national postal mobile transfer. Exact payable amount must be sent.",
                    true, // global
                    true, // Tunisia (controlled by admin)
                    false, // International (controlled by admin)
                    null,
                    1
            );

            // 2. Credit Card / Apple Pay via Polar (Tunisia default: inactive; International default: active)
            initMethodIfMissing(
                    METHOD_CARD,
                    "Credit Card / Apple Pay (Polar)",
                    "Polar",
                    "https://polar.sh/gympilot",
                    "GymPilot International Card Checkout",
                    "Visa, Mastercard, Apple Pay, Google Pay via Polar checkout with instant activation.",
                    "Instant automated plan activation upon checkout completion.",
                    true,  // global
                    false, // Tunisia (controlled by admin)
                    true,  // International (controlled by admin)
                    null,
                    2
            );

            // 3. Remove/delete legacy crypto configs as crypto payment is discontinued
            for (String cryptoCode : List.of(METHOD_USDT, METHOD_BTC, METHOD_ETH)) {
                configRepo.findByCode(cryptoCode).ifPresent(c -> {
                    configRepo.delete(c);
                    log.info("Deleted legacy crypto payment config: {}", cryptoCode);
                });
            }
        } catch (Exception e) {
            log.error("Failed to initialize default payment methods: {}", e.getMessage(), e);
        }
    }

    private void initMethodIfMissing(String code, String name, String network, String address,
                                     String recipient, String instructions, String warningNotice,
                                     boolean global, boolean tunisia, boolean international,
                                     String explorerBaseUrl, int order) {
        if (!configRepo.existsByCode(code)) {
            PaymentMethodConfig config = new PaymentMethodConfig(
                    code, name, network, address, recipient, instructions, warningNotice,
                    global, tunisia, international, explorerBaseUrl, order
            );
            config.setUpdatedByAdminEmail("system@gympilot.tn");
            configRepo.save(config);
            log.info("Initialized default payment method configuration for: {}", code);
        }
    }

    /**
     * Get active payment methods filtered by the customer's region.
     */
    public List<PaymentMethodResponse> getActiveMethodsForCountry(String countryCode) {
        Sort sort = Sort.by(Sort.Direction.ASC, "displayOrder");
        List<PaymentMethodConfig> allConfigs = configRepo.findByIsActiveGlobalTrue(sort);

        return allConfigs.stream()
                .filter(c -> !List.of(METHOD_USDT, METHOD_BTC, METHOD_ETH).contains(c.getCode()))
                .filter(c -> c.isAvailableForCountry(countryCode))
                .map(PaymentMethodResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Admin: get all payment methods with configuration and toggles.
     */
    public List<AdminPaymentMethodResponse> getAllMethodsForAdmin() {
        Sort sort = Sort.by(Sort.Direction.ASC, "displayOrder");
        return configRepo.findAll(sort).stream()
                .filter(c -> !List.of(METHOD_USDT, METHOD_BTC, METHOD_ETH).contains(c.getCode()))
                .map(AdminPaymentMethodResponse::from)
                .collect(Collectors.toList());
    }

    public Optional<PaymentMethodConfig> getMethodByCode(String code) {
        return configRepo.findByCode(code.toUpperCase());
    }

    /**
     * Admin: update configuration, addresses, and regional toggles for a method.
     */
    public AdminPaymentMethodResponse updateMethod(String code, UpdatePaymentMethodRequest req, User admin) {
        PaymentMethodConfig config = configRepo.findByCode(code.toUpperCase())
                .orElseThrow(() -> new InvalidCredentialsException("Payment method not found: " + code));

        config.setReceivingAddress(req.receivingAddress().trim());

        if (req.recipientName() != null) {
            config.setRecipientName(req.recipientName().trim());
        }
        if (req.instructions() != null) {
            config.setInstructions(req.instructions().trim());
        }
        if (req.warningNotice() != null) {
            config.setWarningNotice(req.warningNotice().trim());
        }
        if (req.isActiveGlobal() != null) {
            config.setActiveGlobal(req.isActiveGlobal());
        }
        if (req.isActiveTunisia() != null) {
            config.setActiveTunisia(req.isActiveTunisia());
        }
        if (req.isActiveInternational() != null) {
            config.setActiveInternational(req.isActiveInternational());
        }
        if (req.explorerBaseUrl() != null) {
            config.setExplorerBaseUrl(req.explorerBaseUrl().trim());
        }
        if (req.displayOrder() != null) {
            config.setDisplayOrder(req.displayOrder());
        }

        config.setUpdatedByAdminEmail(admin != null ? admin.getEmail() : "admin");
        config.setUpdatedAt(Instant.now());

        PaymentMethodConfig saved = configRepo.save(config);

        // Sync D17 with SystemSettingService if D17 is edited
        if (METHOD_D17.equalsIgnoreCase(code)) {
            systemSettingService.setSetting(
                    SystemSettingService.D17_PHONE_KEY,
                    config.getReceivingAddress(),
                    "D17 Receiving Phone Number",
                    "Mobile number for receiving customer D17 transfers",
                    admin != null ? admin.getEmail() : "admin"
            );
            if (config.getRecipientName() != null && !config.getRecipientName().isBlank()) {
                systemSettingService.setSetting(
                        SystemSettingService.D17_RECIPIENT_KEY,
                        config.getRecipientName(),
                        "D17 Recipient Name",
                        "Account holder display name shown to customers",
                        admin != null ? admin.getEmail() : "admin"
                );
            }
            if (config.getInstructions() != null && !config.getInstructions().isBlank()) {
                systemSettingService.setSetting(
                        SystemSettingService.D17_INSTRUCTIONS_KEY,
                        config.getInstructions(),
                        "D17 Instructions",
                        "Step instructions shown to customer",
                        admin != null ? admin.getEmail() : "admin"
                );
            }
        }

        log.info("Payment method '{}' updated by admin {}", code, admin != null ? admin.getEmail() : "admin");
        return AdminPaymentMethodResponse.from(saved);
    }
}
