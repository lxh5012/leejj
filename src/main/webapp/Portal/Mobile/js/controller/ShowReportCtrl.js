module.controller('ShowReportCtrl', ['$scope', "$rootScope","$timeout", "$compile",
    "$http", "$state", "$stateParams",
    "$filter", "$ionicHistory", "commonJS",
function ($scope, $rootScope, $timeout, $compile, $http, $state, $stateParams, $filter, $ionicHistory, commonJS) {
    $scope.show = false;//控制标题栏是否显示
    $scope.transrate = 0;//控制标题栏透明度
    $scope.filters = [];
    $scope.filterFlag = false;//点击选人控件之后重新要打开筛选页
    $scope.currentSheetUserId = "";
	
    // console.log($stateParams);
    //class添加到ion-view和ion-popover-view以区分他们的不同
    $scope.reportCode=$stateParams.ReportCode;
    
    $scope.promise=commonJS.sideSlip($scope, 'templates/filterReport.html', true,true);
    console.log($rootScope.departmentInfo);
    
    $scope.$on('$ionicView.leave', function (scopes, states) {
    	if($scope.popover){
    		$scope.popover.hide();
    	}
    })
    
    $scope.$on('$ionicView.enter', function (scopes, states) {
//    	if($scope.popover){
//    		$scope.popover.hide();
//    	}
    	
    	//钉钉头部显示
        if($rootScope.dingMobile.isDingMobile){
            $scope.topStyle="0px";
        }else{
            $scope.topStyle="44px";
        }
    	
        if ($scope.filterFlag) {//已经点击选人控件，重新打开
            $scope.openPopover();
           var $el=$($scope.popover.el);

            if ($scope.currentSheetUserId != "") {
                $scope.map($scope.currentSheetUserId, $rootScope.filterUsers);
                var array = $scope.initItemsCode($rootScope.filterUsers);//选人控件传数据的特殊格式 
                var arrayStr = "";
                for (var i = 0; i < array.length; i++) {
                    arrayStr += array[i] + ",";
                }
                arrayStr = arrayStr.substring(0, arrayStr.length - 1);
                if ($rootScope.filterUsers && !angular.equals([], $rootScope.filterUsers)) {
                    if ($rootScope.filterUsers.constructor == Object) {
                        $el.find("div#" + $scope.currentSheetUserId).find(".ion-chevron-right").prev("span").html($rootScope.filterUsers.Name);
                    } else {
                        if (!$scope.LanJson.isShow) {
                            $el.find("div#" + $scope.currentSheetUserId).find(".ion-chevron-right").prev("span").html($rootScope.filterUsers[0].Name + "等" + array.length + $scope.LanJson.personTotal);
                        } else {
                            $el.find("div#" + $scope.currentSheetUserId).find(".ion-chevron-right").prev("span").html($rootScope.filterUsers[0].Name + array.length + $scope.LanJson.personTotal);
                        }
                    }
                }
                else {
                    $el.find("div#" + $scope.currentSheetUserId).find(".ion-chevron-right").prev("span").html("");
                }
                $el.find("div#" + $scope.currentSheetUserId).find('input[type="hidden"]').val(arrayStr);

                $el.find("div#" + $scope.currentSheetUserId).find('input[type="hidden"]').trigger("change");//手动触发hidden输入框的值得变化
            }
        } else {
            $scope.init();
        }
        
        //设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.tabs.report);
            dd.biz.navigation.setLeft({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: $rootScope.languages.back,//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                    $scope.goback();
                },
                onFail: function (err) { }
            });
            dd.biz.navigation.setRight({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: $rootScope.languages.filter,//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                    $scope.openPopover();
                },
                onFail: function (err) {
                }
            });
        }
        //$scope.ionicInited = true;
    });

    $scope.map = function (key, value) {
        $scope.filters[key] = value;
    }
    $scope.init = function () {

        $scope.UnfinishedText = config.languages.current.report.Unfinished;
        $scope.FinishedText = config.languages.current.report.Finished;
        $scope.CanceledText = config.languages.current.report.Canceled;
        $scope.UnspecifiedText = config.languages.current.report.Unspecified;
        if ($scope.user) {
            $scope.Originator = $scope.user.ObjectID;
        } 
    }
    
    //返回按钮
    $scope.goback = function () {
//    	$state.go("appCenterItem");
    	$ionicHistory.goBack();
    }
    
    $scope.getLanguage = function () {
        $scope.LanJson = {
            isShow: config.languages.current.isShow,
            personTotal: config.languages.current.personTotal,
            search: config.languages.current.report.search,
            ProcessName: config.languages.current.report.ProcessName,
            WorkFlow:    config.languages.current.report.WorkFlow,    
            Originator:  config.languages.current.report.Originator,  
            StartTime:   config.languages.current.report.StartTime,   
            EndTime:     config.languages.current.report.EndTime,   
            sLengthMenu: config.languages.current.report.sLengthMenu,
            sZeroRecords: config.languages.current.report.sZeroRecords_NoRecords,
            sInfo: config.languages.current.report.sInfo,
            sProcessing: config.languages.current.report.sProcessing,
            UnfinishedText: config.languages.current.report.Unfinished,
            FinishedText: config.languages.current.report.Finished,
            CanceledText: config.languages.current.report.Canceled,
            UnspecifiedText: config.languages.current.report.Unspecified,

            //权限
            QueryInstanceByProperty_NotEnoughAuth1: config.languages.current.report.QueryInstanceByProperty_NotEnoughAuth1,
            QueryInstanceByProperty_NotEnoughAuth2: config.languages.current.report.QueryInstanceByProperty_NotEnoughAuth2,
            QueryInstanceByProperty_NotEnoughAuth3: config.languages.current.report.QueryInstanceByProperty_NotEnoughAuth3,
        }
    }
    $scope.getLanguage();

    //用户控件
    $scope.UserOptions = {

        Editable: true, Visiable: true, OrgUnitVisible: true, V: $scope.Originator, IsMultiple: true, PlaceHolder: $scope.LanJson.Originator
    }

    $scope.options = function () {
        // 设置信息
        $scope.setting = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.Setting')) ||
           {
               autoLogin: config.defaultAutoLogin, // 是否自动登录
               serviceUrl: config.defaultServiceUrl, // 服务地址
               httpUrl: '', //http请求地址
               workItemUrl: '', // 打开待办的URL地址
               startInstanceUrl: '', // 发起流程的链接
               instanceSheetUrl: '', // 打开在办流程的链接
               uploadImageUrl: '', // 图片上传URL
               tempImageUrl: '' // 图片存放路径
           };
        var ionic = {
            $scope: $scope,
            $compile: $compile,
            $rootScope:$rootScope
        }
//        var option = {
//            SourceCode: $stateParams.ReportCode,
//            PortalRoot: $scope.setting.httpUrl,
//            TableShowObj: $("#ReportView"),
//            dParamShowObj: $("#ParamContent"),
//            ReportFiters: $scope.popover.$el.find("ion-content").find("div").eq(0),
//            ReportPage: $("#ReportPage"),
//            Ionic: ionic
//        }
        
        var option = {
            SourceCode: $stateParams.ReportCode,
            PortalRoot: $scope.setting.httpUrl,
            TableShowObj: null,
            dParamShowObj: null,
            ReportFiters: $($scope.popover.$el.find("ion-content").find("div").eq(0)[0]),
            //应用中可能有多个报表的视图
            ReportPage: $("."+$scope.reportCode+" #ReportPage"),
            Ionic: ionic,
            "iDisplayLength": 20,   // 每页显示行数
            "bLengthChange": true, // 每页显示多少数据
            "aLengthMenu": [[10, 20, 50, 100], [10, 20, 50, 100]],//设置每页显示数据条数的下拉选项
            "sScrollY": "500px",
            "bScrollCollapse": true,
            "iScrollLoadGap": 50,
            "language": {           // 语言设置
                "sLengthMenu": $scope.LanJson.sLengthMenu,
                "sZeroRecords": "<div class='no-data'><p class='no-data-img'></p><p>"+$scope.LanJson.sZeroRecords+"</p></div>",
                "sInfo": $scope.LanJson.sInfo,
                "infoEmpty": "",
                "sProcessing": '<div class="loading-box"><i class="icon-loading"></i><p>'+$scope.LanJson.sProcessing+'</p></div> ',
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "previous": "<",
                    "next": ">"
                }
            },
            ResetBtn:$("."+$scope.reportCode+"#resetAllReport")
        }
        return option;
    }
    //隐藏报表过滤条件页面 存在bug 触发每个控件绑定的事件，重复请求和渲染
//    $scope.resetReportSearch = function () {
//    	var viewClassName=$scope.reportCode;
//    	var $ele=$("."+viewClassName+"#ReportFiters");
//        //input框全部清空
//        if ($ele.find('div.scroll').find('input')) {
//            $ele.find('div.scroll').find('input').val('');
//            $ele.find('div.scroll').find('input').change();
//        }
//        //日期清空显示
//        if ($ele.find('div.scroll').find('span.showdate')) {
//            $ele.find('div.scroll').find('span.showdate').text('');
//            $ele.find('span.showdate').trigger("DOMSubtreeModified");
//
//        }
//        if ($ele.find('div.scroll').find('input.mydatetimepicker')) {
//            $ele.find('div.scroll').find('input.mydatetimepicker').val('');
//            $ele.find('div.scroll').find('input.mydatetimepicker').change();
//        }
//
//        //单选
//        if ($ele.find('div.scroll').find('input:radio')) {
//            $ele.find('div.scroll').find('input:radio').removeAttr('checked');
//            $ele.find('div.scroll').find('input:radio').change();
//        }
//        // select 多选 add by zcw
//        if($ele.find('div.scroll').find('div.bootstrap-select')){
//            $ele.find('div.scroll').find('div.bootstrap-select').find(".filter-option").text("");
//            $ele.find('div.scroll').find('div.bootstrap-select').find("li").prop("class","");
//            $ele.find('div.scroll').find('div.bootstrap-select').change();
//        }
//
//        //选人清空显示
//        $ele.find('div.scroll').find('.sheetuserflag').find(".ion-chevron-right").prev("span").html("");
//        $scope.filters = [];
//
//
//    }
    //隐藏报表过滤条件页面
    $scope.hideFilterReport = function () {
        $scope.popover.hide();
        $scope.filterFlag=false;
    }
    $scope.ReportstateUser = function (event) {
        $scope.currentSheetUserId = event.currentTarget.id;
        if ($scope.filters[event.currentTarget.id] == null) {
            $scope.filters[event.currentTarget.id] = [];
        }
        //第一次进入加载默认值
        var filtervalue=event.currentTarget.dataset.filtervalue;
        var di=$rootScope.departmentInfo;
        if(filtervalue=="1"){
			event.currentTarget.removeAttribute("data-filtervalue");
			$scope.filters[event.currentTarget.id].push({
			        Code:di.UserId,
        			ContentType:"U",
        			Name:di.UserName,
        			UserGender:di.UserGender,
        			UserImageUrl:di.UserImageUrl,
			})
        }else if(filtervalue=="2"){
        	event.currentTarget.removeAttribute("data-filtervalue");
			$scope.filters[event.currentTarget.id].push({
				    Code:di.DepartmentId,
        			ContentType:"O",
        			Name:di.DepartmentName
			})
        }
        
    	for (var a in $scope.filters) {
            if (a == event.currentTarget.id) {
                $rootScope.filterUsers = $scope.filters[a];
                break;
            }
        }

        var dataOrgUnitVisible  = $('#ReportFiters').find('div#' + event.currentTarget.id).attr('data-OrgUnitVisible');
        var dataUserVisible = $('#ReportFiters').find('div#' + event.currentTarget.id).attr('data-UserVisible');
         
        //报表查询条件选人控件配置对象
        $rootScope.reportFilter={};
        
        if (dataOrgUnitVisible == "true" && dataUserVisible == "false") {
            $rootScope.reportFilter.selecFlag="O";
            $rootScope.reportFilter.loadOptions = "o=O";
            $rootScope.reportFilter.OrgUnitVisible = true;
            $rootScope.reportFilter.UserVisible = false;
        }
        if (dataOrgUnitVisible == "false" && dataUserVisible == "true") {
            $rootScope.reportFilter.selecFlag = "U";
            $rootScope.reportFilter.loadOptions = "o=U";
            $rootScope.reportFilter.UserVisible = true;
             $rootScope.reportFilter.OrgUnitVisible = false;
        }
        if (dataOrgUnitVisible == "true" && dataUserVisible == "true") {
            $rootScope.reportFilter.selecFlag = "OU";
            $rootScope.reportFilter.loadOptions = "o=OU";
            $rootScope.reportFilter.OrgUnitVisible = true;
            $rootScope.reportFilter.UserVisible = true;
        }  
        $state.go("sheetUser",{isReport:true,displayName:$(event.target).closest(".menu-bar").find(".menu-bar-left").text()});
        $scope.filterFlag = true;//判断是否点击过选人控件
        $scope.popover.hide();
    };

    $scope.initItemsCode = function (users) {
        var objs = [];
        if (users && !angular.equals({}, users)) {
            if (users.constructor == Object) {
                var tempUser = users.Code;
                objs.push(tempUser);
            } else {
                users.forEach(function (n, i) {
                    var tempUser = n.Code;
                    objs.push(tempUser);
                });
            }
        }
        return objs;
    };
}]);