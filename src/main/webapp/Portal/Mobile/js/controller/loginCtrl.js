module.controller('loginCtrl', function ($scope, $rootScope, $ionicHistory, $state, commonJS, login, focus, $cordovaDevice, $ionicPlatform) {
    $scope.$on("$ionicView.beforeEnter", (event, data) => {
        // console.log('beforeEnter')
    });
    $scope.init = function () {
        //显示控制器
        $scope.$on('$ionicView.enter', function () {
            var mobile = window.navigator.userAgent;
            String.prototype.endWith = function(s){
                if(s == null|| s==""|| this.length == 0||s.length > this.length)
                    return false;
                if(this.substring(this.length-s.length) == s)
                    return true;
                else
                    return false;
                return true;
            };
            //ios app
            if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
                commonJS.IosJsBridge(function(bridge){
                    bridge.callHandler(
                        'ios_set'
                        ,{'type': '1'} // type 1表示显示 2表示隐藏
                        , function(responseData) {
                        }
                    );
                    bridge.callHandler(
                        'ios_jpushId'
                        , function(responseData) {
                            console.log(responseData,'极光id')
                            responseData = responseData.replace(/\"/g, "");
                            $scope.mobile = responseData;
                            $scope.clientInfo.JPushID = responseData;
                            if(!responseData) {
                                commonJS.showShortMsg("setcommon f15", '暂无极光id', 2000);
                            }
                        }
                    );
                });
            }

            //安卓 app
            if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
                commonJS.AndroidJsBridge(function(bridge) {
                    bridge.callHandler(
                            'submitFromWeb'
                            , {'param': 'JIGUANG'}
                            , function(responseData) {
                                // console.log(JSON.stringify(responseData))
                                console.log(responseData,'极光id')
                                $scope.mobile = responseData
                                $scope.clientInfo.JPushID = responseData;
                                if(!responseData) {
                                    commonJS.showShortMsg("setcommon f15", '暂无极光id', 2000);
                                }
                            }
                        );
                    bridge.callHandler(
                            'submitFromWeb'
                            , {'param': 'SETTING_SHOW'}
                            , function(responseData) {
                                console.log(responseData,'responseData')
                            }
                        );
                    bridge.registerHandler('SETTING_BACK',function(data,responseCallback){
                        console.log(data,'-------');
                    });
                })
            }

            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $rootScope.hideTabs = false;
            // console.log("ionicView.enter");
            $scope.autoLogin();
        });
        $scope.show = false;//控制标题栏是否显示
        $scope.transrate = 0;//控制标题栏透明度
    };

    //登录页面查看密码
    $scope.showPassword = false;
    $scope.togglePassword = function ($event) {
        $scope.showPassword = !$scope.showPassword;
    };

    //跳转settings
    $scope.goSettings = function () {
        $state.go('settings');
    };

    //自动登录
    $scope.changeAutoLogin = function () {
        window.localStorage.setItem('OThinker.H3.Mobile.Setting', JSON.stringify($scope.$parent.setting));
    };

    $scope.autoLogin = function () {
        if (!window.localStorage.getItem('OThinker.H3.Mobile.Setting')) {
            //用户清除缓存无法自动登录
            return;
        }
        var auto = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.Setting')).autoLogin;
        if (auto) {
            var user = window.localStorage.getItem('OThinker.H3.Mobile.User');
            $scope.$parent.user.code = user.Code;
            $scope.$parent.user.password = user.Password;
            $scope.validateUser();
        }
    };

    // 登录逻辑
    $scope.validateUser = function () {
        if (!$scope.$parent.user.Code) {
            focus("userCode");
            commonJS.showShortMsg("setcommon f15", $rootScope.languages.enterUserName, 2000);
            return;
        }
        if (!$scope.$parent.user.Password) {
            focus("userPassword");
            commonJS.showShortMsg("setcommon f15", $rootScope.languages.enterPassword, 2000);
            return;
        }
        commonJS.loadingShow();
        var options = {};
       if (window.cordova) {
             //某些手机在启动时获取不到JPushID
             if ($scope.clientInfo.JPushID == "") {
               if (window.plugins && window.plugins.jPushPlugin) {
                 window.plugins.jPushPlugin.getRegistrationID(function (id) {
                   $scope.clientInfo.JPushID = id;
                 });
               }
             }
             var pwd = $.md5($scope.$parent.user.Password);
             // url = $scope.setting.httpUrl + "/ValidateLogin?callback=JSON_CALLBACK";
             // url += "&userCode=" + $scope.user.Code;
             // url += "&password=" + encodeURIComponent(pwd);
             // url += "&uuid=" + $scope.clientInfo.UUID;
             // url += "&jpushId=" + $scope.clientInfo.JPushID;
             // url += "&mobileToken=" + $scope.user.MobileToken;
             // url += "&mobileType=" + $scope.clientInfo.Platform;
             // url += "&isAppLogin=true";
           options = {
               userCode: $scope.$parent.user.Code,
               password: pwd,
               isMobile:"1",
               jPushID: $scope.clientInfo.JPushID, // app登录 JPushID
               random: new Date().getTime()
           };
       }
       else {//浏览器
            var encryptedPwd = $.md5($scope.$parent.user.Password);
            options = {
                userCode: $scope.$parent.user.Code,
                password: encryptedPwd,
                isMobile: "1",
                jPushID: $scope.clientInfo.JPushID, // app登录 JPushID
                random: new Date().getTime()
            };
       }
        login.browser(options).then(function (result) {
            commonJS.loadingHide();
            // console.log(result);
            if (result.Success == true) {
                // 本地存储服务器相对路径
                if (result.PortalRoot == null) {
                    window.localStorage.setItem("H3.PortalRoot", "/Portal");
                }
                else {
                    window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                }
                //登录成功
                $rootScope.loginInfo.success = true;
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                config.portalroot = result.PortalRoot.toLocaleLowerCase();
                $scope.$parent.user.ObjectID = result.User.ObjectID;
                $scope.$parent.user.ParentID = result.User.ParentID;
                $scope.$parent.user.DirectParentUnits = result.DirectoryUnits;
                $scope.$parent.user.Code = result.User.Code;
                $scope.$parent.user.Name = result.User.Name;
                $scope.$parent.user.MobileToken = result.User.MobileToken;
                if (result.User.ImageUrl.indexOf("/user") > -1) {
                    result.User.ImageUrl = "";
                }
                $scope.$parent.user.ImageUrl = result.User.ImageUrl == "" ? "" : $scope.setting.tempImageUrl + result.User.ImageUrl;
                $scope.$parent.user.Email = result.User.Email;
                $scope.$parent.user.DepartmentName = result.User.DepartmentName;
                $scope.$parent.user.OfficePhone = result.User.OfficePhone;
                $scope.$parent.user.Mobile = result.User.Mobile;
                $scope.$parent.user.WeChat = result.User.WeChat;
                $scope.$parent.user.Appellation = result.User.Appellation;

                //所在部门信息
                $rootScope.departmentInfo={};
                $rootScope.departmentInfo.UserName=result.User.Name;
                $rootScope.departmentInfo.UserId=result.User.ObjectID;
                $rootScope.departmentInfo.DepartmentName=result.OUDepartName;
                $rootScope.departmentInfo.DepartmentId=result.User.ParentID;
                $rootScope.departmentInfo.UserGender=result.User.Gender;
                //本人登录时获取到的imageurl为空，所以根据gender加img
                if(result.User.ImageUrl.length==0&&result.User.Gender==2){
                    $rootScope.departmentInfo.UserImageUrl= "../img/TempImages/userfemale.jpg";
                }else if(result.User.ImageUrl.length==0&&result.User.Gender!=2){
                    $rootScope.departmentInfo.UserImageUrl= "../img/TempImages/usermale.jpg";
                }else{
                    $rootScope.departmentInfo.UserImageUrl=result.User.ImageUrl;
                }

                // 存储最近一次登录的用户信息
                window.localStorage.setItem("OThinker.H3.Mobile.User", JSON.stringify($scope.user));
                // 登录成功，转向主页面
                $state.go("tab.home");
            } else {
                //登录失败
                commonJS.showShortMsg("setcommon f15", $rootScope.languages.loginError, 2000);
            }
        }, function (reason) {
            commonJS.loadingHide();
            commonJS.showShortMsg("setcommon f15", reason, 2000);
        })
    };

    $scope.init();
});
