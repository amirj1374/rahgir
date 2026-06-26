package ir.rayan.businesscore.basedata.config;

import ir.rayan.businesscore.basedata.model.*;
import ir.rayan.businesscore.basedata.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Seeds a baseline dataset on first run so the app is never empty.
 * Runs only when the relevant tables are empty, so it is safe on every boot.
 * Excluded from the "test" profile.
 */
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepo;
    private final CategoryRepository categoryRepo;
    private final UnitRepository unitRepo;
    private final TaxRateRepository taxRepo;
    private final WarehouseRepository warehouseRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedTenantUsersAndRoles();
        seedCompany();
        seedCategories();
        seedUnits();
        seedTaxRates();
        seedWarehouses();
        seedProducts();
        seedCustomers();
    }

    private void seedTenantUsersAndRoles() {
        if (userRepo.count() > 0) return;

        Tenant tenant = new Tenant();
        tenant.setName("فروشگاه آنلاین رایان");
        tenant.setActive(true);
        tenantRepo.save(tenant);

        Role admin = builtinRole(tenant, "مدیر ارشد", Set.of(Permission.values()));
        Role sales = builtinRole(tenant, "فروش", Set.of(Permission.BASEDATA_READ, Permission.SALES, Permission.REPORTS));
        Role inventory = builtinRole(tenant, "انبارداری", Set.of(Permission.BASEDATA_READ, Permission.INVENTORY));
        builtinRole(tenant, "حسابداری", Set.of(Permission.BASEDATA_READ, Permission.ACCOUNTING, Permission.REPORTS));
        builtinRole(tenant, "مشاهده", Set.of(Permission.BASEDATA_READ, Permission.REPORTS));

        seedUser(tenant, admin, "admin", "admin123", "مدیر سیستم", "admin@rayan.ir");
        seedUser(tenant, sales, "sales", "sales123", "امیر حسینی", "amir@rayan.ir");
        seedUser(tenant, inventory, "warehouse", "ware123", "فاطمه نوری", "fateme@rayan.ir");
    }

    private Role builtinRole(Tenant tenant, String name, Set<Permission> permissions) {
        Role role = new Role();
        role.setTenant(tenant);
        role.setName(name);
        role.setPermissions(new java.util.HashSet<>(permissions));
        role.setBuiltin(true);
        return roleRepo.save(role);
    }

    private void seedUser(Tenant tenant, Role role, String username, String pass, String fullName, String email) {
        User u = new User();
        u.setTenant(tenant);
        u.setRole(role);
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(pass));
        u.setFullName(fullName);
        u.setEmail(email);
        u.setActive(true);
        userRepo.save(u);
    }

    private void seedCompany() {
        if (companyRepo.count() > 0) return;
        Company c = new Company();
        c.setName("فروشگاه آنلاین رایان");
        c.setEmail("info@rayan-shop.ir");
        c.setPhone("021-88765432");
        c.setCurrency("IRR");
        c.setVatRate(10);
        companyRepo.save(c);
    }

    private void seedCategories() {
        if (categoryRepo.count() > 0) return;
        for (String[] row : new String[][]{
                {"پوشاک", "–"}, {"کفش و کیف", "–"}, {"عطر و بهداشت", "–"},
        }) {
            Category cat = new Category();
            cat.setName(row[0]);
            cat.setParentName(row[1]);
            categoryRepo.save(cat);
        }
    }

    private void seedUnits() {
        if (unitRepo.count() > 0) return;
        for (String[] row : new String[][]{
                {"عدد", "عدد", "تعداد"}, {"کیلوگرم", "kg", "وزن"}, {"متر", "m", "طول"},
        }) {
            Unit u = new Unit();
            u.setName(row[0]);
            u.setSymbol(row[1]);
            u.setType(row[2]);
            unitRepo.save(u);
        }
    }

    private void seedTaxRates() {
        if (taxRepo.count() > 0) return;
        TaxRate vat = new TaxRate();
        vat.setName("مالیات ارزش افزوده عمومی");
        vat.setRate(10);
        vat.setAppliesTo("همه کالاها");
        vat.setActive(true);
        taxRepo.save(vat);
    }

    private void seedWarehouses() {
        if (warehouseRepo.count() > 0) return;
        Warehouse w = new Warehouse();
        w.setName("انبار اصلی");
        w.setLocation("تهران، انبار مرکزی");
        w.setManager("علی محمدی");
        w.setCapacity(5000);
        w.setActive(true);
        warehouseRepo.save(w);
    }

    private void seedProducts() {
        if (productRepo.count() > 0) return;
        record P(String sku, String name, String cat, long price, int stock) {}
        List<P> rows = List.of(
                new P("TSH-001", "تی‌شرت مردانه", "پوشاک", 185_000, 125),
                new P("SHO-002", "کفش اسپورت رانینگ", "کفش و کیف", 850_000, 12),
                new P("PRF-005", "عطر مردانه کلاسیک", "عطر و بهداشت", 1_200_000, 35)
        );
        for (P r : rows) {
            Product p = new Product();
            p.setSku(r.sku());
            p.setName(r.name());
            p.setCategory(r.cat());
            p.setPrice(BigDecimal.valueOf(r.price()));
            p.setStock(r.stock());
            productRepo.save(p);
        }
    }

    private void seedCustomers() {
        if (customerRepo.count() > 0) return;
        Customer c = new Customer();
        c.setName("علی محمدی");
        c.setPhone("0912-123-4567");
        c.setGroup(Customer.CustomerGroup.VIP);
        c.setBalance(BigDecimal.valueOf(520_000));
        customerRepo.save(c);
    }
}
