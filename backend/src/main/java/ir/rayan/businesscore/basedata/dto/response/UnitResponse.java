package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Unit;

public record UnitResponse(Long id, String name, String symbol, String type) {
    public static UnitResponse from(Unit u) {
        return new UnitResponse(u.getId(), u.getName(), u.getSymbol(), u.getType());
    }
}
