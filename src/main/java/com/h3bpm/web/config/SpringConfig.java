package com.h3bpm.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Controller;

import javax.jws.WebService;

@Configuration
@ComponentScan(
        basePackages = {"OThinker", "OThinker.H3.service", "com.h3bpm.base.operator", "com.h3bpm.mobile.operators", "com.h3bpm.base.engine", "com.h3bpm.base.util"},
        excludeFilters = {@ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})}
        )
public class SpringConfig {

    /*@Bean
    public SpringContextHolder springContextHolder(){
        return new SpringContextHolder();
    }*/

    @Bean(name = "messageSource")
    public ResourceBundleMessageSource resourceBundleMessageSource(){
        ResourceBundleMessageSource resourceBundleMessageSource = new ResourceBundleMessageSource();
        resourceBundleMessageSource.setBasenames("config/messages/message");
        resourceBundleMessageSource.setDefaultEncoding("UTF-8");
        return resourceBundleMessageSource;
    }

    /*@Bean
    public PropertyConfigurer propertyConfigurer(){
        PropertyConfigurer propertyConfigurer = new PropertyConfigurer();
        final Resource resource = new ClassPathResource("config/h3bpm_portal_app.properties");
        propertyConfigurer.setLocation(resource);
        propertyConfigurer.setFileEncoding("UTF-8");
        return propertyConfigurer;
    }*/

}
