module.controller('startWorkflowCtrl', function ($scope, $http, $ionicSideMenuDelegate, $ionicLoading,
        $ionicModal, $window, commonJS, focus) {
    // 流程集合
    $scope.categories = [];
    $scope.sourceCategories = null;
    commonJS.loadingShow();
    $scope.userId = $scope.user.ObjectID;
    // 是否加载完成
    $scope.loadCompleted = false;
    $scope.displaySearchButton = false;
    $scope.searchKey = "";
    $scope.initCompleted = false;
    $scope.exception = false;
    $scope.lastLoadTime = new Date();
    $scope.FavoriteCategory = "常用流程";

    // 每次进入View时触发
    $scope.$on("$ionicView.enter", function (scopes, states) {
        if ($scope.userId != $scope.user.ObjectID) {
            $scope.categories = [];
            $scope.loadWorkflows();
        }
        else {
            var dateNow = new Date();    //结束时间
            var times = dateNow.getTime() - $scope.lastLoadTime.getTime();  //时间差的毫秒数
            if (times > 1000 * 60 * 10) {// 超过10分钟，重新刷新一次
                $scope.lastLoadTime = new Date();
                $scope.loadWorkflows();
            }
        }
    });

    $scope.loadWorkflows = function () {
        var url = $scope.setting.serviceUrl + "/LoadWorkflows?callback=JSON_CALLBACK&userCode=" + encodeURI($scope.user.Code) + "&mobileToken=" + $scope.user.MobileToken;
        $http.jsonp(url)
            .success(function (result) {
                if (result.Workflows && result.Workflows.length > 0) {
                    for (var i = 0; i < result.Workflows.length; i++) {
                        $scope.categories.push(result.Workflows[i]);
                    }
                }
                $scope.sourceCategories = JSON.stringify($scope.categories);
                $scope.initCompleted = true;
                commonJS.loadingHide();
            })
            .error(function () {
                console.log("加载发起出现异常");
                $scope.loadCompleted = true;
                $scope.exception = true;
                commonJS.loadingHide();
            });
    };

    // 搜索流程
    $scope.doSearch = function () {
        $scope.categories = JSON.parse($scope.sourceCategories);

        if ($scope.searchKey) {
            for (var i = 0; i < $scope.categories.length; i++) {
                for (var j = 0; j < $scope.categories[i].Workflows.length; j++) {
                    if ($scope.categories[i].Workflows[j].DisplayName.indexOf($scope.searchKey) == -1) {
                        $scope.categories[i].Workflows.splice(j, 1);
                        j--;
                    }
                }

                if ($scope.categories[i].Workflows.length == 0) {
                    $scope.categories.splice(i, 1);
                    i--;
                }
            }
        }
    };
    // 设置流程是否常用
    $scope.changeFavorite = function (category, workflowCode) {
        for (var i = 0; i < $scope.categories.length; i++) {
            if ($scope.categories[i].DisplayName == category) {
                for (var j = 0; j < $scope.categories[i].Workflows.length; j++) {
                    if ($scope.categories[i].Workflows[j].WorkflowCode == workflowCode) {
                        $scope.categories[i].Workflows[j].IsFavorite = !$scope.categories[i].Workflows[j].IsFavorite;
                        $scope.setFavorite($scope.categories[i].Workflows[j]);
                    }
                }
            }
        }

        event.stopPropagation();
    },
    $scope.setFavorite = function (workflow) {
        var url = $scope.setting.serviceUrl + "/SetFavorite?callback=JSON_CALLBACK";
        url += "&userId=" + $scope.user.ObjectID;
        url += "&mobileToken=" + $scope.user.MobileToken;
        url += "&workflowCode=" + workflow.WorkflowCode;
        url += "&isFavorite=" + workflow.IsFavorite;

        if (workflow.IsFavorite) {
            // 常用流程中增加
            var exists = false;
            for (var i = 0; i < $scope.categories.length; i++) {
                if ($scope.categories[i].DisplayName == $scope.FavoriteCategory) {
                    $scope.categories[i].Workflows.push(workflow);
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                $scope.categories.insert(0, { "DisplayName": $scope.FavoriteCategory, "Workflows": [] });
                $scope.categories[i].push(workflow);
            }
        }
        else {
            // 从常用流程去除
            for (var i = 0; i < $scope.categories.length; i++) {
                if ($scope.categories[i].DisplayName == $scope.FavoriteCategory) {
                    for (var j = 0; j < $scope.categories[i].Workflows.length; j++) {
                        if ($scope.categories[i].Workflows[j].WorkflowCode == workflow.WorkflowCode) {
                            $scope.categories[i].Workflows.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }

        $http.jsonp(url).success(function (result) { }).error(function () { });
    },
    // 显示搜索
    $scope.showSearch = function () {
        $scope.displaySearchButton = !$scope.displaySearchButton;
        if (!$scope.displaySearchButton) {
            $scope.searchKey = "";
            $scope.doSearch();
        }
        focus("searchKey");
    }
    // 发起流程
    $scope.startWorkflow = function (workflowCode) {
        var url = $scope.setting.startInstanceUrl + workflowCode + "&LoginName=" + encodeURI($scope.user.Code) + "&LoginSID=" + $scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
        commonJS.openWorkItem($scope, url);
    };
    $scope.loadWorkflows();
});