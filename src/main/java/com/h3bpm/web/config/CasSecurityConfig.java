package com.h3bpm.web.config;


import com.h3bpm.base.security.CASUserDetailsServiceImpl;
import com.h3bpm.base.security.CustomCasAuthenticationEntryPoint;
import com.h3bpm.base.security.UserDetailsServiceImpl;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.jasig.cas.client.session.SingleSignOutHttpSessionListener;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.jasig.cas.client.validation.TicketValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.event.EventListener;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;

import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

import javax.servlet.http.HttpSessionEvent;

@Configuration
public class CasSecurityConfig {

    @Value("${h3.cas.server_url}")
    private String casServerUrl;

    @Value("${h3.cas.localhost}")
    private String localhost;

    @Bean
    public ServiceProperties serviceProperties() {
        ServiceProperties serviceProperties = new ServiceProperties();
        //本机服务，访问/login/cas时进行校验登录
        serviceProperties.setService(localhost + "/login/cas");
        serviceProperties.setSendRenew(false);
        return serviceProperties;
    }

    @Bean
    @Primary
    public AuthenticationEntryPoint authenticationEntryPoint(
            ServiceProperties sp) {

        CustomCasAuthenticationEntryPoint entryPoint
                = new CustomCasAuthenticationEntryPoint();
        //cas登录服务
        entryPoint.setLoginUrl(casServerUrl + "/login");
        entryPoint.setServiceProperties(sp);
        return entryPoint;
    }

    @Bean
    public TicketValidator ticketValidator() {
        //指定cas校验器
        return new Cas20ServiceTicketValidator(
                casServerUrl);
    }

    //cas认证
    @Bean
    public CasAuthenticationProvider casAuthenticationProvider() {

        CasAuthenticationProvider provider = new CasAuthenticationProvider();
        provider.setServiceProperties(serviceProperties());
        provider.setTicketValidator(ticketValidator());
        provider.setUserDetailsService(new CASUserDetailsServiceImpl());
        //固定响应用户，在生产环境中需要额外设置用户映射
        /*provider.setUserDetailsService(
                s -> new User("auth-user", "123", true, true, true, true,
                        AuthorityUtils.createAuthorityList("ROLE_ADMIN")));*/
        provider.setKey("an_id_for_this_auth_provider_only");
        return provider;
    }


    @Bean
    public SecurityContextLogoutHandler securityContextLogoutHandler() {
        return new SecurityContextLogoutHandler();
    }

    @Bean
    public LogoutFilter logoutFilter() {
        //退出后转发路径
        LogoutFilter logoutFilter = new LogoutFilter(
                casServerUrl + "/logout?service=" + localhost,
                securityContextLogoutHandler());
        //cas退出
        logoutFilter.setFilterProcessesUrl("/logout");
        return logoutFilter;
    }

    @Bean
    public SingleSignOutFilter singleSignOutFilter() {
        //单点退出
        SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
        singleSignOutFilter.setCasServerUrlPrefix(casServerUrl);
        singleSignOutFilter.setIgnoreInitConfiguration(true);
        return singleSignOutFilter;
    }

    //设置退出监听
    @EventListener
    public SingleSignOutHttpSessionListener singleSignOutHttpSessionListener(
            HttpSessionEvent event) {
        return new SingleSignOutHttpSessionListener();
    }

}
