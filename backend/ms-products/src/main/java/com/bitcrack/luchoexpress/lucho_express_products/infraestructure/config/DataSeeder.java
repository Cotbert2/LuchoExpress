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
        // Create categories
        Category electronica = createCategory("Electrónicos", "Dispositivos electrónicos y gadgets");
        Category ropa = createCategory("Ropa y Moda", "Prendas de vestir y accesorios de moda");
        Category hogar = createCategory("Hogar y Jardín", "Artículos para el hogar y jardinería");
        Category deportes = createCategory("Deportes", "Equipos y accesorios deportivos");
        Category libros = createCategory("Libros", "Libros y material educativo");
        Category comida = createCategory("Alimentos", "Comida y bebidas");

        // Create products for Electrónicos
        createProduct(electronica.getId(), "Smartphone Samsung Galaxy S23", 
                     "https://images.samsung.com/is/image/samsung/p6pim/co/sm-s911bzakeub/gallery/co-galaxy-s23-s911-sm-s911bzakeub-534851428",
                     "Smartphone Android con pantalla de 6.1 pulgadas, cámara de 50MP y procesador Snapdragon 8 Gen 2",
                     new BigDecimal("899.99"));

        createProduct(electronica.getId(), "Auriculares Bluetooth Sony WH-1000XM4",
                     "https://www.sony.com/image/5d02da5df6e861db2d8da8b999c2f4b1?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
                     "Auriculares inalámbricos con cancelación de ruido activa y batería de 30 horas",
                     new BigDecimal("349.99"));

        // Create products for Ropa y Moda
        createProduct(ropa.getId(), "Camiseta Nike Dri-FIT",
                     "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/61b4738b-e1e1-4786-8f6c-8d0b8b8e8e8e/dri-fit-uv-miler-running-top-FN3307.png",
                     "Camiseta deportiva con tecnología Dri-FIT para entrenamientos intensos",
                     new BigDecimal("29.99"));

        createProduct(ropa.getId(), "Jeans Levi's 501 Original",
                     "https://lsco.scene7.com/is/image/lsco/005010000_Front_A-SHOT?fmt=jpeg&qlt=70,1&op_sharpen=0&resMode=sharp2&op_usm=0.8,1,8,0&fit=crop,0&wid=750&hei=1000",
                     "Jeans clásicos de corte recto con calidad premium y durabilidad garantizada",
                     new BigDecimal("89.99"));

        // Create products for Hogar y Jardín
        createProduct(hogar.getId(), "Aspiradora Robot iRobot Roomba",
                     "https://www.irobot.com/dw/image/v2/BFXP_PRD/on/demandware.static/-/Sites-master-catalog-irobot/default/dwda6a8b9b/images/large/R675020_1.jpg",
                     "Robot aspirador inteligente con navegación automática y conectividad Wi-Fi",
                     new BigDecimal("299.99"));

        // Create products for Deportes
        createProduct(deportes.getId(), "Pelota de Fútbol Adidas Champions League",
                     "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf1b4d8bb64b9d9e66ac8300c4c4d4_9366/UCL_Pro_Ball_White_GU0209_01_standard.jpg",
                     "Pelota oficial de la UEFA Champions League con tecnología seamless y superficie termosellada",
                     new BigDecimal("149.99"));

        createProduct(deportes.getId(), "Zapatillas Running Nike Air Zoom Pegasus",
                     "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-zoom-pegasus-40-mens-road-running-shoes-6C7ZVt.png",
                     "Zapatillas de running con amortiguación Air Zoom para corredores de todos los niveles",
                     new BigDecimal("129.99"));

        // Create products for Libros
        createProduct(libros.getId(), "Clean Code - Robert C. Martin",
                     "https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
                     "Manual de desarrollo ágil de software. Aprende las mejores prácticas para escribir código limpio",
                     new BigDecimal("45.99"));

        createProduct(libros.getId(), "El Principito - Antoine de Saint-Exupéry",
                     "https://m.media-amazon.com/images/I/41cVgTkpGwL._SX331_BO1,204,203,200_.jpg",
                     "Clásico de la literatura universal sobre la amistad, el amor y la pérdida de la inocencia",
                     new BigDecimal("12.99"));

        // Create products for Alimentos
        createProduct(comida.getId(), "Café Premium Colombiano Juan Valdez",
                     "https://www.juanvaldezcafe.com/images/productos/cafe-molido-balanceado-500g.jpg",
                     "Café 100% colombiano de alta calidad, tostado medio con notas frutales y chocolate",
                     new BigDecimal("18.99"));

        createProduct(comida.getId(), "Chocolate Artesanal 70% Cacao",
                     "https://cdn.shopify.com/s/files/1/0123/4567/8901/products/chocolate-70-cacao_1024x1024.jpg",
                     "Chocolate negro artesanal con 70% de cacao, orgánico y de comercio justo",
                     new BigDecimal("8.99"));

        // Additional products to reach at least 5 products
        createProduct(electronica.getId(), "Tablet iPad Air",
                     "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-select-wifi-blue-202203_FMT_WHH?wid=940&hei=1112&fmt=png-alpha&.v=1645065732688",
                     "Tablet con chip M1, pantalla Liquid Retina de 10.9 pulgadas y compatibilidad con Apple Pencil",
                     new BigDecimal("599.99"));

        createProduct(ropa.getId(), "Chaqueta Deportiva Adidas",
                     "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/1234567890abcdef/essentials-3-stripes-track-jacket-black-HM4452_01_laydown.jpg",
                     "Chaqueta deportiva con las icónicas tres rayas, perfecta para entrenamientos y uso casual",
                     new BigDecimal("79.99"));

        createProduct(hogar.getId(), "Lámpara LED Inteligente Philips Hue",
                     "https://www.philips-hue.com/content/dam/hue-philips-com/global/products/bulbs/white-and-color-ambiance/single-bulb/8718699673147_PK1.png",
                     "Bombilla LED inteligente con 16 millones de colores y control por aplicación móvil",
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
