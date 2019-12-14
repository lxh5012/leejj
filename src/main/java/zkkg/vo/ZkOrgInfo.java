package zkkg.vo;

public class ZkOrgInfo {
    /**
     * 部门id
     */
    private String departmentId;
    /**
     *部门编码
     */
    private String departmentCode;
    /**
     * 部门名称
     */
    private String departmentName;
    /**
     * 描述
     */
    private String  description;
    /**
     * 简称
     */
    private String simpleName;
    /**
     * 上级组织编码
     */
    private String parentCode ;
    /**
     * 公司编码
     */
    private String companyCode ;
    /**
     *
     */
    private String companyId ;
    /**
     * 部门负责人id
     */
    private String ZkLeaderId1 ;
    /**
     * 部门负责人姓名
     */
    private String leaderName1 ;
    /**
     * 部门负责人2
     */
    private String ZkLeaderId2 ;
    /**
     * 部门负责人姓名
     */
    private String leaderName2 ;
    /**
     * 部门负责人3
     */
    private String ZkLeaderId3 ;
    /**
     * 部门负责人姓名
     */
    private String leaderName3 ;
    /**
     * 组织类型
     * 
     * */
    private String OrgType;
    public String getOrgType() {
		return OrgType;
	}

	public void setOrgType(String orgType) {
		OrgType = orgType;
	}

	public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSimpleName() {
        return simpleName;
    }

    public void setSimpleName(String simpleName) {
        this.simpleName = simpleName;
    }

    public String getParentCode() {
        return parentCode;
    }

    public void setParentCode(String parentCode) {
        this.parentCode = parentCode;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getZkLeaderId1() {
        return ZkLeaderId1;
    }

    public void setZkLeaderId1(String ZkLeaderId1) {
        this.ZkLeaderId1 = ZkLeaderId1;
    }

    public String getLeaderName1() {
        return leaderName1;
    }

    public void setLeaderName1(String leaderName1) {
        this.leaderName1 = leaderName1;
    }

    public String getZkLeaderId2() {
        return ZkLeaderId2;
    }

    public void setZkLeaderId2(String ZkLeaderId2) {
        this.ZkLeaderId2 = ZkLeaderId2;
    }

    public String getLeaderName2() {
        return leaderName2;
    }

    public void setLeaderName2(String leaderName2) {
        this.leaderName2 = leaderName2;
    }

    public String getZkLeaderId3() {
        return ZkLeaderId3;
    }

    public void setZkLeaderId3(String ZkLeaderId3) {
        this.ZkLeaderId3 = ZkLeaderId3;
    }

    public String getLeaderName3() {
        return leaderName3;
    }

    public void setLeaderName3(String leaderName3) {
        this.leaderName3 = leaderName3;
    }
}
