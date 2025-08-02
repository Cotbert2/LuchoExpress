package com.bitcrack.luchoexpress.lucho_express_products.application.mapper;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.CategoryResponse;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.CreateCategoryRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.UpdateCategoryRequest;
import com.bitcrack.luchoexpress.lucho_express_products.domain.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    
    public Category toEntity(CreateCategoryRequest request) {
        return new Category(
            request.getName(),
            request.getDescription()
        );
    }
    
    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
    
    public void updateEntityFromRequest(Category category, UpdateCategoryRequest request) {
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
    }
}
