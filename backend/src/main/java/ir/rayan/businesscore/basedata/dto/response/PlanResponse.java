package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.Plan;

import java.util.List;

public record PlanResponse(
        String name, String label, long monthlyPrice,
        List<Feature> features, int maxUsers, int maxProducts
) {
    public static PlanResponse from(Plan p) {
        return new PlanResponse(p.name(), p.getLabel(), p.getMonthlyPrice(),
                List.copyOf(p.getFeatures()), p.getMaxUsers(), p.getMaxProducts());
    }
}
