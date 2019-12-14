
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8" session="false"%>
<%@ page import="OThinker.Common.DotNetToJavaStringHelper"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcDefaultSheet"%>
<%@ page import="OThinker.H3.Controller.MvcSheet.MvcPage"%>
<%@ page import="OThinker.H3.Entity.WorkSheet.BizSheet"%>

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
			request.getRequestDispatcher("../index.html").forward(request, response);
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
			
			BizSheet bs = mdc.getActionContext().getBizSheetOnly();
			if(bs != null){
				htmlContent = bs.getRuntimeContentStr();
			}
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
	document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetComment.js?v=201803121505\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
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
	document.write("<script src=\"../WFRes/_Scripts/MvcSheet/Controls/SheetTextBox.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
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
	document.write("<script src=\"../WFRes/_Scripts/MVCRuntime/Sheet.Validate.js\" language=\"JavaScript\" charset=\"UTF-8\"><\/script>")
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

<script type="text/javascript">
	/*
	全局可访问的对象：$.MvcSheetUI.SheetInfo，该属性是后台传递到前端的所有信息，
	但是需要在 $.MvcSheet.Loaded 方法中使用
	例如： $.MvcSheetUI.SheetInfo.ActivityCode 当前活动编码
		$.MvcSheetUI.SheetInfo.Originator   // 发起人
	获取MVC表单控件的实例：$("#控件ID").SheetUIManager()
	 */
	
	// 所有工具栏按钮完成事件
	$.MvcSheet.ActionDone = function(data) {
		// this.Action; // 获取当前按钮名称
	}
	
	// 控件初始化事件
	$.MvcSheet.ControlInit = function() {
		// 如果是 SheetComment，则默认设置所有的 SheetComment 的属性
		if (this.Type == "SheetComment") {
			this.SignHeight = 80; // 签章高度
			this.SignPosition = "AfterComment"; // 用户名称显示在意见之后
			this.SignAlign = "Right" // 签章靠右显示
		}
		// 也可以对其他控件进行类似统一设置
	};
	
	//// 控件初始化事件
	$.MvcSheet.ControlPreRender = function() {
		// 如果是 SheetComment，则默认设置所有的 SheetComment 的属性
		if (this.Type == "SheetGridView") {
			if (this.V && this.V.R.length > 0) {
				for (var i = 0; i < this.V.R.length; i++) {
					//this.SetRowReadOnly(i); // 设置行只读，这里作用域是 SheetGridView
				}
			}
		}
	};
	
	// 控件初始化事件
	$.MvcSheet.ControlRendered = function() {
		// 如果是 SheetComment，则默认设置所有的 SheetComment 的属性\
		if (this.Type == "SheetComment") {
			this.SignAlign = "Left"; // 设置 SheetComment 全局的属性
		}
	};
	
	// 保存前事件
	$.MvcSheet.SaveAction.OnActionPreDo = function() {
		// this.Action  // 获取当前按钮名称
		alert("保存前事件");
	}
	
	// 保存后事件，保存是异步的，可能比回调函数快
	$.MvcSheet.SaveAction.OnActionDone = function() {
		alert("保存后事件");
		//this   当前SaveAction
		var mvcNum = $.MvcSheetUI.GetSheetDataItem("mvcNum"); //读取后台数据项对象，L：数据项类型，V：数据项的值，O：数据项的权限，N：数据项名称，RowNum:主表中为0，子表中表示行号
		if (mvcNum
				&& (mvcNum.L == $.MvcSheetUI.LogicType.Int
						|| mvcNum.L == $.MvcSheetUI.LogicType.Double || mvcNum.L == $.MvcSheetUI.LogicType.Long)) {
			if (mvcNum.V > 100) {
				alert("mvcNum > 100的事件");
			}
		}
	}
	
	// 表单验证接口
	$.MvcSheet.Validate = function() {
		// this.Action 表示当前操作的按钮名称
		var nameText = $.MvcSheetUI.GetControlValue("mvcName"); // 根据数据项编码获取页面控件的值
	
		// 填写申请单环节，设置 mvcName 必填
		if ($.MvcSheetUI.SheetInfo.ActivityCode == "Apply") {
			if (this.Action == "Submit") {
				if (!nameText) {
					$.MvcSheetUI.GetElement("mvcName").focus();
					alert("请填写名称.");
					return false;
				}
			}
		}
		return true;
	}
	
	//示例演示
	function initPageData() {
		var id = "18f923a7-5a5e-426d-94ae-a55ad1a4b239"
		if (id && id != "") {
			$.ajax({
				url : "../MvcDemoController/TestAction",
				type : 'GET',
				dataType : "json",
				data : {
					userID : id
				},
				async : false,//同步执行
				success : function(result) {
					alert("初始化成功！！");
				}
			});
		}
	};
	
	// 页面加载完成事件
	$.MvcSheet.Loaded = function(sheetInfo) {
		initPageData();
		// 获取选人控件
		// sheetInfo 该参数包含MVC表单后台传递到前端的所有信息
		/*
		MVC控件实例，通过 SheetUIManager() 方法获取，例如获取 txtCode 所对应的MvcSheetUI实例
		 */
		// 可以调用所有 SheetTextBox 提供的接口方法，例如 txtCode.GetValue();
		var txtCode = $("#txtCode").SheetUIManager();
	
		/*
		* 自定义按钮调用后台方法示例
		*/
		$("#btnClick").click(function() {
			// 执行后台事件
			$.ajax({
				url: "../MvcDemoController/TestAction",// 后台方法名称
	            type: "GET",
	            cache: false,
	            async: false,//同步执行
	            data: { userID: "18f923a7-5a5e-426d-94ae-a55ad1a4b239" },// 输入参数 JOSN格式
	            dataType: "JSON",
	            success: function (data) {
	            	// 执行完成后回调事件
					$("#txtCode").val(data.Code);
					$("#txtName").val(data.Name);
	            }
			});
		});
	}
	
	/* 
	子表行保存事件
	参数：grid -> 表示子表对象实例
	参数：args -> 0表示子表行的dom元素，1表示子表当前行数据
	 */
	var gridSaving = function(grid, args) {
		alert("gridSaving");
	};
	
	/*
	子表删除行事件
	参数：row -> 被删除的行
	 */
	var rowRemoved = function(row) {
		alert("被删除的行->" + row.attr("data-row"));
	}
	
	/*
	子表行添加事件
	 参数：grid -> 表示子表对象实例
	参数：args -> 0表示子表对象实例，1表示后台返回的数据对象，2表示当前行号
	 */
	function gridAddRow(grid, args) {
		alert("gridAddRow");
	}
	
	// JS 调用业务服务示例
	var setDisplayName = function() {
		// executeService(业务服务名称，业务服务方法,{参数1:数据项1,参数2:数据项2....})
		//var v = $.MvcSheetUI.MvcRuntime.executeService('DllTest', 'GetDisplayName', { Code: 'code' });
		//$("input[data-datafield='mvcName']").val(v);
	}
</script>

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
							<ul class="nav navbar-nav SheetToolBar" id="divTopBars" >
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
					<script type="text/javascript">
						/* js */
					</script>
					<!-- =============start 自定义表单html, 替换下面代码即可============= -->
					<div style="text-align: center;" class="DragContainer">
				        <label id="lblTitle" class="panel-title">MvcDemo</label>
				    </div>
				    <div class="panel-body">
				    	<div class="nav-icon fa fa-chevron-right bannerTitle">
				            <label id="divBasicInfo">基本信息</label>
				        </div>
				        <div class="divContent">
				            <div class="row">
				                <div id="divFullNameTitle" class="col-md-2">
				                    <label id="lblFullNameTitle" data-type="SheetLabel" data-datafield="Originator.UserName" data-bindtype="OnlyVisiable">发起人</label>
				                </div>
				                <div id="divFullName" class="col-md-4">
				                    <label id="lblFullName" data-type="SheetLabel" data-datafield="Originator.UserName" data-bindtype="OnlyData"></label>
				                </div>
				                <div id="divOriginateDateTitle" class="col-md-2">
				                    <label id="lblOriginateDateTitle" data-type="SheetLabel" data-datafield="OriginateTime" data-bindtype="OnlyVisiable">发起时间</label>
				                </div>
				                <div id="divOriginateDate" class="col-md-4">
				                  <input id="SheetOriginateDate" type="text" data-datafield="OriginateTime" data-timemode="OnlyDate" data-type="SheetTime" class="">
							  
				                </div>
				            </div>
				            <div class="row">
				                <div id="divOriginateOUNameTitle" class="col-md-2">
				                    <label id="lblOriginateOUNameTitle" data-type="SheetLabel" data-datafield="Originator.OUName" data-bindtype="OnlyVisiable">所属组织</label>
				                </div>
				                <div id="divOriginateOUName" class="col-md-4">
				                    <label id="lblOriginateOUName" data-type="SheetLabel" data-datafield="Originator.OUName" data-bindtype="OnlyData"></label>
				                </div>
				                <div id="divSequenceNoTitle" class="col-md-2">
				                    <label id="lblSequenceNoTitle" data-type="SheetLabel" data-datafield="SequenceNo" data-bindtype="OnlyVisiable">流水号</label>
				                </div>
				                <div id="divSequenceNo" class="col-md-4">
				                    <label id="lblSequenceNo" data-type="SheetLabel" data-datafield="SequenceNo" data-bindtype="OnlyData"></label>
				                </div>
				            </div>
				        </div>
				        <div class="nav-icon fa  fa-chevron-right bannerTitle">
				            <label id="divSheetInfo">表单信息</label>
				        </div>
				        <div id="ctl00_BodyContent_divSheet" class="divContent">
				            <div class="row">
				                <div id="title1" class="col-md-2">
				                    <span id="Label11" data-type="SheetLabel" data-pretext="自定义属性" data-datafield="code">编码</span>
				                </div>
				                <div id="control1" class="col-md-4">
				                    <input id="txtCode" type="text" data-datafield="code" data-type="SheetTextBox" class="" onchange="setDisplayName();">
				                   	<!--  注：Change事件调用业务服务，并且给名称赋值<br />
				                    $.MvcSheetUI.MvcRuntime.executeService("业务服务名称","方法名称",{参数1名称:"值1",参数2名称:"值2"...}); -->
				                    <div>
				                        <!-- <asp:Button ID="txtButton" runat="server" Text="测试按钮" OnClick="txtButton_Click" /> -->
				                        <input type="button" id="btnClick" value="前端调用后台方法" />
				                    </div>
				                </div>
				                <div id="title2" class="col-md-2">
				                    <span id="Label12" data-type="SheetLabel" data-datafield="mvcName">名称</span>
				                </div>
				                <div id="control2" class="col-md-4">
				                    <input id="txtName" type="text" data-pretext="->" data-datafield="mvcName" data-type="SheetTextBox">
				                </div>
				            </div>
				            <div class="row">
				                <div id="title1" class="col-md-2">
				                    <span id="Label11" data-type="SheetLabel" data-datafield="Spec">规格</span>
				                </div>
				                <div id="control1" class="col-md-10">
				                    <input id="txtCode" type="text" data-datafield="Spec" data-type="SheetTextBox">
				                </div>
				            </div>
				            <div class="row">
				                <div id="title3" class="col-md-2">
				                    <span id="Label13" data-type="SheetLabel" data-datafield="radio">单选</span>
				                </div>
				                <div id="control3" class="col-md-4">
				                    <div data-datafield="radio" data-type="SheetRadioButtonList" id="ctl414631" class="" data-defaultitems="A;B;C;其他"></div>
				                </div>
				                <div id="title4" class="col-md-2">
				                    <span id="Label14" data-type="SheetLabel" data-datafield="mvcOther" data-displayrule="{radio}=='其他'">其他</span>
				                </div>
				                <div id="control4" class="col-md-4">
				                    <input id="Control14" type="text" data-datafield="mvcOther" data-type="SheetTextBox" class="" data-displayrule="{radio}=='其他'" data-vaildationrule="{radio}=='其他'">
				                </div>
				            </div>
				            <div class="row">
				                <div id="title5" class="col-md-2">
				                    <span id="Label15" data-type="SheetLabel" data-datafield="multiCheck">多选</span>
				                </div>
				                <div id="control5" class="col-md-4">
				                    <div data-datafield="multiCheck" data-type="SheetCheckboxList" id="ctl732795" class="" data-defaultitems="A;B;C"></div>
				                </div>
				                <div id="title6" class="col-md-2">
				                    <span id="Label16" data-type="SheetLabel" data-datafield="mvcTime">日期</span>
				                </div>
				                <div id="control6" class="col-md-4">
				                    <input id="Control16" type="text" data-datafield="mvcTime" data-type="SheetTime">
				                </div>
				            </div>
				            <div class="row">
				                <div id="title7" class="col-md-2">
				                    <span id="Label17" data-type="SheetLabel" data-datafield="mvcMobile">电话</span>
				                </div>
				                <div id="control7" class="col-md-4">
				                    <input id="txtMobile" type="text" data-datafield="mvcMobile" data-type="SheetTextBox" class=""
				                        data-regularexpression="/^1[3|4|5|8][0-9]{9}$/" data-regularinvalidtext="请输入一个有效的手机号码.">
				                </div>
				                <div id="title8" class="col-md-2">
				                    <span id="Label18" data-type="SheetLabel" data-datafield="dropList">下拉框</span>
				                </div>
				                <div id="control8" class="col-md-4">
				                    <select data-datafield="dropList" data-type="SheetDropDownList" id="ctl352297" class="" data-defaultitems="A;B;C;D">
				                    </select>
				                </div>
				            </div>
				            <div class="row">
				                <div id="title11" class="col-md-2">
				                    <span id="Label20" data-type="SheetLabel" data-datafield="selectUser">选人</span>
				                </div>
				                <div id="Div1" class="col-md-4">
				                    <div id="Control20" data-datafield="selectUser" data-type="SheetUser"  >
				                    </div>
				                </div>
				                <div id="title12" class="col-md-2">
				                    <span id="Label21" data-type="SheetLabel" data-datafield="mulitUser">多人</span>
				                </div>
				                <div id="Div2" class="col-md-4">
				                    <div id="Control21" data-datafield="mulitUser" data-type="SheetUser"></div>
				                </div>
				            </div>
				            <!-- <div class="row">
				                <div id="title11" class="col-md-2">
				                    <span id="Label20" data-type="SheetLabel" data-datafield="selectUser">指定组选人</span>
				                </div>
				                <div id="title12" class="col-md-10">
				                    <div id="Control20" data-datafield="selectUser" data-type="SheetUser" data-rolename="测试用户组">
				                    </div>
				                    <br />
							       应用场景：假设存在出纳组，流程需要从出纳组中选择一个人，这里只要指定组名称是【出纳】<br />
							                    注：如果未指定RootUnit属性，则从当前用户所在组织往上开始查找<br />
							                    也可以设置 OrgJobCode或者OrgPostCode，通过职务或者岗位编码进行绑定用户
				                </div>
				            </div> -->
				            <div class="row">
				                <div id="Div5" class="col-md-2">
				                    <span id="Span1" data-type="SheetLabel" data-datafield="Email">邮箱</span>
				                </div>
				                <div id="Div6" class="col-md-4">
				                    <input id="Text3" type="text" data-datafield="Email" data-type="SheetTextBox">
				                </div>
				                <div id="Div7" class="col-md-2">
				                    <span id="Span2" data-type="SheetLabel" data-datafield="Dept">所属组织</span>
				                </div>
				                <div id="Div8" class="col-md-4">
				                    <input id="Text4" type="text" data-datafield="Dept" data-type="SheetTextBox">
				                </div>
				            </div>
				            <div class="row">
				                <div id="title13" class="col-md-2">
				                    <span id="Label22" data-type="SheetLabel" data-datafield="mvcNum">子表小计</span>
				                </div>
				                <div id="control13" class="col-md-4">
				                    <input id="Control22" type="text" data-datafield="mvcNum" data-type="SheetTextBox" class=""
				                        data-computationrule="SUM({mvcDetail.mvcCount})" />
				                </div>
				                <div id="space14" class="col-md-2">
				                    <span id="Span3" data-type="SheetLabel" data-datafield="InvoiceCount">有发票金额</span>
				                </div>
				                <div id="spaceControl14" class="col-md-4">
				                    <input id="Text5" type="text" data-datafield="InvoiceCount" data-type="SheetTextBox" class=""
				                        data-computationrule="SUM({mvcDetail.mvcCount},if('{mvcDetail.Invoice}'=='有')return {mvcDetail.mvcCount};else return 0;)" />
				                </div>
				            </div>
				            <div class="row">
				                <div id="title17" class="col-md-2">
				                    <span id="Label24" data-type="SheetLabel" data-datafield="mvcDetail">子表</span>
				                </div>
				                <div id="Div3" class="col-md-10">
				                    <table id="gridDemo" data-datafield="mvcDetail" data-defaultrowcount="0"
				                        data-onadded="gridAddRow(this,arguments);"
				                        data-oneditorsaving="gridSaving(this,arguments);"
				                        data-onremoved="rowRemoved(this,arguments);"
				                        data-type="SheetGridView" class="SheetGridView">
				                        <tbody>
				                            <tr class="header">
				                                <td id="Control24_SerialNo" class="rowSerialNo" rowspan="2">序号</td>
				                                <td id="Control24_Header3" data-datafield="mvcDetail.code">
				                                    <label id="Control24_Label3" data-datafield="mvcDetail.code" data-type="SheetLabel">编码</label>
				                                </td>
				                                <td id="Td2" data-datafield="mvcDetail.Invoice">
				                                    <label id="Label3" data-datafield="mvcDetail.Invoice" data-type="SheetLabel">发票</label>
				                                </td>
				                                <td id="Control24_Header4" data-datafield="mvcDetail.mvcNum" rowspan="2">
				                                    <label id="Control24_Label4" data-datafield="mvcDetail.mvcNum" data-type="SheetLabel">数量</label>
				                                </td>
				                                <td id="Control24_Header5" data-datafield="mvcDetail.mvcPrice" rowspan="2">
				                                    <label id="Control24_Label5" data-datafield="mvcDetail.mvcPrice" data-type="SheetLabel">单价</label>
				                                </td>
				                                <td id="Control24_Header6" data-datafield="mvcDetail.mvcCount" rowspan="2">
				                                    <label id="Control24_Label6" data-datafield="mvcDetail.mvcCount" data-type="SheetLabel">小计</label>
				                                </td>
				                                <td class="rowOption" rowspan="2">删除</td>
				                            </tr>
				                            <tr class="header">
				                                <td id="Td3" data-datafield="mvcDetail.Spec">
				                                    <label id="Label2" data-datafield="mvcDetail.Spec" data-type="SheetLabel">规格</label>
				                                </td>
				
				                                <td id="Td1" data-datafield="mvcDetail.DetailName">
				                                    <label id="Label1" data-datafield="mvcDetail.DetailName" data-type="SheetLabel">名称</label>
				                                </td>
				                            </tr>
				                            <tr class="template">
				                                <td id="Control24_Option" class="rowOption" rowspan="2"></td>
				                                <td data-datafield="mvcDetail.code">
				                                    <input id="Control24_ctl3" type="text" data-datafield="mvcDetail.code" data-type="SheetTextBox">
				                                </td>
				
				                                <td id="Td4" data-datafield="mvcDetail.Invoice">
				                                    <select data-datafield="mvcDetail.Invoice" data-type="SheetDropDownList" id="ctl317318" class="" data-defaultitems="有;无"></select>
				                                </td>
				                                <td data-datafield="mvcDetail.mvcNum" rowspan="2">
				                                    <input id="Control24_ctl4" type="text" data-datafield="mvcDetail.mvcNum" data-type="SheetTextBox">
				                                </td>
				                                <td data-datafield="mvcDetail.mvcPrice" rowspan="2">
				                                    <input id="Control24_ctl5" type="text" data-datafield="mvcDetail.mvcPrice" data-type="SheetTextBox">
				                                </td>
				                                <td data-datafield="mvcDetail.mvcCount" rowspan="2">
				                                    <input id="Control24_ctl6" type="text" data-datafield="mvcDetail.mvcCount" data-type="SheetTextBox" class="" data-computationrule="{mvcDetail.mvcNum}*{mvcDetail.mvcPrice}">
				                                </td>
				                                <td class="rowOption" rowspan="2">
				                                    <a class="delete">
				                                        <div class="fa fa-minus">
				                                        </div>
				                                    </a>
				                                    <a class="insert">
				                                        <div class="fa fa-arrow-down">
				                                        </div>
				                                    </a>
				                                </td>
				                            </tr>
				                            <tr class="template">
				                                <td data-datafield="mvcDetail.Spec">
				                                    <input id="Text2" type="text" data-datafield="mvcDetail.Spec" data-type="SheetTextBox">
				                                </td>
				                                <td data-datafield="mvcDetail.DetailName">
				                                    <input id="Text1" type="text" data-datafield="mvcDetail.DetailName" data-type="SheetTextBox">
				                                </td>
				                            </tr>
				                            <tr class="footer">
				                                <td class="rowOption"></td>
				                                <td data-datafield="mvcDetail.code"></td>
				                                <td data-datafield="mvcDetail.DetailName"></td>
				                                <td data-datafield="mvcDetail.mvcNum">
				                                    <label id="Control24_stat4" data-datafield="mvcDetail.mvcNum" data-type="SheetCountLabel"></label>
				                                </td>
				                                <td data-datafield="mvcDetail.mvcPrice">
				                                    <label id="Control24_stat5" data-datafield="mvcDetail.mvcPrice" data-type="SheetCountLabel" class="" data-stattype="NONE"></label>
				                                </td>
				                                <td data-datafield="mvcDetail.mvcCount">
				                                    <label id="Control24_stat6" data-datafield="mvcDetail.mvcCount" data-type="SheetCountLabel"></label>
				                                </td>
				                                <td class="rowOption"></td>
				                            </tr>
				                        </tbody>
				                    </table>
				                </div>
				            </div>
				            <div class="row">
				                <div id="title9" class="col-md-2">
				                    <span id="Label19" data-type="SheetLabel" data-datafield="mvcAttachment">附件</span>
				                </div>
				                <div id="control9" class="col-md-10">
				                    <div id="Control19" data-datafield="mvcAttachment" data-type="SheetAttachment"></div>
				                </div>
				            </div>
				            <div class="row">
				                <div id="title15" class="col-md-2">
				                    <span id="Label23" data-type="SheetLabel" data-datafield="mvcHtml">Html</span>
				                </div>
				                <div id="control15" class="col-md-10">
				                    <textarea id="Control23" data-datafield="mvcHtml" data-richtextbox="true" data-type="SheetRichTextBox"></textarea>
				                </div>
				            </div>
				            <div class="row">
				                <div id="title19" class="col-md-2">
				                    <span id="Label25" data-type="SheetLabel" data-datafield="mvcComment">审批意见</span>
				                </div>
				                <div id="Div4" class="col-md-10">
				                    <div id="Control25" data-datafield="mvcComment" data-type="SheetComment" data-displaysign="true"></div>
				                </div>
				            </div>
				        </div>
				    </div>
					<!-- =============end============= -->
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
                // console.log("start init : " + new Date());
				$.MvcSheet.Init();
                // console.log("end init : " + new Date());
           		
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
			console.log('Control13')
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