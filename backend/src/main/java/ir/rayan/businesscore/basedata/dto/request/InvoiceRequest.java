package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.Invoice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoiceRequest(
        Invoice.InvoiceType type,
        Invoice.InvoiceStatus status,
        Long customerId,
        String customerName,
        LocalDate issueDate,
        LocalDate dueDate,
        /** Invoice-level discount applied on top of the line subtotal. */
        BigDecimal discount,
        BigDecimal paidAmount,
        String notes,
        @NotEmpty(message = "فاکتور باید حداقل یک ردیف داشته باشد")
        @Valid List<InvoiceItemRequest> items
) {
    public record InvoiceItemRequest(
            Long productId,
            Long variantId,
            String variantLabel,
            String productName,
            String sku,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal discount,
            Integer taxRate
    ) {}
}
