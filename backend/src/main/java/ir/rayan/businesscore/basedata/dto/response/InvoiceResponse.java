package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Invoice;
import ir.rayan.businesscore.basedata.model.InvoiceItem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoiceResponse(
        Long id, String number,
        Invoice.InvoiceType type, Invoice.InvoiceStatus status,
        Long customerId, String customerName,
        LocalDate issueDate, LocalDate dueDate,
        BigDecimal subtotal, BigDecimal discount, BigDecimal taxAmount,
        BigDecimal total, BigDecimal paidAmount, BigDecimal balance,
        String notes, List<ItemResponse> items
) {
    public record ItemResponse(
            Long id, Long productId, Long variantId, String variantLabel,
            String productName, String sku,
            BigDecimal quantity, BigDecimal unitPrice, BigDecimal discount,
            Integer taxRate, BigDecimal lineTotal
    ) {
        static ItemResponse from(InvoiceItem i) {
            return new ItemResponse(i.getId(), i.getProductId(), i.getVariantId(), i.getVariantLabel(),
                    i.getProductName(), i.getSku(),
                    i.getQuantity(), i.getUnitPrice(), i.getDiscount(), i.getTaxRate(), i.getLineTotal());
        }
    }

    public static InvoiceResponse from(Invoice inv) {
        List<ItemResponse> items = inv.getItems() == null ? List.of()
                : inv.getItems().stream().map(ItemResponse::from).toList();
        return new InvoiceResponse(
                inv.getId(), inv.getNumber(), inv.getType(), inv.getStatus(),
                inv.getCustomerId(), inv.getCustomerName(), inv.getIssueDate(), inv.getDueDate(),
                inv.getSubtotal(), inv.getDiscount(), inv.getTaxAmount(),
                inv.getTotal(), inv.getPaidAmount(), inv.balance(), inv.getNotes(), items);
    }
}
