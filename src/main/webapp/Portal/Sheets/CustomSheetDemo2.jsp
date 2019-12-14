
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" session="false"%>
<%@ page import="OThinker.Common.DotNetToJavaStringHelper"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcDefaultSheet"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcPage"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html class="gt-ie8 gt-ie9 not-ie">

<head>
    <meta charset="utf-8">
    <meta name="renderer" content="webkit" />
    <meta name="format-detection" content="telephone=no" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <%
        boolean IsMobile = false;
        if ("true".equals(request.getParameter("IsMobile"))) {
            IsMobile = true;
        }
        String PortalRoot = "/Portal";
        String Mode = request.getParameter("Mode");
        String Command = request.getParameter("Command");
        String htmlContent = "";
        String submit_content = "";
        String localLan = request.getParameter("localLan");

        if (Command == null || Command.isEmpty()) {
            MvcDefaultSheet mdc = new MvcDefaultSheet(request, response);
            //用户信息失效跳转至登录页面 update by zhangj
            if (null == mdc.getActionContext().getUser()) {
                request.getRequestDispatcher("/Portal/index.html").forward(request, response);
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
                        htmlContent = mdc.OnInitByInstanceID(bizObjectID, schemaCode);
                    }
                }
            } else {
                htmlContent = mdc.getActionContext().getSheet().getRuntimeContentStr();
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
        var _localLan = "<%=localLan%>";
        window.localStorage.setItem("H3.Language",_localLan);

        var _PORTALROOT_GLOBAL = "<%=PortalRoot%>";

        if (typeof (pageInfo) != "undefined") {
            pageInfo.LockImage = "../WFRes/images/WaitProcess.gif";
        }

        var OnSubmitForm = function() {
            if (IsMobile) {
                return false;
            }
            return true;
        }
    </script>

    <%
        if (IsMobile) {
    %>
    <%--移动端--%>
    <link href="../Mobile/lib/ionic/css/ionic.min.css" rel="stylesheet" />
    <link href="../Mobile/css/fonts.css?v=1215" rel="stylesheet" />
    <link href="../WFRes/css/MvcSheetMobileNew.css?v=20180118" rel="stylesheet"
          type="text/css" />
    <link
            href="../Mobile/lib/ion-datetime-picker/release/ion-datetime-picker.min.css"
            rel="stylesheet" type="text/css" />


    <script type="text/javascript" charset="utf-8"
            src="../Mobile/lib/ionic/js/ionic.bundle.min.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/js/ngIOS9UIWebViewPatch.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/jquery-2.1.3.min.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/lib/ngCordova/ng-cordova.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/lib/oclazyload/ocLazyLoad.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/js/dingTalk.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/formApp.js?v=201803301727"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/formservices.js?v=20171213"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/formDirectives.js?v=201802081023"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/formControllers.js?v=201803221202"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/lib/ion-datetime-picker/release/ion-datetime-picker.min.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/services/sheetQuery.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/services/httpService.js"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/services/sheetUserService.js?v=201802081020"></script>
    <script type="text/javascript" charset="utf-8"
            src="../Mobile/form/filters/highlightFilter.js"></script>

    <%
    } else {
    %>
    <link rel="stylesheet" href="../WFRes/editor/themes/default/default.css" />
    <link rel="stylesheet" href="../WFRes/editor/plugins/code/prettify.css" />

    <link href="../WFRes/assets/stylesheets/bootstrap.min.css" rel="stylesheet"
          type="text/css" />
    <link href="../WFRes/assets/stylesheets/pixel-admin.min.css"
          rel="stylesheet" type="text/css" />
    <link href="../WFRes/assets/stylesheets/themes.min.css" rel="stylesheet"
          type="text/css" />
    <link href="../WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-all.min.css"
          rel="stylesheet" type="text/css" />
    <link href="../WFRes/css/MvcSheet.css?v=20180306123" rel="stylesheet" type="text/css" />
    <link href="../WFRes/css/MvcSheetPrint.css" rel="stylesheet"
          type="text/css" media="print" />
    <link rel="shortcut icon" type="image/x-icon"
          href="../WFRes/images/favicon.ico" media="screen" />

    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/jquery/jquery.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/jquery/ajaxfileupload.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/jquery/jquery.lang.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/ligerUI/ligerui.all.min.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/Calendar/WdatePicker.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/editor/kindeditor-all.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/editor/lang/zh_CN.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <%
        }
    %>

    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/SheetControls.js?v=201803211726\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/MvcSheetUI.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetQuery.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetAttachment.js?v=201803211727\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetCheckbox.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetCheckboxList.js?v=20180103\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetComment.js?v=201803291098\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetDropDownList.js?v=20180107\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetGridView.js?v=20180103\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetHiddenField.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetHyperLink.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetInstancePrioritySelector.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetLabel.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetOffice.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetRadioButtonList.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetRichTextBox.js?v=201803201735\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetTextBox.js?v=201800329797\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetTime.js?v=20171223\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetToolbar.js?v=20180306879\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetUser.js?v=201803161103\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetTimeSpan.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetCountLabel.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetOriginatorUnit.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetRelationInstance.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MvcSheet/MvcSheet.js?v=201803281756\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MVCRuntime/Sheet.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MVCRuntime/Sheet.Computation.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MVCRuntime/Sheet.Display.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/_Scripts/MVCRuntime/Sheet.Validate.js?v=201803290978\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>

    <style type="text/css">
        .item {
            border-bottom: 0px;
            padding: 6px;
        }

        .item-checkbox {
            padding-left: 60px;
        }

        .list {
            margin-bottom: 0px;
        }
    </style>
</head>
<body class="theme-default main-menu-animated"
      style="background-color: rgb(204, 204, 204);">
<!--onsubmit="return false":避免ENTER键回传页面-->
<form id="form1" name="form1" onsubmit="return OnSubmitForm();">
    <%--PC端框架总是加载--%>
    <div class="main-container container sheetContent" id="sheetContent"
         style="display: none">
        <div class="panel">
            <div id="main-navbar"
                 class="navbar navbar-inverse toolBar mainnavbar" role="navigation">
                <div class="navbar-inner">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed"
                                data-toggle="collapse" data-target="#main-navbar-collapse">
                            <i class="navbar-icon fa fa-bars"></i>
                        </button>
                    </div>
                    <div id="main-navbar-collapse"
                         class="collapse navbar-collapse main-navbar-collapse">
                        <ul class="nav navbar-nav SheetToolBar" id="divTopBars">
                            <!-- <div id="cphMenu" >
                                <li data-action="Submit"><a href="javascript:void(0);">
                                        <i class="panel-title-icon fa fa-check toolImage"></i> <span
                                        class="toolText" data-en_us="Submit">提交</span>
                                </a></li>
                            </div> -->
                        </ul>
                    </div>
                </div>
            </div>
            <div id="content-wrapper">
                <%=htmlContent%>
            </div>
        </div>
    </div>

    <%
        if (IsMobile) {
    %>
    <div id="ionicForm" ng-app="formApp" ng-controller="mainCtrl">
        <ion-nav-view></ion-nav-view>
    </div>

    <%
    } else {
    %>
    <script>
        var init = [];
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/assets/javascripts/bootstrap.min.js?201412041112\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        document.write("<script src=\"../WFRes/assets/javascripts/pixel-admin.min.js?201412041112\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
    </script>
    <script type="text/javascript">
        init.push(function() {
            var w = 12;//$("textarea[data-richtextbox]").length > 0 ? 12 : 0;
            $(window).resize(
                function() {
                    $("#main-navbar").css("width",
                        $("#main-navbar").parent().width() - w);
                });
            $("#main-navbar").css("width",
                $("#main-navbar").parent().width() - w);
        })
        window.PixelAdmin.start(init);

        $(function() {
            $("[id*=sheetContent]").show();
            //执行入口
            console.log("start init : " + new Date());
            $.MvcSheet.Init();
            console.log("end init : " + new Date());

            $(".SheetGridView").parent().css("overflow","auto");
        })
    </script>
    <%
        }
    %>
</form>
</body>

<!-- add by luwei -->
<script type="text/javascript">
    $(function() {
        /* 绑定click方法 TODO 可能其他方法也需要绑定 */
        $("[data-onclick]").each(function() {
            var functionString = $(this).data("onclick");
            $(this).bind('click', function() {
                eval(functionString);
            })
        });



        /* OnlyData 不显示 label */
        $("#divSheet").find("[data-bindtype]").each(
            function() {
                //系统字段
                var sysKeyWords = [ "ActivityCode", "ActivityName",
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
            })
    })
</script>
</html>