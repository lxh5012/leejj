package zkkg.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 常量类
 * @author laixh
 * @date 2019/11/27
 */
@Component
public class Constant {
    /**
     * 组织机构顶级id
     */
    public static String ORG_ROOT_ID = "18f923a7-5a5e-426d-94ae-a55ad1a4b240";

    public static String ZK_ORG_ROOT_ID = "00000000-0000-0000-0000-000000000000CCE7AED4";

    public static String ZK_ORG_ROOT_CODE = "01";


    public static  String DRIVER ;
    public static  String URL;
    public static  String USER ;
    public static  String PASSWORD ;

    @Value("${datasource.driver}")
    public  void setDRIVER(String DRIVER) {
        Constant.DRIVER = DRIVER;
    }
    @Value("${datasource.url}")
    public  void setURL(String URL) {
        Constant.URL = URL;
    }
    @Value("${datasource.user}")
    public  void setUSER(String USER) {
        Constant.USER = USER;
    }
    @Value("${datasource.password}")
    public  void setPASSWORD(String PASSWORD) {
        Constant.PASSWORD = PASSWORD;
    }
}
