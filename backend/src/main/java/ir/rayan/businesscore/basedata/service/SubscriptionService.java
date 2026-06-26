package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.response.PlanResponse;
import ir.rayan.businesscore.basedata.dto.response.SubscriptionResponse;
import ir.rayan.businesscore.basedata.dto.response.TenantTypeResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.Plan;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.model.TenantType;
import ir.rayan.businesscore.basedata.repository.ProductRepository;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import ir.rayan.businesscore.basedata.repository.UserRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    public SubscriptionResponse current() {
        Tenant tenant = currentTenant();
        int usedUsers = (int) userRepository.findByTenantId(tenant.getId()).size();
        int usedProducts = (int) productRepository.count();
        return SubscriptionResponse.of(tenant, usedUsers, usedProducts);
    }

    public List<PlanResponse> plans() {
        return List.of(Plan.values()).stream().map(PlanResponse::from).toList();
    }

    public List<TenantTypeResponse> types() {
        return List.of(TenantType.values()).stream().map(TenantTypeResponse::from).toList();
    }

    @Transactional
    public SubscriptionResponse changePlan(Plan plan) {
        Tenant tenant = currentTenant();
        tenant.setPlan(plan);
        tenantRepository.save(tenant);
        return current();
    }

    @Transactional
    public SubscriptionResponse changeType(TenantType type) {
        Tenant tenant = currentTenant();
        tenant.setType(type);
        tenantRepository.save(tenant);
        return current();
    }

    /** Whether the caller's tenant has the given feature unlocked by its plan. */
    public boolean hasFeature(Feature feature) {
        return currentTenant().getPlan().getFeatures().contains(feature);
    }

    private Tenant currentTenant() {
        Long id = currentUser.tenantId();
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));
    }
}
