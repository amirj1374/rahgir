package ir.rayan.businesscore.basedata.model;

/**
 * Toggleable product features. A tenant's plan decides which of these are
 * unlocked. (Base data — products, customers, settings — is always available.)
 */
public enum Feature {
    SALES("فروش"),
    INVENTORY("انبارداری"),
    CRM("مدیریت مشتریان"),
    ACCOUNTING("حسابداری"),
    REPORTS("گزارشات"),
    SUPPLIERS("تامین‌کنندگان"),
    WOOCOMMERCE("اتصال ووکامرس");

    private final String label;

    Feature(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
