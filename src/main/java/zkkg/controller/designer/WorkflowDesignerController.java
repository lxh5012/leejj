package zkkg.controller.designer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import OThinker.Common.DotNetToJavaStringHelper;
import OThinker.H3.Controller.ControllerBase;
import OThinker.H3.Controller.AppCode.Admin.ConstantString;
import OThinker.H3.Controller.Controllers.Admin.Formula.FormulaType;
import OThinker.H3.Controller.ViewModels.ActionResult;
import OThinker.H3.Controller.ViewModels.ActivityTemplateConfigsViewModel;
import OThinker.H3.Controller.ViewModels.ExceptionCode;
import OThinker.H3.Controller.ViewModels.FormulaTreeNode;
import OThinker.H3.Entity.Acl.FunctionNode;
import OThinker.H3.Entity.Data.DataLogicType;
import OThinker.H3.Entity.DataModel.BizObjectAssociation;
import OThinker.H3.Entity.DataModel.BizObjectSchema;
import OThinker.H3.Entity.DataModel.MethodGroupSchema;
import OThinker.H3.Entity.DataModel.MethodType;
import OThinker.H3.Entity.DataModel.PropertySchema;
import OThinker.H3.Entity.Exceptions.ExceptionLog;
import OThinker.H3.Entity.Exceptions.ExceptionState;
import OThinker.H3.Entity.Instance.InstanceContext;
import OThinker.H3.Entity.Instance.InstanceState;
import OThinker.H3.Entity.Instance.RuntimeObjectType;
import OThinker.H3.Entity.Instance.Data.Keywords.KeyWordNode;
import OThinker.H3.Entity.Instance.Data.Keywords.ParserFactory;
import OThinker.H3.Entity.Notification.NotifyType;
import OThinker.H3.Entity.WorkSheet.BizSheet;
import OThinker.H3.Entity.WorkflowTemplate.OvertimePolicy;
import OThinker.H3.Entity.WorkflowTemplate.ParAbnormalPolicy;
import OThinker.H3.Entity.WorkflowTemplate.PermittedActions;
import OThinker.H3.Entity.WorkflowTemplate.SubmittingValidationType;
import OThinker.H3.Entity.WorkflowTemplate.WorkflowClause;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Activity;
import OThinker.H3.Entity.WorkflowTemplate.Activity.ActivityParticipateType;
import OThinker.H3.Entity.WorkflowTemplate.Activity.EntryConditionType;
import OThinker.H3.Entity.WorkflowTemplate.Activity.ParticipateMethod;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Client.ApproveActivity;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Client.FillSheetActivity;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Client.LockLevel;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Client.LockPolicy;
import OThinker.H3.Entity.WorkflowTemplate.Activity.Client.ParticipativeActivity;
import OThinker.H3.Entity.WorkflowTemplate.Activity.SubInstance.SubInstanceActivity;
import OThinker.H3.Entity.WorkflowTemplate.Activity.SubInstance.WorkflowDataMap.InOutType;
import OThinker.H3.Entity.WorkflowTemplate.Data.DataDisposalType;
import OThinker.H3.Entity.WorkflowTemplate.Data.DataItemPermission;
import OThinker.H3.Entity.WorkflowTemplate.WorkflowDocument.WorkflowDocument;
import net.sf.json.JSONObject;


@Controller
@RequestMapping(value="/Portal/WorkflowDesigner",method={RequestMethod.GET,RequestMethod.POST})
public class WorkflowDesignerController extends ControllerBase
{
    /**
     * 
     */
    private static final long serialVersionUID = -5276132667843626274L;

    @Override
    public String getFunctionCode()
    {
        return "";
    }

    /** 
     设置可选的通知方式
     
    */
    @RequestMapping(value="/SetNotifyTypes",method={RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public final List<Object>  SetNotifyTypes()
    {
        //通知方式
        List<Object> listObj = new ArrayList<Object>();
        for (NotifyType name : NotifyType.class.getEnumConstants())
        {
            if (!NotifyType.Unspecified.toString().equals(name.toString()))
            {
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("Text", name);
                item.put("Value", String.valueOf(name.getValue()));
                listObj.add(item);
            }
        }
        return listObj;
    }



    /** 
     设置可选的活动模板
     * @throws Exception 
     
    */
    @RequestMapping(value="/SetActivityTemplates",method={RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public final List<Activity> SetActivityTemplates() throws Exception
    {
        //活动模板
        List<Activity> ActivityConfigs = this.getEngine().getWorkflowConfigManager().GetAllActivityConfigs();
        if(null != ActivityConfigs && ActivityConfigs.size() > 0){
            for (Activity activity : ActivityConfigs)
            {
                //update by lisonglin 20191014 流程节点默认属性定制化
                if(activity.getActivityType() == OThinker.H3.Entity.WorkflowTemplate.Activity.ActivityType.FillSheet) {//手工节点
                    FillSheetActivity fsa = (FillSheetActivity)activity;
                    PermittedActions pa = fsa.getPermittedActions();
                    pa.setAdjustParticipant(true);//加签
                    fsa.setPermittedActions(pa);
                }else if(activity.getIsApproveActivity()) {//审批节点
                    ApproveActivity aa = (ApproveActivity)activity;
                    PermittedActions pa = aa.getPermittedActions();
                    pa.setAdjustParticipant(true);//加签
                    aa.setPermittedActions(pa);
                }
                String name = "Activity_" + activity.getActivityType().toString(); //前台需要实现多语言 //this.PortalResource.GetString("Activity_" + activity.ActivityType.ToString());
                //ERROR:实现多语言时,在这里调用获取当前语言对应的显示名称
                activity.setDisplayName(DotNetToJavaStringHelper.isNullOrEmpty(name) ? activity.getActivityType().toString() : name);
                activity.setCustomCode(activity.GenerateCode(Activity.DefaultNameSpace, "{ClassName}"));
            }
        }
        //输出到前端
        return ActivityConfigs;
    }


    /** 
     业务对象模型是否可编辑
     
     @param SchemaCode
     @param UserId
     @return 
     * @throws Exception 
    */
    public final boolean IsSchemaEditable(String SchemaCode) throws Exception
    {
        if (!DotNetToJavaStringHelper.isNullOrEmpty(SchemaCode))
        {
            FunctionNode functionNode = this.getEngine().getFunctionAclManager().GetFunctionNodeByCode(SchemaCode);
            if (functionNode != null)
            {
                if (functionNode.getIsLocked() != true || (functionNode.getIsLocked() == true && functionNode.getLockedBy().compareToIgnoreCase(this.getUserValidator().getUserID()) == 0))
                {
                    return true;
                }
            }
        }
        return false;
    }

    /** 
     获取流程编辑模式
     
     @param SchemaCode
     @param WorkflowVersion
     @return 
     * @throws Exception 
    */
    @RequestMapping(value="/GetWorkflowMode",method={RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public final String GetWorkflowMode(String SchemaCode, int WorkflowVersion) throws Exception
    {
        JSONObject json = ExecuteFunctionRun(null);
        if(json != null){
            return null;
        }
        
        String workflowCode = (IsSchemaEditable(SchemaCode) && WorkflowVersion == WorkflowDocument.NullWorkflowVersion ? "1" : "2");
        return workflowCode;
    }



    /** 
     输出流程模板包、流程模板
     * @throws Exception 
     UPDATE BY ZHANGJ
    */
    @RequestMapping(value="/RegisterActivityTemplateConfigs",method={RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public final Object RegisterActivityTemplateConfigs(String WorkflowCode, int WorkflowVersion, String InstanceID) throws Exception{
        if(this.getUserValidator()==null){
            return new ActionResult(false, "登录超时！", null, ExceptionCode.NoAuthorize);
        }
        
        if(this.getFunctionCode()!=null&&!this.getFunctionCode().isEmpty()&&!this.getUserValidator().ValidateFunctionRun(this.getFunctionCode())){
             return new ActionResult(false, "您没有访问当前功能的权限！");
        }
        //add by linjh@Future 2018.9.25 sql 注入
        WorkflowCode = StringEscapeUtils.escapeSql(WorkflowCode);
        InstanceID = StringEscapeUtils.escapeSql(InstanceID);
        //流程模板编码\显示名称 - 系统数据项，+流程数据项，流程设计选择时使用
        ActivityTemplateConfigsViewModel model = new ActivityTemplateConfigsViewModel();
        if ((WorkflowCode == null || WorkflowCode.equals("")) && WorkflowVersion == -1){
            InstanceContext InstanceContext = this.getEngine().getInstanceManager().GetInstanceContext(InstanceID);
            if(InstanceContext!=null){
                WorkflowCode = InstanceContext.getWorkflowCode();
                WorkflowVersion = InstanceContext.getWorkflowVersion();
                model.setInstanceContext(InstanceContext);
                model.setExceptionActivities(this.exceptionActivities(InstanceID));//异常节点
            }
        }

        //是否锁定 
        model.setIsControlUsable(BizWorkflowPackageLockByID(WorkflowCode, null));
        
        //流程模板
        WorkflowDocument WorkflowTemplate = null;
        if (WorkflowVersion == WorkflowDocument.NullWorkflowVersion){
            WorkflowTemplate = this.getEngine().getWorkflowManager().GetDraftTemplate(WorkflowCode);
        }else{
            WorkflowTemplate = this.getEngine().getWorkflowManager().GetPublishedTemplate(WorkflowCode, WorkflowVersion);
        }
        /**
         *  数据模型
         */
        //数据项
        List<String> lstDataItems = new ArrayList<String>();
        //所有属性
        List<Object> lstProperties = new ArrayList<Object>();
        //输出到前台的数据项
        List<Object> lstFrontDataItems = new ArrayList<Object>();
        //允许设置权限的数据项
        List<String> lstPermissionDataItems = new ArrayList<String>();
        //参与者数据项
        List<String> lstUserDataItems = new ArrayList<String>();
        //逻辑型数据项
        List<String> lstBoolDataItems = new ArrayList<String>();
        //业务方法名称列表 
        List<String> lstBizMethodNames = new ArrayList<String>();
        WorkflowClause Clause = this.getEngine().getWorkflowManager().GetClause(WorkflowCode);

        //设置可选的数据项 
        if (Clause != null && Clause.getBizSchemaCode() != null){
            model.setClauseName(Clause.getWorkflowName() + "");
            //流程模板浏览页面地址
            model.setWorkflowViewUrl(getPortalRoot() + ConstantString.PagePath_WorkflowDesigner);
            BizObjectSchema BizObject = this.getEngine().getBizObjectManager().GetDraftSchema(Clause.getBizSchemaCode());
            if (BizObject != null){
                //流程包
                Map<String, String> Package = new HashMap<String, String>();
                Package.put("SchemaCode", BizObject.getSchemaCode());
                
                model.setPackage(Package);
                //页标签
                if (Clause != null){
                    String TabName = DotNetToJavaStringHelper.isNullOrEmpty(Clause.getWorkflowName()) ? Clause.getWorkflowCode() : Clause.getWorkflowName();
                    if (WorkflowVersion != WorkflowDocument.NullWorkflowVersion){
                        TabName += "[" + WorkflowVersion + "]";
                    }else{
                        TabName += "[设计]";
                    }
                    model.setTabName(TabName);
                }
                List<Object> lstBizMethods = new ArrayList<Object>();
                //可选的业务方法
                if (BizObject.getMethods() != null){
                    for (MethodGroupSchema Method : BizObject.getMethods()){
                        if (!BizObjectSchema.IsDefaultMethod(Method.getMethodName()) 
                                && Method.getMethodType() == MethodType.Normal){
                            lstBizMethodNames.add(Method.getMethodName());
                            Map<String, String> item = new HashMap<String, String>();
                            item.put("Text", Method.getFullName());
                            item.put("Value", Method.getMethodName());
                            //update by zhangj
                            lstBizMethods.add(item);
                        }
                    }
                }
                model.setBizMethods(lstBizMethods);
                //数据项、参与者、逻辑型数据项
                if (BizObject.getProperties() != null){
                    List<Object> listNotifyCondition = new ArrayList<Object>();
                    List<Object> listApprovalDataItem = new ArrayList<Object>();
                    List<Object> listCommentDataItem = new ArrayList<Object>();
                    
                    Map<String, String> m = new HashMap<String, String>();
                    m.put("Text", "");
                    m.put("Value", "");
                    
                    listNotifyCondition.add(m);
                    listApprovalDataItem.add(m);
                    listCommentDataItem.add(m);
                    
                    for (PropertySchema Property : BizObject.getProperties()){
                        //不显示保留数据项
                        if (!BizObjectSchema.IsReservedProperty(Property.getName())){
                            lstDataItems.add(Property.getName());
                            lstProperties.add(EnclDataInfo(Property.getDisplayName(), Property.getName()));
                            
                            Map<String, String> forntDataItem = new HashMap<String, String>();
                            forntDataItem.put("Text", Property.getDisplayName());
                            forntDataItem.put("Value", Property.getName());
                            //标记子表标题行
                            forntDataItem.put("ItemType", Property.getLogicType() == DataLogicType.BizObjectArray ? "SubTableHeader" : "");
                            lstFrontDataItems.add(forntDataItem);
                            lstPermissionDataItems.add(Property.getName());
                            
                            //通知条件
                            listNotifyCondition.add(EnclDataInfo(Property.getDisplayName(), Property.getName()));
                            
                            //子表
                            if ((Property.getLogicType() == DataLogicType.BizObject || 
                                 Property.getLogicType() == DataLogicType.BizObjectArray) && 
                                 Property.getChildSchema() != null && 
                                 Property.getChildSchema().getProperties() != null){
                                for (PropertySchema ChildProperty : Property.getChildSchema().getProperties()){
                                    if (!BizObjectSchema.IsReservedProperty(ChildProperty.getName())){
                                        Map<String,String> forntDataItemMap = new HashMap<String,String>();
                                        forntDataItemMap.put("Text", Property.getDisplayName()+"."+ChildProperty.getDisplayName());
                                        forntDataItemMap.put("Value", Property.getName()+"."+ChildProperty.getName());
                                        lstFrontDataItems.add(forntDataItemMap);
                                        lstPermissionDataItems.add(Property.getName() + "." + ChildProperty.getName());
                                    }
                                }
                            }
                            //参与者
                            else if (Property.getLogicType() == DataLogicType.SingleParticipant || Property.getLogicType() == DataLogicType.MultiParticipant){
                                lstUserDataItems.add(Property.getName());
                            }
                            //逻辑型
                            else if (Property.getLogicType() == DataLogicType.Bool){
                                lstBoolDataItems.add(Property.getName());
                                listApprovalDataItem.add(EnclDataInfo(Property.getDisplayName(), Property.getName()));
                            }
                            //文本
                            else if (Property.getLogicType() == DataLogicType.String){
                                listCommentDataItem.add(EnclDataInfo(Property.getDisplayName(), Property.getName()));
                            }
                        }
                    }
                    model.setNotifyCondition(listNotifyCondition);
                    model.setApprovalDataItem(listApprovalDataItem);
                    model.setCommentDataItem(listCommentDataItem);
                }
                
                //关联对象权限
                if (BizObject.getAssociationList() != null){
                    for (BizObjectAssociation association : BizObject.getAssociationList()){
                        BizObjectSchema AssociatedSchema = this.getEngine().getBizObjectManager().GetPublishedSchema(association.getAssociatedSchemaCode());
                        if (AssociatedSchema != null && AssociatedSchema.getProperties() != null){
                            Map<String, Object> frontDataItem2 = new HashMap<String, Object>();
                            frontDataItem2.put("Text", association.getDisplayName());
                            frontDataItem2.put("Value", association.getName());
                            frontDataItem2.put("ItemType", "SubTableHeader");
                            lstFrontDataItems.add(frontDataItem2);
                            
                            lstPermissionDataItems.add(association.getName());
                            for (PropertySchema AssociatedChildProperty : AssociatedSchema.getProperties()){
                                if (!BizObjectSchema.IsReservedProperty(AssociatedChildProperty.getName())){
                                    lstFrontDataItems.add(EnclDataInfo(association.getDisplayName() + "." + AssociatedChildProperty.getDisplayName(), association.getName() + "." + AssociatedChildProperty.getName()));
                                    
                                    lstPermissionDataItems.add(association.getName() + "." + AssociatedChildProperty.getName());
                                }
                            }
                        }
                    }
                }
                
                //可选表单
                List<Object> listSheetCodes = new ArrayList<Object>();
                List<BizSheet> Sheets = this.getEngine().getBizSheetManager().GetBizSheetBySchemaCode(Clause.getBizSchemaCode());
                if (Sheets != null){
                    for (BizSheet Sheet : Sheets){
                        listSheetCodes.add(EnclDataInfo(Sheet.getDisplayName() + "[" + Sheet.getSheetCode() + "]", Sheet.getSheetCode()));
                    }
                }
                model.setSheetCodes(listSheetCodes);
            }
        }
        model.setDataItems(lstFrontDataItems);
        
        //前置条件, Text前台需要解析多语言包
        List<Object> listEntryCondition = new ArrayList<Object>();
        listEntryCondition.add(EnclDataInfo("Designer.Designer_AnyOne", EntryConditionType.Any.getValue(), 0));
        listEntryCondition.add(EnclDataInfo("Designer.Designer_All", EntryConditionType.All.getValue(), 1));
        model.setEntryCondition(listEntryCondition);
        
        //同步异步
        List<Object> listSync = new ArrayList<Object>();
        listSync.add(EnclDataInfo("Designer.Designer_Sync", "true", 0));
        listSync.add(EnclDataInfo("Designer.Designer_Async", "false", 1));
        model.setSyncOrASync(listSync);
        
        //参与者策略
        List<Object> listParAbNormalPolicy = GetParAbnormalPolicy();
        model.setParAbnormalPolicy(listParAbNormalPolicy);

        //参与过流程策略
        model.setParticipatedParPolicy(GetParticipatedParPolicy());
        
        // 发起者参与者策略
        List<Object> listOriginatorParAbnormalPolicy = getOriginatorParAbnormalPolicy();
        model.setOriginatorParAbnormalPolicy(listOriginatorParAbnormalPolicy);
        
        //参与方式:单人/多人
        List<Object> listParticipantMode = new ArrayList<Object>();
        listParticipantMode.add(EnclDataInfo("Designer.Designer_Single", ActivityParticipateType.SingleParticipant.getValue(), 0));
        listParticipantMode.add(EnclDataInfo("Designer.Designer_Mulit", ActivityParticipateType.MultiParticipants.getValue(), 1));
        model.setParticipantMode(listParticipantMode);
        
        //可选参与方式:并行/串行
        List<Object> listParticipateMethod = new ArrayList<Object>();
        listParticipateMethod.add(EnclDataInfo("Designer.Designer_Parallel", ParticipateMethod.Parallel.getValue(), 0));
        listParticipateMethod.add(EnclDataInfo("Designer.Designer_Serial", ParticipateMethod.Serial.getValue(), 1));
        model.setParticipateMethod(listParticipateMethod);
        
        //提交时检查
        List<Object> listSubmittingValidation = new ArrayList<Object>();
        listSubmittingValidation.add(EnclDataInfo("Designer.Designer_NotCheck", SubmittingValidationType.None.getValue(), 0));
        listSubmittingValidation.add(EnclDataInfo("Designer.Designer_CheckParticipant", SubmittingValidationType.CheckNextParIsNull.getValue(), 1));
        model.setSubmittingValidation(listSubmittingValidation);
        
        //子流程数据映射类型
        List<Object> lstMapTypes = new ArrayList<Object>();
        for (InOutType WorkflowDataMapInOutType : InOutType.class.getEnumConstants()){
            if (!InOutType.InOutAppend.toString().equals(WorkflowDataMapInOutType)){
                lstMapTypes.add(EnclDataInfo(WorkflowDataMapInOutType.name(), InOutType.forValue(WorkflowDataMapInOutType.getValue()).getValue()));
            }
        }
        model.setMapTypes(lstMapTypes);
        
        //表单锁
        List<Object> listLockLevel = new ArrayList<Object>();
        listLockLevel.add(EnclDataInfo("Designer.Designer_PopupManyPeople", LockLevel.Warning.getValue()));
        listLockLevel.add(EnclDataInfo("Designer.Designer_ProhibitOneTime", LockLevel.Mono.getValue()));
        listLockLevel.add(EnclDataInfo("Designer.Designer_CancelExclusive", LockLevel.CancelOthers.getValue()));
        model.setLockLevel(listLockLevel);
        
        // 锁策略
        List<Object> listLockPlicy = new ArrayList<Object>();
        listLockPlicy.add(EnclDataInfo("Designer.Designer_NotLock", LockPolicy.None.getValue()));
        listLockPlicy.add(EnclDataInfo("Designer.Designer_LockOpen", LockPolicy.Open.getValue()));
        listLockPlicy.add(EnclDataInfo("Designer.Designer_LockRequest", LockPolicy.Request.getValue()));
        model.setLockPolicy(listLockPlicy);
        
        //超时策略
        List<Object> listOvertimePolicy = new ArrayList<Object>();
        listOvertimePolicy.add(EnclDataInfo("Designer.Designer_ExecuteStrategy", OvertimePolicy.None.getValue()));
        listOvertimePolicy.add(EnclDataInfo("Designer.Designer_Approval", OvertimePolicy.Approve.getValue()));  
        listOvertimePolicy.add(EnclDataInfo("Designer.Designer_AutoComplete", OvertimePolicy.Finish.getValue()));
        listOvertimePolicy.add(EnclDataInfo("Designer.Designer_RemindStrategy1", OvertimePolicy.Remind1.getValue()));
        listOvertimePolicy.add(EnclDataInfo("Designer.Designer_RemindStrategy2", OvertimePolicy.Remind2.getValue()));
        model.setOvertimePolicy(listOvertimePolicy);
        
        //数据项映射类型
        List<Object> lstDataDisposalTypes = new ArrayList<Object>();
        for (DataDisposalType DisposalTypeString : DataDisposalType.class.getEnumConstants()){
            lstDataDisposalTypes.add(EnclDataInfo(DisposalTypeString.toString(), DisposalTypeString.getValue()));
        }
        model.setDataDisposalTypes(lstDataDisposalTypes);
        
        //初始化活动的数据权限
        if (WorkflowVersion == WorkflowDocument.NullWorkflowVersion && WorkflowTemplate != null && WorkflowTemplate.getActivities() != null){
            Map<String, String> dicWorkflowNames = new HashMap<String, String>();
            for (Activity Activity : WorkflowTemplate.getActivities()){
                if (Activity instanceof ParticipativeActivity){
                    ParticipativeActivity ParticipativeActivity = (ParticipativeActivity)Activity;
                    List<String> lstValidPermissionItemNames = new ArrayList<String>();
                    List<DataItemPermission> lstValidDataItemPermissions = new ArrayList<DataItemPermission>();
                    if (ParticipativeActivity.getDataPermissions() == null){
                        DataItemPermission[] validDataItems = new DataItemPermission[lstValidDataItemPermissions.size()];
                        for (int i = 0; i < validDataItems.length; i++) {
                            validDataItems[i] = lstValidDataItemPermissions.get(i);
                        }
                        ParticipativeActivity.setDataPermissions(validDataItems);
                    }
                        
                    if (ParticipativeActivity.getDataPermissions() != null){
                        for (DataItemPermission DataItemPermission : ParticipativeActivity.getDataPermissions()){
                            if (lstPermissionDataItems.contains(DataItemPermission.getItemName())){
                                lstValidDataItemPermissions.add(DataItemPermission);
                                lstValidPermissionItemNames.add(DataItemPermission.getItemName());
                            }
                        }
                    }
                    for (String ItemName : lstPermissionDataItems){
                        if (!lstValidPermissionItemNames.contains(ItemName)){
                            DataItemPermission tempVar = new DataItemPermission();
                            tempVar.setItemName(ItemName);
                            tempVar.setVisible(true);
                            tempVar.setMobileVisible(true);
                            lstValidDataItemPermissions.add(tempVar);
                            lstValidPermissionItemNames.add(ItemName);
                        }
                    }
                    DataItemPermission[] validDataItems = new DataItemPermission[lstValidDataItemPermissions.size()];
                    for (int i = 0; i < validDataItems.length; i++) {
                        validDataItems[i] = lstValidDataItemPermissions.get(i);
                    }
                    ParticipativeActivity.setDataPermissions(validDataItems);
                }else if (Activity instanceof SubInstanceActivity){
                    String _SubWorkflowCode = ((SubInstanceActivity)Activity).getWorkflowCode();
                    if (!DotNetToJavaStringHelper.isNullOrEmpty(_SubWorkflowCode) && !dicWorkflowNames.containsKey(_SubWorkflowCode.toLowerCase())){
                        WorkflowClause _SubClause = this.getEngine().getWorkflowManager().GetClause(_SubWorkflowCode);
                        dicWorkflowNames.put(_SubWorkflowCode.toLowerCase(), _SubClause == null ? _SubWorkflowCode : _SubClause.getWorkflowName());
                    }
                }
            }
            model.setWorkflowNames(dicWorkflowNames);
        }
        model.setWorkflowTemplate(WorkflowTemplate);

        //数据项
        model.setDataItemsSelect(GetALLDataItems(Clause == null ? WorkflowCode : Clause.getBizSchemaCode()));
        
        return model;
            
    }
    
    /**
     * 
     * @Title: exceptionActivities 
     * @Description: 根据实例ID获取异常节点
     * @param @param instanceID
     * @param @return
     * @param @throws Exception    设定文件 
     * @return List<String>    返回类型 
     * @throws 
     * @author zhangj 
     * @date 2017年8月8日 上午10:05:50
     */
    private List<String> exceptionActivities(String instanceID) throws Exception{
        List<String> listExceptionActivities = new ArrayList<String>();
        InstanceContext instanceContext = this.getEngine().getInstanceManager().GetInstanceContext(instanceID);
        List<ExceptionLog> exceptionLogs = this.getEngine().getExceptionManager().GetExceptionsByInstance(instanceID);
        if(exceptionLogs != null){
            for (ExceptionLog exceptionLog : exceptionLogs) {
                if(exceptionLog.getState() == ExceptionState.Unfixed){
                    instanceContext.setState(InstanceState.Exceptional);
                    if(exceptionLog.getSourceType() == RuntimeObjectType.Activity){
                        listExceptionActivities.add(exceptionLog.getSourceName());
                    }
                }
            }
        }
        return listExceptionActivities;
    }

    /** 
     获取所有数据项
     
     @param SchemaCode
     @return 
     * @throws Exception 
    */
    @RequestMapping(value="/GetALLDataItems",method={RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public final List<FormulaTreeNode> GetALLDataItems(String SchemaCode) throws Exception
    {

        List<FormulaTreeNode> listNodes = new ArrayList<FormulaTreeNode>();
        //根节点
        String RootNodeID = UUID.randomUUID().toString();
        FormulaTreeNode tempVar = new FormulaTreeNode();
        tempVar.setBaseObjectID(RootNodeID);
        tempVar.setText("Designer.Designer_AllDataItem");
        tempVar.setValue("");
        tempVar.setIcon(this.getPortalRoot() + "/WFRes/_Content/designer/image/formula/folder_16.png");
        tempVar.setParentID("");
        FormulaTreeNode AllDataNode = tempVar;

        listNodes.add(AllDataNode);

        //系统数据项
        listNodes.addAll(GetSystemDataItemNode(RootNodeID));

        //流程数据项
        listNodes.addAll(GetDataItems(SchemaCode, RootNodeID));

        return listNodes;


    }


    /** 
     获取流程系统数据项树节点
     
     @return 
    */
    protected final List<FormulaTreeNode> GetSystemDataItemNode(String ParentNodeID)
    {
        List<FormulaTreeNode> listNodes = new ArrayList<FormulaTreeNode>();
        KeyWordNode KeyWordNode = ParserFactory.GetDataTreeNode();

        String FomulaRootID = UUID.randomUUID().toString();

        FormulaTreeNode tempVar = new FormulaTreeNode();
        tempVar.setBaseObjectID(FomulaRootID);
        tempVar.setText(KeyWordNode.getText());
        tempVar.setValue(KeyWordNode.getText());
        tempVar.setIsLeaf(false);
        tempVar.setParentID(ParentNodeID);
        tempVar.setIcon(this.getPortalRoot() + "/WFRes/_Content/designer/image/formula/folder_16.png");
        FormulaTreeNode FormulaNode = tempVar;

        listNodes.add(FormulaNode);
        listNodes.addAll(CopyTreeNode(KeyWordNode, FomulaRootID));

        return listNodes;
    }

    /** 
     从KeyWordNode拷贝到TreeNode
     
     @param fromParentNode
     @param toParentNode
    */
    private List<FormulaTreeNode> CopyTreeNode(KeyWordNode fromParentNode, String ParentNodeID)
    {
        List<FormulaTreeNode> listNodes = new ArrayList<FormulaTreeNode>();
        if (fromParentNode != null)
        {
            if (fromParentNode.getChildNodes().size() == 0)
            {
                //toParentNode.ChildNodes.Add(new TreeNode(fromParentNode.Text, fromParentNode.Text));
            }
            else
            {
                for (KeyWordNode fromChild : fromParentNode.getChildNodes())
                {
                    String NodeObjectID = UUID.randomUUID().toString();
                    FormulaTreeNode tempVar = new FormulaTreeNode();
                    tempVar.setBaseObjectID(NodeObjectID);
                    tempVar.setText(fromChild.getText());
                    tempVar.setValue(fromChild.getText());
                    tempVar.setParentID(ParentNodeID);
                    tempVar.setFormulaType(FormulaType.FlowSystemVariables.toString());
                    tempVar.setIsLeaf(true);
                    FormulaTreeNode FormulaNode = tempVar;
                    listNodes.add(FormulaNode);
                    //toParentNode.ChildNodes.Add(toChild);
                    listNodes.addAll(CopyTreeNode(fromChild, ParentNodeID));
                }
            }
        }

        return listNodes;
    }

    // 流程数据项
    private List<FormulaTreeNode> GetDataItems(String SchemaCode, String ParentID) throws Exception
    {
        String RootNodeID = UUID.randomUUID().toString();
        FormulaTreeNode tempVar = new FormulaTreeNode();
        tempVar.setBaseObjectID(RootNodeID);
        tempVar.setText("Designer.Designer_InstanceDataItem");
        tempVar.setValue("");
        tempVar.setIcon(this.getPortalRoot() + "/WFRes/_Content/designer/image/formula/folder_16.png");
        tempVar.setParentID(ParentID);
        FormulaTreeNode flowDataNode = tempVar;
        List<FormulaTreeNode> lstDataItems = new ArrayList<FormulaTreeNode>();
        lstDataItems.add(flowDataNode);

        if (!DotNetToJavaStringHelper.isNullOrEmpty(SchemaCode))
        {
            BizObjectSchema BizSchema = this.getEngine().getBizObjectManager().GetDraftSchema(SchemaCode);

            if (BizSchema != null)
            {
                if (BizSchema != null && BizSchema.getProperties() != null)
                {

                    for (PropertySchema Property : BizSchema.getProperties())
                    {
                        //不显示保留数据项
                        //update by ouyangsk 流程摘要不展示子表，附件以及审批意见
                        if (!BizObjectSchema.IsReservedProperty(Property.getName())
                                && Property.getLogicType() != DataLogicType.BizObjectArray 
                                && Property.getLogicType() != DataLogicType.Comment 
                                && Property.getLogicType() != DataLogicType.Attachment)
                        {
                            FormulaTreeNode tempVar2 = new FormulaTreeNode();
                            tempVar2.setBaseObjectID(UUID.randomUUID().toString());
                            tempVar2.setIsLeaf(true);
                            tempVar2.setParentID(RootNodeID);
                            tempVar2.setText(Property.getDisplayName());
                            tempVar2.setValue(Property.getName());
                            lstDataItems.add(tempVar2);
                            ;
                        }
                    }


                }
            }
        }

        return lstDataItems;
    }


    /** 
     获取可选参与者策略
     
     @param DropDownList
    */
    private List<Object> GetParAbnormalPolicy()
    {
        List<Object> lstObj = new ArrayList<Object>();

        lstObj.add(EnclDataInfo("Designer.Designer_NotHandle", ParAbnormalPolicy.Default.getValue()));

        lstObj.add(EnclDataInfo("Designer.Designer_LastResult", ParAbnormalPolicy.CopyLastApproval.getValue()));
        
        lstObj.add(EnclDataInfo("Designer.Designer_Approval", ParAbnormalPolicy.Approve.getValue()));

        return lstObj;
    }

    private List<Object> GetParticipatedParPolicy()
    {
        List<Object> lstObj = new ArrayList<Object>();

        lstObj.add(EnclDataInfo("Designer.Designer_NotHandle", ParAbnormalPolicy.Default.getValue()));

        lstObj.add(EnclDataInfo("Designer.Designer_LastResult", ParAbnormalPolicy.CopyLastApproval.getValue()));

        lstObj.add(EnclDataInfo("Designer.Designer_Approval", ParAbnormalPolicy.Approve.getValue()));

        lstObj.add(EnclDataInfo("Designer.Designer_PostApproval", ParAbnormalPolicy.LastApproval.getValue()));

        return lstObj;
    }
    
    /**
     * 绑定发起者参与者策略
     * @return
     * update by zhangj
     */
    private List<Object> getOriginatorParAbnormalPolicy(){
        List<Object> lstObj = new ArrayList<Object>();
        lstObj.add(EnclDataInfo("Designer.Designer_NotHandle", ParAbnormalPolicy.Default.getValue()));
        lstObj.add(EnclDataInfo("Designer.Designer_Approval", ParAbnormalPolicy.Approve.getValue()));
        return lstObj;
    }
    
    /**
     * 封装数据信息
     * @param text 
     * @param value
     * @return
     */
    private Object EnclDataInfo(String text, Object value){
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("Text", text);
        item.put("Value", value);
        return item;
    }
    
    /**
     * 封装数据信息
     * @param text 
     * @param value
     * @return
     */
    private Object EnclDataInfo(String text, Object value, int index){
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("Text", text);
        item.put("Value", value);
        item.put("Index", index);
        return item;
    }
    
}