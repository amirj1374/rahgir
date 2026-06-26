package ir.rayan.businesscore.basedata.model;

import java.util.Set;

/**
 * Subscription tiers. The amount paid (the plan) decides which features a
 * tenant can use and the usage limits. -1 means unlimited.
 */
public enum Plan {
    FREE("رایگان", 0L, Set.of(Feature.REPORTS), 2, 50),
    BASIC("پایه", 990_000L,
            Set.of(Feature.SALES, Feature.INVENTORY, Feature.REPORTS), 5, 1_000),
    PRO("حرفه‌ای", 2_490_000L,
            Set.of(Feature.SALES, Feature.INVENTORY, Feature.CRM, Feature.ACCOUNTING, Feature.REPORTS, Feature.WOOCOMMERCE), 20, 20_000),
    ENTERPRISE("سازمانی", 5_900_000L,
            Set.of(Feature.values()), -1, -1);

    private final String label;
    private final long monthlyPrice;     // in Toman
    private final Set<Feature> features;
    private final int maxUsers;          // -1 = unlimited
    private final int maxProducts;       // -1 = unlimited

    Plan(String label, long monthlyPrice, Set<Feature> features, int maxUsers, int maxProducts) {
        this.label = label;
        this.monthlyPrice = monthlyPrice;
        this.features = features;
        this.maxUsers = maxUsers;
        this.maxProducts = maxProducts;
    }

    public String getLabel() { return label; }
    public long getMonthlyPrice() { return monthlyPrice; }
    public Set<Feature> getFeatures() { return features; }
    public int getMaxUsers() { return maxUsers; }
    public int getMaxProducts() { return maxProducts; }
}
