<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false" %>
<%@ page import="OThinker.Common.DotNetToJavaStringHelper" %>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcDefaultSheet" %>
<%@ page import="org.apache.commons.lang.StringEscapeUtils" %>
<%@ page import="com.h3bpm.base.util.SqlUtils" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en" class="gt-ie8 gt-ie9 not-ie">

<head>
    <meta charset="utf-8">
    <meta name="renderer" content="webkit"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>H3 BPM-流程</title>
    <%--<link href="img/H.jpg" rel="shortcut icon" />--%>
    <link href="favicon.ico" rel="shortcut icon" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" type="text/css" href="WFRes/nprogress/progress.css"/>
    <script type="text/javascript" charset="utf-8" src="WFRes/nprogress/progressbar.min.js"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/nprogress/progress.js"></script>
    <%
        boolean IsMobile = false;
        String Version = "20191018";
        if ("true".equals(request.getParameter("IsMobile"))) {
            IsMobile = true;
        }
        String PortalRoot = request.getContextPath() + "/Portal";
        String Mode = request.getParameter("Mode");
        String Command = request.getParameter("Command");
        String htmlContent = "";
        String submit_content = "";
        String localLan = request.getParameter("localLan");
        //add by linjh@Future 2018.9.25 sql 注入
        localLan = StringEscapeUtils.escapeSql(localLan);
        if (Command == null || Command.isEmpty()) {
            MvcDefaultSheet mdc = new MvcDefaultSheet(request, response);
            //用户信息失效跳转至登录页面 update by zhangj
            if (null == mdc.getActionContext().getUser()) {
                response.sendRedirect(PortalRoot + "/index.html");
                //request.getRequestDispatcher(PortalRoot + "/Portal/index.html").forward(request, response);
                return;
            }
            request.setAttribute("Mode", Mode);
            request.setAttribute("Command", Command);
            boolean isEdit = mdc.IsEditInstanceData();
            if (isEdit) {
                if (!mdc.getActionContext().getUser().ValidateBizObjectAdmin(
                        mdc.getActionContext().getSchemaCode(),
                        "",
                        mdc.getActionContext().getBizObject().getOwnerId())) {
                    response.flushBuffer();
                } else {
                    htmlContent = mdc.getActionContext().getSheet().getRuntimeContentStr();
                    if (htmlContent.isEmpty()) {
                        String bizObjectID = request.getParameter("BizObjectID");
                        String schemaCode = request.getParameter("SchemaCode");
                        //add by linjh@Future 2018.9.25 sql 注入
                        bizObjectID = SqlUtils.escapeSql(bizObjectID);
                        schemaCode = StringEscapeUtils.escapeSql(schemaCode);
                        htmlContent = mdc.OnInitByInstanceID(bizObjectID, schemaCode);
                    }
                }
            } else {
                htmlContent = mdc.getActionContext().getBizSheetOnly().getRuntimeContentStr();
//                    System.out.println(htmlContent);
                if (htmlContent.isEmpty()) {
                    if ("Originate".equals(Mode)) {
                        //发起
                        String WorkflowCode = request.getParameter("WorkflowCode");
                        int WorkflowVersion = -1;
                        if (!DotNetToJavaStringHelper.isNullOrEmpty(request.getParameter("WorkflowVersion"))) {
                            WorkflowVersion = Integer.valueOf(request.getParameter("WorkflowVersion"));
                        }
                        //Update by linjh:如果WorkflowVersion=-1，则默认设置为1。
                        if (WorkflowVersion == -1) {
                            WorkflowVersion = 1;
                        }
                        if (!DotNetToJavaStringHelper.isNullOrEmpty(request.getParameter("SchemaCode"))) {
                            WorkflowCode = request.getParameter("SchemaCode");
                        }
                        htmlContent = mdc.OnInitByWorkflow(WorkflowCode, WorkflowVersion);
                    } else {
                        String WorkItemID = request.getParameter("WorkItemID");
                        //add by linjh@Future 2018.9.25 sql 注入
                        if (WorkItemID != null && SqlUtils.sql_inj(WorkItemID)) {
                            return;
                        }
                        WorkItemID = SqlUtils.escapeSql(WorkItemID);
                        //若WorkItemID为空，则根据InstanceID和SheetCode查询表单信息
                        if (DotNetToJavaStringHelper.isNullOrEmpty(WorkItemID)) {
                            String InstanceID = request.getParameter("InstanceId");
                            String SheetCode = request.getParameter("SchemaCode");

                            htmlContent = mdc.OnInitByInstanceID(InstanceID, SheetCode);
                        } else {
                            //根据WorkItemID查询表单信息
                            htmlContent = mdc.OnInitByWorkItemID(WorkItemID);
                        }
                    }
                }
            }
            request.setAttribute("Command", "load");
        } else {
            request.setAttribute("Command", Command);
            if ("Submit".equals(Command)) {
                if (!submit_content.isEmpty()) {
                    response.getWriter().write(submit_content);
                }
            }
        }
    %>
    <script type="text/javascript">
        var IsMobile = "<%=IsMobile%>" == "true";
        <%--var _localLan = "<%=localLan%>";--%>
        var local = window.localStorage.getItem("H3.Language"); // 本地语言
        // console.log(local, '_localLan');
        var _localLan = local || 'zh_cn';
        window.localStorage.setItem("H3.Language", _localLan);

        var _PORTALROOT_GLOBAL = "<%=PortalRoot%>";
        if (typeof (pageInfo) != "undefined") {
            pageInfo.LockImage = "WFRes/images/WaitProcess.gif";
        }
        window.localStorage.setItem("H3.PortalRoot", _PORTALROOT_GLOBAL);
        var OnSubmitForm = function () {
            if (IsMobile) {
                return false;
            }
            return true;
        }
    </script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/lazyload.min.js?v=<%=Version%>"></script>
    <%
        if (IsMobile) {
    %>
    <%--移动端--%>
    <%--css--%>
    <link rel="stylesheet" type="text/css" href="Mobile/lib/ionic/css/ionic.min.min.css?v=<%=Version%>"/>
    <link rel="stylesheet" type="text/css" href="Mobile/css/fonts.min.css?v=<%=Version%>"/>
    <link rel="stylesheet" type="text/css" href="WFRes/css/MvcSheetMobileNew.min.css?v=<%=Version%>"/>
    <link rel="stylesheet" type="text/css" href="Mobile/lib/ion-datetime-picker/release/ion-datetime-picker.min.css?v=<%=Version%>"/>
    <%--js--%>
    <script type="text/javascript" charset="utf-8" src="Mobile/lib/ionic/js/ionic.bundle.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/js/ngIOS9UIWebViewPatch.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/jquery-2.1.3.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/jquery/jquery.lang.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/lib/ngCordova/ng-cordova.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/lib/oclazyload/ocLazyLoad.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/js/dingTalk/dingtalk.open.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/formApp.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/formservices.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/formDirectives.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/formControllers.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/lib/ion-datetime-picker/release/ion-datetime-picker.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/services/sheetQuery.min.js?v=<%=Version%>"></script>
    <%--<script type="text/javascript" charset="utf-8" src="Mobile/form/services/sheetQuery.js"></script>--%>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/services/httpService.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="Mobile/form/services/sheetUserService.js?v=<%=Version%>"></script>
    <%--<script type="text/javascript" charset="utf-8" src="Mobile/form/filters/highlightFilter.min.js?v=<%=Version%>"></script>--%>
    <script type="text/javascript" charset="utf-8" src="vendor/angular/angular-file/ng-file-upload-shim.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="vendor/angular/angular-file/ng-file-upload.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/jsqrcode/qr_packed.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/scrollIntoView.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8">
        LazyLoad.js([
            'Mobile/form/filters/highlightFilter.min.js?v=<%=Version%>'
        ]);
    </script>
    <%
    } else {
    %>
    <link rel="stylesheet" type="text/css" href="WFRes/editor/themes/default/default.min.css?v=<%=Version%>"/>
    <link rel="stylesheet" type="text/css" href="css/less-bootstrap/bootstrap.css?v=<%=Version%>" />
    <link rel="stylesheet" type="text/css"  href="icons/iconfont.min.css?v=<%=Version%>" />
    <link rel="stylesheet" type="text/css" href="WFRes/assets/stylesheets/pixel-admin.min.css?v=<%=Version%>"/>
    <link rel="stylesheet" type="text/css" href="WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-all.min.css?v=<%=Version%>" />
    <link rel="stylesheet" type="text/css" href="WFRes/css/MvcSheet.min.css?v=<%=Version%>" />
    <link  rel="stylesheet" type="text/css" media="print" href="WFRes/css/MvcSheetPrint.min.css?v=<%=Version%>"/>

    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/jquery/jquery.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/jquery/jquery.lang.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/nicescroll/jquery.nicescroll.min.js?v=<%=Version%>"></script>

    <script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/ligerUI/ligerui.all.min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/editor/kindeditor-all-min.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/editor/lang/zh_CN.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8" src="WFRes/assets/javascripts/uiSheet.js?v=<%=Version%>"></script>
    <script type="text/javascript" charset="utf-8">
        LazyLoad.js([
            'WFRes/_Scripts/jquery/ajaxfileupload.min.js?v=<%=Version%>',
            'WFRes/_Scripts/Calendar/WdatePicker.js?v=<%=Version%>',
            'WFRes/_Scripts/jQuery.print.min.js?v=<%=Version%>'
        ]);
    </script>
    <%
        }
    %>
</head>
<body class="theme-default main-menu-animated">
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/MvcSheetUI.min.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/SheetControls.min.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/MvcSheet.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="js/xss/xss.min.js?v=<%=Version%>"></script>
<%--压缩合并所有控件到下面js文件内 修改控件后需要重新压缩下面的《所有控件》--%>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/MvcSheetControls.js?v=<%=Version%>"></script>
<%--所有控件--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetQuery.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetAttachment.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetCheckbox.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetCheckboxList.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetComment.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetDropDownList.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetGridView.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetHiddenField.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetHyperLink.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetInstancePrioritySelector.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetLabel.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetOffice.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetRadioButtonList.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetRichTextBox.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetTextBox.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetTime.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetToolbar.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetUser.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetTimeSpan.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetCountLabel.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetOriginatorUnit.js?v=<%=Version%>"></script>--%>
<%--<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MvcSheet/Controls/SheetRelationInstance.js?v=<%=Version%>"></script>--%>
<%--所有控件--%>

<%--控件辅助校验--%>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MVCRuntime/Sheet.min.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MVCRuntime/Sheet.Computation.min.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MVCRuntime/Sheet.Display.min.js?v=<%=Version%>"></script>
<script type="text/javascript" charset="utf-8" src="WFRes/_Scripts/MVCRuntime/Sheet.Validate.min.js?v=<%=Version%>"></script>
<%--控件辅助校验-%>

<%--<!--onsubmit="return false":避免ENTER键回传页面-->--%>
<form id="form1" name="form1" onsubmit="return OnSubmitForm();" class="form1">
    <%--PC端框架总是加载--%>
    <div class="main-container sheetContent" id="sheetContent" style="display: none">
        <div class="panel">
            <div id="main-navbar" class="navbar navbar-inverse toolBar mainnavbar" role="navigation">
                <div class="navbar-inner">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar-collapse">
                            <i class="navbar-icon fa fa-bars"></i>
                        </button>
                    </div>
                    <div id="main-navbar-collapse"
                         class="collapse navbar-collapse main-navbar-collapse">
                        <ul class="nav navbar-nav SheetToolBar test" id="divTopBars">
                        </ul>
                    </div>
                </div>
                <a href="/Portal/#/app/Workflow/MyUnfinishedWorkItem" target="_blank" class="form-logo">
                    <img src="img/H3-BPMLogo.png" alt="">
                </a>
            </div>
            <div id="content-wrapper">
                <%=htmlContent%>
            </div>
            <div  class="back-top" style=""><i  class="icon aufontAll h-icon-all-up-o"></i></div>
        </div>
    </div>
    <%
        if (IsMobile) {
    %>
    <div id="ionicForm" ng-app="formApp" ng-controller="mainCtrl">
        <ion-nav-view ></ion-nav-view>
    </div>
    <%
    } else {
    %>
     <%--<script type="text/javascript" charset="utf-8" src="WFRes/assets/javascripts/bootstrap.min.js?v=<%=Version%>"></script>--%>
    <%--已改过压缩文件 不需要再压缩--%>
    <%--<script type="text/javascript" charset="utf-8" src="WFRes/assets/javascripts/pixel-admin.min.js?v=<%=Version%>"></script>--%>
    <script type="text/javascript">
        var init = [];
        // init.push(function () {
        //     var w = 12;//$("textarea[data-richtextbox]").length > 0 ? 12 : 0;
        //     $(window).resize(
        //         function () {
        //             $("#main-navbar").css("width", $("#main-navbar").parent().width() - w);
        //             //表单按钮展示超出一行的加下拉按钮并隐藏
        //             var topBarWidth = 0;
        //             var topBarFlag = true;
        //             //获取所有按钮的总宽
        //             $("#divTopBars").children("li").each(function () {
        //                 topBarWidth += ($(this).width() + 1);
        //             });
        //
        //             if (topBarWidth > ($("#main-navbar").width() - 20) && ($("#divTopBars").children("li").width() + 1) != ($("#main-navbar").width() - 20)) {
        //                 $("#divTopBars").css({
        //                     "height": $("#divTopBars").children("li").height(),
        //                     "overflow": "hidden",
        //                     "padding-right": "20px"
        //                 });
        //                 $("#divTopBars").after("<i class='glyphicon glyphicon-chevron-down' id='dropTopBars' style='position:absolute;right:3px;top:15px;color:dodgerblue;font-size:16px;'></i>");
        //
        //                 $("#divTopBars").on("click", function (event) {
        //                     // alert('111')
        //                     if (event.target.nodeName == "UL") {
        //                         if (topBarFlag) {
        //                             topBarFlag = false;
        //                             $("#divTopBars").css({"height": "inherit", "overflow": "inherit"});
        //                             $("i#dropTopBars").addClass("glyphicon-chevron-up").removeClass("glyphicon-chevron-down");
        //                         } else {
        //                             topBarFlag = true;
        //                             $("#divTopBars").css({
        //                                 "height": $("#divTopBars").children("li").height(),
        //                                 "overflow": "hidden"
        //                             });
        //                             $("i#dropTopBars").addClass("glyphicon-chevron-down").removeClass("glyphicon-chevron-up");
        //                         }
        //                     }
        //                 });
        //             } else {
        //                 $("i#dropTopBars").hide();
        //             }
        //         });
        //     $("#main-navbar").css("width", $("#main-navbar").parent().width() - w);
        // });
        // window.PixelAdmin.start(init);
        $(function () {
            $("[id*=sheetContent]").show();
            //执行入口
            // console.log("start init : " + new Date());
            $.MvcSheet.Init();
            // console.log("end init : " + new Date());
            // 滚动
            $("#form1").niceScroll({
                touchbehavior:false,     //是否是触摸式滚动效果
                cursorcolor:"rgba(0, 0, 0, 0.5)",     //滚动条的颜色值
                cursoropacitymax:0.9,   //滚动条的透明度值
                cursorwidth:8,         //滚动条的宽度值
                background:"rgba(0,0,0,0)",  //滚动条的背景色，默认是透明的
                autohidemode:true,      //滚动条是否是自动隐藏，默认值为 true
            });
            $("#form1").getNiceScroll(0).scrollend(function(e) {
                if(e.current.y > 100) {
                    $(".back-top").show();
                    $("#form1").getNiceScroll(0).resize();
                } else {
                    $(".back-top").hide();
                }
            });
            $(".back-top").bind('click', function(elment){
                $("#form1").getNiceScroll(0).doScrollTop(0, 100); // Scroll Y Axis
            });
        })
    </script>
    <%
        }
    %>
</form>
</body>

<!-- add by luwei -->
<script type="text/javascript">
    $(function () {
        function load() {
            line.animate(1, {
                duration: 300
            }, function() {
                line.destroy();
                document.getElementById('container').remove()
            });
            console.timeEnd("结束时间");
        }
        /* 绑定click方法 TODO 可能其他方法也需要绑定 */
        $("[data-onclick]").each(function () {
            var functionString = $(this).data("onclick");
            $(this).bind('click', function () {
                eval(functionString);
            })
        });
        /* OnlyData 不显示 label */
        $("#divSheet").find("[data-bindtype]").each(function () {
                //系统字段
                var sysKeyWords = ["ActivityCode", "ActivityName",
                    "InstanceId", "InstanceName", "InstancePriority",
                    "OriginateTime", "SequenceNo", "Originator",
                    "Originator.FullName", "Originator.LoginName",
                    "Originator.UserName", "Originator.UserID",
                    "Originator.Email", "Originator.EmployeeNumber",
                    "Originator.EmployeeRank",
                    "Originator.Appellation", "Originator.OfficePhone",
                    "Originator.Mobile", "Originator.OUName",
                    "Originator.OUFullName", "Originator.OU"
                ];
                var datafield = $(this).data("datafield");
                if (sysKeyWords.indexOf(datafield)) {
                    return;
                }
                if ($(this).data("bindtype") == "OnlyData") {
                    $(this).hide();
                }
            });
        var speed = 200;
        $('body,html').animate({scrollTop: 0}, speed);

        $('div.bannerTitle').next().addClass("divContent-title-show");
        $('div.bannerTitle').bind('click', function(elment){
            var ndiv = $(this).next();
            if(ndiv.hasClass("divContent-title-show")) {
                // 执行隐藏
                ndiv.slideUp(100).removeClass("divContent-title-show");
                $(this).find('.aufontAll').removeClass("expanded");
                setTimeout(function(){
                    $("#form1").getNiceScroll(0).resize();
                },300)
            } else {
                // 显示
                $(this).find('.aufontAll').addClass("expanded");
                ndiv.slideDown(100).addClass("divContent-title-show");
                setTimeout(function(){
                    $("#form1").getNiceScroll(0).resize();
                },300)
            }
        });

       LazyLoad.js([
                'js/jQuery.md5.min.js?v=<%=Version%>',
                'js/sweetalert.min.js?v=<%=Version%>'
            ]);
        var u = navigator.userAgent;
        var ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if(ios) {
            document.body.addEventListener('touchmove', function (e) {
                e.preventDefault() // 阻止默认的处理方式(阻止下拉滑动的效果)
            }, {passive: false}) // passive 参数不能省略，用来兼容ios和android
        } else {
            document.body.addEventListener('touchmove', function (e) {
                if(!e.cancelable) {
                    return true
                }
                // e.preventDefault() // 阻止默认的处理方式(阻止下拉滑动的效果)
            }, {passive: false}) // passive 参数不能省略，用来兼容ios和android
        }
        var end = new Date().getTime();
        var duration = (end - start)/1000;
        load(duration);
    })
</script>
</html>