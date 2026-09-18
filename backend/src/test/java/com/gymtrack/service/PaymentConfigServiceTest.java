package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import com.gymtrack.dto.payment.AdminPaymentMethodResponse;
import com.gymtrack.dto.payment.PaymentMethodResponse;
import com.gymtrack.dto.payment.UpdatePaymentMethodRequest;
import com.gymtrack.model.PaymentMethodConfig;
import com.gymtrack.model.User;
import com.gymtrack.repository.PaymentMethodConfigRepository;

@ExtendWith(MockitoExtension.class)
class PaymentConfigServiceTest {

    @Mock
    private PaymentMethodConfigRepository configRepo;

    @Mock
    private SystemSettingService systemSettingService;

    private PaymentConfigService configService;

    private PaymentMethodConfig d17Config;
    private PaymentMethodConfig usdtConfig;
    private PaymentMethodConfig btcConfig;

    @BeforeEach
    void setUp() {
        configService = new PaymentConfigService(configRepo, systemSettingService);

        d17Config = new PaymentMethodConfig(
                "D17", "D17 Mobile", "D17", "+216 21 214 512", "GymPilot Official",
                "Send D17", "Note", true, true, false, null, 1
        );

        usdtConfig = new PaymentMethodConfig(
                "USDT_TRC20", "USDT TRC20", "TRC20", "TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxnSE",
                "GymPilot Treasury", "Send USDT", "TRC20 only", true, false, true,
                "https://tronscan.org/#/transaction/", 2
        );

        btcConfig = new PaymentMethodConfig(
                "BTC", "Bitcoin", "Bitcoin", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                "GymPilot Vault", "Send BTC", "BTC only", true, false, true,
                "https://www.blockchain.com/explorer/transactions/btc/", 3
        );
    }

    @Test
    void testGetActiveMethodsForCountry_Tunisia() {
        when(configRepo.findByIsActiveGlobalTrue(any(Sort.class)))
                .thenReturn(List.of(d17Config, usdtConfig, btcConfig));

        List<PaymentMethodResponse> methods = configService.getActiveMethodsForCountry("TN");

        assertEquals(1, methods.size());
        assertEquals("D17", methods.get(0).code());
    }

    @Test
    void testGetActiveMethodsForCountry_International() {
        when(configRepo.findByIsActiveGlobalTrue(any(Sort.class)))
                .thenReturn(List.of(d17Config, usdtConfig, btcConfig));

        List<PaymentMethodResponse> methods = configService.getActiveMethodsForCountry("US");

        assertEquals(2, methods.size());
        assertTrue(methods.stream().anyMatch(m -> "USDT_TRC20".equals(m.code())));
        assertTrue(methods.stream().anyMatch(m -> "BTC".equals(m.code())));
        assertFalse(methods.stream().anyMatch(m -> "D17".equals(m.code())));
    }

    @Test
    void testGetActiveMethodsForCountry_TunisiaWithCryptoEnabled() {
        // Admin enabled USDT for Tunisia too
        usdtConfig.setActiveTunisia(true);

        when(configRepo.findByIsActiveGlobalTrue(any(Sort.class)))
                .thenReturn(List.of(d17Config, usdtConfig, btcConfig));

        List<PaymentMethodResponse> methods = configService.getActiveMethodsForCountry("TN");

        assertEquals(2, methods.size());
        assertTrue(methods.stream().anyMatch(m -> "D17".equals(m.code())));
        assertTrue(methods.stream().anyMatch(m -> "USDT_TRC20".equals(m.code())));
    }

    @Test
    void testUpdateMethod_TogglesAndAddress() {
        User admin = new User("Admin", "User", "admin@gympilot.tn", "secret");
        when(configRepo.findByCode("USDT_TRC20")).thenReturn(Optional.of(usdtConfig));
        when(configRepo.save(any(PaymentMethodConfig.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdatePaymentMethodRequest req = new UpdatePaymentMethodRequest(
                "TNewAddress1234567890",
                "New Treasury Label",
                "Updated instructions",
                "Updated warning",
                true,
                true, // enabled for Tunisia now
                true,
                "https://tronscan.org/#/transaction/",
                2
        );

        AdminPaymentMethodResponse response = configService.updateMethod("USDT_TRC20", req, admin);

        assertNotNull(response);
        assertEquals("TNewAddress1234567890", response.receivingAddress());
        assertEquals("New Treasury Label", response.recipientName());
        assertTrue(response.isActiveTunisia());
        assertTrue(response.isActiveInternational());
        assertEquals("admin@gympilot.tn", response.updatedByAdminEmail());
        verify(configRepo).save(usdtConfig);
    }
}
