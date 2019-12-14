﻿﻿module.controller('appCenterItemCtrl', function ($scope, $rootScope, $ionicHistory, $state, commonJS, appCenterService, focus,$stateParams) {
	//显示控制器
    $scope.$on('$ionicView.enter', function () {
       	//钉钉头部显示
        if($rootScope.dingMobile.isDingMobile){
            $scope.topStyle="0px";
            $scope.SetDingDingHeader($scope.DisplayName);
            $scope.SetDingDingHeaderRight(" ");
        }else{
            $scope.topStyle="44px";
        }
        $rootScope.hideTabs = false;
        console.log("ionicView.enter");

    });
	
    $scope.init = function () {
        $scope.show = false;//控制标题栏是否显示
        $scope.transrate = 0;//控制标题栏透明度


        window.console.log($stateParams);
        $scope.AppCode = $stateParams.AppCode;
        $scope.DisplayName = $stateParams.DisplayName;
        
        //缓存和获取缓存AppCode
        if (!$scope.AppCode) {
            $scope.AppCode = window.localStorage.getItem("appCenter.AppCode");
            $scope.DisplayName = window.localStorage.getItem("appCenter.DisplayName");
        } else {
            window.localStorage.setItem("appCenter.AppCode", $scope.AppCode);
            window.localStorage.setItem("appCenter.DisplayName", $scope.DisplayName);
        }
        
        $scope.getFunctions();
        
    };

    $scope.goBack = function () {
        //$state.go("tab.appCenter");
    	$ionicHistory.goBack();
    }

    $scope.changeOtherContentShow=function(){
        $scope.otherContentShow=!$scope.otherContentShow;
    }

    $scope.changeContentShow = function (item) {
        item.contentShow = !item.contentShow;
    }

    $scope.getFunctions = function () {
        
        var options = {
            AppCode: $scope.AppCode
        };
        $scope.data = [];


        commonJS.loadingShow();
        appCenterService.getFunctions(options).then(function (result) {
            commonJS.loadingHide();
            $scope.data = result;

            //相关显示
            $scope.otherShow = false;
            $scope.otherNumber = 0;
            $scope.otherContentShow = true;
            for (var i = 0; i < $scope.data.length;i++) {
                if ($scope.data[i].Children.length == 0) {
                    $scope.otherShow = true;
                    $scope.otherNumber++;
                    $scope.data[i] = $scope.Workflowdata($scope.data[i]); //改变数据
                } else {
                    $scope.data[i].contentShow = true;
                    for(var j = 0; j< $scope.data[i].Children.length; j++){
                    	$scope.data[i].Children[j] = $scope.Workflowdata($scope.data[i].Children[j]); //改变数据
                    }
                }
            }
        }, function (reason) {
            commonJS.loadingHide();
            commonJS.showShortMsg("setcommon f15", reason, 2000);
        })
    }

    //改变数据
    //为每一组数据增加type（1为默认配置，2为发起流程链接，3为外部链接，4为打开表单）； data.Code作为发起流程链接提取workflowCode
    $scope.Workflowdata = function(data){
    	var regex = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    	var reg = new RegExp("WorkflowCode=([^&]*)(&|$)");
    	var WoekflowCode = "";
    	if(data.Url && regex.test(data.Url)){
    		data.Type = 3;
    	}else if(data.Url && data.Url.toLowerCase().indexOf(config.portalroot.toLowerCase()) != -1){
    		var r = data.Url.match(reg);
    		if(r != null) WorkflowCode = unescape(r[1]);
    		data.Type = 2;
    		data.Code = WorkflowCode;
    	}else{
    		data.Type = 1;
    		// console.log(data, 'data') // zaf-11-29
            if (data.Url) {
                if(data.Url.indexOf("app.EditBizObject")>-1){
                    data.Type = 4;
                    data.Url = $scope.ConvertBizObjectUrl(data.Url);
                }
            } else {
                return data
            }
    	}
    	return data;
    };
    
    $scope.ConvertBizObjectUrl = function(Url){
    	var url = "";
    	url = Url.slice(0,Url.length-1).replace("app.EditBizObject(","");
    	return url;
    }
    
    //发起流程
    $scope.startWorkflow = function(workflowCode){
    	$scope.worksheetUrl = $scope.setting.startInstanceUrl + workflowCode + "&LoginName=" + encodeURI($scope.user.Code)+"&LoginSID="+$scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
    	commonJs.OpenStartInstanceSheet($scope,$scope.worksheetUrl);
    };
    
    //打开链接
    $scope.openLink = function(url){
    	commonJS.openWorkItem($scope,url + "?t="+Math.random());
    }
    
    //打开流程表单
    $scope.editBizObject =  function(obj){
    	var obj = eval("("+obj+")");
    	var url =  $scope.setting.httpUrl.replace("portal","Portal")+"/MvcDefaultSheet.jsp?SheetCode="+obj.SheetCode+"&Mode="+obj.Mode+"&SchemaCode="+ obj.SchemaCode+"&IsMobile=true&onlyData=true&go=-2&T="+new Date().getTime();
    	commonJS.openWorkItem($scope,url);
    };

    $scope.init();
});