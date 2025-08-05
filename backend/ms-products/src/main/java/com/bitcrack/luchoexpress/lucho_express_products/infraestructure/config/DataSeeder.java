package com.bitcrack.luchoexpress.lucho_express_products.infraestructure.config;

import com.bitcrack.luchoexpress.lucho_express_products.domain.Category;
import com.bitcrack.luchoexpress.lucho_express_products.domain.Product;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.CategoryRepository;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedData() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding categories and products data...");
            seedCategories();
            log.info("Data seeding completed successfully!");
        } else {
            log.info("Data already exists, skipping seeding.");
        }
    }

private void seedCategories() {
    Category electronics = createCategory("Electronics", "Electronic devices and gadgets");
    Category clothing = createCategory("Clothing & Fashion", "Clothing and fashion accessories");
    Category home = createCategory("Home & Garden", "Home and gardening products");
    Category sports = createCategory("Sports", "Sports equipment and accessories");
    Category books = createCategory("Books", "Books and educational material");
    Category food = createCategory("Food & Beverages", "Food and drinks");

    // Create products for Electronics
    createProduct(electronics.getId(), "Samsung Galaxy S23 Smartphone",
                 "https://m.media-amazon.com/images/I/61yUiD1CVML._AC_SL1500_.jpg",
                 "Android smartphone with 6.1-inch display, 50MP camera, and Snapdragon 8 Gen 2 processor",
                 new BigDecimal("899.99"));

    createProduct(electronics.getId(), "Sony WH-1000XM4 Bluetooth Headphones",
                 "https://www.sony.com.ec/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
                 "Wireless headphones with active noise cancellation and 30-hour battery life",
                 new BigDecimal("349.99"));

    // Create products for Clothing & Fashion
    createProduct(clothing.getId(), "Nike Dri-FIT T-Shirt",
                 "https://m.media-amazon.com/images/I/61SRQf1Z+0L._AC_SL1500_.jpg",
                 "Sports T-shirt with Dri-FIT technology for intense workouts",
                 new BigDecimal("29.99"));

    createProduct(clothing.getId(), "Levi's 501 Original Jeans",
                 "https://i5.walmartimages.com/seo/Levi-s-Men-s-501-Original-Fit-Jeans_d88ed239-b830-458d-896a-94b25e6bc0ce.b84e99c57efcbdc9f16c05836cc10806.jpeg",
                 "Classic straight-cut jeans with premium quality and guaranteed durability",
                 new BigDecimal("89.99"));

    // Create products for Home & Garden
    createProduct(home.getId(), "iRobot Roomba Robot Vacuum",
                 "https://http2.mlstatic.com/D_NQ_NP_634956-MEC70542895126_072023-O.webp",
                 "Smart robot vacuum with automatic navigation and Wi-Fi connectivity",
                 new BigDecimal("299.99"));

    // Create products for Sports
    createProduct(sports.getId(), "Adidas Champions League Soccer Ball",
                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaPFccZ2iT_OqegKjPaqiMoTwZ0pWS4-3XZg&s",
                 "Official UEFA Champions League ball with seamless technology and thermally bonded surface",
                 new BigDecimal("149.99"));

    createProduct(sports.getId(), "Nike Air Zoom Pegasus Running Shoes",
                 "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-zoom-pegasus-40-mens-road-running-shoes-6C7ZVt.png",
                 "Running shoes with Air Zoom cushioning for runners of all levels",
                 new BigDecimal("129.99"));

    // Create products for Books
    createProduct(books.getId(), "Clean Code - Robert C. Martin",
                 "https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
                 "Agile software development handbook. Learn best practices for writing clean code",
                 new BigDecimal("45.99"));

    createProduct(books.getId(), "The Little Prince - Antoine de Saint-Exupéry",
                 "https://m.media-amazon.com/images/I/71OZY035QKL._UF1000,1000_QL80_.jpg",
                 "Classic literary tale about friendship, love, and the loss of innocence",
                 new BigDecimal("12.99"));

    // Create products for Food & Beverages
    createProduct(food.getId(), "Juan Valdez Premium Colombian Coffee",
                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHdp71l39sh-KGcDC1odHWx-36bvPS73LmUQ&s",
                 "100% Colombian high-quality coffee, medium roast with fruity and chocolate notes",
                 new BigDecimal("18.99"));

    createProduct(food.getId(), "70% Cacao Artisan Dark Chocolate",
                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS32ixpELtgSu9lEjQKQZlUB3TFCgx59DkxmA&s",
                 "Artisan dark chocolate with 70% cacao, organic and fair trade",
                 new BigDecimal("8.99"));

    // Additional products
    createProduct(electronics.getId(), "iPad Air Tablet",
                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShtM61evC32i3-d1sUSV-lF-mhTbCh5g0HtA&s",
                 "Tablet with M1 chip, 10.9-inch Liquid Retina display, and Apple Pencil support",
                 new BigDecimal("599.99"));

    createProduct(clothing.getId(), "Adidas Sports Jacket",
                 "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/ba91a7ee28c345858d54e1ecf7caab7d_9366/z.n.e.-full-zip-hooded-track-jacket.jpg",
                 "Sports jacket with iconic three stripes, ideal for workouts and casual wear",
                 new BigDecimal("79.99"));

    createProduct(home.getId(), "Philips Hue Smart LED Bulb",
                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaHSYxQmD-KI5zhz1LjgAzTrpUBoAQ5UVYDw&s",
                 "Smart LED bulb with 16 million colors and mobile app control",
                 new BigDecimal("49.99"));

    log.info("Created {} categories and {} products", categoryRepository.count(), productRepository.count());
}


    private Category createCategory(String name, String description) {
        Category category = new Category(name, description);
        Category saved = categoryRepository.save(category);
        log.debug("Created category: {}", saved.getName());
        return saved;
    }

    private Product createProduct(UUID categoryId, String name, String imageUrl, String description, BigDecimal price) {
        Product product = new Product(categoryId, name, imageUrl, description, price);
        Product saved = productRepository.save(product);
        log.debug("Created product: {}", saved.getName());
        return saved;
    }
}
