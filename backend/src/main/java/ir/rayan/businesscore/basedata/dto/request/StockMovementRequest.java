package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.StockMovement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Records a manual stock movement (receipt, or an inventory adjustment). */
public record StockMovementRequest(
        @NotNull(message = "محصول الزامی است") Long productId,
        /** Optional: the colour/size variant. Null/0 for a product with no variants. */
        Long variantId,
        @NotNull(message = "انبار الزامی است") Long warehouseId,
        @NotNull(message = "نوع حرکت الزامی است") StockMovement.MovementType type,
        @NotNull @Positive(message = "تعداد باید بزرگ‌تر از صفر باشد") BigDecimal quantity,
        String note
) {}
