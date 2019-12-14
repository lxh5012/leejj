package zkkg.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import OThinker.H3.Controller.ControllerBase;
import OThinker.H3.Entity.Instance.InstanceContext;
import OThinker.H3.Entity.WorkflowTemplate.WorkflowDocument.PublishedWorkflowTemplate;
import data.DataTable;
import net.sf.json.JSONObject;

/**
 * @author shipeng
 * @date 2019-12-4
 * @description 特殊主流程流程状态跳转
 * 
 */
@Controller
@RequestMapping(value = "/SpecialWorkflowJump")
public class SpecialWorkflowJumpController extends ControllerBase {

	private static final Logger LOGGER = LoggerFactory.getLogger(OrgUnitSyncController.class);
	@Value("${specialIdentifier}")
	private  String specialIdentifier;

	@Override
	public String getFunctionCode() {
		// TODO Auto-generated method stub
		return null;
	}
    /**
     * @author 时鹏
     * @description  根据实例ID，判断当前流程是否是特殊主流程，如果是，则返回其子流程的流程实例ID 
     * 
     */
	@RequestMapping(value = "/JumpInstanceDetail", produces = "application/json; charset=UTF-8")
	@ResponseBody
	public String JumpInstanceDetail(String instanceId) throws Exception {
		boolean flag=false;
		JSONObject json = new JSONObject();
		if (instanceId != null) {
			InstanceContext context = getEngine().getInstanceManager().GetInstanceContext(instanceId);
            if(context!=null) {
             PublishedWorkflowTemplate pwt=getEngine().getWorkflowManager().GetPublishedTemplate(context.getWorkflowCode(), context.getWorkflowVersion());
    	     if(pwt!=null) {
    	    	 LOGGER.info("specialIdentifier:"+specialIdentifier);
    	    	 LOGGER.info("pwt.getShortText1():"+pwt.getShortText1());
    	    	if(specialIdentifier.equals(pwt.getShortText1())) {
    	    		flag=true;		
    	    		String sql="select objectid from ot_instanceContext where ParentInstanceID='"+instanceId+"'";
    	    		DataTable dt=	getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteDataTable(sql);
    	    		if(dt!=null&&dt.getRows().size()>0) {
    	             String childrenWorkflowInstanceId=dt.getRows().get(0).getString("objectid");
    	             json.put("childrenWorkflowInstanceId",childrenWorkflowInstanceId);
    	    		}
    	    	}
    	    	 
    	    	 
    	     }
            }
		}
		json.put("isSpecialWorkflow", flag);
		return json.toString();
	}

}
