<div id="masterContent_divContent" class="div">
    <script type="text/javascript">
$.MvcSheet.Loaded = function () {

    if($.MvcSheetUI.SheetInfo.ActivityCode=="Activity2"){

        //取出表长度
        var TZLX_Tab_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        if(TZLX_Tab_Num>0){
            for (var i = 0; i < TZLX_Tab_Num; i++) {
                //循环行
                var Arow = i + 1;
                var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
                if (TZLX=="新增") {
                    $("input[data-datafield='BianGenXinXiToOther.DepartmentName2'][data-row='" + Arow + "']").removeAttr("readonly");
                }

            }
        }

    }

    //申请部门的值
    Get_SQBM_Data();

    Get_SQBM_Data2();
    //Get_ShenQingBuMen_ByFenXiaoLeiXing();
    //申请类型
    Get_ShenQingLeiXing();

    //隐藏审核意见标题在传阅节点多余字段
    YinCang_SHYJ_Label();

    //设置添加字体为添加行
    $("a[id^='Add_']").text("添加行");

    //隐藏成本中心
    CBZX_Hidden_Show();

    //隐藏预算中心
    YSZX_Hidden_Show();

    //隐藏table上的按钮信息
    Hidden_Table_TalInfo();

    //在HRSCC节点显示导出按钮
    ExportBtn_Show_HRSCC();

    //控制费用类型下拉框值显示
    //ShuiWuZu_FYLX_Show();

    //控制子表第一行不被删除   部门变更
    KZ_First_Row_No_Delete_BuMen();

    //控制子表第一行不被删除   其他变更
    KZ_First_Row_No_Delete_Other();

    //隐藏审批意见中的常用意见。
    CWGX_SPYJ_Hide();

    //发起节点审批意见输入框不可以见
    FaQiJieDianInputJHidden();


    ShuiWuZu_TiaoZhengLeiXing();


    YeWuXian_TiaoZhengLeiXing();

    //隐藏已办多出的值
    YiBanData_YinCang();

//显示删除按钮
    showDelete();

}

//显示删除按钮
function showDelete(){
    if($.MvcSheetUI.SheetInfo.ActivityCode=="Activity2"){
        $(".delete").show();
        $("#optionDeleteOther_Row1.delete").hide();
    }
}



//隐藏审核意见标题在传阅节点多余字段
function YinCang_SHYJ_Label() {
    //判断是否两个传阅节点,如果在就隐藏
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity182" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity184" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        $("#ctl871464").hide();
    }
    else {
        $("#ctl871464").show();
    }
}


//Activity131 费用类型 Activity145  Activity140  Activity137
function Other_FeiYongLeiXing() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity145" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity140" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        //取出表长度
        var TZLX_Tab_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var FYLX
        for (var i = 0; i < TZLX_Tab_Num; i++) {
            //循环行
            var Arow = i + 1;
            //取费用类型的值
            FYLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.FeiYongLeiXing", Arow);
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (FYLX == "" && TZLX=="新增") {
                alert("请输入费用类型,不允许为空!");
                return false;
            }

        }

    }
}


//获取申请类型的值 隐藏显示子表信息
function Get_ShenQingLeiXing() {
    var ShenQingLeiXing = $.MvcSheetUI.GetControlValue("ShenQingLeiXing");
    //如果申请类型为部门负责人变更显示部门负责人变更子表，反之，显示其他变更流程子表
    if (ShenQingLeiXing == "") {
        //隐藏部门变更子表
        $("#BMBGTable").hide();
        //隐藏其他变更子表
        $("#OtherBGTable").hide();
        //隐藏部门变更模板
        $("#BMBGMB").hide();
        //隐藏其他变更模板
        $("#QTBGMB").hide();
    }
    else if (ShenQingLeiXing == "部门负责人变更") {
        //显示部门变更表，隐藏其他表
        $("#BMBGTable").show();
        $("#OtherBGTable").hide();
        $("#lblTitle").empty();
        $("#lblTitle").append("组织结构变更申请(负责人变更)");
        //隐藏其他变更模板
        $("#QTBGMB").hide();
        //显示部门变更模板
        $("#BMBGMB").show();
    }
    else if (ShenQingLeiXing == "其他") {
        //显示其他变更表,隐藏部门子表
        $("#OtherBGTable").show();
        $("#BMBGTable").hide();
        $("#lblTitle").empty();
        $("#lblTitle").append("组织结构变更申请(其他变更)");
        //设置参与者控件样式
        $("div[data-datafield='BianGenXinXiToOther.DepartmentName2']").click(function () {
            $(".SelectorPanel").css("position", "initial");
        });
        //隐藏部门变更模板
        $("#BMBGMB").hide();
        //显示其他变更模板
        $("#QTBGMB").show();
    }
    else {
        return false;
    }
}


//获取其他变更子表中调整类型的值  发起页面
function Get_TZLX_Data() {
    var TZLX_Tab_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
    for (var i = 0; i < TZLX_Tab_Num; i++) {
        //定义循环行号
        var Arow = i + 1;
        //取出每行调整类型的值
        var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
        //选择为新增的情况下部门名称不填写,调整后部门名称不填写，负责人名称必填，上级部门必填
        if (TZLX == "新增") {
            //现部门名称目前无法实现不可编辑
            //$.MvcSheetUI.GetElement("BianGenXinXiToOther.DepartmentName", Arow).find("input").attr("disabled", true);
            //调整后部门不可编辑
            //$("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").attr("readonly", "true");

            //隐藏部门ID的选择  避免弹出开窗查询
            $("#BMID a").eq(i).hide();

            //部门等级可填
            $("#BMDJ a").eq(i).show();
            //部门ID 不可编辑
            $("input[data-datafield='BianGenXinXiToOther.DepartmentID'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.DepartmentID'][data-row='" + Arow + "']").attr("readonly", "true");
            //现部门名称可以手动填写
            //$("input[data-datafield='BianGenXinXiToOther.DepartmentName2'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.DepartmentName2'][data-row='" + Arow + "']").removeAttr("readonly");
            //调整后部门不填写
            $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").attr("readonly", "true");
            $("#SJBM a").eq(i).show();
            //上级部门可编辑
            $("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").removeAttr("readonly");
            //负责人信息
            $("#FZRID a").eq(i).show();
            $("input[data-datafield='BianGenXinXiToOther.FuZeRenName2'][data-row='" + Arow + "']").attr("readonly", "true");
        }
        else if (TZLX == "部门更名") {
            //部门ID必填,显示选择按钮
            $("#BMID a").eq(i).show();

            //部门等级可填
            $("#BMDJ a").eq(i).show();

            //将部门名称设为只读
            $("input[data-datafield='BianGenXinXiToOther.DepartmentName2'][data-row='" + Arow + "']").attr("readonly", "true");
            //调整后部门必填,去除只读属性
            $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").removeAttr("readonly");
            //负责人ID必填
            $("#FZRID a").eq(i).show();
            $("#SJBM a").eq(i).show();
            //上级部门可编辑
            //上级部门不可编辑
            //$("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").val("");
            //$("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").attr("readonly", "true");
            //上级部门手填，可编辑
            $("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").removeAttr("readonly");

        }
        //选项为部门更新额情况下部门名称必填，调整后部门必填，部门名称填写，上级部门可填
        else if (TZLX == "取消") {
            //部门ID必填,显示选择按钮
            $("#BMID a").eq(i).show();

            //部门等级不可填
            //$("#BMDJ a").eq(i).hide();
            $("#BMDJ a").eq(i).show();
            //调整后部门不可编辑
            $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").attr("readonly", "true");

            //上级部门不填
            $("#SJBM a").eq(i).hide();
            //上级部门不可编辑
            $("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").attr("readonly", "true");
            //负责人ID不填
            $("#FZRID a").eq(i).hide();
            $("input[data-datafield='BianGenXinXiToOther.FuZeRenID'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.FuZeRenID'][data-row='" + Arow + "']").attr("readonly", "true");
            //负责人不可编辑
            $("input[data-datafield='BianGenXinXiToOther.FuZeRenName2'][data-row='" + Arow + "']").val("");
            $("input[data-datafield='BianGenXinXiToOther.FuZeRenName2'][data-row='" + Arow + "']").attr("readonly", "true");

        }
    }
}

var dataArray = new Array();
//表单必填验证事件
$.MvcSheet.Validate = function () {
    // //debugger;
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        var SQLX = $.MvcSheetUI.GetControlValue("ShenQingLeiXing");
        //部门负责人变更子表中必填项是否为空
        if (SQLX == "部门负责人变更") {
            //获取到部门负责人变更子表中的行数
            var BM_Name, FZR_Name, BM_Level;
            var BMFZRNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
            if(BMFZRNum>30){
                alert("数据条数不能大于30!");
                return false;
            }
            for (var i = 0; i < BMFZRNum; i++) {
                //定义循环行号
                var Arow = i + 1;
                BM_Name = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.DepartmentName2", Arow);
                FZR_Name = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.FuZeRenName2", Arow);
                BM_Level = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.BuMenJiBie", Arow);

                var FZR_Id = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.FuZeRenID", Arow);
                var BM_Id = "tal0000000000000000000000000"+$.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.DepartmentID", Arow).toLowerCase();
                var BMCODE=GetBMCODEByBMLevel(BM_Level);
                if(!checkFZRBGBM(BM_Id,BM_Name,BMCODE)){
                    alert("第"+Arow+"行部门信息与数据库数据不一致，请修正！");
                    return false;
                }
                if(!checkFZRBGFZR(FZR_Id,FZR_Name)){
                    alert("第"+Arow+"行负责人信息与数据库数据不一致，请修正！");
                    return false;
                }

                if($.MvcSheetUI.GetControlValue("UnitGroup_Level_State")==null || $.MvcSheetUI.GetControlValue("UnitGroup_Level_State")==""){
                    if(BM_Level=="集团总部" || BM_Level=="集团" || BM_Level=="集团一级部门" || BM_Level=="分校" || BM_Level=="事业部" || BM_Level=="事业部一级部门" || BM_Level=="事业部总部"){
                        $.MvcSheetUI.SetControlValue("UnitGroup_Level_State","1");
                    }
                }
            }

            //判断必填项是否为空
            if (BM_Name == "" || FZR_Name == "" || BM_Level == "") {
                alert("1、部门名称  2、负责人名称  3、部门级别不能为空!");
                return false;
            }
        }
        //其他变更信息验证
        else if (SQLX == "其他") {
            //获取到其他变更子表中的行数
            var OtherNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
            var TZLX, XBMMC, BMJB, SJBM, FZRMC, TZHBM, Dizhi;
            if(OtherNum>50){
                alert("数据条数不能大于50!");
                return false;
            }
            for (var i = 0; i < OtherNum; i++) {
                //定义循环行号
                var Arow = i + 1;
                //获取调整类型的值
                TZLX = $("select[data-datafield='BianGenXinXiToOther.TiaoZhengType'][data-row='" + Arow + "']").val();
                XBMMC = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.DepartmentName2", Arow);
                BMJB = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.DepartmentLevel", Arow);
                SJBM = $("input[data-datafield='BianGenXinXiToOther.ShangJiBuMen2'][data-row='" + Arow + "']").val();
                FZRMC = $("input[data-datafield='BianGenXinXiToOther.FuZeRenName2'][data-row='" + Arow + "']").val();
                TZHBM = $("input[data-datafield='BianGenXinXiToOther.TiaoZhengHouBuMenName'][data-row='" + Arow + "']").val();
                Dizhi = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.Address", Arow);
                if (TZLX == "") {
                    alert("1、调整类型不允许为空!");
                    return false;
                }

                if(GetBMCODEByBMLevel(BMJB)==""){
                    alert("第"+Arow+"行-"+TZLX+"-部门级别与数据库数据不一致，请修正！");
                    return false;
                }

                if (TZLX == "新增") {
                    var FZR_Id = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.FuZeRenID", Arow);
                    if(!checkFZRBGFZR(FZR_Id,FZRMC)){
                        alert("第"+Arow+"行-"+TZLX+"-负责人信息与数据库数据不一致，请修正！");
                        return false;
                    }
                    if(!checkBMNAME(SJBM)){
                        alert("第"+Arow+"行-"+TZLX+"-上级部门与数据库数据不一致，请修正！");
                        return false;
                    }
                    //判断负责人名称和上级部门是否为空，如果为空不允许提交表单
                    if (FZRMC == "" || SJBM == "" || BMJB == "" || Dizhi == ""||XBMMC=="") {
                        alert("1、负责人名称   2、现部门名称  3、上级部门  4、部门级别  5、城市不允许为空! ");
                        return false;
                    }
                    if (XBMMC.length >30) {
                        alert("现部门名称长度不能大于30! ");
                        return false;
                    }

                }
                else if (TZLX == "部门更名") {
                    var FZR_Id = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.FuZeRenID", Arow);
                    if(!checkFZRBGFZR(FZR_Id,FZRMC)){
                        alert("第"+Arow+"行-"+TZLX+"-负责人信息与数据库数据不一致，请修正！");
                        return false;
                    }
                    if(!checkBMNAME(SJBM)){
                        alert("第"+Arow+"行-"+TZLX+"-上级部门与数据库数据不一致，请修正！");
                        return false;
                    }
                    var BM_Id = "tal0000000000000000000000000"+$.MvcSheetUI.GetControlValue("BianGenXinXiToOther.DepartmentID", Arow).toLowerCase();
                    if(!checkBMIDNAME(BM_Id,XBMMC)){
                        alert("第"+Arow+"行-"+TZLX+"-现部门信息与数据库数据不一致，请修正！");
                        return false;
                    }
                    //设置部门名称，调整后部门名称为必填
                    if (XBMMC == "" || TZHBM == "" || BMJB == "" || Dizhi == "") {
                        alert("1、现部门名称  2、调整后部门名称   3、部门级别  4、城市不允许为空!");
                        return false;
                    }
                    if (TZHBM.length >30) {
                        alert("调整后部门名称长度不能大于30! ");
                        return false;
                    }

                }
                else if (TZLX == "取消") {
                    var BM_Id = "tal0000000000000000000000000"+$.MvcSheetUI.GetControlValue("BianGenXinXiToOther.DepartmentID", Arow).toLowerCase();
                    var BMCODE=GetBMCODEByBMLevel(BMJB);
                    if(!checkFZRBGBM(BM_Id,XBMMC,BMCODE)){
                        alert("第"+Arow+"行-"+TZLX+"-部门信息与数据库数据不一致，请修正！");
                        return false;
                    }
                    //设置部门名称必填
                    if (XBMMC == "" || BMJB == "") {
                        alert("1、现部门名称  2、部门级别");
                        return false;
                    }
                }
                if($.MvcSheetUI.GetControlValue("UnitGroup_Level_State")==null || $.MvcSheetUI.GetControlValue("UnitGroup_Level_State")==""){
                    if(BMJB=="集团总部" || BMJB=="集团" || BMJB=="集团一级部门" || BMJB=="分校" || BMJB=="事业部" || BMJB=="事业部一级部门" || BMJB=="事业部总部"){
                        $.MvcSheetUI.SetControlValue("UnitGroup_Level_State","1");
                    }
                }
            }
        }
        else {
            return true;
        }
    }

    //验证成本中心和预算中心
    var aa = Other_ChengBenZhongXinAndYuSuanZhongXin();
    // alert(aa);
    if (aa == false) {
        return false;
    }
    var bb = Other_ChengBenZhongXinAndYuSuanZhongXin2();
    if (bb === false) {
        return false;
    }
    //验证费用类型
    var fy=Other_FeiYongLeiXing();
    if (fy == false) {
        return false;
    }

    //验证业务线

    var cc = Other_YeWuLian();

    if (cc == false) {
        return false;
    }


    //传送数据至EHR系统
    Get_DataList_ToEHRSystem();

    //获取组织等级Code更改状态
    //Get_UnitGroupCode_ByState();

    //验证费用类型是否为空
    var cc = FeiYongType_JiaoYan();
    if (cc == false) {
        return false;
    }

    var dd = PanDuanRowCount_BuMen();
    if (dd == false) {
        return false;
    }

    var ee = PanDuanRowCount_Other();
    if (ee == false) {
        return false;
    }
}

//批量导入数据验证
function checkFZRBGBM(bmid,bmname,bmcode){
    var flag=false;
    $.ajax({
        type: "POST",
        async: false,
        url: "/Portal/AjaxServices/executeServiceMethod",
        data: { "cmd": "ExecuteServiceMethod", "ServiceCode": "Query_Department_Info", "MethodName": "checkDepartmentInfo","objectid":bmid,"name":bmname,"categorycode":bmcode},
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if(data!=null && JSON.stringify(data)!="{}"){
                flag=true;
            }
        }
    });
    return flag;
}
function checkBMIDNAME(bmid,bmname){
    var flag=false;
    $.ajax({
        type: "POST",
        async: false,
        url: "/Portal/AjaxServices/executeServiceMethod",
        data: { "cmd": "ExecuteServiceMethod", "ServiceCode": "Query_Department_Info", "MethodName": "checkDepartmentIdName","objectid":bmid,"name":bmname},
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if(data!=null && JSON.stringify(data)!="{}"){
                flag=true;
            }
        }
    });
    return flag;
}
function checkBMNAME(bmname){
//上级部门改为手填，不校验是否存在上级部门
    /*	var flag=false;
        $.ajax({
           type: "POST",
           async: false,
           url: "/Portal/AjaxServices/executeServiceMethod",
           data: { "cmd": "ExecuteServiceMethod", "ServiceCode": "Query_Department_Info", "MethodName": "checkDepartmentName","name":bmname},
           contentType: "application/x-www-form-urlencoded; charset=utf-8",
           dataType: "json",
           success: function (data) {
            if(data!=null && JSON.stringify(data)!="{}"){
                flag=true;
            }
           }
       });*/
    return true;
}
function checkFZRBGFZR(id,name){
    var flag=false;
    $.ajax({
        type: "POST",
        async: false,
        url: "/Portal/AjaxServices/executeServiceMethod",
        data: { "cmd": "ExecuteServiceMethod", "ServiceCode": "Query_Employee_Info", "MethodName": "checkEmployeeInfo","employeenumber":id,"name":name},
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if(data!=null && JSON.stringify(data)!="{}"){
                flag=true;
            }
        }
    });
    return flag;
}

//部门等级部门变更
function Get_BuMenLevel1() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        //获取表长度
        var tabNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
        //定义数组
        var arr1 = new Array();
        for (var i = 0; i < tabNum; i++) {
            //循环行
            var Arow = i + 1;
            var BM_Level_1 = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.BuMenJiBie", Arow);
            if (BM_Level_1 == "") {
                return false;
            }
            else {
                arr1.push(BM_Level_1);
            }
        }
        if (arr1.length > 0) {
            if ($.inArray('事业部总部', arr1) >= 0 || $.inArray('事业部', arr1) >= 0 || $.inArray('事业部一级部门', arr1) >= 0 || $.inArray('集团总部', arr1) >= 0 || $.inArray('集团', arr1) >= 0 || $.inArray('集团一级部门', arr1) >= 0 || $.inArray('分校', arr1) >= 0) {
                $("input[data-datafield='BuMenLevelHidden']").val("1");
            }
            else {
                $("input[data-datafield='BuMenLevelHidden']").val("0");
            }
        }
    }
}

//部门等级其他变更
function Get_BuMenLevel2() {

    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        //获取表长度
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            //定义数组
            var arr2 = new Array();
            for (var i = 0; i < tabNum; i++) {
                //循环行
                var Arow = i + 1;
                var BM_Level_2 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.DepartmentLevel", Arow);
                if (BM_Level_2 == "") {
                    return false;
                }
                else {
                    arr2.push(BM_Level_2);
                }

            }
            if (arr2.length > 0) {
                //alert($.inArray('分校', arr2));
                //if (arr2.indexOf("分校") >= 0 || arr2.indexOf("事业部总部") >= 0 || arr2.indexOf("事业部一级部门") >= 0 || arr2.indexOf("集团") >= 0 || arr2.indexOf("集团一级部门")) {


                //    $("input[data-datafield='BuMenLevelHidden2']").val("1");
                //}
                //else {
                //    $("input[data-datafield='BuMenLevelHidden2']").val("0");
                //}
                if ($.inArray('事业部总部', arr2) >= 0 || $.inArray('事业部', arr2) >= 0 || $.inArray('事业部一级部门', arr2) >= 0 || $.inArray('集团总部', arr2) >= 0 || $.inArray('集团', arr2) >= 0 || $.inArray('集团一级部门', arr2) >= 0 || $.inArray('分校', arr2) >= 0) {
                    $("input[data-datafield='BuMenLevelHidden2']").val("1");
                }
                else {
                    $("input[data-datafield='BuMenLevelHidden2']").val("0");
                }
            }
        }
    }

}

//非发起页面  所有子表下的添加行 等信息 全部隐藏
function Hidden_Table_TalInfo() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode != "Activity2") {
        //隐藏添加按钮
        $("a[id^='Add_BianGengXinXiToFuZeRen_']").hide();

        //隐藏清除按钮
        $("a[id^='Clear_BianGengXinXiToFuZeRen_']").hide();

        //隐藏导出按钮
        $("a[id^='Export_BianGengXinXiToFuZeRen_']").hide();

        //隐藏导入选择框
        $("input[id^='importExcel_BianGengXinXiToFuZeRen_']").hide();

        //隐藏导入按钮
        $("a[id^='Import_BianGengXinXiToFuZeRen_']").hide();

        //隐藏删除操作按钮
        $("td[class^='rowOption']").hide();


        //隐藏添加按钮
        $("a[id^='Add_BianGenXinXiToOther_']").hide();

        //隐藏清除按钮
        $("a[id^='Clear_BianGenXinXiToOther_']").hide();

        //隐藏导出按钮
        $("a[id^='Export_BianGenXinXiToOther_']").hide();

        //隐藏导入选择框
        $("input[id^='importExcel_BianGenXinXiToOther_']").hide();

        //隐藏导入按钮
        $("a[id^='Import_BianGenXinXiToOther_']").hide();

        //隐藏删除操作按钮
        $("td[class^='rowOption']").hide();
    }
}

//select CATEGORYCODE	 from wanghaipeng.OT_OrganizationUnit where objectid='tal0000000000000000000000000d1006194'
//根据申请部门确定分校类型
//function Get_ShenQingBuMen_ByFenXiaoLeiXing() {
//    var BMNO = $.MvcSheetUI.GetControlValue("ShenQingBuMen");
//    if (BMNO != "" || BMNO != null) {
//        $.MvcSheetUI.SetControlValue("GroupUnit_Level", BMNO);
//    }
//}

//获取组织等级Code更改状态
//function Get_UnitGroupCode_ByState() {
//    var Unit_Code = $.MvcSheetUI.GetControlValue("Group_Unit_Name");
//    if (Unit_Code != "" || Unit_Code != null) {
//        //判断是否符合条件。编号代表的是等级Code
//        if (Unit_Code == "SYB" || Unit_Code == "S01" || Unit_Code == "J00" || Unit_Code == "F00" || Unit_Code == "XES") {
//            $.MvcSheetUI.SetControlValue("UnitGroup_Level_State", "1");
//        }
//        else {
//            $.MvcSheetUI.SetControlValue("UnitGroup_Level_State", "0");
//        }
//    }
//    else {
//        $.MvcSheetUI.SetControlValue("UnitGroup_Level_State", "0");
//    }
//}


//取到申请部门的值确定是否属于智康和外分
function Get_SQBM_Data() {
    var SQBM_Str = $("div[data-datafield='ShenQingBuMen']").children().children().eq(0).attr("data-code");
    $("input[data-datafield='ShenQingBuMenHidden']").val(SQBM_Str);

}

//取到申请部门的值确定判断属于哪个分校
function Get_SQBM_Data2() {
    var SQBM_Str = $("div[data-datafield='ShenQingBuMen']").children().children().eq(0).text();
    var SQBM_Str3 = $("div[data-datafield='ShenQingBuMen']").children().children().eq(0).text();
    if (SQBM_Str.indexOf("培优") >= 0 || SQBM_Str.indexOf("智康") >= 0) {
        if ((SQBM_Str.split('-')).length - 1 >= 2) {
            var SQBM_New_Str2 = SQBM_Str.split("-")[0] + "-" + SQBM_Str.split("-")[1];
            $("input[data-datafield='SQBM_Splict']").val(SQBM_New_Str2);
        }
        else {
            $("input[data-datafield='SQBM_Splict']").val(SQBM_New_Str2);
        }
    }
    else {
        if ((SQBM_Str.split('-')).length - 1 >= 2) {
            var SQBM_New_Str2 = SQBM_Str.split("-")[0] + "-" + SQBM_Str.split("-")[1];
            $("input[data-datafield='SQBM_Splict']").val(SQBM_New_Str2);
        }
        else {
            $("input[data-datafield='SQBM_Splict']").val(SQBM_New_Str2);
        }
    }
}

//除以下节点外，显示导出数据按钮
function ExportBtn_Show_HRSCC() {
    // Activity98 HRSCC  Activity98  Activity130 Activity131 Activity145 Activity152 Activity153 Activity184 Activity135  Activity140  Activity137
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity96" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity98" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity131" || $.MvcSheetUI.SheetInfo.ActivityCode
        == "Activity145" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity152" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity153" ||
        $.MvcSheetUI.SheetInfo.ActivityCode == "Activity184" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity140" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        $("a[id^='Export_BianGengXinXiToFuZeRen_']").show();
        $("a[id^='Export_BianGenXinXiToOther_']").show();
        $("a[id^='Export_BianGengXinXiToFuZeRen_']").parent("div").css("float", "");
        $("a[id^='Export_BianGenXinXiToOther_']").parent("div").css("float", "");
    }
    else {
        $("a[id^='Export_BianGengXinXiToFuZeRen_']").hide();
        $("a[id^='Export_BianGenXinXiToOther_']").hide();
    }
}

//控制第一行不让删除  部门变更
function KZ_First_Row_No_Delete_BuMen() {
    //保证为发起节点
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        //取到子表行号
        var tabNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            //循环行
            var Arow = i + 1;
            if (Arow == 1) {
                $("a[id^='optionDelete_']").hide();
            }
        }
    }
}

//控制第一行不让删除 其他变更
function KZ_First_Row_No_Delete_Other() {
    //保证为发起节点
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        //取到子表行号
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            //循环行
            var Arow = i + 1;
            if (Arow == 1) {
                $("a[id^='optionDeleteOther_']").hide();
            }
        }
    }
}


//在共享经理处隐藏审批意见中的常用意见。
function CWGX_SPYJ_Hide() {
    $("#SHYJ").find('select.inputMouseOut').hide();
    $("#SHYJ").find('span').hide();
}

//在发起节点输入框不可以见
function FaQiJieDianInputJHidden() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity2") {
        $("#SHYJ").find('textarea.inputMouseOut').hide();
    }
}


//其他节点需要填写成本中心和预算中心的数据项验证
function Other_ChengBenZhongXinAndYuSuanZhongXin() {
    //当前审批节点存在填写成本中心和预算中心的  预算组，培优共享财务负责人  培优非共享财务负责人
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        //获取子表中行个数
        var Other_Table_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var IsChengBenZhongXin, ChengBenZhongXinName1, ChengBenZhongXinName2;
        var result = true;
        for (var i = 0; i < Other_Table_Num; i++) {
            //定义循环行
            var Arow = i + 1;
            //获取调整类型的值
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名" ) {
                result = true;
            }
            else {
                //获取成本中心选择项的值
                IsChengBenZhongXin = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin", Arow);

                if (IsChengBenZhongXin == "") {
                    alert("请选择成本中心填写方式!");
                    result = false;
                }
                else if (IsChengBenZhongXin == "是") {
                    //获取手输列和选择列
                    ChengBenZhongXinName1 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ChengBenZhongXinName1", Arow);
                    if (ChengBenZhongXinName1 == "") {
                        alert("请填写成本中心!");
                        result = false;
                    }
                }
                else if (IsChengBenZhongXin == "否") {
                    ChengBenZhongXinName2 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ChengBenZhongXinName2", Arow);
                    if (ChengBenZhongXinName2 == "") {
                        alert("请选择成本中心!");
                        result = false;
                    }
                }
                //获取预算中心选择项的值
                IsYuSuanZhongXin = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin", Arow);

                if (IsYuSuanZhongXin == "") {
                    alert("请选择预算中心填写方式!");
                    result = false;
                }
                else if (IsYuSuanZhongXin == "是") {
                    //获取手输列和选择列
                    YuSuanZhongXinName1 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.YuSuanZhongXinName1", Arow);
                    if (YuSuanZhongXinName1 == "") {
                        alert("请填写预算中心!");
                        result = false;
                    }
                }
                else if (IsYuSuanZhongXin == "否") {
                    YuSuanZhongXinName2 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.YuSuanZhongXinName2", Arow);
                    if (YuSuanZhongXinName2 == "") {
                        alert("请选择预算中心!");
                        result = false;
                    }
                }
            }
        }

        if (result == false) {
            return false;
        }
    }
}

//其他节点需要填写成本中心和预算中心的数据项验证
function Other_ChengBenZhongXinAndYuSuanZhongXin2() {
    //当前审批节点存在填写成本中心和预算中心的  预算组，培优共享财务负责人  培优非共享财务负责人
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        //获取子表中行个数
        var Other_Table_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var IsYuSuanZhongXin, YuSuanZhongXinName1, YuSuanZhongXinName2;
        var result = true;
        for (var i = 0; i < Other_Table_Num; i++) {
            //定义循环行
            var Arow = i + 1;
            //获取调整类型的值
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名" ) {
                result = true;
            }
            else {
                //获取预算中心选择项的值
                IsYuSuanZhongXin = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin", Arow);
                if (IsYuSuanZhongXin == "") {
                    alert("请选择预算中心填写方式!");
                    result = false;
                }
                else if (IsYuSuanZhongXin == "是") {
                    //获取手输列和选择列
                    YuSuanZhongXinName1 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.YuSuanZhongXinName1", Arow);
                    if (YuSuanZhongXinName1 == "") {
                        alert("请填写预算中心!");
                        result = false;
                    }
                }
                else if (IsYuSuanZhongXin == "否") {
                    YuSuanZhongXinName2 = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.YuSuanZhongXinName2", Arow);
                    if (YuSuanZhongXinName2 == "") {
                        alert("请选择预算中心!");
                        result = false;
                    }
                }
            }
        }
        if (result == false) {
            return false;
        }
    }
}


//隐藏显示成本中心
function CBZX_Hidden_Show() {
    // //debugger;
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        for (i = 0; i < tabNum; i++) {
            //定义行号
            var Arow = i + 1;
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消") {
                var isCheckStr = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin", Arow);
                if (isCheckStr == "" || isCheckStr == null) {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                if (isCheckStr == "是") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").show();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    //隐藏选择项选择字段
                    $("#CBZX_INPUT_2 a").eq(i).show();
                }
                else if (isCheckStr == "否") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                else {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
            }
            else if (TZLX == "部门更名") {
                var isCheckStr = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin", Arow);
                if (isCheckStr == "" || isCheckStr == null) {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                if (isCheckStr == "是") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").show();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").show();
                    $("#CBZX_INPUT_2 a").eq(i).show();
                }
                else if (isCheckStr == "否") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                else {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
            }
            else if (TZLX == "新增") {
                var isCheckStr = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin", Arow);
                if (isCheckStr == "" || isCheckStr == null) {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                if (isCheckStr == "是") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").show();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    //隐藏选择项选择字段
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
                else if (isCheckStr == "否") {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").show();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).show();
                }
                else {
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#CBZX_INPUT_2 a").eq(i).hide();
                }
            }

        }

    }
}


//隐藏显示预算中心
function YSZX_Hidden_Show() {
    // //debugger;
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var trs=$("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']");
        for (i = 0; i < tabNum; i++) {
            //定义行号
            var Arow = i + 1;
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名" ) {
                //将预算中心等置灰  不可输入
                //将成本中心置灰  不可输入 (手输)
                $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").attr("disabled", "disabled");

                //选择
                $("#YSZX2 a").eq(i).hide();

                //是否新增预算中心
                trs.eq(Arow-1).find("td ").find("input[type='radio']").eq(2).attr("disabled", "disabled");
                trs.eq(Arow-1).find("td ").find("input[type='radio']").eq(3).attr("disabled", "disabled");
            }
            else {
                var isCheckStr = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin", Arow);
                if (isCheckStr == "" || isCheckStr == null) {
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("#YSZX2 a").eq(i).hide();
                }
                if (isCheckStr == "是") {
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").show();
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").val("");
                    //隐藏选择项选择字段
                    $("#YSZX2 a").eq(i).hide();
                }
                else if (isCheckStr == "否") {
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").show();
                    $("#YSZX2 a").eq(i).show();
                }
                else {
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").hide();
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1'][data-row='" + Arow + "']").val("");
                    $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2'][data-row='" + Arow + "']").val("");
                    $("#YSZX2 a").eq(i).hide();
                }
            }

        }
    }
}

//Activity130业务线
function Other_YeWuLian() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        //取出表长度
        var TZLX_Tab_Num = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var result = true;

        for (var i = 0; i < TZLX_Tab_Num ; i++) {
            //循环行
            var Arow = i + 1;
            //取到调整类型的值
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名") {
                $("select[data-datafield='BianGenXinXiToOther.YeWuXian'][data-row='" + Arow + "']").attr("disabled", "disabled");
                result = true;
            }
            else {
                //取业务线的值
                var FYLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.YeWuXian", Arow);
                if (FYLX == "") {
                    alert("请输入业务线,不允许为空!");
                    result = false;
                }
            }
        }
        if (result == false) {
            return false;
        }
    }
}

//如果税务组没有填写费用类型 那么在智康外分负责人处就必须填写
function FeiYongType_JiaoYan() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity145" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity140") {
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        var result = true;
        for (var i = 0; i < tabNum; i++) {
            var Arow = i + 1;
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名") {
                $("select[data-datafield='BianGenXinXiToOther.FeiYongLeiXing'][data-row='" + Arow + "']").attr("disabled", "disabled");
                result = true;
            }
            else {
                var FYLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.FeiYongLeiXing", Arow);
                if (FYLX == "") {
                    alert("请输入费用类型!");
                    return false;
                }
            }
        }
    }
}

//税务组  调整类型为取消 隐藏费用类型
function ShuiWuZu_TiaoZhengLeiXing() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity131" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity145" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity140" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            var Arow = i + 1;
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名") {
                $("select[data-datafield='BianGenXinXiToOther.FeiYongLeiXing'][data-row='" + Arow + "']").attr("disabled", "disabled");
            }
        }

    }
}

//Activity130业务线
function YeWuXian_TiaoZhengLeiXing() {
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity130" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity140" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity135" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity137") {
        var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            var Arow = i + 1;
            var TZLX = $.MvcSheetUI.GetControlValue("BianGenXinXiToOther.TiaoZhengType", Arow);
            if (TZLX == "取消" || TZLX == "部门更名") {
                $("select[data-datafield='BianGenXinXiToOther.YeWuXian'][data-row='" + Arow + "']").attr("disabled", "disabled");
            }
        }

    }
}

//获取部门等级编号  翻译为中文
function GetBuMenLevelCode_ByChinese_FuZeRen() {
    var tabNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
    for (var i = 0; i < tabNum; i++) {
        var Arow = i + 1;
        var BMCODE = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.BuMenLevelHidden", Arow);
        if (BMCODE == "") {
            return false;
        }
        else if (BMCODE == "F00") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校");
        }
        else if (BMCODE == "F01") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校一级部门");
        }
        else if (BMCODE == "F02") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校二级部门");
        }
        else if (BMCODE == "F03") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校三级部门");
        }
        else if (BMCODE == "F04") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校四级部门");
        }
        else if (BMCODE == "FO5") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("分校五级部门");
        }
        else if (BMCODE == "S00") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部总部");
        }
        else if (BMCODE == "S01") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部一级部门");
        }
        else if (BMCODE == "S02") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部二级部门");
        }
        else if (BMCODE == "S03") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部三级部门");
        }
        else if (BMCODE == "S04") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部四级部门");
        }
        else if (BMCODE == "S05") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部五级部门");
        }
        else if (BMCODE == "J00") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团总部");
        }
        else if (BMCODE == "J01") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团一级部门");
        }
        else if (BMCODE == "J02") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团二级部门");
        }
        else if (BMCODE == "J03") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团三级部门");
        }
        else if (BMCODE == "J04") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团四级部门");
        }
        else if (BMCODE == "F0Y") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("服务中心/校区");
        }
        else if (BMCODE == "XES") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("集团");
        }
        else if (BMCODE == "VIT") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("虚拟部门");
        }
        else if (BMCODE == "VIS") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("虚拟事业部");
        }
        else if (BMCODE == "SYB") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("事业部");
        }
        else if (BMCODE == "OTH") {
            $("input[data-datafield='BianGengXinXiToFuZeRen.BuMenJiBie'][data-row='" + Arow + "']").val("其他");
        }

    }
}
//通过部门级别获取部门组织编码
function GetBMCODEByBMLevel(level) {
    var BMCODE="";
    if (level == "分校") {
        BMCODE="F00";
    }
    else if (level == "分校一级部门") {
        BMCODE="F01";
    }
    else if (level == "分校二级部门") {
        BMCODE="F02";
    }
    else if (level == "分校三级部门") {
        BMCODE="F03";
    }
    else if (level == "分校四级部门") {
        BMCODE="F04";
    }
    else if (level == "分校五级部门") {
        BMCODE="FO5";
    }
    else if (level == "事业部总部") {
        BMCODE="S00";
    }
    else if (level == "事业部一级部门") {
        BMCODE="S01";
    }
    else if (level == "事业部二级部门") {
        BMCODE="S02";
    }
    else if (level == "事业部三级部门") {
        BMCODE="S03";
    }
    else if (level == "事业部四级部门") {
        BMCODE="S04";
    }
    else if (level == "事业部五级部门") {
        BMCODE="S05";
    }
    else if (level == "集团总部") {
        BMCODE="J00";
    }
    else if (level == "集团一级部门") {
        BMCODE="J01";
    }
    else if (level == "集团二级部门") {
        BMCODE="J02";
    }
    else if (level == "集团三级部门") {
        BMCODE="J03";
    }
    else if (level == "集团四级部门") {
        BMCODE="J04";
    }
    else if (level == "服务中心/校区") {
        BMCODE="F0Y";
    }
    else if (level == "集团") {
        BMCODE="XES";
    }
    else if (level == "虚拟部门") {
        BMCODE="VIT";
    }
    else if (level == "虚拟事业部") {
        BMCODE="VIS";
    }
    else if (level == "事业部") {
        BMCODE="SYB";
    }
    else if (level == "其他") {
        BMCODE="OTH";
    }
    return BMCODE;
}

//隐藏已办多出的值
function YiBanData_YinCang() {
    //已办页面
    if ($.MvcSheetUI.SheetInfo.SheetMode == "2") {
        $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName1']").hide();
        $("input[data-datafield='BianGenXinXiToOther.ChengBenZhongXinName2']").hide();
        $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName1']").hide();
        $("input[data-datafield='BianGenXinXiToOther.YuSuanZhongXinName2']").hide();
    }
}

//判断子表行个数 如果小于1禁止提交  部门变更
function PanDuanRowCount_BuMen() {
    var tabNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
    if (tabNum < 1) {
        alert("必须填写一行数据，否则不允许提交!");
        return false;
    }
}
//判断子表行个数 如果小于1禁止提交  其他变更
function PanDuanRowCount_Other() {
    var tabNum = $("table[data-datafield='BianGenXinXiToOther']").children('tbody').children("tr[class='rows']").length;
    if (tabNum < 1) {
        alert("必须填写一行数据，否则不允许提交!");
        return false;
    }
}


//判断在Activity98 HRSCC审批后传送给EHR系统数据
function Get_DataList_ToEHRSystem() {
    // //debugger;
    var SQLX = $.MvcSheetUI.GetControlValue("ShenQingLeiXing");
    if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity98" && SQLX == "部门负责人变更") {
        var tabNum = $("table[data-datafield='BianGengXinXiToFuZeRen']").children('tbody').children("tr[class='rows']").length;
        for (var i = 0; i < tabNum; i++) {
            var Arow = i + 1;
            //生效日期
            var SXRQ = $.MvcSheetUI.GetControlValue("ShengXiaoRiQi");
            //部门编号
            // var BMID = $.MvcSheetUI.SheetInfo.BizObject.DataItems["BianGengXinXiToFuZeRen"].V["R"][i].DataItems["BianGengXinXiToFuZeRen.DepartmentID"].V;
            var BMID = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.DepartmentID", Arow);
            //负责人编号
            //var FZRID = $.MvcSheetUI.SheetInfo.BizObject.DataItems["BianGengXinXiToFuZeRen"].V["R"][i].DataItems["BianGengXinXiToFuZeRen.FuZeRenID"].V;
            var FZRID = $.MvcSheetUI.GetControlValue("BianGengXinXiToFuZeRen.FuZeRenID", Arow);
            var datafrom;
            if (SXRQ != "" && BMID != "" && FZRID != "") {
                datafrom = {
                    "department_id": BMID,
                    "workcode": FZRID,
                    "effected_on": SXRQ
                }

                var FIZ = JSON.stringify(datafrom);
                var text1;
                $.ajax({
                    async: false,
                    data: FIZ,
                    url: "https://hr-api.info.100tal.com/api/oa/v2/departments/manager",
                    type: "POST", contentType: "application/json",
                    success: function (msg) {
                        text1 = true;
                        alert("部门编号"+BMID+",传送EHR系统数据成功!");
                    },
                    error: function (mm) {
                        text1 = mm;
                        alertMessage2(text1);
                        text1=false;
                    }
                })
                //return text1;
            }
        }
    }
}

function alertMessage2(r) {
    if (r.responseJSON['errors']) {
        for (var i in r.responseJSON['errors']) {
            alert("传送EHR系统数据失败："+r.responseJSON.errors[i][0]);
            return r.responseJSON.errors[i][0];
        }
    }
    else {
        alert("传送EHR系统数据失败："+r.responseJSON.message);
        return r.responseJSON.message;
    }
}
</script>
<div style="text-align: center;"  class="DragContainer">
    <label id="lblTitle" class="panel-title">组织结构变更申请</label>
    </div>
    <div class="panel-body sheetContainer">
        <div class="nav-icon fa fa-chevron-right bannerTitle">
        <label id="divBasicInfo" data-en_us="Basic information">基本信息</label>
    </div>
    <div class="divContent">
    <div class="row">
    <div id="divFullNameTitle" class="col-md-2">
    <label id="lblFullNameTitle" data-type="SheetLabel" data-datafield="Originator.UserName" data-en_us="Originator" data-bindtype="OnlyVisiable" style="">发起人</label>
    </div>
    <div id="divFullName" class="col-md-4">

    <label id="lblFullName" data-type="SheetLabel" data-datafield="Originator.UserName" data-bindtype="OnlyData" style="" class=""></label>
    </div>
    <div id="divOriginateDateTitle" class="col-md-2">
    <label id="lblOriginateDateTitle" data-type="SheetLabel" data-datafield="OriginateTime" data-en_us="Originate Date" data-bindtype="OnlyVisiable" style="">发起时间</label>
    </div>
    <div id="divOriginateDate" class="col-md-4">
    <label id="lblOriginateDate" data-type="SheetLabel" data-datafield="OriginateTime" data-bindtype="OnlyData" style=""></label>
    </div>
    </div>
    <div class="row">
    <div id="divOriginateOUNameTitle" class="col-md-2">
    <label id="lblOriginateOUNameTitle" data-type="SheetLabel" data-datafield="Originator.OUName" data-en_us="Originate OUName" data-bindtype="OnlyVisiable" style="">所属组织</label>
    </div>
    <div id="divOriginateOUName" class="col-md-4">
    <!--					<label id="lblOriginateOUName" data-type="SheetLabel" data-datafield="Originator.OUName" data-bindtype="OnlyData">
    <span class="OnlyDesigner">Originator.OUName</span>
    </label>-->
    <select data-datafield="Originator.OUName" data-type="SheetOriginatorUnit" id="ctlOriginaotrOUName" class="" style="">
    </select>
    </div>
    <div id="divSequenceNoTitle" class="col-md-2">
    <label id="lblSequenceNoTitle" data-type="SheetLabel" data-datafield="SequenceNo" data-en_us="SequenceNo" data-bindtype="OnlyVisiable" style="">流水号</label>
    </div>
    <div id="divSequenceNo" class="col-md-4">
    <label id="lblSequenceNo" data-type="SheetLabel" data-datafield="SequenceNo" data-bindtype="OnlyData" style=""></label>
    </div>
    </div>
    </div>
    <div class="nav-icon fa  fa-chevron-right bannerTitle">
    <label id="divSheetInfo" data-en_us="Sheet information">表单信息</label>
    </div>
    <div class="divContent" id="divSheet">
    <div class="row">
    <div id="title1" class="col-md-2">
    <span id="Label11" data-type="SheetLabel" data-datafield="ShenQingRen" style="">申请人</span>
    </div>
    <div id="control1" class="col-md-4">
    <input id="Control11" type="text" data-datafield="ShenQingRen" data-type="SheetTextBox" style="" class="" data-defaultvalue="{Originator.UserName}" disabled="disabled">
    </div>
    <div id="title2" class="col-md-2">
    <span id="Label12" data-type="SheetLabel" data-datafield="ShenQingBuMen" style="" class="">申请部门</span>
    </div>
    <div id="control2" class="col-md-4">
    <div id="Control12" data-datafield="ShenQingBuMen" data-type="SheetUser" style="" class="" data-orgunitvisible="true" data-uservisible="false" data-defaultvalue="{Originator.OU}" data-onchange="Get_SQBM_Data();
Get_SQBM_Data2();"></div>
</div>
</div>
<div class="row hidden">
    <div id="div452130" class="col-md-2">
    <label data-datafield="ShenQingBuMenHidden" data-type="SheetLabel" id="ctl957626" class="" style="">申请部门隐藏字段</label>
    </div>
    <div id="div392835" class="col-md-4">
    <input type="text" data-datafield="ShenQingBuMenHidden" data-type="SheetTextBox" id="ctl386176" class="" style="">
    </div>
    <div id="div529462" class="col-md-2">
    <label data-datafield="UnitGroup_Level_State" data-type="SheetLabel" id="ctl407982" class="" style="">组织等级状态</label>
    </div>
    <div id="div305459" class="col-md-4">
    <input type="text" data-datafield="UnitGroup_Level_State" data-type="SheetTextBox" id="ctl504412" class="" style="">
    </div>
    </div>
    <div class="row hidden">
    <div id="div854672" class="col-md-2">
    <label data-datafield="SQBM_Splict" data-type="SheetLabel" id="ctl664294" class="" style="">申请部门区别</label>
    </div>
    <div id="div233925" class="col-md-4">
    <input type="text" data-datafield="SQBM_Splict" data-type="SheetTextBox" id="ctl137664" class="" style="">
    </div>
    <div id="div182428" class="col-md-2"></div>
    <div id="div102419" class="col-md-4"></div>
    </div>
    <div class="row hidden">
    <div id="div466216" class="col-md-2">
    <label data-datafield="GroupUnit_Level" data-type="SheetLabel" id="ctl223312" class="" style="">组织级别</label>
    </div>
    <div id="div300664" class="col-md-4">
    <input type="text" data-datafield="GroupUnit_Level" data-type="SheetTextBox" id="ctl820887" class="" style="">
    </div>
    <div id="div45330" class="col-md-2">
    <label data-datafield="Group_Unit_Name" data-type="SheetLabel" id="ctl54628" class="" style="">组织等级Code</label>
    </div>
    <div id="div740070" class="col-md-4">
    <select data-datafield="Group_Unit_Name" data-type="SheetDropDownList" id="ctl753416" class="" style="" data-schemacode="Query_GroupUnit_Level" data-querycode="Query_GroupUnit_Level" data-filter="GroupUnit_Level:BMID" data-datavaluefield="CATEGORYCODE" data-datatextfield="CATEGORYCODE"></select>
    </div>
    </div>
    <div class="row">
    <div id="title3" class="col-md-2">
    <span id="Label13" data-type="SheetLabel" data-datafield="ShenQingLeiXing" style="">申请类型</span>
    </div>
    <div id="control3" class="col-md-4">

    <select data-datafield="ShenQingLeiXing" data-type="SheetDropDownList" id="ctl228790" class="" style="" data-defaultitems="部门负责人变更;其他" data-onchange="Get_ShenQingLeiXing()" data-displayemptyitem="true" data-emptyitemtext="--请选择--"></select>
    </div>
    <div id="title4" class="col-md-2">
    <span id="Label14" data-type="SheetLabel" data-datafield="ShengXiaoRiQi" style="" class="">生效日期</span>
    </div>
    <div id="control4" class="col-md-4">
    <input id="Control14" type="text" data-datafield="ShengXiaoRiQi" data-type="SheetTime" style="" disabled="disabled" class="">
    </div>
    </div>
    <div class="row">
    <div id="title5" class="col-md-2">
    <span id="Label15" data-type="SheetLabel" data-datafield="LiuChengTongZhiRen" style="" class="">流程通知人</span>
    </div>
    <div id="control5" class="col-md-4">
    <div id="Control15" data-datafield="LiuChengTongZhiRen" data-type="SheetUser" style="" class="" data-placeholder="请输入用户姓名"></div>
    </div>
    <div id="space6" class="col-md-2">
    </div>
    <div id="spaceControl6" class="col-md-4">
    </div>
    </div>
    <div class="row" id="BMBGMB">
    <div id="div835358" class="col-md-2">
    <label data-datafield="BMBGMB" data-type="SheetLabel" id="ctl165854" class="" style="">部门变更模板</label>
    </div>
    <div id="div733656" class="col-md-10"><a data-datafield="BMBGMB" data-type="SheetHyperLink" id="ctl276967" class="" style=""></a><a data-datafield="BMBGMB" data-type="SheetHyperLink" id="ctl573375" class="" style=""></a><a data-datafield="BMBGMB" data-type="SheetHyperLink" id="ctl405654" class="" style="color: red;" data-navigateurl="组织结构部门变更信息.xls" data-text="组织结构部门变更信息.xls"></a></div>
</div>
<div class="row" id="BMBGTable">
    <div id="div738204" class="col-md-2">
    <label data-datafield="BianGengXinXiToFuZeRen" data-type="SheetLabel" id="ctl86944" class="" style="">变更信息</label>
    </div>
    <div id="div859410" class="col-md-10" style="float: left; overflow: auto;">
    <div style="width: 1000px;">
    <table id="ctl295624" data-datafield="BianGengXinXiToFuZeRen" data-type="SheetGridView" class="SheetGridView" style="width: 100%;" data-displayexport="true" data-displayimport="true" data-displayclear="true">
    <tbody class="">
    <tr class="header">
    <td id="ctl295624_SerialNo" class="rowSerialNo" style="width: 30px;">序号</td>
    <td id="ctl295624_header1" data-datafield="BianGengXinXiToFuZeRen.DepartmentID" style="width: 80px;" class="">
    <label id="ctl295624_Label1" data-datafield="BianGengXinXiToFuZeRen.DepartmentID" data-type="SheetLabel" style="" class="">部门ID</label></td>
<td id="ctl295624_header5" data-datafield="BianGengXinXiToFuZeRen.DepartmentName2" style="width: 200px;" class="">
    <label id="ctl295624_Label5" data-datafield="BianGengXinXiToFuZeRen.DepartmentName2" data-type="SheetLabel" style="" class="">部门名称</label></td>
<td id="ctl295624_header3" data-datafield="BianGengXinXiToFuZeRen.FuZeRenID" style="width: 80px;" class="">
    <label id="ctl295624_Label3" data-datafield="BianGengXinXiToFuZeRen.FuZeRenID" data-type="SheetLabel" style="" class="">负责人ID</label></td>
<td id="ctl295624_header6" data-datafield="BianGengXinXiToFuZeRen.FuZeRenName2" style="width: 80px;" class="">
    <label id="ctl295624_Label6" data-datafield="BianGengXinXiToFuZeRen.FuZeRenName2" data-type="SheetLabel" style="" class="">负责人名称</label></td>
<td id="ctl295624_header4" data-datafield="BianGengXinXiToFuZeRen.BuMenJiBie" style="width: 100px;" class="">
    <label id="ctl295624_Label4" data-datafield="BianGengXinXiToFuZeRen.BuMenJiBie" data-type="SheetLabel" style="" class="">部门级别</label></td>
<td id="ctl295624_header7" data-datafield="BianGengXinXiToFuZeRen.BuMenLevelHidden" style="width: 180px;" class="hidden">
    <label id="ctl295624_Label7" data-datafield="BianGengXinXiToFuZeRen.BuMenLevelHidden" data-type="SheetLabel" style="" class="">部门等级编号</label></td>
<td class="rowOption" id="rowOption">删除</td>
    </tr>
    <tr class="template">
    <td></td>
    <td id="ctl295624_control0" data-datafield="BianGengXinXiToFuZeRen.DepartmentID" style="" class="">
    <input type="text" readonly="readonly" data-datafield="BianGengXinXiToFuZeRen.DepartmentID" data-type="SheetTextBox" id="ctl295624_control1" class="" style="width: 80%;" data-popupwindow="PopupWindow" data-schemacode="Query_Department_Info" data-querycode="Query_Department_Info" data-outputmappings="BianGengXinXiToFuZeRen.DepartmentID:BMCODE,BianGengXinXiToFuZeRen.DepartmentName2:NAME1,BianGengXinXiToFuZeRen.BuMenLevelHidden:CATEGORYCODE">
    </td>
    <td id="ctl295624_control5" data-datafield="BianGengXinXiToFuZeRen.DepartmentName2" style="" class="">
    <input type="text" readonly="readonly" data-datafield="BianGengXinXiToFuZeRen.DepartmentName2" data-type="SheetTextBox" id="ctl821115" class="" style=""></td>
    <td id="ctl295624_control3" data-datafield="BianGengXinXiToFuZeRen.FuZeRenID" style="" class="" data-schemacode="Query_Employee_Info" data-querycode="Query_Employy_Info" data-outputmappings="BianGengXinXiToFuZeRen.FuZeRenID:EMPLOYEENUMBER,BianGengXinXiToFuZeRen.FuZeRenName2:NAME1" data-popupwindow="PopupWindow">
    <input type="text" readonly="readonly" data-datafield="BianGengXinXiToFuZeRen.FuZeRenID" data-type="SheetTextBox" id="ctl295624_control3" style="width: 80%;" class="" data-schemacode="Query_Employee_Info" data-querycode="Query_Employy_Info" data-outputmappings="BianGengXinXiToFuZeRen.FuZeRenID:EMPLOYEENUMBER,BianGengXinXiToFuZeRen.FuZeRenName2:NAME1" data-popupwindow="PopupWindow"></td>
    <td id="ctl295624_control6" data-datafield="BianGengXinXiToFuZeRen.FuZeRenName2" style="" class="" data-onchange="YGNO_GetDataFunc()">
    <input type="text" readonly="readonly" data-datafield="BianGengXinXiToFuZeRen.FuZeRenName2" data-type="SheetTextBox" id="ctl295624_control6" style="" class=""></td>
    <td id="ctl295624_control4" data-datafield="BianGengXinXiToFuZeRen.BuMenJiBie" style="" class="">
    <input type="text" readonly="readonly" data-datafield="BianGengXinXiToFuZeRen.BuMenJiBie" data-type="SheetTextBox" id="ctl821117" class="" style="width: 100%;"></td>
    <td id="ctl295624_control7" data-datafield="BianGengXinXiToFuZeRen.BuMenLevelHidden" style="" class="hidden">
    <input type="text" data-datafield="BianGengXinXiToFuZeRen.BuMenLevelHidden" data-type="SheetTextBox" id="ctl501560" class="" style="width: 100%;" data-onchange="GetBuMenLevelCode_ByChinese_FuZeRen()"></td>
    <td class="rowOption" id="OptionID">
    <a class="delete" id="optionDelete">
    <div class="fa fa-minus"></div>
    </a>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    </div>
    </div>

    <div class="row" id="QTBGMB">
    <div id="div485660" class="col-md-2">
    <label data-datafield="QTBGMB" data-type="SheetLabel" id="ctl450338" class="" style="">其他变更模板</label>
    </div>
    <div id="div992819" class="col-md-10"><a data-datafield="QTBGMB" data-type="SheetHyperLink" id="ctl13210" class="" style="color: red;" data-navigateurl="组织结构其他变更信息.xls" data-text="组织结构其他变更信息.xls"></a></div>
</div>
<div class="row" id="OtherBGTable">
    <div id="div111058" class="col-md-2">
    <label data-datafield="BianGenXinXiToOther" data-type="SheetLabel" id="ctl787063" class="" style="">变更信息</label>
    </div>
    <div id="div730589" class="col-md-10" style="float: left; overflow: auto;">
    <div style="width: 2000px;">
    <table id="Other_Table" data-datafield="BianGenXinXiToOther" data-type="SheetGridView" class="SheetGridView" style="width: 100%;" data-displayexport="true" data-displayimport="true" data-displayclear="true">
    <tbody>
    <tr class="header">
    <td id="ctl705324_SerialNo" class="rowSerialNo" style="width: 30px;">序号</td>
    <td id="ctl705324_header0" data-datafield="BianGenXinXiToOther.TiaoZhengType" class="" style="width: 80px;">
    <label id="ctl705324_Label0" data-datafield="BianGenXinXiToOther.TiaoZhengType" data-type="SheetLabel" style="" class="">调整类型</label></td>
<td id="ctl705324_header2" data-datafield="BianGenXinXiToOther.DepartmentID" style="width: 80px;" class="">
    <label id="ctl705324_Label2" data-datafield="BianGenXinXiToOther.DepartmentID" data-type="SheetLabel" style="" class="">部门ID</label></td>
<td id="ctl705324_header1" data-datafield="BianGenXinXiToOther.DepartmentName2" style="width: 200px;" class="">
    <label id="ctl705324_Label1" data-datafield="BianGenXinXiToOther.DepartmentName2" data-type="SheetLabel" style="" class="">现部门名称</label></td>
<td id="ctl705324_header3" data-datafield="BianGenXinXiToOther.TiaoZhengHouBuMenName" style="width: 200px;" class="">
    <label id="ctl705324_Label3" data-datafield="BianGenXinXiToOther.TiaoZhengHouBuMenName" data-type="SheetLabel" style="" class="">调整后部门名称</label></td>
<td id="ctl705324_header4" data-datafield="BianGenXinXiToOther.DepartmentLevel" style="width: 100px;" class="">
    <label id="ctl705324_Label4" data-datafield="BianGenXinXiToOther.DepartmentLevel" data-type="SheetLabel" style="" class="">部门级别</label></td>
<td id="ctl705324_header6" data-datafield="BianGenXinXiToOther.FuZeRenID" style="width: 80px;" class="">
    <label id="ctl705324_Label6" data-datafield="BianGenXinXiToOther.FuZeRenID" data-type="SheetLabel" style="" class="">负责人ID</label></td>
<td id="ctl705324_header5" data-datafield="BianGenXinXiToOther.FuZeRenName2" style="width: 80px;" class="">
    <label id="ctl705324_Label5" data-datafield="BianGenXinXiToOther.FuZeRenName2" data-type="SheetLabel" style="" class="" data-onclick="YGNO_GetDataFunc_Other()">负责人名称</label></td>
<td id="ctl705324_header7" data-datafield="BianGenXinXiToOther.ShangJiBuMen2" style="width: 200px;" class="">
    <label id="ctl705324_Label7" data-datafield="BianGenXinXiToOther.ShangJiBuMen2" data-type="SheetLabel" style="" class="">上级部门</label></td>
<td id="ctl705324_header20" data-datafield="BianGenXinXiToOther.Address" style="width: 80px;" class="">
    <label id="ctl705324_Label20" data-datafield="BianGenXinXiToOther.Address" data-type="SheetLabel" style="" class="">城市</label></td>
<td id="ctl705324_header8" data-datafield="BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin" style="width: 200px;" class="">
    <label id="ctl705324_Label8" data-datafield="BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin" data-type="SheetLabel" style="" class="">是否新增/更名/取消成本中心</label></td>
<td id="CBZX_LABEL_2" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName2" style="width: 200px;" class="">
    <label id="ctl705324_Label10" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName2" data-type="SheetLabel" style="" class="">成本中心(名称)选择</label></td>
<td id="CBZX_LABEL_1" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName1" style="width: 200px;" class="">
    <label id="ctl705324_Label9" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName1" data-type="SheetLabel" style="" class="">成本中心(名称)手写</label></td>

<td id="FYLX2_LABLE_1" data-datafield="BianGenXinXiToOther.FeiYongLeiXing" style="width: 80px;" class="">
    <label id="ctl705324_Label11" data-datafield="BianGenXinXiToOther.FeiYongLeiXing" data-type="SheetLabel" style="" class="">费用类型</label></td>
<td id="ctl705324_header12" data-datafield="BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin" style="width: 120px;" class="">
    <label id="ctl705324_Label12" data-datafield="BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin" data-type="SheetLabel" style="" class="">是否新增预算中心</label></td>
<td id="YSZX_LABEL_2" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName2" style="width: 200px;" class="">
    <label id="ctl705324_Label14" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName2" data-type="SheetLabel" style="" class="">预算中心(名称)选择</label></td>
<td id="YSZX_LABEL_1" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName1" style="width: 200px;" class="">
    <label id="ctl705324_Label13" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName1" data-type="SheetLabel" style="" class="">预算中心(名称)手写</label></td>

<td id="ctl705324_header15" data-datafield="BianGenXinXiToOther.YeWuXian" style="width: 90px;" class="">
    <label id="ctl705324_Label15" data-datafield="BianGenXinXiToOther.YeWuXian" data-type="SheetLabel" style="" class="">业务线</label></td>

<td class="rowOption">删除</td>
    </tr>
    <tr class="template">
    <td class=""></td>
    <td id="ctl705324_control0" data-datafield="BianGenXinXiToOther.TiaoZhengType" style="" class="" data-defaultvalue="新增;部门更名;取消">
    <select data-datafield="BianGenXinXiToOther.TiaoZhengType" data-type="SheetDropDownList" id="ctl962946" class="" style="" data-defaultitems="新增;部门更名;取消" data-displayemptyitem="true" data-emptyitemtext="--请选择--" data-onchange="Get_TZLX_Data()"></select></td>
<td id="BMID" data-datafield="BianGenXinXiToOther.DepartmentID" style="" class="" data-schemacode="Query_Department_Info" data-querycode="Query_Department_Info" data-outputmappings="BianGenXinXiToOther.DepartmentID:BMBH,BianGenXinXiToOther.DepartmentName:NAME1" data-popupwindow="PopupWindow">
    <input type="text" readonly="readonly" data-datafield="BianGenXinXiToOther.DepartmentID" data-type="SheetTextBox" id="ctl705324_control2" style="width: 80%;" class="" data-schemacode="Query_Department_Info" data-querycode="Query_Department_Info" data-outputmappings="BianGenXinXiToOther.DepartmentID:BMCODE,BianGenXinXiToOther.DepartmentName2:NAME1,BianGenXinXiToOther.BuMenLevelHidden:CATEGORYCODE" data-popupwindow="PopupWindow"></td>
    <td id="ctl705324_control1" data-datafield="BianGenXinXiToOther.DepartmentName2" style="" class="" data-orgunitvisible="true" data-uservisible="false" data-onchange="BMNO_GetDataFunc_Other()">
    <input type="text" readonly="readonly" data-datafield="BianGenXinXiToOther.DepartmentName2" data-type="SheetTextBox" id="ctl705324_control1" style="" class=""></td>
    <td id="ctl705324_control3" data-datafield="BianGenXinXiToOther.TiaoZhengHouBuMenName" style="" class="">
    <input type="text" data-datafield="BianGenXinXiToOther.TiaoZhengHouBuMenName" data-type="SheetTextBox" id="ctl705324_control3" style="" class=""></td>
    <td id="BMDJ" data-datafield="BianGenXinXiToOther.DepartmentLevel" style="" class="">
    <input type="text" readonly="readonly" data-datafield="BianGenXinXiToOther.DepartmentLevel" data-type="SheetTextBox" id="ctl35550" class="" style="width: 80%;" data-popupwindow="PopupWindow" data-schemacode="Query_DepartmentLevel_Info" data-querycode="Query_DepartmentLevel_Info" data-outputmappings="BianGenXinXiToOther.DepartmentLevel:NAME1"></td>
    <td id="FZRID" data-datafield="BianGenXinXiToOther.FuZeRenID" style="" class="" data-schemacode="Query_Employee_Info" data-querycode="Query_Employy_Info" data-outputmappings="BianGenXinXiToOther.FuZeRenID:EMPLOYEENUMBER,BianGenXinXiToOther.FuZeRenName:NAME1" data-popupwindow="PopupWindow">
    <input type="text" readonly="readonly" data-datafield="BianGenXinXiToOther.FuZeRenID" data-type="SheetTextBox" id="ctl705324_control6" style="width: 80%;" class="" data-schemacode="Query_Employee_Info" data-querycode="Query_Employy_Info" data-outputmappings="BianGenXinXiToOther.FuZeRenID:EMPLOYEENUMBER,BianGenXinXiToOther.FuZeRenName2:NAME1" data-popupwindow="PopupWindow"></td>
    <td id="ctl705324_control5" data-datafield="BianGenXinXiToOther.FuZeRenName2" style="" class="" data-onchange="YGNO_GetDataFunc_Other()">
    <input type="text" readonly="readonly" data-datafield="BianGenXinXiToOther.FuZeRenName2" data-type="SheetTextBox" id="ctl705324_control5" style="" class=""></td>

    <td id="SJBM" data-datafield="BianGenXinXiToOther.ShangJiBuMen2" style="" class="" data-orgunitvisible="true" data-uservisible="false" data-schemacode="Query_Department_Info" data-querycode="Query_Department_Info" data-outputmappings="BianGenXinXiToOther.ShangJiBuMen:NAME1" data-popupwindow="PopupWindow">
    <input type="text" data-datafield="BianGenXinXiToOther.ShangJiBuMen2" data-type="SheetTextBox" id="ctl859972" class="" style=""></td>
    <td id="ctl705324_control9" data-datafield="BianGenXinXiToOther.Address" style="" class="" data-orgunitvisible="true" data-uservisible="false">
    <input type="text" data-datafield="BianGenXinXiToOther.Address" data-type="SheetTextBox" id="ctl705324_control9" style="width: 100%;" class=""></td>
    <td id="ctl705324_control8" data-datafield="BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin" style="" class="">
    <div data-datafield="BianGenXinXiToOther.ShiFouXinZengChengBenZhongXin" data-type="SheetRadioButtonList" id="ctl521177" class="" style="" data-repeatcolumns="2" data-defaultitems="是;否" data-onchange="CBZX_Hidden_Show()"></div>
    </td>

    <td id="CBZX_INPUT_2" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName2" style="" class="">
    <input type="text" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName2" data-type="SheetTextBox" id="ctl485176" class="" style="width: 80%; display: none;" data-popupwindow="PopupWindow" data-schemacode="Query_CostCenter_Info" data-querycode="Query_CostCenter_Info" data-outputmappings="BianGenXinXiToOther.ChengBenZhongXinName2:NAME1"></td>
    <td id="CBZX_INPUT_1" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName1" style="" class="">
    <input type="text" data-datafield="BianGenXinXiToOther.ChengBenZhongXinName1" data-type="SheetTextBox" id="ctl705324_control21" style="" class=""></td>
    <td id="FYLX1" data-datafield="BianGenXinXiToOther.FeiYongLeiXing" style="" class="">
    <select data-datafield="BianGenXinXiToOther.FeiYongLeiXing" data-type="SheetDropDownList" id="FYLX_Select" class="" style="" data-emptyitemtext="--请选择--" data-displayemptyitem="true" data-defaultitems="经营费用;主营业务成本;管理费用;研发费用;"></select></td>
<td id="ctl705324_control12" data-datafield="BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin" style="" class="">
    <div data-datafield="BianGenXinXiToOther.ShiFouXinZengYuSuanZhongXin" data-type="SheetRadioButtonList" id="ctl386961" class="" style="" data-repeatcolumns="2" data-defaultitems="是;否" data-onchange="YSZX_Hidden_Show()"></div>
    </td>
    <td id="YSZX2" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName2" style="" class="">
    <input type="text" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName2" data-type="SheetTextBox" id="ctl705324_control14" style="width: 80%; display: none;" class="" data-popupwindow="PopupWindow" data-schemacode="Query_YuSuanZhongXin_Info" data-querycode="Query_YuSuanZhongXin_Info" data-outputmappings="BianGenXinXiToOther.YuSuanZhongXinName2:NAME1"></td>
    <td id="YSZX1" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName1" style="" class="">
    <input type="text" data-datafield="BianGenXinXiToOther.YuSuanZhongXinName1" data-type="SheetTextBox" id="ctl705324_control13" style="" class=""></td>

    <td id="ctl705324_control15" data-datafield="BianGenXinXiToOther.YeWuXian" style="" class="">
    <select data-datafield="BianGenXinXiToOther.YeWuXian" data-type="SheetDropDownList" id="ctl835514" class="" style="" data-displayemptyitem="true" data-emptyitemtext="--请选择--" data-defaultitems="培优-在线;其他;培优-双师;培优-面授;"></select></td>
<td class="rowOption"><a class="delete" id="optionDeleteOther">
    <div class="fa fa-minus"></div>
    </a><a class="insert">
    <div class="fa fa-arrow-down"></div>
    </a></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="row">
    <div id="div594146" class="col-md-2">
    <label data-datafield="ShenHeYiJian" data-type="SheetLabel" id="ctl871464" class="" style="">意见</label>
    </div>
    <div id="SHYJ" class="col-md-10">
    <div data-datafield="ShenHeYiJian" data-type="SheetComment" id="ctl933536" class="" style=""></div>
    </div>
    </div>
    <div class="row hidden">
    <div id="div767622" class="col-md-2">
    <label data-datafield="BMBGBM_Hidden" data-type="SheetLabel" id="ctl400545" class="" style="">部门变更部门编号隐藏</label>
    </div>
    <div id="div73771" class="col-md-4">
    <input type="text" data-datafield="BMBGBM_Hidden" data-type="SheetTextBox" id="ctl616638" class="" style="">
    </div>
    <div id="div940736" class="col-md-2">
    <label data-datafield="BMBGFZR_Hidden" data-type="SheetLabel" id="ctl309675" class="" style="">部门变更负责人编号隐藏</label>
    </div>
    <div id="div752589" class="col-md-4">
    <input type="text" data-datafield="BMBGFZR_Hidden" data-type="SheetTextBox" id="ctl131358" class="" style="">
    </div>
    </div>
    <div class="row hidden">
    <div id="div662884" class="col-md-2">
    <label data-datafield="BuMenLevelHidden" data-type="SheetLabel" id="ctl929150" class="" style="">部门等级隐藏</label>
    </div>
    <div id="div507400" class="col-md-4">
    <input type="text" data-datafield="BuMenLevelHidden" data-type="SheetTextBox" id="ctl954229" class="" style="">
    </div>
    <div id="div112131" class="col-md-2">
    <label data-datafield="BuMenLevelHidden2" data-type="SheetLabel" id="ctl473599" class="" style="">部门等级隐藏2</label>
    </div>
    <div id="div973346" class="col-md-4">
    <input type="text" data-datafield="BuMenLevelHidden2" data-type="SheetTextBox" id="ctl907458" class="" style="">
    </div>
    </div>
    <div class="row hidden">
    <div id="div129287" class="col-md-2">
    <label data-datafield="CWSHR" data-type="SheetLabel" id="ctl786044" class="" style="">财务审核人</label>
    </div>
    <div id="div990175" class="col-md-10">
    <div data-datafield="CWSHR" data-type="SheetUser" id="ctl965436" class="" style=""></div>
    </div>
    </div>
    <div class="row hidden">
    <div id="div619727" class="col-md-2">
    <label data-datafield="ZKWF_CWSH" data-type="SheetLabel" id="ctl226943" class="" style="">智康外分财务审核</label>
    </div>
    <div id="div835576" class="col-md-4">
    <div data-datafield="ZKWF_CWSH" data-type="SheetUser" id="ctl907252" class="" style=""></div>
    </div>
    <div id="div112165" class="col-md-2">
    <label data-datafield="PYGX_CWSHR" data-type="SheetLabel" id="ctl808282" class="" style="">培优共享财务审核人</label>
    </div>
    <div id="div873444" class="col-md-4">
    <div data-datafield="PYGX_CWSHR" data-type="SheetUser" id="ctl241244" class="" style=""></div>
    </div>
    </div>

    </div>
    </div>
    </div>