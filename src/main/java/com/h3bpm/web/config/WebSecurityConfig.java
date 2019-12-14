package com.h3bpm.web.config;

import com.h3bpm.base.security.AccessDeniedHandlerImpl;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@ComponentScan("com.h3bpm.base.security")
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Value("${h3.cas.enabled:true}")
    private boolean casEnabled;

    @Value("${h3.cas.success_target_url}")
    private String successTargetUrl;

    @Value("${h3.cas.failure_targer_url}")
    private String failureTargetUrl;

    @Autowired
    private AuthenticationEntryPoint authenticationEntryPoint;

    @Autowired
    private CasAuthenticationProvider authenticationProvider;

    @Autowired
    private SingleSignOutFilter singleSignOutFilter;

    @Autowired
    private LogoutFilter logoutFilter;

    @Autowired
    private AccessDeniedHandlerImpl accessDeniedHandler;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        if(casEnabled){
            http.csrf().disable().headers().frameOptions().sameOrigin().and()
                    .authorizeRequests()
                    .antMatchers("/login/cas").permitAll()
                    .antMatchers("/logout").permitAll()
                    .antMatchers("/login_error.html").permitAll()

                    .antMatchers("/Cluster/**").permitAll()
                    .antMatchers("/attached/**").permitAll()
                    .antMatchers("/favicon.ico").permitAll()

                    .antMatchers("/Portal/**").permitAll()
                    .antMatchers("/portal/**").permitAll()
                    .antMatchers("/Portal/Mobile/**").permitAll()
                    .antMatchers("/portal/Mobile/**").permitAll()
                    .antMatchers("/portal/mobile/**").permitAll()
                    .antMatchers("/Portal/mobile/**").permitAll()

//                    .antMatchers("/Portal/platform/login").permitAll()
//                    .antMatchers("/Portal/**").permitAll()
//                    .antMatchers("/Portal/js/**").permitAll()
//                    .antMatchers("/Portal/css/**").permitAll()
//                    .antMatchers("/Portal/vendor/**").permitAll()
//                    .antMatchers("/Portal/WFRes/**").permitAll()
//                    .antMatchers("/Portal/lang/**").permitAll()
//                    .antMatchers("/Portal/img/**").permitAll()
//                    .antMatchers("/Portal/fonts/**").permitAll()
//                    .antMatchers("/Portal/TempImages/**").permitAll()
//
//                    .antMatchers("/Portal/**/*.html").permitAll()
//                    .antMatchers("/Portal/Mobile/").permitAll()
//                    .antMatchers("/Portal/Mobile/**/*.html").permitAll()
//                    .antMatchers("/Portal/Mobile/js/**").permitAll()
//                    .antMatchers("/Portal/Mobile/css/**").permitAll()
//                    .antMatchers("/Portal/Mobile/fonts/**").permitAll()
//                    .antMatchers("/Portal/Mobile/img/**").permitAll()
//                    .antMatchers("/Portal/Mobile/lib/**").permitAll()
//                    .antMatchers("/Portal/Mobile/**").permitAll()
//
//                    .antMatchers("/Portal/Organization/GetCurrentUser").permitAll()
//                    .antMatchers("/Portal/Organization/LoginIn").permitAll()
//                    .antMatchers("/Portal/activity-api/**").permitAll()
//                    .antMatchers("/Portal/bpm-api/**").permitAll()
//                    .antMatchers("/Portal/org-api/**").permitAll()
//                    .antMatchers("/Portal/sso-api/**").permitAll()
//                    .antMatchers("/Portal/cloud/**").permitAll()
//                    .antMatchers("/Portal/formEngine/**").permitAll()
//                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .and()
                    .authorizeRequests().anyRequest().authenticated()
                    .and()
                    .httpBasic().authenticationEntryPoint(authenticationEntryPoint)
                    .and()
                    .logout().permitAll().invalidateHttpSession(true)
                    .and()
                    .addFilterBefore(singleSignOutFilter, CasAuthenticationFilter.class).addFilterBefore(logoutFilter, LogoutFilter.class)
                    .exceptionHandling().accessDeniedHandler(accessDeniedHandler);
        } else {
            http.csrf().disable().headers().frameOptions().sameOrigin().and()
                    .authorizeRequests()
                    .antMatchers("/Portal/**").permitAll()
                    .antMatchers("/portal/**").permitAll()
                    .antMatchers("/attached/**").permitAll()
                    .antMatchers("/Cluster/**").permitAll()
                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .and().exceptionHandling();
        }
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth)
            throws Exception {
        auth.authenticationProvider(authenticationProvider);
    }

    @Override
    protected AuthenticationManager authenticationManager() throws Exception {
        //设置cas认证提供
        return new ProviderManager(
                Arrays.asList(authenticationProvider));
    }



    @Bean
    public CasAuthenticationFilter casAuthenticationFilter(ServiceProperties sp)
            throws Exception {
        //cas认证过滤器，当触发本filter时，对ticket进行认证
        CasAuthenticationFilter filter = new CasAuthenticationFilter();
        filter.setServiceProperties(sp);
        filter.setAuthenticationManager(authenticationManager());

        SimpleUrlAuthenticationSuccessHandler successHandler = new SimpleUrlAuthenticationSuccessHandler(successTargetUrl);
    //    successHandler.setAlwaysUseDefaultTargetUrl(true);
        filter.setAuthenticationSuccessHandler(successHandler);
        filter.setAuthenticationFailureHandler(new SimpleUrlAuthenticationFailureHandler(failureTargetUrl));

        return filter;
    }


    @Override
    public void configure(WebSecurity web) throws Exception {
        super.configure(web);
    }

}
