package zkkg.controller;


import OThinker.H3.Controller.ControllerBase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import zkkg.service.IOrgUnitService;


import javax.annotation.Resource;


/**
 * @author laixh
 */
@Controller
@RequestMapping(value="/OrgUnit")
public class OrgUnitSyncController extends ControllerBase {
    private static final Logger LOGGER = LoggerFactory.getLogger(OrgUnitSyncController.class);
    @Resource
    private IOrgUnitService orgUnitServiceImpl;
    @Override
    public String getFunctionCode() {
        return null;
    }
    /**
     * 同步组织机构信息
     */
    @RequestMapping(value="/SaveOrgInfoZk",method= RequestMethod.POST)
    @ResponseBody
    public  void SaveOrgInfo( ) throws Exception
    {
        try {
            LOGGER.info("|OrgUnitSyncController|SaveOrgIn|同步组织机构信息开始");
            orgUnitServiceImpl.syncOrgUnit();
            LOGGER.info("|OrgUnitSyncController|SaveOrgIn|同步组织机构信息结束");
        } catch (Exception ex) {
            LOGGER.error("OrgUnitSyncController|SaveOrgInfo:",ex);
        }
    }


}
