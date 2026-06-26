package ir.rayan.businesscore.basedata.model;

/**
 * The catalog of system capabilities. These are fixed (the application defines
 * what is possible); tenants compose them into custom roles.
 */
public enum Permission {
    USER_MANAGE("مدیریت کاربران"),
    ROLE_MANAGE("مدیریت نقش‌ها و دسترسی‌ها"),
    BASEDATA_READ("مشاهده اطلاعات پایه"),
    BASEDATA_WRITE("ویرایش اطلاعات پایه"),
    SALES("فروش"),
    INVENTORY("انبارداری"),
    ACCOUNTING("حسابداری"),
    REPORTS("گزارشات");

    private final String label;

    Permission(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
