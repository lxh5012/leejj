package zkkg.util;

import java.rmi.RemoteException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.xml.rpc.ServiceException;

import org.apache.axis.client.Call;
import org.apache.axis.client.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.h3bpm.base.engine.client.EngineClient;
import com.h3bpm.base.util.AppUtility;

import data.DataException;
import data.DataRow;
import data.DataTable;
import net.sf.json.JSONObject;

/**
 * @author shipeng
 * @date 2019-12-3
 * 
 */
@Component
public class OaWorkflowPush {
	private static final Logger LOGGER = LoggerFactory.getLogger(OaWorkflowPush.class);
	private static volatile EngineClient _Engine = null;
    private static volatile boolean shouldRefreshEngine = false;
    public static  String ENDPOINT;
    public static  String OASYSTEMCODE;
    @Value("${OAPushWorkAddress}")
    public  void setENDPOINT(String ENDPOINT) {
    	OaWorkflowPush.ENDPOINT = ENDPOINT;
    }
    @Value("${OaSystemCode}")
    public  void setOASYSTEMCODE(String OASYSTEMCODE) {
    	OaWorkflowPush.OASYSTEMCODE = OASYSTEMCODE;
    }
	/**
	 * @description 转化时间格式
	 * 
	 * @author shipeng
	 * 
	 * @date 2018/3/5 19:02
	 * 
	 * @param time 时间字符，示例：2018-02-08 17:23:01
	 */
	public static String transDate(Date date) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return String.valueOf(formatter.format(date));
	}

	/**
	 * @author shipeng
	 * @throws Exception
	 * @throws DataException
	 * @date 2019-12-3
	 * @description 循环所有OA推送失败记录，重新推送
	 * 
	 */
	public static void repeatMangeOaFailRecord() throws DataException, Exception {
		String sql = "select id from zk_oa_pushflow where  operResult='0'";
		DataTable dt = getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteDataTable(sql);
		LOGGER.info("size:" + dt.getRows().size());
		List<String> tasks = new ArrayList<String>();
		if (dt != null && dt.getRows().size() > 0) {
			for (int i = 0; i < dt.getRows().size(); i++) {
				RepeatRepushFailFlow(dt.getRows().get(i).getString("id"));
			}
		}
		
	}

    /**
     * @author shipeng
     * @date 2019-12-3
     * @description 推送oa
     * 
     */
    public static void RepeatRepushFailFlow(String id) throws Exception {
        StringBuffer sql = new StringBuffer();
        sql.append("select syscode,flowid,requestname,workflowname,nodename,pcurl,appurl,isremark");
        sql.append(",viewtype,creator,createdatetime");
        sql.append(",receiver,receivedatetime,operResult,dataType,operType,message");
        sql.append(" from zk_oa_pushflow ");
        sql.append(" where id='"+id+"'");
        DataTable dt =
            getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteDataTable(sql.toString());
        if (dt != null && dt.getRows().size() > 0) {
            DataRow dr = dt.getRows().get(0);
            try {
                String syscode = dr.getString("syscode");
                String flowid = dr.getString("flowid");
                String requestname = dr.getString("requestname");
                String workflowname = dr.getString("workflowname");
                String nodename = dr.getString("nodename");
                String pcurl = dr.getString("pcurl");
                String appurl = dr.getString("appurl");
                String isremark = dr.getString("isremark");
                String viewtype = dr.getString("viewtype");
                String creator = dr.getString("creator");
                String createdatetime = dr.getString("createdatetime");
                String receiver = dr.getString("receiver");
                String receivedatetime = dr.getString("receivedatetime");
                String operType = dr.getString("operType");
                if ("Del".equalsIgnoreCase(operType)) {
                    deleteFlow(syscode, flowid, receiver,id);

                } else {
                    pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark, viewtype,
                        creator, createdatetime, receiver, receivedatetime, flowid, id);

                }
            } catch (DataException e) {
                LOGGER.info("捕捉异常：DataException");
            }
        }
    }
    /**
     * @author shipeng
     * @date 2019-12-3
     * @description 远程调用OA接口
     * 
     */
    public static String pushFlow(String syscode, String flowid, String requestname, String workflowname,
        String nodename, String pcurl, String appurl, String isremark, String viewtype, String creator,
        String createdatetime, String receiver, String receivedatetime, String workitemId, String id) {
        // axis 远程调用OA推送统一待办的接口开始
        // 直接引用远程的wsdl文件
        String result = "";
        String operResult = "";
        String dataType = "";
        String operType = "";
        String message = "";
        String operState = "";
        String returnOperResult = "";
        try {
            
            Service service = new Service();
            Call call = (Call)service.createCall();
            call.setTargetEndpointAddress(ENDPOINT);
            // WSDL里面描述的接口名称
            call.setOperationName("receiveRequestInfoByJson");
            // 接口的参数
            call.addParameter("requestJson", org.apache.axis.encoding.XMLType.XSD_STRING,
                javax.xml.rpc.ParameterMode.IN);
            // 设置超时时间30秒
            call.setTimeout(30000);
            // 设置返回类型
            call.setReturnType(org.apache.axis.encoding.XMLType.XSD_STRING);
            String requestJson = "";
            JSONObject json = new JSONObject();
            // 系统编号
            json.put("syscode", syscode);
            // 待办id
            json.put("flowid", flowid);
            // 标题
            json.put("requestname", requestname);
            // 流程名称
            json.put("workflowname", workflowname);
            // 节点名称
            json.put("nodename", nodename);
            // PC端访问地址
            json.put("pcurl", pcurl);
            // APP端访问地址
            json.put("appurl", appurl);
            // isremark:流程处理状态 0：待办 2：已办 4：办结
            json.put("isremark", isremark);
            // viewtype:流程查看状态 0：未读 1：已读;
            json.put("viewtype", viewtype);
            // 创建者
            json.put("creator", creator);
            // 创建时间
            json.put("createdatetime", createdatetime);
            // 接收者
            json.put("receiver", receiver);
            // 接收时间
            json.put("receivedatetime", receivedatetime);
            requestJson = json.toString();
            String OaResult;
            OaResult = (String)call.invoke(new Object[] {requestJson});// 给方法传递参数，并且调用方法
            LOGGER.info("result is " + OaResult);
            JSONObject jsonObject = JSONObject.fromObject(OaResult);
            operResult = (String)jsonObject.get("operResult");
            dataType = (String)jsonObject.get("dataType");
            operType = (String)jsonObject.get("operType");
            message = (String)jsonObject.get("message");
        } catch (RemoteException e) {
            // 远程服务器出现异常，默认回写失败
            LOGGER.info("捕捉异常：RemoteException");
            dataType = "未知";
            operType = "未知";
            operResult = "0";
            message = "远程服务器出现异常:RemoteException";
            // e.printStackTrace();
        } catch (ServiceException e) {
            dataType = "未知";
            operType = "未知";
            operResult = "0";
            message = "服务器出现异常:ServiceException";
            LOGGER.info("ServiceException：ServiceException");
            // e.printStackTrace();
        } catch (Exception e) {
            LOGGER.info("ServiceException：Exception");
            dataType = "未知";
            operType = "未知";
            operResult = "0";
            message = "服务器出现异常:Exception";
            // e.printStackTrace();
        }
        if ("0".equals(operResult)) {
            operState = "未处理";
            returnOperResult = "失败";
        } else if ("1".equals(operResult)) {
            operState = "已处理";
            returnOperResult = "成功";
        }
        result = "结果:" + returnOperResult + ";消息:" + message;
        // 更新推送记录
        Date date = new Date();
        String strDateFormat = "yyyy-MM-dd HH:mm:ss";
        SimpleDateFormat sdf = new SimpleDateFormat(strDateFormat);
        StringBuffer updateSql = new StringBuffer();
        updateSql.append("update zk_oa_pushflow set  operResult='" + operResult + "', dataType='" + dataType + "',");
        updateSql
            .append("operType='" + operType + "',message='" + message + "',ModifiedTime='" + sdf.format(date) + "',");
        updateSql.append("operState='" + operState + "'");
        updateSql.append(" where id='"+id+"'" );
        getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteNonQuery(updateSql.toString());

        return result.toString();
    }
    /**
     * @author shipeng
     * @date 2019/12/3
     *            
     */
    public static String deleteFlow(String syscode, String flowid, String receiver,String id) {
        String operResult = "";
        String dataType = "";
        String operType = "";
        String message = "";
        String returnOperResult = "";
        String operState = "";
        String result = "";
        // 直接引用远程的wsdl文件
        try {
            Service service = new Service();
            Call call = (Call)service.createCall();
            call.setTargetEndpointAddress(ENDPOINT);
            call.setOperationName("deleteUserRequestInfoByJson");// WSDL里面描述的接口名称
            call.addParameter("requestJson", org.apache.axis.encoding.XMLType.XSD_STRING,
                javax.xml.rpc.ParameterMode.IN);// 接口的参数
            call.setReturnType(org.apache.axis.encoding.XMLType.XSD_STRING);// 设置返回类型
            // 增加设置超时时间30秒
            call.setTimeout(30000);
            JSONObject jsonObjet = new JSONObject();
            jsonObjet.put("syscode", syscode);
            jsonObjet.put("flowid", flowid);
            jsonObjet.put("userid", receiver);
            String requestJson = jsonObjet.toString();
            LOGGER.info("删除请求：" + requestJson);
            result = (String)call.invoke(new Object[] {requestJson});// 给方法传递参数，并且调用方法
            LOGGER.info("删除结果：" + result);
            JSONObject jsonObject = JSONObject.fromObject(result);
            operResult = (String)jsonObject.get("operResult");
            dataType = (String)jsonObject.get("dataType");
            operType = (String)jsonObject.get("operType");
            message = (String)jsonObject.get("message");
        } catch (RemoteException e) {
            // 远程服务器出现异常，默认回写失败
            LOGGER.info("捕捉异常：RemoteException");
            operType = "Del";
            operResult = "0";
            message = "远程服务器出现异常:RemoteException";
            // e.printStackTrace();
        } catch (ServiceException e) {
            operType = "Del";
            operResult = "0";
            message = "服务器出现异常:ServiceException";
            LOGGER.info("ServiceException：ServiceException");
            // e.printStackTrace();
        } catch (Exception e) {
            LOGGER.info("ServiceException：Exception");
            operType = "Del";
            operResult = "0";
            message = "服务器出现异常:Exception";
            // e.printStackTrace();
        } finally {
            if ("0".equals(operResult)) {
                operState = "未处理";
                returnOperResult = "失败";
            } else if ("1".equals(operResult)) {
                operState = "已处理";
                returnOperResult = "成功";
            }
            result = "结果:" + returnOperResult + ";消息:" + message;
            // 更新推送记录
            Date date = new Date();
            String strDateFormat = "yyyy-MM-dd HH:mm:ss";
            SimpleDateFormat sdf = new SimpleDateFormat(strDateFormat);
            StringBuffer updateSql = new StringBuffer();
            updateSql.append("update zk_oa_pushflow set  operResult='" + operResult + "',");
            updateSql.append(
                "operType='" + operType + "',message='" + message + "',ModifiedTime='" + sdf.format(date) + "',");
            updateSql.append("operState='" + operState + "'");
            updateSql.append(" where id=" + id);
            LOGGER.info("updateSql:" + updateSql);
            getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteNonQuery(updateSql.toString());
        }
        return result;
    }
	/**
	 * 获取引擎管理器
	 * 
	 * @return
	 */
	private static EngineClient getEngine() {
		if (_Engine == null || shouldRefreshEngine) {
			try {
				_Engine = (EngineClient) AppUtility.getEngine();
			} catch (Exception var1) {
				LOGGER.error("get engine fail", var1);
				throw new RuntimeException(var1);
			}

			shouldRefreshEngine = false;
		}

		return _Engine;
	}
}
