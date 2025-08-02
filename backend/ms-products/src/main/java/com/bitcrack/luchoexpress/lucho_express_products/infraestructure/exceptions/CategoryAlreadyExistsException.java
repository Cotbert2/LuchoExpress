package com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions;

public class CategoryAlreadyExistsException extends RuntimeException {
    public CategoryAlreadyExistsException(String message) {
        super(message);
    }
}
