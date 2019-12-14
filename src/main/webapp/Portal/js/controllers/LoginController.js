app.controller('LoginController', ['$rootScope', '$scope', '$translate', '$http', '$location', '$state', '$stateParams', '$timeout', '$interval', 'ControllerConfig',
    function ($rootScope, $scope, $translate, $http, $location, $state, $stateParams, $timeout, $interval, Controller) {
        $scope.LoginSuccess = true;
        $scope.ConnectionFailed = true;
        $scope.EnginePasswordValid = true;//引擎密码错误
        //add by luwei@Future 2018.8.10
        $scope.LoginFailTimesExceed = true;
        // $scope.errorText = '用户名密码错误';
        $scope.errorText = $translate.instant("LoginController.NotInvalid");
        $scope.loginFail = false;
        $scope.timeout_upd = ''; // 定时器
        $scope.loginDisabled = false;// 禁止点击
        $scope.InvalidCodeError = true;//验证码错误
        $scope.inputInvalidCode = true;//请输入验证码
        $scope.validCode = false;//登陆验证码
        $scope.showPass = false
        $scope.inputType = 'password'
        $scope.validCodeImg = "Validate/createCode?userCode=&time=" + new Date().getTime();
        $rootScope.$on('$viewContentLoaded', function () {
        });

        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, {reload: true});
        });

        $scope.getLanguage = function () {
            $scope.LanJson = {
                Code: $translate.instant("LoginController.EnterName"),
                Password: $translate.instant("LoginController.EnterPassword"),
                ValidCode: $translate.instant("LoginController.ValidCode"),
                ApplicationName: $translate.instant("LoginController.ApplicationName"),
            }
            if ($scope.LanJson.Code === "LoginController.EnterName") {
                $scope.LanJson = {
                    Code: $translate.instant("LoginController.EnterName"),
                    Password: $translate.instant("LoginController.EnterPassword")
                }
            }
        }
        $scope.getLanguage();

        //钉钉单点登录开始
        // 处理单点登录
        $scope.getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        };

        var loginFrom = $scope.getUrlParam("loginfrom");
        var state = $scope.getUrlParam("state");
        var code = $scope.getUrlParam("code");
        var workItemID = $scope.getUrlParam("WorkItemID")
        //根据URL参数判断是否钉钉登录
        if (loginFrom == "dingtalk") { //TODO
            $scope.IsSSO = true;

            //commonJS.loadingHide();
            if (code && state && !workItemID) {
                $scope.loginFail = false;
                $.ajax({
                    url: "Organization/ValidateLoginForDingTalkPC",
                    data: {
                        state: state,
                        code: code
                    },
                    async: false,
                    success: function (result) {
                        $scope.$emit("LoginIn", result);
                        // 设置主界面
                        if (result.Success) {
                            var redirectUrl = window.localStorage.getItem("H3.redirectUrl");
                            if (redirectUrl && redirectUrl != "" && redirectUrl.indexOf("Redirect.html") != -1) {
                                // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   begin
                                if (result.PortalRoot == null) {
                                    window.localStorage.setItem("H3.PortalRoot", "/Portal");
                                } else {
                                    window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                                }
                                // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   end
                                //window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                                window.localStorage.setItem("H3.redirectUrl", "");
                                $timeout(function () {
                                    window.location.href = redirectUrl;
                                }, 500)
                            } else {
                                //去掉参数,跳转到待办页面
                                var rUrl = window.location.href.replace(window.location.search, "")
                                var index = rUrl.indexOf("#/");
                                rUrl = rUrl.substring(0, index);
                                window.location.href = rUrl + "#/app/Workflow/MyUnfinishedWorkItem"
                            }
                            $scope.loginFail = false;
                        }
                    }
                })
            }
        }
// 更新验证码
        $scope.changeUrl = function () {
            $scope.validCodeImg = "Validate/createCode?userCode=&time=" + new Date().getTime();
        }
        $scope.removeValid = function () {
            $scope.validCode = false;
        }
        $scope.handleShowPassword = function () {
            $scope.showPass = !$scope.showPass
            if($scope.showPass){
                $scope.inputType = 'text'
            } else {
                $scope.inputType = 'password'
            }
        }
        $scope.forgetPass = function () {
        }
// 登陆
        $scope.loginIn = function () {
            // debugger
            $interval.cancel($scope.timeout_upd);
            $scope.userCode = $("#txtUser").val();
            $scope.userPassword = $("#txtPassword").val();
            $scope.userValidCode = $("#codevalidate").val();
            // var $text1 = document.querySelector('#txtUser');
            // var $text2 = document.querySelector('#txtPassword');
            if (!$scope.userCode) {
                // $text1.setCustomValidity($translate.instant("LoginController.EnterName"));
                // focus("userCode");
                $scope.loginFail = true;
                $scope.errorText = $translate.instant("LoginController.EnterName");
                $scope.timeout_upd = $interval(function () {
                    $scope.loginFail = false
                }, 2000);
                return;
            }
            if (!$scope.userPassword) {
                // $text2.setCustomValidity($translate.instant("LoginController.EnterPassword"));
                // focus("userPassword");
                $scope.loginFail = true;
                $scope.errorText = $translate.instant("LoginController.EnterPassword");
                $scope.timeout_upd = $interval(function () {
                    $scope.loginFail = false
                }, 2000);
                return;
            }
            // $text1.setCustomValidity('');
            // $text2.setCustomValidity('');
            var encryptedPwd = $.md5($scope.userPassword);
            $scope.loginDisabled = true;
            //add by luwei@Future 2018.8.10
            $http({
                url: Controller.Organization.LoginIn,
                data: {
                    userCode: this.userCode,
                    password: encryptedPwd,
                    userValidCode: this.userValidCode,
                    random: new Date().getTime()
                },
                method: 'post'
            })
                .success(function (result, header, config, status) {
                    $scope.$emit("LoginIn", result);
                    // 设置主界面
                    if (result.Success) {
                        var redirectUrl = window.localStorage.getItem("H3.redirectUrl");
                        $scope.loginFail = false
                        if (redirectUrl && redirectUrl != "" && redirectUrl.indexOf("Redirect.html") != -1) {
                            // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   begin
                            if (result.PortalRoot == null) {
                                window.localStorage.setItem("H3.PortalRoot", "/Portal");
                            } else {
                                window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                            }
                            // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   end
                            window.localStorage.setItem("H3.redirectUrl", "");
                            $timeout(function () {
                                window.location.href = redirectUrl;
                                $scope.loginDisabled = false;
                            }, 500)
                        } else {
                            $state.go("app.MyUnfinishedWorkItem", {TopAppCode: "Workflow"});
                        }
                        $interval.cancel($scope.timeout_upd)
                        // $scope.LoginSuccess = true;
                    } else {
                        $scope.loginDisabled = false;
                        if (result.failedCount) {
                            $scope.changeUrl(); // 更新验证码
                            $scope.validCode = true;
                        }
                        $scope.loginFail = true;
                        $scope.errorText = result.Message;
                        $scope.timeout_upd = $interval(function () {
                            $scope.loginFail = false
                        }, 3000);
                    }
                })
                .error(function (data, header, config, status) {
                    $scope.loginFail = true;
                    $scope.errorText = $translate.instant("LoginController.NetError");
                    $scope.loginDisabled = false;
                });
        }
    }]);