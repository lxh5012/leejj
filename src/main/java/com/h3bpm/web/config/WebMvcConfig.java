package com.h3bpm.web.config;

import OThinker.H3.Controller.Controllers.Designer.WorkflowDesignerController;
import OThinker.H3.Controller.RestfulApi.BPMRestfulApi;
import OThinker.interceptor.LogicUnitCacheInterceptor;
import zkkg.interceptors.SsoInterceptor;

import com.h3bpm.base.interceptors.AuthInterceptor;
import com.h3bpm.base.interceptors.LocaleInterceptor;
import com.h3bpm.base.interceptors.UserInfoInterceptor;

import org.springframework.context.annotation.*;

import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.*;



@Configuration
@ComponentScan(
        basePackages = {"${h3.scanBasePackages:OThinker.H3.Controller.*,com.h3bpm.mobile.controller,com.h3bpm.base.controller.handler}"},
/*        excludeFilters = {@ComponentScan.Filter(type = FilterType.CUSTOM, classes = {SeedLandTypeFilter.class})} */
        excludeFilters = {@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {BPMRestfulApi.class,WorkflowDesignerController.class})}
    )
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("redirect:/Portal/index.html");
        registry.addViewController("/Portal/Mobile/").setViewName("redirect:/Portal/Mobile/index.html");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LocaleInterceptor());
        registry.addInterceptor(new UserInfoInterceptor());
        registry.addInterceptor(new LogicUnitCacheInterceptor());
        registry.addInterceptor(new AuthInterceptor()).addPathPatterns("/Portal/Mobile/**", "/Portal/Platform/**");
        //add by shipeng 2019-11-7 增加SSO单点拦截器，拦截所有.do 请求
        registry.addInterceptor(new  SsoInterceptor()).addPathPatterns("/Portal/*.do/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        /*registry.addResourceHandler("/Portal/**").addResourceLocations("/Portal/");
        registry.addResourceHandler("/Cluster/**").addResourceLocations("/Cluster/");
        registry.addResourceHandler("/attached/**").addResourceLocations("/attached/");*/
    }
  
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedHeaders("*")
                .allowedMethods("*")
                .maxAge(3600);
    }

    @Bean
    public CommonsMultipartResolver commonsMultipartResolver(){
        return new CommonsMultipartResolver();
    }

    /*@Bean
    public PropertyPlaceholderConfigurer propertyPlaceholderConfigurer(){
        final Resource resource = new ClassPathResource("config/h3bpm_portal_app.properties");
        PropertyPlaceholderConfigurer propertyPlaceholderConfigurer = new PropertyPlaceholderConfigurer();
        propertyPlaceholderConfigurer.setLocation(resource);
        propertyPlaceholderConfigurer.setFileEncoding("UTF-8");
        return propertyPlaceholderConfigurer;
    }*/


}
