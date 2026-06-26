package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.InvoiceRequest;
import ir.rayan.businesscore.basedata.dto.response.InvoiceResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Invoice;
import ir.rayan.businesscore.basedata.repository.InvoiceRepository;
import ir.rayan.businesscore.basedata.support.WithMockTenantUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@WithMockTenantUser(authorities = {"SALES"})
class InvoiceServiceTest {

    @Autowired InvoiceService service;
    @Autowired InvoiceRepository repo;

    @BeforeEach
    void clean() {
        repo.deleteAll();
    }

    private InvoiceRequest.InvoiceItemRequest item(String name, long qty, long price, int tax) {
        return new InvoiceRequest.InvoiceItemRequest(
                null, null, null, name, null, BigDecimal.valueOf(qty), BigDecimal.valueOf(price), BigDecimal.ZERO, tax);
    }

    @Test
    void createComputesTotalsAndTax() {
        var req = new InvoiceRequest(Invoice.InvoiceType.SALE, null, null, "علی", null, null,
                BigDecimal.ZERO, BigDecimal.ZERO, null,
                List.of(item("کالا", 2, 100_000, 10)));
        InvoiceResponse inv = service.create(req);

        assertThat(inv.subtotal()).isEqualByComparingTo("200000");
        assertThat(inv.taxAmount()).isEqualByComparingTo("20000");
        assertThat(inv.total()).isEqualByComparingTo("220000");
        assertThat(inv.number()).startsWith("INV-");
        assertThat(inv.status()).isEqualTo(Invoice.InvoiceStatus.CONFIRMED);
    }

    @Test
    void paymentDrivesStatus() {
        var partial = new InvoiceRequest(Invoice.InvoiceType.SALE, null, null, null, null, null,
                BigDecimal.ZERO, BigDecimal.valueOf(50_000), null, List.of(item("x", 1, 100_000, 0)));
        assertThat(service.create(partial).status()).isEqualTo(Invoice.InvoiceStatus.PARTIALLY_PAID);

        var fullyPaid = new InvoiceRequest(Invoice.InvoiceType.SALE, null, null, null, null, null,
                BigDecimal.ZERO, BigDecimal.valueOf(100_000), null, List.of(item("x", 1, 100_000, 0)));
        InvoiceResponse paid = service.create(fullyPaid);
        assertThat(paid.status()).isEqualTo(Invoice.InvoiceStatus.PAID);
        assertThat(paid.balance()).isEqualByComparingTo("0");
    }

    @Test
    void invoiceLevelDiscountReducesTotal() {
        var req = new InvoiceRequest(Invoice.InvoiceType.SALE, null, null, null, null, null,
                BigDecimal.valueOf(30_000), BigDecimal.ZERO, null, List.of(item("x", 1, 100_000, 0)));
        assertThat(service.create(req).total()).isEqualByComparingTo("70000");
    }

    @Test
    void numbersAreSequentialPerTenant() {
        service.create(new InvoiceRequest(null, null, null, null, null, null, null, null, null,
                List.of(item("a", 1, 1000, 0))));
        InvoiceResponse second = service.create(new InvoiceRequest(null, null, null, null, null, null, null, null, null,
                List.of(item("b", 1, 1000, 0))));
        assertThat(second.number()).endsWith("0002");
    }

    @Test
    void deleteMissingThrows() {
        assertThatThrownBy(() -> service.delete(404L)).isInstanceOf(ResourceNotFoundException.class);
    }
}
