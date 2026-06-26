package ir.rayan.businesscore.basedata.security;

import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.Tenant;
import ir.rayan.businesscore.basedata.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * Enforces the subscription model on the server: a tenant may only reach a
 * feature's endpoints if its purchased plan unlocks that feature. This backs up
 * the frontend gating so the "pay for what you use" model can't be bypassed by
 * calling the API directly. Role permissions are checked separately in security
 * config; this is the orthogonal plan/feature gate.
 */
@Component
@RequiredArgsConstructor
public class FeatureAccessInterceptor implements HandlerInterceptor {

    /** Path prefix → the feature a tenant's plan must include to use it. */
    private static final Map<String, Feature> GATED = Map.of(
            "/api/invoices", Feature.SALES,
            "/api/inventory", Feature.INVENTORY
    );

    private final TenantRepository tenantRepository;
    private final CurrentUser currentUser;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String path = request.getRequestURI();
        Feature required = GATED.entrySet().stream()
                .filter(e -> path.startsWith(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst().orElse(null);
        if (required == null) return true;

        Tenant tenant = tenantRepository.findById(currentUser.tenantId()).orElse(null);
        boolean unlocked = tenant != null && tenant.getPlan().getFeatures().contains(required);
        if (!unlocked) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            return false;
        }
        return true;
    }
}
