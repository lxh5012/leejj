package zkkg.controller;

import java.rmi.RemoteException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import javax.xml.rpc.ServiceException;

import org.apache.axis.client.Call;
import org.apache.axis.client.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import OThinker.Common.Organization.Models.User;
import OThinker.H3.Controller.ControllerBase;

import OThinker.H3.Entity.Instance.InstanceContext;
import OThinker.H3.Entity.Instance.InstanceState;
import OThinker.H3.Entity.WorkItem.CirculateModels.CirculateItem;
import OThinker.H3.Entity.WorkItem.WorkItemModels.WorkItem;
import net.sf.json.JSONObject;

/**
 * @author shipeng
 * @date 2019-12-3
 * @description OA推送运维方法
 * 
 */
@Controller
@RequestMapping(value = "/OaWorkflowPush")
public class OaWorkflowPushController extends ControllerBase {
	private static final Logger LOGGER = LoggerFactory.getLogger(OaWorkflowPushController.class);
	@Value("${OAPushWorkAddress}")
	private String endpoint;
	@Value("${OaSystemCode}")
	private  String OaSystemCode;

	@Override
	public String getFunctionCode() {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @author shipeng
	 * @date 2019-12-3
	 * @description 生成OA统一待办
	 * @param id 待办或者待阅Id
	 */
	@RequestMapping(value = "/crateOaWork", produces = "application/json; charset=UTF-8")
	@ResponseBody
	public String createOAWork(String id) throws Exception {
		LOGGER.info("进入待办creater");
		String retunrResult = "";
		WorkItem workitem = getEngine().getWorkItemManager().GetWorkItem(id);
		CirculateItem circulateItem = getEngine().getWorkItemManager().GetCirculateItem(id);
		if (workitem == null && circulateItem == null) {
			retunrResult = "待办不存在";
		}
		Date date = new Date();
		// 系统编码
		String syscode = OaSystemCode;
		// 发起人
		String creator = "";
		String receiver = "";
		// 流程处理状态
		String isremark = "0";
		String viewtype = "0";
		// PC端URL
		String pcurl = "";
		// 手机端URL
		String appurl = "";
		User user;
		// 处理待办的推送
		if (workitem != null) {
			LOGGER.info("处理人：" + workitem.getParticipant() + ",委托人：" + workitem.getDelegant() + ",转发人："
					+ workitem.getForwarder());
			// 节点名称
			String nodename = workitem.getDisplayName();
			// 流程接收日期
			String receivedatetime = transDate(workitem.getReceiveTime());
			try {
				user = (User) getEngine().getOrganization().GetUnit(workitem.getOriginator());
				// 获取发起人
				creator = user.getCode();
				// 发起人姓名
				String userName = user.getName();
				user = (User) getEngine().getOrganization().GetUnit(workitem.getParticipant());
				// 获取节点处理人
				receiver = user.getCode();
				InstanceContext Instance = getEngine().getInstanceManager()
						.GetInstanceContext(workitem.getInstanceID());// 获取流程实例
				// 获取流程实例名称
				String InstanceName = Instance.getInstanceName();
				// 获取流程发起时间
				String createdatetime = transDate(Instance.getStartTime());
				// 标题
				String requestname = InstanceName;
				// 流程类型
				String workflowname = getEngine().getWorkflowManager().GetClauseDisplayName(workitem.getWorkflowCode());
				// 流程ID
				String flowid = workitem.getWorkItemID();
				pcurl = createUrl(flowid, user.getCode(), false);
				appurl = createUrl(flowid, user.getCode(), true);
				// 发起环节，只推送发起人的待办，不考虑委托
				if (workitem.getTokenId() == 1) {
					String result = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl,
							isremark, viewtype, creator, createdatetime, receiver, receivedatetime,
							workitem.getActivityCode());
					retunrResult = JSONObject.fromObject(result).toString();
				} else {
					// 推送处理人的待办
					String result = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl,
							isremark, viewtype, creator, createdatetime, receiver, receivedatetime,
							workitem.getActivityCode());
					retunrResult = JSONObject.fromObject(result).toString();
					// 推送被委托人的待办
					if (workitem.getDelegant() != null && !workitem.getDelegant().equals("")) {
						user = (User) getEngine().getOrganization().GetUnit(workitem.getDelegant());
						// 获取节点处理人
						receiver = user.getCode();
						String DelegantResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl,
								appurl, isremark, viewtype, creator, createdatetime, receiver, receivedatetime,
								workitem.getActivityCode());
						retunrResult += JSONObject.fromObject(DelegantResult).toString();
					}
				}
			} catch (Exception e) {

				e.printStackTrace();
			}

		}
		// 推送待阅
		else if (circulateItem != null) {
			LOGGER.info("进入传阅OnCreated ：" + circulateItem);
			LOGGER.info(
					"create->ItemID=" + circulateItem.getObjectID() + ",State=" + circulateItem.getState().toString());
			// 节点名称
			String nodename = circulateItem.getDisplayName();
			// 流程接收日期
			String receivedatetime = transDate(circulateItem.getReceiveTime());
			try {
				user = (User) getEngine().getOrganization().GetUnit(circulateItem.getOriginator());
				// 获取发起人
				creator = user.getCode();
				// 发起人姓名
				String userName = user.getName();
				user = (User) getEngine().getOrganization().GetUnit(circulateItem.getParticipant());
				// 获取节点处理人
				receiver = user.getCode();
				// 获取流程实例
				InstanceContext Instance = getEngine().getInstanceManager()
						.GetInstanceContext(circulateItem.getInstanceID());
				// 获取流程实例名称
				String InstanceName = Instance.getInstanceName();
				// 获取流程发起时间
				String createdatetime = transDate(Instance.getStartTime());
				// String requestname = InstanceName + "_" + userName + "_" +
				// formatterDate(Instance.getStartTime());// 标题
				// 标题
				String requestname = InstanceName;
				// 流程类型
				String workflowname = getEngine().getWorkflowManager()
						.GetClauseDisplayName(circulateItem.getWorkflowCode());
				// 流程ID
				String flowid = circulateItem.getObjectID();
				pcurl = createUrl(flowid, user.getCode(), false);
				appurl = createUrl(flowid, user.getCode(), false);
				String circulateResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl,
						isremark, viewtype, creator, createdatetime, receiver, receivedatetime,
						circulateItem.getActivityCode());
				retunrResult = JSONObject.fromObject(circulateResult).toString();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return retunrResult;
	}

	/*
	 * @author shipeng
	 * 
	 * @date 2019-4-9
	 * 
	 * @description 完成OA统一待办
	 */
	@RequestMapping(value = "/finishOAWork", produces = "application/json; charset=UTF-8")
	@ResponseBody
	public String finishOAWork(String id) throws Exception {
		LOGGER.info("进入完成待办");
		String retunrResult = "";
		WorkItem workitem = getEngine().getWorkItemManager().GetWorkItem(id);
		CirculateItem circulateItem = getEngine().getWorkItemManager().GetCirculateItem(id);
		Date date = new Date();
		// 系统编码
		String syscode = "H3";
		// 发起人
		String creator = "";
		String receiver = "";
		// 流程处理状态 2 表示已办 4已结
		String isremark = "2";
		// 0:未读 1：已读
		String viewtype = "1";
		// PC端URL
		String pcurl = "";
		// 手机端URL
		String appurl = "";
		User user;
		if (workitem == null && circulateItem == null) {
			retunrResult = "待办在H3中不存在,无法转换成已办";
		}
		// 将H3已经生成的已办转变为OA的已办
		if (workitem != null) {

			LOGGER.info("处理人：" + workitem.getParticipant() + ",委托人：" + workitem.getDelegant() + ",转发人："
					+ workitem.getForwarder() + ",实际处理人：" + workitem.getFinisher());
			LOGGER.info("create->ItemID=" + workitem.getObjectId() + ",State=" + workitem.getState().toString()
					+ ",token=" + workitem.getTokenId());
			// 节点名称
			String nodename = workitem.getDisplayName();
			// 流程接收日期
			String receivedatetime = transDate(workitem.getReceiveTime());
			user = (User) getEngine().getOrganization().GetUnit(workitem.getOriginator());
			// 获取发起人
			creator = user.getCode();
			// 发起人姓名
			String userName = user.getName();
			user = (User) getEngine().getOrganization().GetUnit(workitem.getParticipant());
			// 获取节点处理人
			receiver = user.getCode();
			// 获取流程实例
			InstanceContext Instance = getEngine().getInstanceManager().GetInstanceContext(workitem.getInstanceID());
			// 获取流程实例名称
			String InstanceName = Instance.getInstanceName();
			// 获取流程发起时间
			String createdatetime = transDate(Instance.getStartTime());
			// String requestname = InstanceName + "_" + userName + "_" +
			// formatterDate(Instance.getStartTime());// 标题
			// 标题
			String requestname = InstanceName;
			// 流程类型
			String workflowname = getEngine().getWorkflowManager().GetClauseDisplayName(workitem.getWorkflowCode());
			// 流程ID
			String flowid = workitem.getWorkItemID();
			// 表单编码
			String sheetcode = workitem.getSheetCode();
			pcurl = createUrl(flowid, user.getCode(), false);
			appurl = createUrl(flowid, user.getCode(), true);
			// 发起环节，只推送发起人的已办，不考虑委托关系
			if (workitem.getTokenId() == 1) {
				retunrResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
						viewtype, creator, createdatetime, receiver, receivedatetime, workitem.getActivityCode());
			}

			else if (workitem.getDelegant() == null || workitem.getDelegant().equals("")) {
				// 推送默认审核人的已办
				retunrResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
						viewtype, creator, createdatetime, receiver, receivedatetime, workitem.getActivityCode());
			} else if (workitem.getDelegant() != null && !workitem.getDelegant().equals("")
					&& workitem.getParticipant().equals(workitem.getFinisher())) {
				// 解决：1、如果委托人自己处理了待办，委托人自己会产生已办，被委托人的待办消失，不会产生已办
				// 2、被转发人处理待办，产生已办，被委托人那里生成的待办消失，不会产生已办
				// 删除被委托人的待办
				user = (User) getEngine().getOrganization().GetUnit(workitem.getDelegant());
				deleteFlow(syscode, flowid, user.getCode());
				// 推送实际审核人的已办
				retunrResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
						viewtype, creator, createdatetime, receiver, receivedatetime, workitem.getActivityCode());
			} else if (workitem.getDelegant() != null && !workitem.getDelegant().equals("")
					&& workitem.getDelegant().equals(workitem.getFinisher())) {
				// 推送审核人的已办
				retunrResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
						viewtype, creator, createdatetime, receiver, receivedatetime, workitem.getActivityCode());
				// 生成被委托人的已办
				user = (User) getEngine().getOrganization().GetUnit(workitem.getDelegant());
				receiver = user.getCode();
				// 重新生成被委托人的手机端和PC端访问地址
				pcurl = createUrl(flowid, receiver, false);
				appurl = createUrl(flowid, receiver, true);
				retunrResult += pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
						viewtype, creator, createdatetime, receiver, receivedatetime, workitem.getActivityCode());
			}
		}
		// 推送H3已阅到OA的已办
		if (circulateItem != null) {
			// 节点名称
			String nodename = circulateItem.getDisplayName();
			// 流程接收日期
			String receivedatetime = transDate(circulateItem.getReceiveTime());
			user = (User) getEngine().getOrganization().GetUnit(circulateItem.getOriginator());
			// 获取发起人
			creator = user.getCode();
			// 发起人姓名
			String userName = user.getName();
			user = (User) getEngine().getOrganization().GetUnit(circulateItem.getParticipant());
			// 获取节点处理人
			receiver = user.getCode();
			// 获取流程实例
			InstanceContext Instance = getEngine().getInstanceManager()
					.GetInstanceContext(circulateItem.getInstanceID());
			// add by shipeng 2018-11-26 增加已结处理
			if (Instance.getState() == InstanceState.Finished) {
				isremark = "4";
			}
			// 获取流程实例名称
			String InstanceName = Instance.getInstanceName();
			// 获取流程发起时间
			String createdatetime = transDate(Instance.getStartTime());
			// 标题
			String requestname = InstanceName;
			String workflowname = getEngine().getWorkflowManager()
					.GetClauseDisplayName(circulateItem.getWorkflowCode());// 流程类型
			// 流程ID
			String flowid = circulateItem.getObjectID();
			pcurl = createUrl(flowid, user.getCode(), false);
			appurl = createUrl(flowid, user.getCode(), true);
			retunrResult = pushFlow(syscode, flowid, requestname, workflowname, nodename, pcurl, appurl, isremark,
					viewtype, creator, createdatetime, receiver, receivedatetime, circulateItem.getActivityCode());
		}
		return retunrResult;
	}

	/**
	 * @description 调用OA删除指定人待办接口
	 * @author shipeng
	 * @date 2018/3/8 12.09
	 * @param syscode  系统编码
	 * @param flowid   流程ID
	 * @param nodename 节点名称
	 * @param receiver 接收人
	 */
	@RequestMapping(value = "/deleteFlow", produces = "application/json; charset=UTF-8")
	@ResponseBody
	public  String deleteFlow(String syscode, String flowid, String receiver) throws Exception {
		// 直接引用远程的wsdl文件
		String result = "";
		Service service = new Service();
		Call call = (Call) service.createCall();
		call.setTargetEndpointAddress(endpoint);
		// WSDL里面描述的接口名称
		call.setOperationName("deleteUserRequestInfoByJson");
		// 设置返回类型
		call.addParameter("requestJson", org.apache.axis.encoding.XMLType.XSD_STRING, javax.xml.rpc.ParameterMode.IN);// 接口的参数
		call.setReturnType(org.apache.axis.encoding.XMLType.XSD_STRING);
		JSONObject jsonObjet = new JSONObject();
		jsonObjet.put("syscode", syscode);
		jsonObjet.put("flowid", flowid);
		jsonObjet.put("userid", receiver);
		String requestJson = jsonObjet.toString();
		LOGGER.info("删除请求：" + requestJson);
		// 给方法传递参数，并且调用方法
		result = (String) call.invoke(new Object[] { requestJson });
		LOGGER.info("删除结果：" + result);
		JSONObject jsonObject = JSONObject.fromObject(result);
		String operResult = (String) jsonObject.get("operResult");
		String dataType = (String) jsonObject.get("dataType");
		String operType = (String) jsonObject.get("operType");
		String message = (String) jsonObject.get("message");
		System.out.println("operResult=" + operResult);
		System.out.println("dataType=" + dataType);
		System.out.println("operType=" + operType);
		System.out.println("message=" + message);
		InstanceContext Instance = null;
		WorkItem workitem = getEngine().getWorkItemManager().GetWorkItem(flowid);
		if (workitem != null) {
			Instance = getEngine().getInstanceManager().GetInstanceContext(workitem.getInstanceID());
		}
		CirculateItem circulateItem = getEngine().getWorkItemManager().GetCirculateItem(flowid);
		if (circulateItem != null) {
			Instance = getEngine().getInstanceManager().GetInstanceContext(circulateItem.getInstanceID());
		}
		if (Instance != null) {
			String sequenceNo = Instance.getSequenceNo(); // 流水号
			String insertPushFlowData = "INSERT INTO  zk_oa_pushflow  (id,sequenceNo,syscode,flowid,receiver,operResult,dataType,operType,message)VALUES("
					+ "'" + UUID.randomUUID().toString() + "','" + sequenceNo + "','" + syscode + "','" + flowid + "','"
					+ receiver + "','" + operResult + "','" + dataType + "','" + operType + "','" + message + "')";
			LOGGER.info("insertPushFlowData=" + insertPushFlowData);
			getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteNonQuery(insertPushFlowData);
		} else {
			result = "流程数据不存在";
		}

		return result;
	}

	/**
	 * @description 转化时间格式
	 * @author shipeng
	 * @date 2019/12/3
	 * @return 时间字符，示例：2018-02-08 17:23:01
	 */
	public static String transDate(Date date) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return String.valueOf(formatter.format(date));
	}

	/**
	 * @author shipeng
	 * @description 生成接口参数需要的url地址
	 * @date 2019-12-3
	 * @param workitem  流程ID
	 * @param loginName 用户登录名
	 * @param IsMobile  是否是手机端
	 */
	public static String createUrl(String workitemid, String loginName, boolean IsMobile) {
		String url = "";
		if (IsMobile) {
			url = "/Portal/SSO.do?WorkItemID=" + workitemid + "&loginName=" + loginName + "&IsMobile=true"
					+ "&type=OASS0";
		} else {
			url = "/Portal/SSO.do?WorkItemID=" + workitemid + "&loginName=" + loginName + "&type=OASS0";
		}
		return url;
	}

	/**
	 * @description 调用统一代办接口，推送H3待办和已办
	 * @author shipeng
	 * @date 2019/12/13
	 * @param syscode      系统编码(OA分配给H3的唯一标识，目前是H3BPM)
	 * @param flowid       流程ID
	 * @param requestname  标题
	 * @param workflowname 流程名称
	 * @param nodename     节点名称
	 * @param pcurl        PC审核地址
	 * @Parma appurl 手机端地址
	 * @param isremark        流程处理状态 0：待办 2：已办 4：办结
	 * @param viewtype        流程查看状态 0：未读 1：已读;
	 * @param creator         创建人
	 * @param createdatetime  创建时间
	 * @param receiver        接收人
	 * @param receivedatetime 接收时间
	 * @demo JSON格式参数示例{'syscode':'H3BPM','flowid':'2779a369ab3b4cfe844e41c319a7b1ba','requestname':'來自时鹏的测试','workflowname':'时鹏测试','nodename':'lixiaomin4','pcurl':'/account/ssologin?uid=lixiaomin4&t=-2147483648&token=4f410368c9611252fb9c7388d06a176d&redirect=%2fBiz%2fBizMain%2fBizToDo%3fIsOARequest%3d123%26BizID%3dTASEED1802080002','appurl':'/#/ssologin?loginid=lixiaomin4&stamp=-2147483648&token=c1b78551d81583609847b892394cf5deb3d0105b&redirect=%2fbill%2ftravelApplyDetail%3fid%3dTASEED1802080002','isremark':'0','viewtype':'0','creator':'chenyu2','createdatetime':'2018-02-08
	 *       17:23:01','receiver':'lixiaomin4','receivedatetime':'2018-02-08
	 *       17:23:01'}
	 */
	public  String pushFlow(String syscode, String flowid, String requestname, String workflowname,
			String nodename, String pcurl, String appurl, String isremark, String viewtype, String creator,
			String createdatetime, String receiver, String receivedatetime, String ActivityCode) {
		// axis 远程调用OA推送统一待办的接口开始
		// 直接引用远程的wsdl文件
		String requestJson = "";
		String result = "";
		String operResult = "";
		String dataType = "";
		String operType = "";
		String message = "";
		String itemType = "";
		String instanceId = "";
		String operState = "";
		String sequenceNo = "";
		try {
			InstanceContext Instance;
			CirculateItem circulateItem = getEngine().getWorkItemManager().GetCirculateItem(flowid);
			if (circulateItem != null) {
				instanceId = circulateItem.getInstanceID();
			} else {
				WorkItem workitem = getEngine().getWorkItemManager().GetWorkItem(flowid);
				if (workitem != null) {
					instanceId = workitem.getInstanceID();
				}
			}
			// 获取流程实例
			Instance = getEngine().getInstanceManager().GetInstanceContext(instanceId);
			// 流水号
			sequenceNo = Instance.getSequenceNo();
			itemType = "workitem";
			Service service = new Service();
			Call call = (Call) service.createCall();
			call.setTargetEndpointAddress(endpoint);
			// WSDL里面描述的接口名称
			call.setOperationName("receiveRequestInfoByJson");
			// 接口的参数
			call.addParameter("requestJson", org.apache.axis.encoding.XMLType.XSD_STRING,
					javax.xml.rpc.ParameterMode.IN);
			// 设置接口超时时间30秒
			call.setTimeout(30000);
			call.setReturnType(org.apache.axis.encoding.XMLType.XSD_STRING);// 设置返回类型
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("syscode", syscode);
			jsonObject.put("flowid", flowid);
			jsonObject.put("requestname", requestname);
			jsonObject.put("workflowname", workflowname);
			jsonObject.put("nodename", nodename);
			jsonObject.put("pcurl", pcurl);
			jsonObject.put("appurl", appurl);
			jsonObject.put("isremark", isremark);
			jsonObject.put("viewtype", viewtype);
			jsonObject.put("creator", creator);
			jsonObject.put("createdatetime", createdatetime);
			jsonObject.put("receiver", receiver);
			jsonObject.put("receivedatetime", receivedatetime);
			requestJson = jsonObject.toString();
			LOGGER.info("请求：" + requestJson);
			// 给方法传递参数，并且调用方法
			result = (String) call.invoke(new Object[] { requestJson });
			LOGGER.info("结果：" + result);
			JSONObject resultJson = JSONObject.fromObject(result);
			operResult = (String) resultJson.get("operResult");
			dataType = (String) resultJson.get("dataType");
			operType = (String) resultJson.get("operType");
			message = (String) resultJson.get("message");
			operState = "";

		} catch (RemoteException e) {
			// 远程服务器出现异常，默认回写失败
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
			// e.printStackTrace();
		} catch (Exception e) {
			dataType = "未知";
			operType = "未知";
			operResult = "0";
			message = "服务器出现异常:Exception";
			// e.printStackTrace();
		} finally {
			if ("0".equals(operResult)) {
				operState = "未处理";
			} else if ("1".equals(operResult)) {
				operState = "已处理";
			}
			Date date = new Date();
			String strDateFormat = "yyyy-MM-dd HH:mm:ss";
			SimpleDateFormat sdf = new SimpleDateFormat(strDateFormat);
			StringBuffer insertPushFlowData = new StringBuffer();
			insertPushFlowData.append("INSERT INTO  zk_oa_pushflow");
			insertPushFlowData.append("(");
			insertPushFlowData.append("id,sequenceNo,syscode,flowid,requestname,workflowname");
			insertPushFlowData.append(",nodename,pcurl,appurl,isremark,viewtype,creator");
			insertPushFlowData.append(",createdatetime,receiver,receivedatetime,operResult");
			insertPushFlowData.append(",dataType,operType,message,itemType,operState,ActivityCode,FristPushTime");
			insertPushFlowData.append(",ModifiedTime");
			insertPushFlowData.append(")");
			insertPushFlowData.append("VALUES");
			insertPushFlowData.append("(");
			insertPushFlowData.append(
					"'" + UUID.randomUUID().toString() + "','" + sequenceNo + "','" + syscode + "','" + flowid + "',");
			insertPushFlowData
					.append("'" + requestname + "','" + workflowname + "','" + nodename + "','" + pcurl + "',");
			insertPushFlowData.append("'" + appurl + "','" + isremark + "','" + viewtype + "','" + creator + "',");
			insertPushFlowData.append(
					"'" + createdatetime + "','" + receiver + "','" + receivedatetime + "','" + operResult + "',");
			insertPushFlowData.append("'" + dataType + "','" + operType + "','" + message + "','" + itemType + "',");
			insertPushFlowData.append(
					"'" + operState + "','" + ActivityCode + "','" + sdf.format(date) + "','" + sdf.format(date) + "'");
			insertPushFlowData.append(")");
			getEngine().getEngineConfig().getCommandFactory().CreateCommand()
					.ExecuteNonQuery(insertPushFlowData.toString());

		}
		return result;
	}
}
