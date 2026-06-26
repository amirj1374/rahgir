package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.TaxRate;

public record TaxRateResponse(Long id, String name, Integer rate, String appliesTo, Boolean active) {
    public static TaxRateResponse from(TaxRate t) {
        return new TaxRateResponse(t.getId(), t.getName(), t.getRate(), t.getAppliesTo(), t.getActive());
    }
}
