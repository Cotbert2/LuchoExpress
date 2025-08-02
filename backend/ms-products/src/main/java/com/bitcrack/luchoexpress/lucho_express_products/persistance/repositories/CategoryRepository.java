package com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories;

import com.bitcrack.luchoexpress.lucho_express_products.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    boolean existsByName(String name);
}
