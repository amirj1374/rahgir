package ir.rayan.businesscore.basedata.dto.request;

import ir.rayan.businesscore.basedata.model.InventoryStage;
import jakarta.validation.constraints.NotBlank;

/** Defines or edits one step in a tenant's warehouse pipeline. */
public record InventoryStageRequest(
        @NotBlank(message = "نام مرحله الزامی است") String name,
        InventoryStage.Direction direction,
        Integer sequence,
        Boolean available
) {}
