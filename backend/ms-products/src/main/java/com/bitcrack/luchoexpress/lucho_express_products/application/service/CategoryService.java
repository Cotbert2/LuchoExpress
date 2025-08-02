package com.bitcrack.luchoexpress.lucho_express_products.application.service;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.*;
import com.bitcrack.luchoexpress.lucho_express_products.application.mapper.CategoryMapper;
import com.bitcrack.luchoexpress.lucho_express_products.application.mapper.ProductMapper;
import com.bitcrack.luchoexpress.lucho_express_products.domain.Category;
import com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions.CategoryAlreadyExistsException;
import com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions.CategoryNotFoundException;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.CategoryRepository;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;
    private final ProductMapper productMapper;
    
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // Check if category with same name already exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new CategoryAlreadyExistsException("Category with name '" + request.getName() + "' already exists");
        }
        
        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }
    
    public CategoryResponse updateCategory(UUID id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + id + " not found"));
        
        // Check if new name already exists (if changing name)
        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new CategoryAlreadyExistsException("Category with name '" + request.getName() + "' already exists");
            }
        }
        
        categoryMapper.updateEntityFromRequest(category, request);
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }
    
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CategoryWithProductsResponse> getCategoriesWithProducts() {
        List<Category> categories = categoryRepository.findAll();
        
        return categories.stream()
                .map(category -> {
                    CategoryResponse categoryResponse = categoryMapper.toResponse(category);
                    List<ProductResponse> products = productRepository.findByCategoryIdWithCategory(category.getId())
                            .stream()
                            .map(productMapper::toResponse)
                            .collect(Collectors.toList());
                    
                    return new CategoryWithProductsResponse(categoryResponse, products);
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(UUID categoryId) {
        // Verify category exists
        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException("Category with ID " + categoryId + " not found");
        }
        
        return productRepository.findByCategoryIdWithCategory(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }
}
