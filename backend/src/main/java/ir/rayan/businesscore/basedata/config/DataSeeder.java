package ir.rayan.businesscore.basedata.config;

import ir.rayan.businesscore.basedata.model.*;
import ir.rayan.businesscore.basedata.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final ProductVariantRepository productVariantRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final RoleRepository roleRepo;
    private final InvoiceRepository invoiceRepo;
    private final StockLevelRepository stockLevelRepo;
    private final StockMovementRepository stockMovementRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Tenant tenant = seedTenantUsersAndRoles();
        if (tenant == null) return;
        long tid = tenant.getId();
        seedCompany(tid);
        seedCategories(tid);
        seedUnits(tid);
        seedTaxRates(tid);
        seedWarehouses(tid);
        seedProducts(tid);
        seedInitialStock(tid);
        seedCustomers(tid);
        seedInvoices(tid);
    }

    private Tenant seedTenantUsersAndRoles() {
        if (userRepo.count() > 0) return tenantRepo.findAll().stream().findFirst().orElse(null);

        Tenant tenant = new Tenant();
        tenant.setName("فروشگاه آنلاین رایان");
        tenant.setType(TenantType.ONLINE_SHOP);
        tenant.setPlan(Plan.PRO);
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
        return tenant;
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

    private void seedCompany(long tenantId) {
        if (companyRepo.count() > 0) return;
        Company c = new Company();
        c.setTenantId(tenantId);
        c.setName("فروشگاه آنلاین رایان");
        c.setEmail("info@rayan-shop.ir");
        c.setPhone("021-88765432");
        c.setCurrency("IRR");
        c.setVatRate(10);
        companyRepo.save(c);
    }

    private void seedCategories(long tenantId) {
        if (categoryRepo.count() > 0) return;
        for (String[] row : new String[][]{
                {"پوشاک", "–"}, {"کفش و کیف", "–"}, {"عطر و بهداشت", "–"},
        }) {
            Category cat = new Category();
            cat.setTenantId(tenantId);
            cat.setName(row[0]);
            cat.setParentName(row[1]);
            categoryRepo.save(cat);
        }
    }

    private void seedUnits(long tenantId) {
        if (unitRepo.count() > 0) return;
        for (String[] row : new String[][]{
                {"عدد", "عدد", "تعداد"}, {"کیلوگرم", "kg", "وزن"}, {"متر", "m", "طول"},
        }) {
            Unit u = new Unit();
            u.setTenantId(tenantId);
            u.setName(row[0]);
            u.setSymbol(row[1]);
            u.setType(row[2]);
            unitRepo.save(u);
        }
    }

    private void seedTaxRates(long tenantId) {
        if (taxRepo.count() > 0) return;
        TaxRate vat = new TaxRate();
        vat.setTenantId(tenantId);
        vat.setName("مالیات ارزش افزوده عمومی");
        vat.setRate(10);
        vat.setAppliesTo("همه کالاها");
        vat.setActive(true);
        taxRepo.save(vat);
    }

    private void seedWarehouses(long tenantId) {
        if (warehouseRepo.count() > 0) return;
        Warehouse w = new Warehouse();
        w.setTenantId(tenantId);
        w.setName("انبار اصلی");
        w.setLocation("تهران، انبار مرکزی");
        w.setManager("علی محمدی");
        w.setCapacity(5000);
        w.setActive(true);
        warehouseRepo.save(w);
    }

    private void seedProducts(long tenantId) {
        if (productRepo.count() > 0) return;

        // A variable product: one t-shirt tracked per colour/size combination.
        Product tshirt = new Product();
        tshirt.setTenantId(tenantId);
        tshirt.setSku("TSH-NIKE");
        tshirt.setName("تی‌شرت نایک");
        tshirt.setCategory("پوشاک");
        tshirt.setPrice(BigDecimal.valueOf(185_000));
        tshirt.setType(Product.ProductType.VARIABLE);
        tshirt.setStock(10);
        productRepo.save(tshirt);
        seedVariant(tshirt, "TSH-NIKE-WH-S", "رنگ", "سفید", "سایز", "S", 185_000, 2);
        seedVariant(tshirt, "TSH-NIKE-BK-L", "رنگ", "مشکی", "سایز", "L", 185_000, 3);
        seedVariant(tshirt, "TSH-NIKE-OR-XL", "رنگ", "نارنجی", "سایز", "XL", 195_000, 4);
        seedVariant(tshirt, "TSH-NIKE-WH-M", "رنگ", "سفید", "سایز", "M", 185_000, 1);

        // Simple products: stocked as a whole.
        record P(String sku, String name, String cat, long price, int stock) {}
        List<P> rows = List.of(
                new P("SHO-002", "کفش اسپورت رانینگ", "کفش و کیف", 850_000, 12),
                new P("PRF-005", "عطر مردانه کلاسیک", "عطر و بهداشت", 1_200_000, 35)
        );
        for (P r : rows) {
            Product p = new Product();
            p.setTenantId(tenantId);
            p.setSku(r.sku());
            p.setName(r.name());
            p.setCategory(r.cat());
            p.setPrice(BigDecimal.valueOf(r.price()));
            p.setStock(r.stock());
            productRepo.save(p);
        }
    }

    private void seedVariant(Product product, String sku, String a1n, String a1v, String a2n, String a2v, long price, int stock) {
        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        v.setSku(sku);
        v.setAttr1Name(a1n);
        v.setAttr1Value(a1v);
        v.setAttr2Name(a2n);
        v.setAttr2Value(a2v);
        v.setPrice(BigDecimal.valueOf(price));
        v.setStock(stock);
        productVariantRepo.save(v);
    }

    /**
     * Opens the stock ledger: each product's (or variant's) starting count becomes
     * a PURCHASE into the main warehouse, so the ledger and the cached levels agree.
     */
    private void seedInitialStock(long tenantId) {
        if (stockLevelRepo.count() > 0) return;
        Warehouse warehouse = warehouseRepo.findByTenantId(tenantId).stream().findFirst().orElse(null);
        if (warehouse == null) return;

        for (Product p : productRepo.findByTenantId(tenantId)) {
            List<ProductVariant> variants = productVariantRepo.findByProductId(p.getId());
            if (variants.isEmpty()) {
                openingStock(tenantId, warehouse, p, null,
                        BigDecimal.valueOf(p.getStock() == null ? 0 : p.getStock()));
            } else {
                for (ProductVariant v : variants) {
                    openingStock(tenantId, warehouse, p, v,
                            BigDecimal.valueOf(v.getStock() == null ? 0 : v.getStock()));
                }
            }
        }
    }

    private void openingStock(long tenantId, Warehouse warehouse, Product p, ProductVariant v, BigDecimal qty) {
        long variantId = v != null ? v.getId() : 0L;
        String variantLabel = v != null ? join(v.getAttr1Value(), v.getAttr2Value()) : null;

        StockLevel level = new StockLevel();
        level.setTenantId(tenantId);
        level.setProductId(p.getId());
        level.setVariantId(variantId);
        level.setWarehouseId(warehouse.getId());
        level.setQuantity(qty);
        stockLevelRepo.save(level);

        StockMovement m = new StockMovement();
        m.setTenantId(tenantId);
        m.setProductId(p.getId());
        m.setProductName(p.getName());
        m.setSku(v != null ? v.getSku() : p.getSku());
        m.setVariantId(variantId);
        m.setVariantLabel(variantLabel);
        m.setWarehouseId(warehouse.getId());
        m.setWarehouseName(warehouse.getName());
        m.setType(StockMovement.MovementType.PURCHASE);
        m.setQuantity(qty);
        m.setReference("موجودی اولیه");
        m.setBalanceAfter(qty);
        stockMovementRepo.save(m);
    }

    private String join(String a, String b) {
        if (a == null || a.isBlank()) return b;
        if (b == null || b.isBlank()) return a;
        return a + " / " + b;
    }

    private void seedCustomers(long tenantId) {
        if (customerRepo.count() > 0) return;
        Customer c = new Customer();
        c.setTenantId(tenantId);
        c.setName("علی محمدی");
        c.setPhone("0912-123-4567");
        c.setGroup(Customer.CustomerGroup.VIP);
        c.setBalance(BigDecimal.valueOf(520_000));
        customerRepo.save(c);
    }

    private void seedInvoices(long tenantId) {
        if (invoiceRepo.count() > 0) return;
        Invoice inv = new Invoice();
        inv.setTenantId(tenantId);
        inv.setNumber("INV-1404-0001");
        inv.setType(Invoice.InvoiceType.SALE);
        inv.setCustomerName("علی محمدی");
        inv.setIssueDate(LocalDate.now());

        InvoiceItem item = new InvoiceItem();
        item.setInvoice(inv);
        item.setProductName("تی‌شرت نایک");
        item.setVariantLabel("مشکی / L");
        item.setSku("TSH-NIKE-BK-L");
        item.setQuantity(BigDecimal.valueOf(2));
        item.setUnitPrice(BigDecimal.valueOf(185_000));
        item.setTaxRate(10);
        BigDecimal net = BigDecimal.valueOf(370_000);
        BigDecimal tax = BigDecimal.valueOf(37_000);
        item.setLineTotal(net.add(tax));
        inv.getItems().add(item);

        inv.setSubtotal(net);
        inv.setTaxAmount(tax);
        inv.setTotal(net.add(tax));
        inv.setPaidAmount(net.add(tax));
        inv.setStatus(Invoice.InvoiceStatus.PAID);
        invoiceRepo.save(inv);
    }
}
