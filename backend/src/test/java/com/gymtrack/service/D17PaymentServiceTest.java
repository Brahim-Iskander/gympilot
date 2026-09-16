package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.dto.payment.ApprovePaymentRequest;
import com.gymtrack.dto.payment.D17PaymentResponse;
import com.gymtrack.dto.payment.RejectPaymentRequest;
import com.gymtrack.dto.payment.SubmitD17PaymentRequest;
import com.gymtrack.model.D17PaymentTicket;
import com.gymtrack.model.Order;
import com.gymtrack.model.SupportTicket;
import com.gymtrack.model.User;
import com.gymtrack.repository.D17PaymentTicketRepository;
import com.gymtrack.repository.OrderRepository;
import com.gymtrack.repository.SupportTicketRepository;
import com.gymtrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class D17PaymentServiceTest {

    @Mock
    private D17PaymentTicketRepository paymentRepo;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SupportTicketRepository supportTicketRepo;

    @Mock
    private SupportTicketService supportTicketService;

    @Mock
    private MembershipService membershipService;

    @Mock
    private OrderService orderService;

    @Mock
    private SystemSettingService settingService;

    @Mock
    private MailService mailService;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private AiCreditService aiCreditService;

    private D17PaymentService paymentService;

    private User testUser;
    private User testAdmin;

    @BeforeEach
    void setUp() {
        paymentService = new D17PaymentService(
                paymentRepo,
                orderRepository,
                userRepository,
                supportTicketRepo,
                supportTicketService,
                membershipService,
                orderService,
                settingService,
                mailService,
                cloudinaryService,
                aiCreditService
        );

        testUser = new User("Sami", "Ben Ali", "sami@example.com", "pass");
        testUser.setId("user-1");
        testUser.setPhone("+216 98 123 456");

        testAdmin = new User("Admin", "User", "admin@gympilot.tn", "pass");
        testAdmin.setId("admin-1");
    }

    @Test
    void testSubmitPayment_Subscription_Success() {
        SubmitD17PaymentRequest req = new SubmitD17PaymentRequest(
                "SUBSCRIPTION",
                null,
                "BASIC",
                null,
                49.0,
                "+216 98 123 456",
                "Transaction Ref #987654",
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "image/png"
        );

        when(paymentRepo.existsByUserIdAndTypeAndSubscriptionTierAndStatus(
                "user-1", "SUBSCRIPTION", "BASIC", "PENDING_VERIFICATION")).thenReturn(false);

        SupportTicket mockTicket = new SupportTicket();
        mockTicket.setId("st-1");
        when(supportTicketRepo.save(any(SupportTicket.class))).thenReturn(mockTicket);

        when(paymentRepo.save(any(D17PaymentTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        D17PaymentResponse res = paymentService.submitPayment(testUser, req);

        assertNotNull(res);
        assertEquals("PENDING_VERIFICATION", res.status());
        assertEquals(49.0, res.amount());
        assertEquals("BASIC", res.subscriptionTier());
        assertTrue(res.ticketNumber().startsWith("D17-"));
        assertEquals("WITHIN_SLA", res.slaStatus());

        // Verify user membership status was updated to PENDING_VERIFICATION
        assertEquals("PENDING_VERIFICATION", testUser.getMembershipStatus());
        verify(userRepository).save(testUser);

        // Verify notification email was sent
        verify(mailService).sendD17PaymentProofReceived(
                eq("sami@example.com"), eq("Sami"), anyString(), eq(49.0), eq("SUBSCRIPTION"));
    }

    @Test
    void testSubmitPayment_Subscription_DuplicatePrevented() {
        SubmitD17PaymentRequest req = new SubmitD17PaymentRequest(
                "SUBSCRIPTION",
                null,
                "PREMIUM",
                null,
                99.0,
                "+216 98 123 456",
                null,
                "data:image/jpeg;base64,testdata",
                "image/jpeg"
        );

        when(paymentRepo.existsByUserIdAndTypeAndSubscriptionTierAndStatus(
                "user-1", "SUBSCRIPTION", "PREMIUM", "PENDING_VERIFICATION")).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                paymentService.submitPayment(testUser, req));

        assertTrue(ex.getMessage().contains("already have a pending verification"));
    }

    @Test
    void testSubmitPayment_Order_Success() {
        Order order = new Order();
        order.setId("order-1");
        order.setOrderNumber("GP-1001");
        order.setBuyerId("user-1");
        order.setTotalAmount(120.0);

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(paymentRepo.existsByUserIdAndOrderIdAndStatus("user-1", "order-1", "PENDING_VERIFICATION")).thenReturn(false);

        SupportTicket mockTicket = new SupportTicket();
        mockTicket.setId("st-order-1");
        when(supportTicketRepo.save(any(SupportTicket.class))).thenReturn(mockTicket);
        when(paymentRepo.save(any(D17PaymentTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        SubmitD17PaymentRequest req = new SubmitD17PaymentRequest(
                "ORDER",
                "order-1",
                null,
                null,
                120.0,
                "+216 22 333 444",
                "Sent via D17 app",
                "data:image/jpeg;base64,orderproof",
                "image/jpeg"
        );

        D17PaymentResponse res = paymentService.submitPayment(testUser, req);

        assertNotNull(res);
        assertEquals("ORDER", res.type());
        assertEquals("order-1", res.orderId());
        assertEquals("GP-1001", res.orderNumber());
        assertEquals("D17", order.getPaymentMethod());
        assertEquals("PENDING_VERIFICATION", order.getPaymentStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void testApprovePayment_Subscription_Success() {
        D17PaymentTicket ticket = new D17PaymentTicket();
        ticket.setId("pt-1");
        ticket.setTicketNumber("D17-20260916-ABCDE");
        ticket.setUserId("user-1");
        ticket.setUserEmail("sami@example.com");
        ticket.setUserFullName("Sami Ben Ali");
        ticket.setType("SUBSCRIPTION");
        ticket.setSubscriptionTier("BASIC");
        ticket.setAmount(49.0);
        ticket.setStatus("PENDING_VERIFICATION");
        ticket.setSupportTicketId("st-1");

        when(paymentRepo.findById("pt-1")).thenReturn(Optional.of(ticket));
        when(paymentRepo.save(any(D17PaymentTicket.class))).thenAnswer(inv -> inv.getArgument(0));

        ApprovePaymentRequest approveReq = new ApprovePaymentRequest("Screenshot clear, D17 balance verified.");
        D17PaymentResponse res = paymentService.approvePayment("pt-1", testAdmin, approveReq);

        assertNotNull(res);
        assertEquals("APPROVED", res.status());
        assertEquals("admin-1", res.verifiedByAdminId());
        assertNotNull(res.verifiedAt());

        // Verify membership was activated
        verify(membershipService).activateMembershipFromPayment("user-1", "BASIC", 30, "D17-20260916-ABCDE");

        // Verify linked support ticket closed
        verify(supportTicketService).adminCloseTicket("st-1");

        // Verify approval email sent
        verify(mailService).sendD17PaymentApproved(
                eq("sami@example.com"), eq("Sami Ben Ali"), eq("D17-20260916-ABCDE"), eq(49.0), eq("SUBSCRIPTION"), anyString());
    }

    @Test
    void testApprovePayment_AiCredit_Success() {
        D17PaymentTicket ticket = new D17PaymentTicket();
        ticket.setId("pt-ai-1");
        ticket.setTicketNumber("D17-20260916-AICR1");
        ticket.setUserId("user-1");
        ticket.setUserEmail("sami@example.com");
        ticket.setUserFullName("Sami Ben Ali");
        ticket.setType("AI_CREDIT");
        ticket.setAiCredits(5);
        ticket.setAmount(8.0);
        ticket.setStatus("PENDING_VERIFICATION");
        ticket.setSupportTicketId("st-ai-1");

        when(paymentRepo.findById("pt-ai-1")).thenReturn(Optional.of(ticket));
        when(paymentRepo.save(any(D17PaymentTicket.class))).thenAnswer(inv -> inv.getArgument(0));
        when(aiCreditService.addCredits("user-1", 5)).thenReturn(testUser);

        ApprovePaymentRequest approveReq = new ApprovePaymentRequest("Verified 8 TND transfer for 5 AI credits.");
        D17PaymentResponse res = paymentService.approvePayment("pt-ai-1", testAdmin, approveReq);

        assertNotNull(res);
        assertEquals("APPROVED", res.status());
        verify(aiCreditService).addCredits("user-1", 5);
        verify(supportTicketService).adminCloseTicket("st-ai-1");
    }

    @Test
    void testRejectPayment_WithReason_Success() {
        D17PaymentTicket ticket = new D17PaymentTicket();
        ticket.setId("pt-2");
        ticket.setTicketNumber("D17-20260916-XYZ12");
        ticket.setUserId("user-1");
        ticket.setUserEmail("sami@example.com");
        ticket.setUserFullName("Sami Ben Ali");
        ticket.setType("SUBSCRIPTION");
        ticket.setSubscriptionTier("PREMIUM");
        ticket.setAmount(99.0);
        ticket.setStatus("PENDING_VERIFICATION");
        ticket.setSupportTicketId("st-2");

        when(paymentRepo.findById("pt-2")).thenReturn(Optional.of(ticket));
        when(paymentRepo.save(any(D17PaymentTicket.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));

        RejectPaymentRequest rejectReq = new RejectPaymentRequest("Blurry screenshot, recipient phone number not readable.", "Please re-upload");
        D17PaymentResponse res = paymentService.rejectPayment("pt-2", testAdmin, rejectReq);

        assertNotNull(res);
        assertEquals("REJECTED", res.status());
        assertEquals("Blurry screenshot, recipient phone number not readable.", res.rejectionReason());

        // Verify rejection email sent
        verify(mailService).sendD17PaymentRejected(
                eq("sami@example.com"), eq("Sami Ben Ali"), eq("D17-20260916-XYZ12"), eq(99.0),
                eq("Blurry screenshot, recipient phone number not readable."));
    }

    @Test
    void testSlaStatusCalculation() {
        D17PaymentTicket ticketFresh = new D17PaymentTicket();
        ticketFresh.setStatus("PENDING_VERIFICATION");
        ticketFresh.setCreatedAt(Instant.now().minus(5, ChronoUnit.HOURS));
        D17PaymentResponse resFresh = D17PaymentResponse.from(ticketFresh);
        assertEquals("WITHIN_SLA", resFresh.slaStatus());

        D17PaymentTicket ticketWarning = new D17PaymentTicket();
        ticketWarning.setStatus("PENDING_VERIFICATION");
        ticketWarning.setCreatedAt(Instant.now().minus(26, ChronoUnit.HOURS));
        D17PaymentResponse resWarning = D17PaymentResponse.from(ticketWarning);
        assertEquals("SLA_WARNING", resWarning.slaStatus());

        D17PaymentTicket ticketBreached = new D17PaymentTicket();
        ticketBreached.setStatus("PENDING_VERIFICATION");
        ticketBreached.setCreatedAt(Instant.now().minus(50, ChronoUnit.HOURS));
        D17PaymentResponse resBreached = D17PaymentResponse.from(ticketBreached);
        assertEquals("SLA_BREACHED", resBreached.slaStatus());
    }
}
