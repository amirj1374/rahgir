package ir.rayan.businesscore.basedata.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Advances stock of a product from one pipeline stage to the next. */
public record StageAdvanceRequest(
        @NotNull(message = "محصول الزامی است") Long productId,
        Long variantId,
        @NotNull(message = "انبار الزامی است") Long warehouseId,
        @NotNull(message = "مرحله مبدأ الزامی است") Long fromStageId,
        @NotNull(message = "مرحله مقصد الزامی است") Long toStageId,
        @NotNull @Positive(message = "تعداد باید بزرگ‌تر از صفر باشد") BigDecimal quantity,
        String note
) {}
