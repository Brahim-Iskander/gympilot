package com.gymtrack.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.CreateOrderRequest;
import com.gymtrack.dto.OrderResponse;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** POST /api/orders - Place order / checkout */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Principal principal) {
        return orderService.createOrder(request, principal.getName());
    }

    /** GET /api/orders/my-orders - User's order history */
    @GetMapping("/my-orders")
    public PagedResponse<OrderResponse> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return orderService.getBuyerOrders(principal.getName(), page, size);
    }

    /** GET /api/orders/{id} - Single order details */
    @GetMapping("/{id}")
    public OrderResponse getOrderById(
            @PathVariable String id,
            Principal principal) {
        return orderService.getOrderById(id, principal.getName(), false);
    }
}
