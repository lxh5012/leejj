app.controller('PortalPageManegerController', ['$rootScope', '$scope', '$state', '$http', '$modal', '$translate', 'ControllerConfig',
    function ($rootScope, $scope, $state, $http, $modal, $translate, ControllerConfig) {
        $scope.init = function () {
            $http({
                url: "PortalAdminHandler/GetAllPages",
                params: {}
            })
            .success(function (data) {
                if (data.ExceptionCode == 1) {
                    //刷新页面转到登录
                } else if (data.Success == true) {
                    $scope.SitPages = data.Extend || [];
                }
            })
        }

        $scope.init();

        $scope.AddTemplate = function () {
            $scope.EditPage();
        }

        //修改  编辑、添加
        $scope.EditPage = function (PageId) {
            var modalInstance = $modal.open({
                templateUrl: "template/Templates/EditPage.html",// 指向上面创建的视图
                controller: 'EditPageController',// 初始化模态范围
                size: "md",
                resolve: {
                    params: function () {
                        return {
                            PageId: PageId || ""
                        };
                    }
                }
            });
            // 弹窗点击确定的回调事件
            modalInstance.result.then(function (arg) {
                //reload
            });
        }
        //设计
        $scope.Design = function (PageId) {
            window.open("index.html#/home/" + PageId + "/Design", "_blank");
        }
        //部件
        $scope.ManageWebParts = function (PageId) {
            var modalInstance = $modal.open({
                templateUrl: "ManageWebParts.html",// 指向上面创建的视图
                controller: 'ManageWebPartsController',// 初始化模态范围
                size: "md",
                resolve: {
                    params: function () {
                        return {
                            PageId: PageId
                        };
                    }
                }
            });
            // 弹窗点击确定的回调事件
            modalInstance.result.then(function (arg) {

            });
        }
        //删除
        $scope.RemovePage = function (PageId) {
            var modalInstance = $modal.open({
                templateUrl: 'template/ProcessCenter/ConfirmModal.html',
                size: "sm",
                controller: function ($scope, $modalInstance) {
                    $scope.Title = $translate.instant("WarnOfNotMetCondition.Tips");
                    $scope.Message = $translate.instant("WarnOfNotMetCondition.Confirm_Delete");
                    $scope.Button_OK = true;
                    $scope.Button_OK_Text = $translate.instant("QueryTableColumn.Button_OK");
                    $scope.Button_Cancel = true;
                    $scope.Button_Cancel_Text = $translate.instant("QueryTableColumn.Button_Cancel");
                    $scope.ok = function () {
                        $modalInstance.close();  // 点击确定按钮
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel'); // 退出
                    }
                }
            });
            //弹窗点击确定的回调事件
            modalInstance.result.then(function () {
                //删除
                $http({
                    url: "PortalAdminHandler/RemoveManagedPage",
                    params: {
                        PageId: PageId
                    }
                })
                .success(function (data) {
                    //console.log(data);
                    $scope.init();
                    if (data.Message != "") {
                        $.notify({ message: data.Message, status: "danger" });
                    }
                })
            });
        }
    }]);

//修改Controller
app.controller('EditPageController', ['$scope', '$modalInstance', '$http', '$state', 'params', function ($scope, $modalInstance, $http, $state, params) {
    $scope.PageId = params.PageId;
    if ($scope.PageId != "") {
        //编辑
    }
    $scope.init = function () {
        //LoadTemplate、LoadPage
    	//update by ouyangsk 将异步请求改为同步请求，因为要先设置进UserOptions.V，以便于SheetUser.js取到V的值
//        $http({
//            url: window.localStorage.getItem("H3.PortalRoot")?window.localStorage.getItem("H3.PortalRoot"):"/Portal" + "/PortalAdminHandler/LoadPage",
//            params: {
//                PageId: $scope.PageId
//            }
//        })
//        .success(function (data) {
//            ////console.log(data);
//            if (/*data.ExceptionCode == -1 && */data.Success == true) {
//                $scope.Templates = data.Extend.Templates;
//                $scope.Page = data.Extend.Page;
//                if ($scope.Page) {
//                    $scope.UserOptions.V = $scope.Page.OrgId;
//                }
//            }
//        })
    	$.ajax({
    		url: "PortalAdminHandler/LoadPage",
    		data:{
    			PageId: $scope.PageId
    		},
    		async: false,
    		type: "get",
    		dataType: "json",
    		success: function(data) {
    			 if (/*data.ExceptionCode == -1 && */data.Success == true) {
                   $scope.Templates = data.Extend.Templates;
                   $scope.Page = data.Extend.Page;
                   if ($scope.Page) {
                       $scope.UserOptions.V = $scope.Page.OrgId;
                   }
               }
    		}
    	});
    }


    $scope.UserOptions = {
        Editable: true, Visiable: true, OrgUnitVisible: true, UserVisible: false
    }
    $scope.init();
    
    $scope.invalid = false;
    $scope.ok = function () {
        $scope.Page.OrgId = $("#sheetUser").SheetUIManager().GetValue();
        if ($scope.OrgId == "") {
            $scope.invalid = true;
            return;
        }
        $scope.invalid = false;
        //alert($scope.PageId + "|||" + $scope.Page.PageTitle + "|||" + $scope.Page.TempId + "|||" + $scope.Page.OrgId)
        $http({
            url: "PortalAdminHandler/SavePage",
            params: {
                PageId: $scope.PageId,
                PageTitle: $scope.Page.PageTitle,
                TempId: $scope.Page.TempId,
                OrgId: $scope.Page.OrgId
            }
        })
        .success(function (data) {
        	if(data.Success){
        		$modalInstance.close();
        		$state.go($state.$current.self.name, {}, { reload: true });
        	}else{
        		$.notify({ message: data.Message, status: "danger" });
        	}
        })
    }
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    };
}]);

//部件管理
app.controller('ManageWebPartsController', ['$scope', '$modalInstance', '$http', 'params', function ($scope, $modalInstance, $http, params) {
    $scope.PageId = params.PageId;
    $scope.NoWebParts = false;
    $scope.init = function () {
        $http({
            url: "PortalAdminHandler/GetPageWebParts",
            params: {
                PageId: $scope.PageId
            }
        })
        .success(function (data) {
            //console.log(data);
            if (/*data.ExceptionCode == -1 && */data.Success == true) {
            	$scope.WebParts = data.Extend;
                if (data.Extend.length == 0) {
                    $scope.NoWebParts = true;
                }
            }
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    };
    $scope.RemovePageWebPart = function (WebPartId) {
        $http({
            url: "PortalAdminHandler/RemovePageWebPart",
            params: {
                WebPartId: WebPartId
            }
        })
        .success(function (data) {
            $scope.init();
        })
    }
}])


