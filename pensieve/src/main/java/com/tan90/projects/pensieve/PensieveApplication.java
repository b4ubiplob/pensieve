package com.tan90.projects.pensieve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PensieveApplication {

	public static void main(String[] args) {
		SpringApplication.run(PensieveApplication.class, args);
	}

}
