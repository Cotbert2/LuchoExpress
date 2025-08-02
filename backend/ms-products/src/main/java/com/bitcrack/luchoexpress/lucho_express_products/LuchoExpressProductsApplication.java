package com.bitcrack.luchoexpress.lucho_express_products;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class LuchoExpressProductsApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuchoExpressProductsApplication.class, args);
	}

}
