package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableFeignClients
@ComponentScan(basePackages = {
    "com.bitcrack.luchoexpresstracking.trancking_service_lucho_express",
    "main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express"
})
public class TranckingServiceLuchoExpressApplication {

	public static void main(String[] args) {
		SpringApplication.run(TranckingServiceLuchoExpressApplication.class, args);
	}

}
