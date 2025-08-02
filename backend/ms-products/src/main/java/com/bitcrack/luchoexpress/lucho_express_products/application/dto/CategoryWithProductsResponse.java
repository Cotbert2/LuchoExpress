package com.bitcrack.luchoexpress.lucho_express_products.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithProductsResponse {
    
    private CategoryResponse category;
    private List<ProductResponse> products;
}
