var settingsLang = module.controller('settingsLangCtrl', function ($scope, $rootScope, $state, $ionicHistory, logout, $ionicLoading, commonJS,$ionicPlatform) {
    $scope.$on("$ionicView.enter", function (scopes, states) {
        $ionicHistory.clearCache();
        $rootScope.hideTabs = false;
        //设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.login.systemSetting);
            dd.biz.navigation.setRight({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: $rootScope.languages.confirm,//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                    $scope.setIP();
                },
                onFail: function (err) { }
            });
        }

    });

    $scope.init = function () {
        $scope.initSettings();//系统设置
        $scope.initLanguages();//语言设置

    };
    /*********系统设置***************/
    $scope.initSettings = function () {
        //设置页面 返回
        $scope.goback = function () {
          // $ionicHistory.goBack();
            $state.go("tab.home");
        }
    };
      /*********语言切换***************/
    $scope.initLanguages = function () {
        $scope.languages = [
               { text: "中文", value: "zh_cn" },
               { text: "English", value: "en_us" }
        ];
        var mobile = window.navigator.userAgent;
        // $scope.mobile = mobile
        String.prototype.endWith = function(s){
            if(s == null|| s==""|| this.length == 0||s.length > this.length)
                return false;
            if(this.substring(this.length-s.length) == s)
                return true;
            else
                return false;
            return true;
        };

        //语言页面 完成  返回
        $scope.gobackSetting = function () {
            $scope.isLanguages= false;
            $state.go("settings");
        };
         $scope.changelanguages = function () {
             //改变语言并缓存
             window.localStorage.setItem('H3.Language', $scope.$parent.H3.language);
             if ($scope.$parent.H3.language == 'en_us') {
                 config.languages.current = config.languages.en;
                 //安卓 app
                 if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
                     commonJS.AndroidJsBridge(function(bridge) {
                         bridge.callHandler(
                             'submitFromWeb'
                             , {'param': 'LANGUAGE_EN'}
                             , function(responseData) {
                             }
                         );
                     })
                 }
                 // ios app
                 if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
                     commonJS.IosJsBridge(function(bridge) {
                         bridge.callHandler(
                             'ios_change_lan'
                             , 'en' // 英文
                             , function(responseData) {
                             }
                         );
                     });
                 }
             }
             else if ($scope.$parent.H3.language == 'zh_cn') {
                 config.languages.current = config.languages.zh;
                 //安卓 app
                 if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
                     commonJS.AndroidJsBridge(function(bridge) {
                         bridge.callHandler(
                             'submitFromWeb'
                             , {'param': 'LANGUAGE_ZH'}
                             , function(responseData) {
                             }
                         );
                     })
                 }
                 // ios app
                 if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
                     commonJS.IosJsBridge(function(bridge) {
                         bridge.callHandler(
                             'ios_change_lan'
                             ,'zh-Hans' // 中文
                             , function(responseData) {
                                 alert('中文')
                             }
                         );
                     });
                 }
             }
             commonJS.setLanguages();
             setTimeout(function () {
                 $scope.gobackSetting();
             },300)
         };
    };
    $scope.init();
});
