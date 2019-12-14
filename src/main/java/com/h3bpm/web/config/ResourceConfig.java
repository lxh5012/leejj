//package com.h3bpm.web.config;
//
//import com.h3bpm.base.security.AccessDeniedHandlerImpl;
//import com.h3bpm.base.security.CustomAccessTokenConverter;
//import com.h3bpm.base.security.CustomOAuth2AuthExceptionEntryPoint;
//import org.apache.commons.io.IOUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.core.io.Resource;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
//import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
//import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
//import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
//import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;
//import org.springframework.security.oauth2.provider.token.TokenStore;
//import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
//import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
//
//import java.io.IOException;
//import java.nio.charset.Charset;
//
//@ComponentScan("com.h3bpm.base.security")
//@Configuration
//@EnableResourceServer
//public class ResourceConfig extends ResourceServerConfigurerAdapter {
//
//    @Value("${cloudpivot.api.oauth.enabled:true}")
//    private boolean oauthEnabled;
//
//    @Autowired
//    private AccessDeniedHandlerImpl accessDeniedHandler;
//
//    @Autowired
//    private CustomOAuth2AuthExceptionEntryPoint point;
//
//    @Bean
//    public TokenStore tokenStore() {
//        return new JwtTokenStore(accessTokenConverter());
//    }
//
//    @Bean
//    public JwtAccessTokenConverter accessTokenConverter() {
//        final JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
//        final Resource resource = new ClassPathResource("public.txt");
//        String publicKey;
//        try {
//            publicKey = IOUtils.toString(resource.getInputStream(), Charset.defaultCharset());
//        } catch (final IOException e) {
//            throw new RuntimeException(e);
//        }
//        converter.setVerifierKey(publicKey);
//        converter.setAccessTokenConverter(new CustomAccessTokenConverter());
//        return converter;
//    }
//
//    @Bean
//    public ResourceServerTokenServices tokenServices() {
//        final DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
//        defaultTokenServices.setTokenStore(tokenStore());
//        defaultTokenServices.setTokenEnhancer(accessTokenConverter());
//        defaultTokenServices.setSupportRefreshToken(true);
//        return defaultTokenServices;
//    }
//
//    @Override
//    public void configure(final HttpSecurity http) throws Exception {
//
//        if (oauthEnabled) {
//            http.authorizeRequests()
//                    // swagger start
//                    .antMatchers("/Portal/platform/login").permitAll()
//                    .antMatchers("/login_error.html").permitAll()
//                    .antMatchers("/Portal/js/**").permitAll()
//                    .antMatchers("/Portal/css/**").permitAll()
//                    .antMatchers("/Portal/vendor/**").permitAll()
//                    .antMatchers("/Portal/WFRes/**").permitAll()
//                    .antMatchers("/Portal/lang/**").permitAll()
//                    .antMatchers("/Portal/img/**").permitAll()
//                    .antMatchers("/Portal/fonts/**").permitAll()
//                    .antMatchers("/Cluster/**").permitAll()
//                    .antMatchers("/attached/**").permitAll()
//                    .antMatchers("/Portal/**/*.html").permitAll()
//                    .antMatchers("/Portal/Organization/GetCurrentUser").permitAll()
//                    .antMatchers("/Portal/Organization/LoginIn").permitAll()
//                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                    .anyRequest().authenticated()
//                    .and().exceptionHandling().authenticationEntryPoint(point);
//        } else {
//            http.csrf().disable().headers().frameOptions().sameOrigin().and()
//                    .authorizeRequests()
//                    .antMatchers("/Portal/**").permitAll()
//                    .antMatchers("/portal/**").permitAll()
//                    .antMatchers("/attached/**").permitAll()
//                    .antMatchers("/Cluster/**").permitAll()
//                    .antMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
//                    .antMatchers("/api/**").permitAll()
//                    .and().exceptionHandling();
//        }
//    }
//
//    @Override
//    public void configure(final ResourceServerSecurityConfigurer config) {
//        config.resourceId("api").tokenServices(tokenServices()).tokenStore(tokenStore())
//                .authenticationEntryPoint(point);
//    }
//
//}
