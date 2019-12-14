module.controller('EditBizObjectController', function ($scope, $rootScope, categories, $ionicSlideBoxDelegate, $stateParams, $ionicLoading, commonJS) {
    // 发起流程
    //$scope.startWorkflow = function (workflowCode) {
    //    var absurl = {
    //        state: 'tab.startworkflow',
    //        tab: $scope.slectIndex
    //    }
    //    window.localStorage.setItem("absurl", JSON.stringify(absurl));
    //    $scope.worksheetUrl = $scope.setting.startInstanceUrl + workflowCode + "&LoginName=" + encodeURI($scope.user.Code) + "&LoginSID=" + $scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
    //    commonJS.OpenStartInstanceSheet($scope, $scope.worksheetUrl);
    //};
    //$scope.startWorkflow($stateParams.SheetCode);
	$scope.$on('$ionicView.enter',function(scopes,states){
		
	
     //移动端流程表单 zcw
	    var url = $scope.setting.httpUrl.replace("portal","Portal")+"/MvcDefaultSheet.jsp?SheetCode="+$stateParams.SheetCode+"&Mode="+$stateParams.Mode+"&SchemaCode="+ $stateParams.SchemaCode+"&IsMobile=true&onlyData=true&go=-2";
	    
	    if($rootScope.dingMobile.isDingMobile && dd){
	    	document.addEventListener('resume',function(){
	    		$rootScope.goLink = false;
	    		dd.biz.navigation.goBack({});
	    	});
	    	$rootScope.goLink = true;
	    	commonJS.openWorkItem($scope,url);
	    }else{
	    	window.location.replace(url);
	    }
	});
});