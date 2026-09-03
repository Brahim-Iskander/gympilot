package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.dto.VoucherDtos.CreateVoucherRequest;
import com.gymtrack.dto.VoucherDtos.VoucherResponse;
import com.gymtrack.dto.VoucherDtos.VoucherValidationResponse;
import com.gymtrack.model.Voucher;
import com.gymtrack.repository.VoucherRepository;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private com.gymtrack.repository.OrderRepository orderRepository;

    private VoucherService voucherService;

    @BeforeEach
    void setUp() {
        voucherService = new VoucherService(voucherRepository, orderRepository);
    }

    @Test
    void createVoucher_success() {
        CreateVoucherRequest req = new CreateVoucherRequest(
                "PILOT20",
                "PERCENTAGE",
                20.0,
                50.0,
                30.0,
                100,
                "20% off launch discount",
                Instant.now().plus(30, ChronoUnit.DAYS)
        );

        when(voucherRepository.existsByCodeIgnoreCase("PILOT20")).thenReturn(false);
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(invocation -> {
            Voucher v = invocation.getArgument(0);
            v.setId("voucher-123");
            return v;
        });

        VoucherResponse res = voucherService.createVoucher(req, "admin@gympilot.tn");

        assertNotNull(res);
        assertEquals("PILOT20", res.code());
        assertEquals("PERCENTAGE", res.discountType());
        assertEquals(20.0, res.discountValue());
        assertTrue(res.active());
    }

    @Test
    void validateVoucher_percentageCalculation() {
        Voucher v = new Voucher("PILOT10", "PERCENTAGE", 10.0, 50.0, 0.0, 50, "10% off", null, "admin@gympilot.tn");
        when(voucherRepository.findByCodeIgnoreCase("PILOT10")).thenReturn(Optional.of(v));

        VoucherValidationResponse res = voucherService.validateVoucher("PILOT10", 100.0);

        assertTrue(res.valid());
        assertEquals("PILOT10", res.code());
        assertEquals(10.0, res.discountAmount());
        assertEquals(90.0, res.finalAmount());
    }

    @Test
    void validateVoucher_fixedCalculation() {
        Voucher v = new Voucher("SAVE15", "FIXED", 15.0, 40.0, 0.0, 0, "15 TND off", null, "admin@gympilot.tn");
        when(voucherRepository.findByCodeIgnoreCase("SAVE15")).thenReturn(Optional.of(v));

        VoucherValidationResponse res = voucherService.validateVoucher("SAVE15", 80.0);

        assertTrue(res.valid());
        assertEquals(15.0, res.discountAmount());
        assertEquals(65.0, res.finalAmount());
    }

    @Test
    void validateVoucher_failsIfBelowMinimumOrder() {
        Voucher v = new Voucher("MIN100", "FIXED", 20.0, 100.0, 0.0, 0, "20 TND off over 100", null, "admin@gympilot.tn");
        when(voucherRepository.findByCodeIgnoreCase("MIN100")).thenReturn(Optional.of(v));

        VoucherValidationResponse res = voucherService.validateVoucher("MIN100", 60.0);

        assertFalse(res.valid());
        assertTrue(res.message().contains("at least 100.00 TND"));
    }

    @Test
    void validateVoucher_failsIfExpired() {
        Voucher v = new Voucher("EXPIRED", "PERCENTAGE", 10.0, 0.0, 0.0, 0, "Expired", Instant.now().minus(2, ChronoUnit.DAYS), "admin@gympilot.tn");
        when(voucherRepository.findByCodeIgnoreCase("EXPIRED")).thenReturn(Optional.of(v));

        VoucherValidationResponse res = voucherService.validateVoucher("EXPIRED", 100.0);

        assertFalse(res.valid());
        assertTrue(res.message().contains("expired"));
    }

    @Test
    void applyAndConsumeVoucher_incrementsUsedCount() {
        Voucher v = new Voucher("USEME", "FIXED", 10.0, 0.0, 0.0, 5, "Test", null, "admin@gympilot.tn");
        v.setUsedCount(2);
        when(voucherRepository.findByCodeIgnoreCase("USEME")).thenReturn(Optional.of(v));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> inv.getArgument(0));

        double discount = voucherService.applyAndConsumeVoucher("USEME", 50.0);

        assertEquals(10.0, discount);
        assertEquals(3, v.getUsedCount());
        verify(voucherRepository).save(v);
    }

    @Test
    void getOrdersUsingVoucher_returnsOrders() {
        com.gymtrack.model.Order order = new com.gymtrack.model.Order();
        order.setId("order-1");
        order.setOrderNumber("ORD-1001");
        order.setBuyerName("John Doe");
        order.setBuyerEmail("john@example.com");
        order.setTotalAmount(90.0);
        order.setDiscountAmount(10.0);
        order.setStatus("DELIVERED");
        order.setVoucherCode("USEME");

        when(orderRepository.findByVoucherCodeOrderByCreatedAtDesc("USEME"))
                .thenReturn(java.util.List.of(order));

        var result = voucherService.getOrdersUsingVoucher("useme");
        assertEquals(1, result.size());
        assertEquals("ORD-1001", result.get(0).orderNumber());
        assertEquals("John Doe", result.get(0).buyerName());
    }
}
