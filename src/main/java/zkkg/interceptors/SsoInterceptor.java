 package zkkg.interceptors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import zkkg.sso.SsoLogin;
/**
 * @author shipeng
 * @date   2019-11-7
 * @description  拦截所有.do 请求,进行单点登录跳转
 * 
 * */
public class SsoInterceptor implements HandlerInterceptor {
    
    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(SsoInterceptor.class);
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object o) throws Exception {
        SsoLogin Sso=new   SsoLogin();
        String loginName=request.getParameter("loginName");
        String type=request.getParameter("type");
        String IsMobile=request.getParameter("IsMobile");
        String WorkItemID=request.getParameter("WorkItemID");
        LOGGER.info("loginName:"+loginName);
        LOGGER.info("type:"+type);
        LOGGER.info("IsMobile:"+IsMobile);
        LOGGER.info("WorkItemID:"+WorkItemID);
        if(type!=null&&"OASSO".equals(type)&&"true".equals(Sso.SSOValidateUser(loginName, request, response))) {
            LOGGER.info("登录成功:");
            if(IsMobile!=null&&("true").equals(IsMobile)){
            response.sendRedirect("/Portal/WorkItemSheets.html?WorkItemID="+WorkItemID+"&IsMobile=true");
            }
            else {
            response.sendRedirect("/Portal/WorkItemSheets.html?WorkItemID="+WorkItemID);
            }
        }
        return false; 
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {
        
    
    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
