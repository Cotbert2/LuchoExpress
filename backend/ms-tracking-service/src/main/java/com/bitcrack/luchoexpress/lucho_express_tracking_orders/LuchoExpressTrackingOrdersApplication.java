package com.bitcrack.luchoexpress.lucho_express_tracking_orders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Habilita las tareas programadas
public class LuchoExpressTrackingOrdersApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuchoExpressTrackingOrdersApplication.class, args);
	}

}
