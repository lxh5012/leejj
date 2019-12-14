package zkkg.sso;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.h3bpm.base.user.UserValidator;
import com.h3bpm.base.util.AppUtility;
import com.h3bpm.base.util.Sessions;
import OThinker.Common.DotNetToJavaStringHelper;
import OThinker.Common.Organization.Models.User;
import OThinker.Common.Organization.enums.UserServiceState;
import OThinker.H3.Controller.ControllerBase;
import OThinker.H3.Entity.IEngine;
import OThinker.H3.Entity.Site.PortalType;

public class SsoLogin extends ControllerBase {
    private static final Logger LOGGER = LoggerFactory.getLogger(SsoLogin.class);

    /**
     * <p>
     * @Title: SSOValidateUser
     * </p>
     * <p>
     * @Description: h3自身单点登录
     * </p>
     * 
     * @param userCode
     * @param urlcode
     * @return String 返回类型
     * @throws @throws
     * @author shipeng
     * @date 2019年11月7日 
     */
    public String SSOValidateUser(String userCode, HttpServletRequest request, HttpServletResponse response) {
        this.request = request;
        UserValidator userValidator = null;
        String JSESSIONID = "";
        boolean flag = false;
        LOGGER.info(">>中科接口_SSOValidateUser start...userCode=" + userCode);
        try {
            if (DotNetToJavaStringHelper.isNullOrEmpty(userCode)) {
                flag = false;
            }

            User user = getEngine().getOrganization().GetUserByCode(userCode);
            if (user != null) {
                userValidator = this.GetUserValidator(user);
                if (userValidator != null) {
                    // 当前用户登录
                    request.getSession().setMaxInactiveInterval(12 * 60 * 60);
                    request.getSession().setAttribute(Sessions.GetUserValidator(), userValidator);
                    AppUtility.OnUserLogin(userValidator, PortalType.UserPortal, "", "", "");
                    JSESSIONID = request.getSession().getId();
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    User currentUser = null;
                    currentUser = this.getUserValidator().getUser();// 获取当前登录用户
                    System.out.println("当前登录用户：" + currentUser);
                    if (currentUser != null) {
                        flag = true;
                    } else {
                        flag = false;
                    }
                }
            } else {
                flag = false;

            }
            if(flag)
            {
                   return "true";              
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "false";
    }

    private UserValidator GetUserValidator(User user) {
        UserValidator userValidator = null;
        String tempImagesPath = System.getProperty("user.dir") + "/TempImages";
        IEngine engine = AppUtility.getEngine();
        if (user == null || user.getServiceState() == UserServiceState.Dismissed || user.getIsVirtualUser()) {
              return null;
        }
          try {
                userValidator = new UserValidator(request, engine, user.getObjectID(), tempImagesPath, null);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                 e.printStackTrace();
            }

        return userValidator;
    }

    @Override
    public String getFunctionCode() {
        // TODO Auto-generated method stub
        return null;
    }

}
