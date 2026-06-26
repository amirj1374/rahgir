package ir.rayan.businesscore.basedata.model;

import java.util.Set;

/**
 * The kind of business a tenant runs. Drives the recommended/default feature
 * set; the actual unlocked features are still governed by the purchased plan.
 * Ordered by product priority: online shops, retail stores, traders/importers,
 * then manufacturers.
 */
public enum TenantType {
    ONLINE_SHOP("فروشگاه آنلاین",
            Set.of(Feature.SALES, Feature.INVENTORY, Feature.CRM, Feature.WOOCOMMERCE, Feature.REPORTS)),
    RETAIL_STORE("مغازه و خرده‌فروشی",
            Set.of(Feature.SALES, Feature.INVENTORY, Feature.REPORTS)),
    TRADER("بازرگانی، خرید و فروش و واردات",
            Set.of(Feature.SALES, Feature.INVENTORY, Feature.SUPPLIERS, Feature.ACCOUNTING, Feature.REPORTS)),
    MANUFACTURER("کارخانه و تولیدی",
            Set.of(Feature.INVENTORY, Feature.SUPPLIERS, Feature.ACCOUNTING, Feature.REPORTS));

    private final String label;
    private final Set<Feature> recommendedFeatures;

    TenantType(String label, Set<Feature> recommendedFeatures) {
        this.label = label;
        this.recommendedFeatures = recommendedFeatures;
    }

    public String getLabel() {
        return label;
    }

    public Set<Feature> getRecommendedFeatures() {
        return recommendedFeatures;
    }
}
