package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Feature;
import ir.rayan.businesscore.basedata.model.TenantType;

import java.util.List;

public record TenantTypeResponse(String name, String label, List<Feature> recommendedFeatures) {
    public static TenantTypeResponse from(TenantType t) {
        return new TenantTypeResponse(t.name(), t.getLabel(), List.copyOf(t.getRecommendedFeatures()));
    }
}
