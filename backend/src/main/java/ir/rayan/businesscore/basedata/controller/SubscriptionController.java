package ir.rayan.businesscore.basedata.controller;

import ir.rayan.businesscore.basedata.dto.ApiResponse;
import ir.rayan.businesscore.basedata.dto.response.PlanResponse;
import ir.rayan.businesscore.basedata.dto.response.SubscriptionResponse;
import ir.rayan.businesscore.basedata.dto.response.TenantTypeResponse;
import ir.rayan.businesscore.basedata.model.Plan;
import ir.rayan.businesscore.basedata.model.TenantType;
import ir.rayan.businesscore.basedata.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService service;

    /** Current tenant's subscription — readable by any authenticated user. */
    @GetMapping
    public ApiResponse<SubscriptionResponse> current() {
        return ApiResponse.ok(service.current());
    }

    @GetMapping("/plans")
    public ApiResponse<List<PlanResponse>> plans() {
        return ApiResponse.ok(service.plans());
    }

    @GetMapping("/types")
    public ApiResponse<List<TenantTypeResponse>> types() {
        return ApiResponse.ok(service.types());
    }

    @PutMapping("/plan")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ApiResponse<SubscriptionResponse> changePlan(@RequestParam Plan plan) {
        return ApiResponse.ok(service.changePlan(plan));
    }

    @PutMapping("/type")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ApiResponse<SubscriptionResponse> changeType(@RequestParam TenantType type) {
        return ApiResponse.ok(service.changeType(type));
    }
}
