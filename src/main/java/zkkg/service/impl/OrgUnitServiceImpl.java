package zkkg.service.impl;

import OThinker.Common.Organization.Models.OrganizationUnit;
import OThinker.Common.Organization.Models.User;
import OThinker.Common.Organization.enums.HandleResult;
import OThinker.Common.Organization.enums.UserGender;
import OThinker.Common.Organization.enums.VisibleType;
import com.h3bpm.base.engine.client.EngineClient;
import com.h3bpm.base.util.AppUtility;
import data.DataRow;
import data.DataTable;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import zkkg.service.IOrgUnitService;
import zkkg.util.Constant;
import zkkg.util.JdbcUtil;
import zkkg.vo.ZkOrgInfo;
import zkkg.vo.ZkUserInfo;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @author laixh
 */
@Service("orgUnitServiceImpl")
public class OrgUnitServiceImpl implements IOrgUnitService {
    private static final Logger LOGGER = LoggerFactory.getLogger(OrgUnitServiceImpl.class);
    private static volatile boolean shouldRefreshEngine = false;
    private static volatile EngineClient _Engine = null;

    @Override
    public void syncOrgUnit() throws Exception{

        //第一步：同步组织机构
        syncAllUnit();

        //第二步：同步人员，更新组织信息，注意虚拟账号问题
        syncAllUser();

        //第三步：刷新组织机构关系，反写组织机构中的部门领导
        updateOrgUnit();

        //第四步：虚拟账号处理数据处理
        updateOrgUser();
    }

    private List<User> selectAllUser() throws Exception{
        List<User> users = new ArrayList<>();
        StringBuffer userSql =new StringBuffer(" select ObjectID,ModifiedTime,ZkUserId,IsVirtualUser,ZkMasterId,Code from ot_user where 1=1 " );

        DataTable orgDataTable = getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteDataTable(userSql.toString());
        for(int i=0;i<orgDataTable.getRows().size();i++){
            User userTemp = new User();
            DataRow dataRow = orgDataTable.getRows().get(i);
            userTemp.setObjectID(dataRow.getString("ObjectID"));
            userTemp.setZkUserId(dataRow.getString("ZkUserId"));
            userTemp.setModifiedTime(dataRow.getDate("ModifiedTime"));
            userTemp.setIsVirtualUser(dataRow.getBoolean("IsVirtualUser"));
            userTemp.setZkMasterId(dataRow.getString("ZkMasterId"));
            userTemp.setCode(dataRow.getString("Code"));
            users.add(userTemp);
        }

        return users;
    }

    private List<OrganizationUnit> selectAllUnit() {
        List<OrganizationUnit> organizationUnits = new ArrayList<>();
        StringBuffer userSql =new StringBuffer(" select ObjectID,ModifiedTime,DepartmentID,ZkLeaderId1,ZkLeaderId2,ZkLeaderId3,ParentCode,NAME,DepartmentCode,CategoryCode,description from ot_organizationunit  " );
        DataTable orgDataTable = getEngine().getEngineConfig().getCommandFactory().CreateCommand().ExecuteDataTable(userSql.toString());
        try {
           for(int i=0;i<orgDataTable.getRows().size();i++){
               OrganizationUnit organizationUnitTemp = new OrganizationUnit();
               DataRow dataRow = orgDataTable.getRows().get(i);
               organizationUnitTemp.setObjectID(dataRow.getString("ObjectID"));
               organizationUnitTemp.setDepartmentID(dataRow.getString("DepartmentID"));
               organizationUnitTemp.setParentCode(dataRow.getString("ParentCode"));
               organizationUnitTemp.setDepartmentCode(dataRow.getString("DepartmentCode"));
               organizationUnitTemp.setName(dataRow.getString("NAME"));
               organizationUnitTemp.setZkLeaderId1(dataRow.getString("ZkLeaderId1"));
               organizationUnitTemp.setZkLeaderId2(dataRow.getString("ZkLeaderId2"));
               organizationUnitTemp.setZkLeaderId3(dataRow.getString("ZkLeaderId3"));
               organizationUnitTemp.setCategoryCode(dataRow.getString("CategoryCode"));
               organizationUnitTemp.setVisibility(VisibleType.Normal);
               //add by shipeng 2019-12-10 增加描述同步
               organizationUnitTemp.setDescription(dataRow.getString("description"));
               organizationUnits.add(organizationUnitTemp);
           }
        }catch (Exception e){
            LOGGER.error("查询组织数据异常",e);
        }

        return organizationUnits;
    }

    /**
     * 同步组织信息
     * @throws Exception
     */
    private void syncAllUnit() throws Exception{
        //同步组织信息
        List<ZkOrgInfo> orgInfos = JdbcUtil.queryOrgUnit();
        List<OrganizationUnit> organizationUnits = selectAllUnit();
        Map<String,OrganizationUnit> organizationUnitMap = new HashMap<>();
        if(!organizationUnits.isEmpty()){
            organizationUnitMap = organizationUnits.stream().collect(
                    Collectors.toMap(OrganizationUnit::getDepartmentID, Function.identity(), (key1, key2) -> key2));
        }
        for (ZkOrgInfo o : orgInfos) {
            OrganizationUnit unit = null ;
            //我的公司改成对应顶级公司
            if(Constant.ZK_ORG_ROOT_CODE.equals(o.getDepartmentCode())&&Constant.ZK_ORG_ROOT_ID.equals(o.getDepartmentId())){
                unit = (OrganizationUnit) getEngine().getOrganization().GetUnit(Constant.ORG_ROOT_ID);
                unit.setObjectID(Constant.ORG_ROOT_ID);
                unit.setIsRootUnit(true);
            }else {
            	unit = new  OrganizationUnit();
                unit = organizationUnitMap.get(o.getDepartmentId());
            }

            //更新标志
            boolean isUpdate = true;
            if (ObjectUtils.isEmpty(unit)) {
                unit = new OrganizationUnit();
                isUpdate = false;
            }
            unit.setDepartmentID(o.getDepartmentId());
            unit.setName(o.getDepartmentName());
            unit.setSimpleName(o.getSimpleName());
            unit.setDescription(o.getDescription());
            unit.setDepartmentCode(o.getDepartmentCode());
            unit.setCompanyCode(o.getCompanyCode());
            unit.setParentCode(Constant.ZK_ORG_ROOT_CODE.equals(o.getDepartmentCode()) ? "" : o.getParentCode());
            unit.setZkLeaderId1(o.getZkLeaderId1());
            unit.setZkLeaderId2(o.getZkLeaderId2());
            unit.setZkLeaderId3(o.getZkLeaderId3());
            //add by shipeng 219-12-10 增加可见类型设置
            unit.setVisibility(VisibleType.Normal);
            //add by shipeng 219-12-10 增加组织类型同步
            unit.setCategoryCode(o.getOrgType());

            //全部更新
            if (isUpdate) {
                unit.setSerialized(true);
                getEngine().getOrganization().UpdateUnit(User.AdministratorID, unit);
            }else{
                String objectId= UUID.randomUUID().toString();
                unit.setObjectID(objectId);
                getEngine().getOrganization().AddUnit("",unit);
            }
        }
    }

    /**
     * 更新用户信息
     * @throws Exception
     */
    private void syncAllUser() throws Exception{
       //同步用户信息
        List<ZkUserInfo> userInfos = JdbcUtil.queryOrgUser();

        List<User> userList = selectAllUser();
        Map<String,User> userMap = new HashMap<>();
        if(!userList.isEmpty()){
            for(User user:userList ){
                userMap.put(user.getZkUserId(),user);
            }
        }
        List<OrganizationUnit> organizationUnits = selectAllUnit();
        Map<String,OrganizationUnit> organizationUnitMap =  new HashMap<>();
        for(OrganizationUnit organizationUnit:organizationUnits){
            if(StringUtils.isNotBlank(organizationUnit.getDepartmentCode())){
                organizationUnitMap.put(organizationUnit.getDepartmentID(),organizationUnit);
            }
        }
        for (ZkUserInfo u : userInfos) {
            User user = userMap.get(u.getUfid());
            //更新标志
            boolean isUpdate = true;
            if (ObjectUtils.isEmpty(user)) {
                user = new User();
                isUpdate = false;
            }
            user.setZkUserId(u.getUfid());
            user.setName(u.getUname());
            user.setName(u.getUname());
            user.setZkOrgId(u.getOrgfid());
            user.setEmail(u.getEmail());
            user.setCode(u.getUnumber());
            user.setZkMasterId(u.getParentid());
            user.setVisibility(VisibleType.Normal);
            //存组织id,通过同步的组织id，获取H3的ObjectId
            OrganizationUnit organizationUnit = organizationUnitMap.get(u.getOrgfid());
            user.setParentID(Objects.nonNull(organizationUnit)?organizationUnit.getObjectID():"");
            //主次账号(0主账号，1次账号)
            if("1".equals(u.getIsprimary())){
                user.setIsVirtualUser(true);
            }
            if("0".equals(u.getGender())){
                user.setGender(UserGender.Male);
            }else if("1".equals(u.getGender())){
                user.setGender(UserGender.Female);
            }else{
                user.setGender(UserGender.None);
            }
            user.setMobile(u.getFcell());

            if(isUpdate){
                user.setSerialized(true);
                getEngine().getOrganization().UpdateUnit(User.AdministratorID,user);
            }else{
                String objectId= UUID.randomUUID().toString();
                user.setObjectID(objectId);
                HandleResult handleResult = getEngine().getOrganization().AddUnit(User.AdministratorID,user);
                LOGGER.info("OrgUnitServiceImpl|syncAllUser"+handleResult);
            }

        }
    }

    private void updateOrgUnit() throws Exception{
        List<OrganizationUnit> organizationUnits = selectAllUnit();
        Map<String,OrganizationUnit> organizationUnitMap =  new HashMap<>();
        for(OrganizationUnit organizationUnit:organizationUnits){
            if(StringUtils.isNotBlank(organizationUnit.getDepartmentCode())){
                organizationUnitMap.put(organizationUnit.getDepartmentCode(),organizationUnit);
            }
        }
        List<User> userList = selectAllUser();
        Map<String,User> userMap = new HashMap<>();
        for(User user:userList ){
            if(StringUtils.isNotBlank(user.getZkUserId())){
                userMap.put(user.getZkUserId(),user);
            }
        }
        for(OrganizationUnit organizationUnit:organizationUnits){
            //更新组织id
            //我的公司不需要更改信息
            if(Constant.ORG_ROOT_ID.equals(organizationUnit.getObjectID())){
                continue;
            }

            OrganizationUnit organizationUnitTemp = organizationUnitMap.get(organizationUnit.getParentCode());
            organizationUnit.setParentID(Objects.nonNull(organizationUnitTemp)?organizationUnitTemp.getObjectID():"");

            //部门领导
            User leader1 = userMap.get(organizationUnit.getZkLeaderId1());
            User leader2 = userMap.get(organizationUnit.getZkLeaderId2());
            User leader3 = userMap.get(organizationUnit.getZkLeaderId3());
            if(LOGGER.isDebugEnabled()){
                if(Objects.nonNull(leader3)){
                    LOGGER.info("|OrgUnitServiceImpl|updateOrgUnit|organizationUnit|{"+"ZkLeaderId3:"+organizationUnit.getZkLeaderId3()+"}|leader3|{ZkUserId:"+leader3.getZkUserId()+"}");
                }

            }

            organizationUnit.setLeaderId1(Objects.isNull(leader1)?"":leader1.getObjectID());
            organizationUnit.setLeaderId2(Objects.isNull(leader2)?"":leader2.getObjectID());
            organizationUnit.setLeaderId3(Objects.isNull(leader3)?"":leader3.getObjectID());
            if(LOGGER.isDebugEnabled()){
                LOGGER.info("|OrgUnitServiceImpl|updateOrgUnit|organizationUnit|{LeaderId3:"+organizationUnit.getLeaderId3()+"}");
            }
            organizationUnit.setSerialized(true);
            getEngine().getOrganization().UpdateUnit(User.AdministratorID, organizationUnit);
        }

    }

    private void updateOrgUser() throws Exception{
        //获取所有用户
        List<User> userList = selectAllUser();
        Map<String,User> userMap = new HashMap<>();
        //获取主账户
        for(User user:userList ){
            if(!user.getIsVirtualUser()){
                userMap.put(user.getZkUserId(),user);
            }
        }
        //更新虚拟账户
        for(User u:userList){
            if(!u.getIsVirtualUser()){
                continue;
            }
            User userTemp = userMap.get(u.getZkMasterId());
            if(LOGGER.isDebugEnabled()){
                LOGGER.info("OrgUnitServiceImpl|updateOrgUser|u|{ZkUserId:"+u.getZkUserId()+",ZkMasterId:"+u.getZkMasterId()+"}");
                LOGGER.info("OrgUnitServiceImpl|updateOrgUser|userTemp|{ObjectID:"+(Objects.nonNull(userTemp)?userTemp.getObjectID():"not found"));
            }
            if(Objects.isNull(userTemp)){
                continue;
            }
            u.setRelationUserID(userTemp.getObjectID());
            u.setSerialized(true);
            getEngine().getOrganization().UpdateUnit(User.AdministratorID, u);
        }
    }

    /**
     * 获取引擎管理器
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
