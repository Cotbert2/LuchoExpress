package com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String message) {
        super(message);
    }
}
