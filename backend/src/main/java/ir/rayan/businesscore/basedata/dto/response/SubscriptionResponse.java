package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.Tenant;

import java.util.List;

/** A tenant's current subscription: business type, plan, unlocked features,
 *  limits and current usage. */
public record SubscriptionResponse(
        String tenantName,
        String type, String typeLabel,
        String plan, String planLabel, long monthlyPrice,
        List<Feature> features,
        int maxUsers, int usedUsers,
        int maxProducts, int usedProducts
) {
    public static SubscriptionResponse of(Tenant t, int usedUsers, int usedProducts) {
        return new SubscriptionResponse(
                t.getName(),
                t.getType().name(), t.getType().getLabel(),
                t.getPlan().name(), t.getPlan().getLabel(), t.getPlan().getMonthlyPrice(),
                List.copyOf(t.getPlan().getFeatures()),
                t.getPlan().getMaxUsers(), usedUsers,
                t.getPlan().getMaxProducts(), usedProducts);
    }
}
