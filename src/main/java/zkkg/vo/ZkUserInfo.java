package zkkg.vo;

public class ZkUserInfo {
    /**
     * 主账号Id
     */
    private String  parentid  ;
    /**
     * 主次账号(0主账号，1此账号)
     */
	private String  isprimary   ;
    /**
     * 用户id
     */
	private String  ufid  ;
	private String  unumber   ;
    /**
     * 用户名称
     */
	private String  uname  ;
    /**
     * 所属组织id
     */
	private String  orgfid   ;
	private String  orgnumber   ;
	private String  orgname   ;
	private String  orgdisplayname   ;
	private String  poid   ;
	private String  position   ;
	private String  u2fid   ;
    /**
     * 邮箱
     */
	private String  email  ;
    /**
     * 性别
     */
	private String  gender   ;
    /**
     * 手机号
     */
	private String  fcell   ;

    public String getParentid() {
        return parentid;
    }

    public void setParentid(String parentid) {
        this.parentid = parentid;
    }

    public String getIsprimary() {
        return isprimary;
    }

    public void setIsprimary(String isprimary) {
        this.isprimary = isprimary;
    }

    public String getUfid() {
        return ufid;
    }

    public void setUfid(String ufid) {
        this.ufid = ufid;
    }

    public String getUnumber() {
        return unumber;
    }

    public void setUnumber(String unumber) {
        this.unumber = unumber;
    }

    public String getUname() {
        return uname;
    }

    public void setUname(String uname) {
        this.uname = uname;
    }

    public String getOrgfid() {
        return orgfid;
    }

    public void setOrgfid(String orgfid) {
        this.orgfid = orgfid;
    }

    public String getOrgnumber() {
        return orgnumber;
    }

    public void setOrgnumber(String orgnumber) {
        this.orgnumber = orgnumber;
    }

    public String getOrgname() {
        return orgname;
    }

    public void setOrgname(String orgname) {
        this.orgname = orgname;
    }

    public String getOrgdisplayname() {
        return orgdisplayname;
    }

    public void setOrgdisplayname(String orgdisplayname) {
        this.orgdisplayname = orgdisplayname;
    }

    public String getPoid() {
        return poid;
    }

    public void setPoid(String poid) {
        this.poid = poid;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getU2fid() {
        return u2fid;
    }

    public void setU2fid(String u2fid) {
        this.u2fid = u2fid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getFcell() {
        return fcell;
    }

    public void setFcell(String fcell) {
        this.fcell = fcell;
    }
}
