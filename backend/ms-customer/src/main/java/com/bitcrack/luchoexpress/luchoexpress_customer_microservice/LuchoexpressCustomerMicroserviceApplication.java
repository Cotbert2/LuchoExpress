package com.bitcrack.luchoexpress.luchoexpress_customer_microservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class LuchoexpressCustomerMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuchoexpressCustomerMicroserviceApplication.class, args);
	}

}
