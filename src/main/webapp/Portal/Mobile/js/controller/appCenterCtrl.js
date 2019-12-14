module.controller('appCenterCtrl', function ($scope, $rootScope, $ionicHistory, $state, commonJS, appCenterService, focus) {
    $scope.$on("$ionicView.enter", function (scopes, states) {
        //update by luxm设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.tabs.apps);
            dd.biz.navigation.setRight({
                show: false,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: "",//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                },
                onFail: function (err) {
                }
            });
        }
    });
    $scope.init = function () {
        //update by luxm
        //前端传过来的地址portal首字母小写寻找不倒图片地址
        $scope.setting.upHttpUrl = $scope.setting.httpUrl.substring(0, $scope.setting.httpUrl.indexOf("portal")) + "Portal";
        //显示控制器
        $scope.$on('$ionicView.enter', function () {
            //钉钉头部显示
            if ($rootScope.dingMobile.isDingMobile) {
                $scope.topStyle = "0px";
            } else {
                $scope.topStyle = "44px";
            }
            $rootScope.hideTabs = false;
            console.log("ionicView.enter");

        });
        $scope.doRefresh = function () {
            commonJS.loadingShow();
            $scope.show = false;//控制标题栏是否显示
            $scope.transrate = 0;//控制标题栏透明度

            $scope.getAppList();
        }
        $scope.show = false;//控制标题栏是否显示
        $scope.transrate = 0;//控制标题栏透明度

        $scope.getAppList();
    };
    $scope.getAppList = function () {
        // window.console.log($scope.setting);
        //update by luxm
        //钉钉登录跳转到应用页面
        var appCode = commonJS.getUrlParam("appCode");
        if (!appCode) {
            appCode = "";
        }
        var options = {
            AppCode: appCode,
            t: Math.random()
            //DisplayName:""
        };
        $scope.AllApps = [];

        commonJS.loadingShow();
        appCenterService.getAppList(options).then(function (result) {
            commonJS.loadingHide();
            // window.console.log(result);
            // window.console.log(result.AllApps);
            $scope.AllApps = result.AllApps;
        }, function (reason) {
            commonJS.loadingHide();
            commonJS.showShortMsg("setcommon f15", reason, 2000);
        })
    }
    $scope.openAppCenterItem = function (AppCode, DisplayName) {
        $state.go("appCenterItem", {'AppCode': AppCode, 'DisplayName': DisplayName});
    }
    $scope.init();
});