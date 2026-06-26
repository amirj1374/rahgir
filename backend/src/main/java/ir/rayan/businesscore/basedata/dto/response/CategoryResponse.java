package ir.rayan.businesscore.basedata.dto.response;

import ir.rayan.businesscore.basedata.model.Category;

public record CategoryResponse(Long id, String name, String parentName, Integer productCount) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getParentName(), c.getProductCount());
    }
}
