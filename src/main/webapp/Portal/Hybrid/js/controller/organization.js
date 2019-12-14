module.controller('organizationCtrl', function ($scope, $state, $stateParams,
    $ionicSideMenuDelegate, $http, commonJS) {
    $scope.userId = "";
    $scope.parentParentId = "";
    $scope.loadComplete = false;

    $scope.init = function () {
        $scope.isCompany = false;
        $scope.OrgUnits = [];
        $scope.OrgUsers = [];
        $scope.parentId = "";
        $scope.parentParentId = "";
        $scope.ParentName = "";
        $scope.DividerDisplay = false;
        $scope.searchKey = "";
        $scope.displaySearchButton = false;
        commonJS.loadingShow();
        $scope.loadComplete = false;
    };

    // 每次进入View时触发
    $scope.$on("$ionicView.enter", function (scopes, states) {
        if (!$scope.userId || $scope.userId != $scope.user.ObjectID) {
            $scope.init();
            $scope.loadOrg();
            $scope.userId = $scope.user.ObjectID;
        }
    });

    $scope.loadOrg = function () {
        var orgId = $stateParams.id;
        var url = $scope.setting.serviceUrl + "/GetOrganizationByParent?callback=JSON_CALLBACK";
        url += "&userCode=" + $scope.user.Code;
        url += "&mobileToken=" + $scope.user.MobileToken;
        url += "&parentId=" + orgId;

        $http.jsonp(url)
           .success(function (result) {
               var resultValue = result;
               if (!resultValue) return;

               $scope.OrgUnits = resultValue.orgUnits;
               $scope.OrgUsers = resultValue.orgUsers;
               if ($scope.OrgUnits.length > 0 && $scope.OrgUsers.length > 0) {
                   $scope.DividerDisplay = true;
               }
               $scope.ParentName = resultValue.parentName;
               $scope.loadComplete = true;
               $scope.parentId = resultValue.parentId;
               $scope.parentParentId = resultValue.parentParentId || "";
               $scope.isCompany = $scope.parentParentId == "";
               commonJS.loadingHide();
           }).error(function () {
               commonJS.loadingHide();
           });
    }
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    // 打开指定组织
    $scope.openUnit = function (objectId) {
        $state.go("home.organization", {
            id: objectId
        });
    }
    // 打开指定用户
    $scope.openUser = function (objectId) {
        $state.go("user", {
            id: objectId
        });
    }
    // 搜索用户
    $scope.doSearch = function () {
        $scope.OrgUnits = [];
        $scope.OrgUsers = [];

        if (!$scope.searchKey) {
            $scope.loadOrg();
        }
        else {
            var url = $scope.setting.serviceUrl + "/SearchUser?callback=JSON_CALLBACK";
            url += "&userCode=" + $scope.user.Code;
            url += "&mobileToken=" + $scope.user.MobileToken;
            url += "&parentId=" + $scope.parentId;
            url += "&searchKey=" + $scope.searchKey;

            $http.jsonp(url)
               .success(function (result) {
                   if (!result) return;

                   $scope.OrgUsers = result.orgUsers;
                   $scope.DividerDisplay = false;
                   $scope.loadComplete = true;
                   commonJS.loadingHide();
               }).error(function () {
                   commonJS.loadingHide();
               });
        }
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
    // 点击电话
    $scope.openTel = function () {
        event.stopPropagation();
    }
});