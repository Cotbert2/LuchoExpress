package com.bitcrack.luchoexpress.luchoexpress_auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class LuchoexpressAuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuchoexpressAuthServiceApplication.class, args);
	}

}
