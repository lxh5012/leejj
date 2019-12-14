package zkkg.util;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import zkkg.controller.OrgUnitSyncController;
import zkkg.vo.ZkOrgInfo;
import zkkg.vo.ZkUserInfo;


 public class JdbcUtil {
     private static final Logger LOGGER = LoggerFactory.getLogger(OrgUnitSyncController.class);
//     private static final String DRIVER = "oracle.jdbc.driver.OracleDriver";
//     private static  final String URL = "jdbc:oracle:thin:@127.0.0.1:1521:orcl";
//     private static  final String USER = "H3BPMTEST";
//     private static  final String PASSWORD = "Sp481085";


     /**
      * 加载驱动程序
      */
     static {
         try {
             Class.forName(Constant.DRIVER);
         } catch (ClassNotFoundException e) {
             e.printStackTrace();
         }
     }

     /**
      * @return 连接对象
      */
     public static Connection getConn() {
         try {
             return DriverManager.getConnection(Constant.URL, Constant.USER, Constant.PASSWORD);
         } catch (SQLException e) {

             e.printStackTrace();
         }
         return null;
     }

     /**
      * 释放资源
      *
      * @param conn 连接对象
      * @param  preparedStatement 预编译对象
      * @param   rs 结果集
      */
     public static void colseResource(Connection conn, PreparedStatement preparedStatement, ResultSet rs) {
         closeResultSet(rs);
         closeStatement(preparedStatement);
         closeConnection(conn);
     }

     /**
      * 释放连接 Connection
      *
      * @param conn 连接对象
      */
     public static void closeConnection(Connection conn) {
         if (conn != null) {
             try {
                 conn.close();
             } catch (SQLException e) {
                 e.printStackTrace();
             }
         }
         //等待垃圾回收
         conn = null;
     }

     /**
      * 释放语句执行者 preparedStatement
      *
      * @param preparedStatement 预编译
      */
     public static void closeStatement(PreparedStatement preparedStatement) {
         if (preparedStatement != null) {
             try {
                 preparedStatement.close();
             } catch (SQLException e) {
                 e.printStackTrace();
             }
         }
         //等待垃圾回收
         preparedStatement = null;
     }

     /**
      * 释放结果集 ResultSet
      *
      * @param rs
      */
     public static void closeResultSet(ResultSet rs) {
         if (rs != null) {
             try {
                 rs.close();
             } catch (SQLException e) {
                 e.printStackTrace();
             }
         }
         //等待垃圾回收
         rs = null;
     }

     /**
            * 模拟测试查询组织机构信息
      * @return
      */
     public static List<ZkOrgInfo> queryOrgUnit() throws Exception {
         PreparedStatement stmt = null;
         ResultSet res = null;
         Connection conn = null;
         List<ZkOrgInfo> zkOrgInfos = new ArrayList<>();
         String sql = " select * from h3_company_vw " ;
         try {
             conn = JdbcUtil.getConn();
             LOGGER.info("JdbcUtil|queryOrgUnit|conn|"+conn);
             stmt = conn.prepareStatement(sql);
             res = stmt.executeQuery();
             while (res.next()) {
                 ZkOrgInfo zkOrgInfo = new ZkOrgInfo();
                 String FID = res.getString("FID");
                 String FNUMBER = res.getString("FNUMBER");
                 String PARENTNUMBER = res.getString("PARENTNUMBER");
                 String LEADID1 = res.getString("LEADID1");
                 String LEADID2 = res.getString("LEADID2");
                 String LEADID3 = res.getString("LEADID3");
                 String FNAME = res.getString("FNAME");
                 //add by shipeng 增加描述同步
                 String FSIMPLENAME=res.getString("FSIMPLENAME");
                 // add by shipeng 增加组织类型同步
                 String ORGTYPE=res.getString("ORGTYPE");
                 zkOrgInfo.setOrgType(ORGTYPE);
                 zkOrgInfo.setDepartmentId(FID);
                 zkOrgInfo.setDepartmentCode(FNUMBER);
                 zkOrgInfo.setParentCode(PARENTNUMBER);
                 zkOrgInfo.setZkLeaderId1(LEADID1);
                 zkOrgInfo.setZkLeaderId2(LEADID2);
                 zkOrgInfo.setZkLeaderId3(LEADID3);
                 zkOrgInfo.setDepartmentName(FNAME);
                 zkOrgInfo.setDescription(FSIMPLENAME);
                 zkOrgInfos.add(zkOrgInfo);
                 
             }

         } catch (Exception e) {
             LOGGER.error("获取组织数据报错|JdbcUtil|queryOrgUnit",e);
         }finally {
             colseResource(conn,stmt,res);
         }
         return zkOrgInfos;

     }

     /**
      * 模拟测试查询组织用户信息
      * @return
      */
     public static List<ZkUserInfo> queryOrgUser(){
         PreparedStatement stmt = null;
         ResultSet res = null;
         Connection conn = null;
         CallableStatement proc = null;
         List<ZkUserInfo> zkUserInfos = new ArrayList<>();
         String sql = " select * from h3_user_vw " ;
         try {
             conn = JdbcUtil.getConn();
             LOGGER.info("JdbcUtil|queryOrgUser|conn|"+conn);
             stmt = conn.prepareStatement(sql);
             res = stmt.executeQuery();
             while (res.next()) {
                 ZkUserInfo zkUserInfo = new ZkUserInfo();
                 String UFID = res.getString("UFID");
                 String ORGFID = res.getString("ORGFID");
                 String UNAME = res.getString("UNAME");
                 String GENDER = res.getString("GENDER");
                 String EMAIL = res.getString("EMAIL");
                 String FCELL = res.getString("FCELL");
                 String ISPRIMARY = res.getString("ISPRIMARY");
                 String FNUMBER = res.getString("UNUMBER");
                 String ParentID = res.getString("PARENTID");
                 zkUserInfo.setEmail(EMAIL);
                 zkUserInfo.setIsprimary(ISPRIMARY);
                 zkUserInfo.setUfid(UFID);
                 zkUserInfo.setOrgfid(ORGFID);
                 zkUserInfo.setUname(UNAME);
                 zkUserInfo.setGender(GENDER);
                 zkUserInfo.setFcell(FCELL);
                 zkUserInfo.setUnumber(FNUMBER);
                 zkUserInfo.setParentid(ParentID);
                 zkUserInfos.add(zkUserInfo);
             }
         } catch (Exception e) {
             LOGGER.error("|获取组织数据报错|JdbcUtil|queryOrgUser", e);
         }finally {
             colseResource(conn,stmt,res);
         }
         return zkUserInfos;
     }
}
