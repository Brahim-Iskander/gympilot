package com.gymtrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gymtrack.model.SystemSetting;
import com.gymtrack.repository.SystemSettingRepository;

@Service
public class SystemSettingService {

    private static final Logger log = LoggerFactory.getLogger(SystemSettingService.class);

    public static final String D17_PHONE_KEY = "d17_payment_phone";
    public static final String D17_RECIPIENT_KEY = "d17_recipient_name";
    public static final String D17_INSTRUCTIONS_KEY = "d17_instructions";

    @Value("${app.payment.d17.phone-number:+216 21 214 512}")
    private String defaultD17Phone;

    @Value("${app.payment.d17.recipient-name:GymPilot Official}")
    private String defaultD17Recipient;

    private final SystemSettingRepository settingRepository;

    public SystemSettingService(SystemSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    public String getSetting(String key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    public String getD17PhoneNumber() {
        return getSetting(D17_PHONE_KEY, defaultD17Phone);
    }

    public String getD17RecipientName() {
        return getSetting(D17_RECIPIENT_KEY, defaultD17Recipient);
    }

    public String getD17Instructions() {
        return getSetting(D17_INSTRUCTIONS_KEY,
                "Send the exact amount to this number via D17, then take a screenshot of the payment confirmation.");
    }

    public SystemSetting setSetting(String key, String value, String label, String description, String adminEmail) {
        SystemSetting setting = settingRepository.findByKey(key)
                .orElseGet(() -> new SystemSetting(key, value, label, description));

        setting.setValue(value);
        if (label != null) setting.setLabel(label);
        if (description != null) setting.setDescription(description);
        setting.setUpdatedByAdminEmail(adminEmail);

        SystemSetting saved = settingRepository.save(setting);
        log.info("System setting '{}' updated to '{}' by admin {}", key, value, adminEmail);
        return saved;
    }
}
