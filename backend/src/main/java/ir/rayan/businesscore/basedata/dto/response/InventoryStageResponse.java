package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.InventoryStage;

public record InventoryStageResponse(
        Long id, String name,
        InventoryStage.Direction direction, String directionLabel,
        Integer sequence, boolean available
) {
    public static InventoryStageResponse from(InventoryStage s) {
        return new InventoryStageResponse(
                s.getId(), s.getName(), s.getDirection(), s.getDirection().getLabel(),
                s.getSequence(), s.isAvailable());
    }
}
