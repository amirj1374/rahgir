package ir.rayan.businesscore.basedata.config;

import ir.rayan.businesscore.basedata.model.*;
import ir.rayan.businesscore.basedata.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

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

    @Override
    public void run(String... args) {
        seedCompany();
        seedCategories();
        seedUnits();
        seedTaxRates();
        seedWarehouses();
        seedProducts();
        seedCustomers();
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
