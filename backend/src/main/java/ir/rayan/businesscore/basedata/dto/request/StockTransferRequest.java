package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Moves stock of one product from one warehouse to another. */
public record StockTransferRequest(
        @NotNull(message = "محصول الزامی است") Long productId,
        Long variantId,
        @NotNull(message = "انبار مبدأ الزامی است") Long fromWarehouseId,
        @NotNull(message = "انبار مقصد الزامی است") Long toWarehouseId,
        @NotNull @Positive(message = "تعداد باید بزرگ‌تر از صفر باشد") BigDecimal quantity,
        String note
) {}
