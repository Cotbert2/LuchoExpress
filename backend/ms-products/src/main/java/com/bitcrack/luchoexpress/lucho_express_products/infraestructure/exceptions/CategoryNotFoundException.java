package com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String message) {
        super(message);
    }
}
