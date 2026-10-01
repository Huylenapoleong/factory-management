package com.company.factory.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global Web MVC configuration.
 * Automatically injects the configurable API prefix (default: /api/v1) to all @RestController endpoints,
 * keeping controller @RequestMapping annotations clean, RESTful, and centrally managed via application.yml / .env.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.api.prefix:/api/v1}")
    private String apiPrefix;

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(apiPrefix, HandlerTypePredicate.forAnnotation(RestController.class));
    }
}
