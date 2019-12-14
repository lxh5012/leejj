<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false"%>
<%@page import="OThinker.Common.DotNetToJavaStringHelper"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcDefaultSheet"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcPage"%>
<%@ page import="OThinker.H3.Controller.Controllers.ProcessModel.SheetPrintController"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<!--[if IE 8]>         <html class="ie8"> <![endif]-->
<!--[if IE 9]>         <html class="ie9 gt-ie8"> <![endif]-->
<!--[if gt IE 9]><!-->
<html class="gt-ie8 gt-ie9 not-ie">
<!--<![endif]-->
<html>
	<head>
		<meta charset="utf-8">
		<%--提示360等双核浏览器使用WebKit核心--%>
		<meta name="renderer" content="webkit" />
		<meta name="format-detection" content="telephone=no" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<%
			boolean IsMobile = false;
		    System.out.println("IsMobile" + request.getParameter("IsMobile") );
		    if("true".equals(request.getParameter("IsMobile")) ){
		    	IsMobile = true;
		    }
			String PortalRoot = "/Portal";
			String InstanceId = request.getParameter("InstanceId");
			String WorkItemID = request.getParameter("WorkItemID");
			String Mode = request.getParameter("Mode");
			String SheetCode = request.getParameter("SheetCode");
			String Command = request.getParameter("Command");
			String htmlContent = "";
			String load_content = "";
			String submit_content = "";
			if(Command==null||Command.isEmpty()){
			MvcDefaultSheet mdc = new MvcDefaultSheet(request, response);
			SheetPrintController spc = new SheetPrintController(request, response);
		%>
		<title><%=spc.getActionContext().getSheetDisplayName() %></title>
		<%
			request.setAttribute("InstanceId", InstanceId);
			request.setAttribute("WorkItemID", WorkItemID);
			request.setAttribute("Command", Command);
			request.setAttribute("SheetCode", SheetCode);
			boolean isEdit = false;
			htmlContent = spc.getActionContext().getSheet().getRuntimeContentStr();
			if(DotNetToJavaStringHelper.isNullOrEmpty(htmlContent)){
				//若WorkItemID为空，则根据InstanceID和SheetCode查询表单信息
				if(DotNetToJavaStringHelper.isNullOrEmpty(WorkItemID)){
					String InstanceID = request.getParameter("InstanceId");
					htmlContent = mdc.OnInitByInstanceID(InstanceID, SheetCode);
				} else {
					//根据WorkItemID查询表单信息
					htmlContent = mdc.OnInitByWorkItemID(WorkItemID);
				}
			}
			System.out.println(htmlContent);
			request.setAttribute("Command", "load");
			MvcPage mp = new MvcPage(request, response);
			System.out.println(".........load_content:"+load_content);
			} else if ("GetPrintContent".equals(Command)){
				htmlContent = "";
				request.setAttribute("Command", Command);
			}
			
		%>
		<script type="text/javascript">
    		var IsMobile = "<%=IsMobile%>" == "true";
    		var _PORTALROOT_GLOBAL = "<%=PortalRoot%>";
			if (typeof (pageInfo) != "undefined") {
				pageInfo.LockImage = "WFRes/images/WaitProcess.gif";
			}
			var OnSubmitForm = function() {
				if (IsMobile) {
					return false;
				}
				return true;
			}
		</script>
		<%
			System.out.println("IsMobile="+IsMobile);
			if (IsMobile) {
		%>
		<%--移动端--%>
		<link href="Hybrid/lib/ionic/css/ionic.css" rel="stylesheet" />
		<link href="Hybrid/css/animate.min.css" rel="stylesheet" />
		<link href="Hybrid/css/style.css" rel="stylesheet" />
		<link href="WFRes/css/MvcSheetMobile.css" rel="stylesheet" type="text/css" />
		<link href="Hybrid/lib/ion-datetime-picker/release/ion-datetime-picker.min.css" rel="stylesheet" type="text/css" />
		<script type="text/javascript" charset="utf-8" src="Hybrid/lib/ionic/js/ionic.bundle.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/lib/ionic/js/ionic.bundle.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/js/ngIOS9UIWebViewPatch.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/jquery-2.1.3.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/lib/ngCordova/ng-cordova.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/lib/oclazyload/ocLazyLoad.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/js/dingTalk.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/formApp.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/formservices.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/formDirectives.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/formControllers.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/lib/ion-datetime-picker/release/ion-datetime-picker.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/services/sheetQuery.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/services/httpService.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/services/sheetUserService.js"></script>
		<script type="text/javascript" charset="utf-8" src="Hybrid/form/filters/highlightFilter.js"></script>
		<% } 
			else {
		%>
		<link rel="stylesheet" href="WFRes/editor/themes/default/default.css" />
		<link rel="stylesheet" href="WFRes/editor/plugins/code/prettify.css" />
		<link href="WFRes/assets/stylesheets/bootstrap.min.css" rel="stylesheet" type="text/css" />
		<link href="WFRes/assets/stylesheets/pixel-admin.min.css" rel="stylesheet" type="text/css" />
		<link href="WFRes/assets/stylesheets/themes.min.css" rel="stylesheet" type="text/css" />
		<link href="WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-all.min.css?v=1.2" rel="stylesheet" type="text/css" />
		<link href="WFRes/css/MvcSheet.css" rel="stylesheet" type="text/css" />
		<link href="WFRes/css/MvcSheetPrint.css" rel="stylesheet" type="text/css" media="print" />
		<link rel="shortcut icon" type="image/x-icon" href="WFRes/images/favicon.ico" media="screen" />
		<script type="text/javascript" src="WFRes/_Scripts/jquery/jquery.js?v=1.12.4"></script>
		<script type="text/javascript" src="WFRes/_Scripts/jquery/ajaxfileupload.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/jquery/jquery.lang.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/ligerUI/ligerui.all.min.js" ></script>
		<script type="text/javascript" src="WFRes/_Scripts/Calendar/WdatePicker.js"></script>
		<script type="text/javascript" charset="utf-8" src="WFRes/editor/kindeditor-all.js"></script>
		<script type="text/javascript" charset="utf-8" src="WFRes/editor/lang/zh_CN.js"></script>
		<!--[if lt IE 9]>
			<script src="WFRes/assets/javascripts/ie.min.js"></script>
		<![endif]-->
		<%
			}
		%>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/SheetControls.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/MvcSheetUI.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetQuery.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetAttachment.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetCheckbox.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetCheckboxList.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetComment.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetDropDownList.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetGridView.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetHiddenField.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetHyperLink.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetInstancePrioritySelector.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetLabel.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetOffice.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetRadioButtonList.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetRichTextBox.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetTextBox.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetTime.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetToolbar.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetUser.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetTimeSpan.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetCountLabel.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetOriginatorUnit.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/Controls/SheetRelationInstance.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MvcSheet/MvcSheet.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MVCRuntime/Sheet.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MVCRuntime/Sheet.Computation.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MVCRuntime/Sheet.Display.js"></script>
		<script type="text/javascript" src="WFRes/_Scripts/MVCRuntime/Sheet.Validate.js"></script>
 		<style type="text/css">
	        .item {
	            border-bottom: 0;
	            padding: 6px;
	        }
	
	        .item-checkbox {
	            padding-left: 60px;
	        }
	
	        .list {
	            margin-bottom: 0;
	        }
    	</style>
    	<script type="text/javascript">
	        //加载完成后，加载打印模板
	        $.MvcSheet.Loaded = function () {
	            // 执行后台事件
	            $.MvcSheet.Action(
	                {
	                    Action: "GetPrintContent",    // 后台方法名称
	                    Datas: [],     // 输入参数，格式 ["{数据项名称}","String值","控件ID"]，当包含数据项名称时 LoadControlValue必须为true
	                    LoadControlValue: true,  // 是否获取表单数据
	                    PostSheetInfo: false,    // 是否获取已经改变的表单数据
	                    Async: true,
	                    OnActionDone: function (e) {
	                        // 执行完成后回调事件
							console.log(e.printContent)
	                        if (e) {
	                            $("#divContent").html(e.printContent);
	                        }
	                    }
	                }
	            );
	            setTimeout(function () {
	                window.print();
	            }, 1000)
	        }
    	</script>
	</head>
	<body class="theme-default main-menu-animated" style="background-color: #CCC">
		<!--onsubmit="return false":避免ENTER键回传页面-->
		<form method="post" action="SheetPrint.jsp?InstanceId=8a052923-0679-4c79&amp;WorkItemID=faebba16-d7b4-ac&amp;Mode=Print&amp;SheetCode=Szx" id="form1" onsubmit="return OnSubmitForm();">
			<div class="aspNetHidden">
				<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="L9kTx3wtUXx6U">
			</div>
			<div id="sheetContent" class="main-container container sheetContent" style="display: none">
				<div class="panel">
					<%
						SheetPrintController spc = new SheetPrintController(request, response);
						String isCoustomContent = spc.GetPrintContent();
						if (DotNetToJavaStringHelper.isNullOrEmpty(isCoustomContent)){
			        %>
			        	<div id="main-navbar" class="navbar navbar-inverse toolBar mainnavbar" role="navigation">
						<div class="navbar-inner">
							<div class="navbar-header">
								<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar-collapse">
									<i class="navbar-icon fa fa-bars"></i>
								</button>
							</div>
							<div id="main-navbar-collapse" class="collapse navbar-collapse main-navbar-collapse">
								<ul id="divTopBars" class="nav navbar-nav SheetToolBar"></ul>
							</div>
						</div>
					</div>
			        <%
			        	} else {
			        %>
			        <div id="content-wrapper">
						<style>
							#content-wrapper {
								padding: 5px;
							}
							
							#main-navbar {
								dispaly: none;
							}
						</style>
						<div id="divContent"></div>
					</div>
			        <%
			        	}
					%>
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
			<script type="text/javascript" src="WFRes/assets/javascripts/bootstrap.min.js?201412041112"></script>
			<script type="text/javascript" src="WFRes/assets/javascripts/pixel-admin.min.js?201412041112"></script>
			<script type="text/javascript">
				init.push(function() {
					var w = 12;//$("textarea[data-richtextbox]").length > 0 ? 12 : 0;
					$(window).resize(
						function() {
							$("#main-navbar").css("width", $("#main-navbar").parent().width() - w);
						});
					$("#main-navbar").css("width", $("#main-navbar").parent().width() - w);
				})
				window.PixelAdmin.start(init);
				$(function() {
					$("[id*=sheetContent]").show();
					//执行入口
					$.MvcSheet.Init();
				})
			</script>
			<%
				}
			%>
		</form>
	</body>
</html>