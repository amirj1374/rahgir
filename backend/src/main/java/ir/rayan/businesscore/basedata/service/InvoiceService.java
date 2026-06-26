package ir.rayan.businesscore.basedata.service;

import ir.rayan.businesscore.basedata.dto.request.InvoiceRequest;
import ir.rayan.businesscore.basedata.dto.response.InvoiceResponse;
import ir.rayan.businesscore.basedata.exception.ResourceNotFoundException;
import ir.rayan.businesscore.basedata.model.Invoice;
import ir.rayan.businesscore.basedata.model.InvoiceItem;
import ir.rayan.businesscore.basedata.repository.InvoiceRepository;
import ir.rayan.businesscore.basedata.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final InvoiceRepository repository;
    private final CurrentUser currentUser;

    public List<InvoiceResponse> findAll() {
        return repository.findByTenantIdOrderByIssueDateDescIdDesc(currentUser.tenantId())
                .stream().map(InvoiceResponse::from).toList();
    }

    public InvoiceResponse findOne(Long id) {
        return InvoiceResponse.from(load(id));
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setTenantId(currentUser.tenantId());
        invoice.setNumber(nextNumber());
        applyRequest(invoice, request);
        return InvoiceResponse.from(repository.save(invoice));
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest request) {
        Invoice invoice = load(id);
        invoice.getItems().clear();
        applyRequest(invoice, request);
        return InvoiceResponse.from(repository.save(invoice));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsByIdAndTenantId(id, currentUser.tenantId())) {
            throw new ResourceNotFoundException("Invoice", id);
        }
        repository.deleteById(id);
    }

    private Invoice load(Long id) {
        return repository.findByIdAndTenantId(id, currentUser.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }

    /** Rebuilds the line items and recomputes every money total from scratch. */
    private void applyRequest(Invoice invoice, InvoiceRequest request) {
        if (request.type() != null) invoice.setType(request.type());
        invoice.setCustomerId(request.customerId());
        invoice.setCustomerName(request.customerName());
        invoice.setIssueDate(request.issueDate() != null ? request.issueDate() : LocalDate.now());
        invoice.setDueDate(request.dueDate());
        invoice.setNotes(request.notes());
        invoice.setDiscount(nz(request.discount()));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (InvoiceRequest.InvoiceItemRequest r : request.items()) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProductId(r.productId());
            item.setProductName(r.productName());
            item.setSku(r.sku());
            BigDecimal qty = r.quantity() != null ? r.quantity() : BigDecimal.ONE;
            BigDecimal unit = nz(r.unitPrice());
            BigDecimal lineDiscount = nz(r.discount());
            int rate = r.taxRate() != null ? r.taxRate() : 0;

            BigDecimal net = qty.multiply(unit).subtract(lineDiscount).max(BigDecimal.ZERO);
            BigDecimal lineTax = net.multiply(BigDecimal.valueOf(rate)).divide(HUNDRED, 0, RoundingMode.HALF_UP);

            item.setQuantity(qty);
            item.setUnitPrice(unit);
            item.setDiscount(lineDiscount);
            item.setTaxRate(rate);
            item.setLineTotal(net.add(lineTax));

            invoice.getItems().add(item);
            subtotal = subtotal.add(net);
            taxAmount = taxAmount.add(lineTax);
        }

        BigDecimal total = subtotal.subtract(invoice.getDiscount()).max(BigDecimal.ZERO).add(taxAmount);
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(total);
        invoice.setPaidAmount(nz(request.paidAmount()).min(total));

        invoice.setStatus(resolveStatus(invoice, request.status()));
    }

    /**
     * Honours an explicit DRAFT/CANCELLED choice; otherwise derives the status
     * from how much has been paid so the lifecycle stays consistent.
     */
    private Invoice.InvoiceStatus resolveStatus(Invoice invoice, Invoice.InvoiceStatus requested) {
        if (requested == Invoice.InvoiceStatus.DRAFT || requested == Invoice.InvoiceStatus.CANCELLED) {
            return requested;
        }
        BigDecimal paid = invoice.getPaidAmount();
        if (paid.signum() <= 0) return Invoice.InvoiceStatus.CONFIRMED;
        if (paid.compareTo(invoice.getTotal()) >= 0) return Invoice.InvoiceStatus.PAID;
        return Invoice.InvoiceStatus.PARTIALLY_PAID;
    }

    /** INV-<year>-<sequence>, sequence scoped to the tenant. */
    private String nextNumber() {
        long seq = repository.countByTenantId(currentUser.tenantId()) + 1;
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        return String.format("INV-%s-%04d", year, seq);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
