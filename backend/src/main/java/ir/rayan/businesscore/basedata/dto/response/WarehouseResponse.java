package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Warehouse;

public record WarehouseResponse(Long id, String name, String location, String manager, Integer capacity, Boolean active) {
    public static WarehouseResponse from(Warehouse w) {
        return new WarehouseResponse(w.getId(), w.getName(), w.getLocation(), w.getManager(), w.getCapacity(), w.getActive());
    }
}
