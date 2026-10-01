package com.company.factory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class FactoryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FactoryManagementApplication.class, args);
    }
}
