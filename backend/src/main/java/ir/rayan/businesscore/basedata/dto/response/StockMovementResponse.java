package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id, Long productId, String productName, String sku,
        Long variantId, String variantLabel,
        Long warehouseId, String warehouseName,
        StockMovement.MovementType type, String typeLabel,
        BigDecimal quantity, String reference, String note,
        LocalDateTime createdAt, BigDecimal balanceAfter
) {
    public static StockMovementResponse from(StockMovement m) {
        return new StockMovementResponse(
                m.getId(), m.getProductId(), m.getProductName(), m.getSku(),
                m.getVariantId(), m.getVariantLabel(),
                m.getWarehouseId(), m.getWarehouseName(),
                m.getType(), m.getType().getLabel(),
                m.getQuantity(), m.getReference(), m.getNote(),
                m.getCreatedAt(), m.getBalanceAfter());
    }
}
