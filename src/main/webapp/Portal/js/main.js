'use strict';
/* 
    Controllers 
*/

String.prototype.endWith = function (endStr) {
    var d = this.length - endStr.length;
    return (d >= 0 && this.lastIndexOf(endStr) === d)
};

angular.module('app');

app.controller('AppCtrl', ['$rootScope', '$scope', '$translate', '$localStorage', '$window', '$interval', '$http', '$state', '$stateParams', '$location', '$document', '$modal', 'ControllerConfig', '$filter', '$compile', '$timeout', 'menuhandle',
        function ($rootScope, $scope, $translate, $localStorage, $window, $interval, $http, $state, $stateParams, $location, $document, $modal, ControllerConfig, $filter, $compile, $timeout, menuhandle) {
             var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            $scope.password = "";
            $scope.myScroll = null;
            // config
            $scope.app = {
                name: "H3 BPM",
                version: '1.0.1',
                locked: false,
                logoSimple: "img/H1.jpg",
                logoFull: "img/logo.jpg",
                // 颜色定义
                color: {
                    primary: '#7266ba',
                    info: '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger: '#f05050',
                    light: '#e8eff0',
                    dark: '#3a3f51',
                    black: '#1c2b36'
                },
                // 页面显示定义
                settings: {
                    themeID: 8,
                    navbarHeaderColor: '',
                    navbarCollapseColor: '',
                    asideColor: '',
                    headerFixed: true,
                    asideFixed: true,
                    asideFolded: false,
                    asideDock: false,
                    container: false,
                    allowSetting: false,  // 是否可配置选项
                    autoLogin: false      // 是否允许
                }
            }
            //Html编码获取Html转义实体
            $scope.htmlEncode = function (value) {
                return $('<div/>').text(value).html();
            }

            //Html解码获取Html实体
            $scope.htmlDecode = function (value) {
                return $('<div/>').html(value).text();
            }

            // 设置信息本地存储
            if (angular.isDefined($localStorage.settings)) {
                $scope.app.settings = $localStorage.settings;
            }
            else {
                $localStorage.settings = $scope.app.settings;
            }

            $scope.$watch('app.settings', function () {
                if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
                    $scope.app.settings.headerFixed = true;
                }
                $localStorage.settings = $scope.app.settings;
            }, true);

            // 设置语言
            $scope.setLang = function (langKey, $event) {
                console.log(langKey, 'langKey');
                console.log($scope.selectLang, '$scope.selectLang');
                $scope.changeSetLang(langKey);
            };

            $scope.changelang = function() {
                if ($scope.selectLang === '中文') {
                    $scope.changeSetLang('en')
                } else if ($scope.selectLang === 'English'){
                    $scope.changeSetLang('zh_CN')
                }
            }
            $scope.changeSetLang = function(langKey) {
                // set the current lang
                $scope.selectLang = $scope.langs[langKey];
                // You can change the language during runtime
                $translate.use(langKey);
                $scope.lang.isopen = !$scope.lang.isopen;
                setItem(langKey);
                window.sessionStorage.removeItem("LanguageData");

                //add by luwei : 后端国际化
                $.ajax({
                    type: "post",
                    url: "/Portal/language/change",
                    dataType: "json",
                    data: {"lang": langKey},
                    success: function (data) {
                        if (data && data.success) {
                        } else {
                            // console.log(data.message);
                        }
                    },
                    error: function (a, b, c) {
                        // console.log(a);
                    }
                })
            }
            // 获取是否是手机客户端访问
            $scope.isSmartDevice = function ($window) {
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }
            // 锁定
            $scope.doLock = function () {
                $scope.app.locked = true;
                $scope.LoginSuccess = true;
                //状态记录到服务器
                $http({
                    url: "Organization/DoLock",
                    params: {}
                })
                    .success(function (data) {
                        $scope.user.DoLock = true;
                    })
            }

            // 解锁
            $scope.doUnlock = function () {
                // var password = $("#password").val();
                // var encryptedPwd = $.md5($("#password").val());
                $http({
                    method: 'post',
                    url: "Organization/DoUnlock",
                    params: {
                        // password: password
                        password: $.md5($("#password").val())
                    }
                }).success(function (data) {
                    if (data) {
                        $("#password").val("");
                        $scope.app.locked = false;
                        $scope.user.DoLock = false;
                        $scope.LoginSuccess = true;
                    } else {
                        $scope.LoginSuccess = false;
                    }
                }).error(function () {
                })
            }
            //切换模式,设计、浏览
            $scope.StartEdit = function () {
                if ($stateParams.Mode == "Design") {
                    $state.go($state.$current.self.name, {OT_EditorModel: false, Mode: ""}, {reload: true});
                    return;
                }
                if (typeof ($scope.OT_EditorModel) == "undefined" || !$scope.OT_EditorModel) {
                    $state.go($state.$current.self.name, {OT_EditorModel: true, Mode: "Design"}, {reload: true});
                } else {
                    $state.go($state.$current.self.name, {OT_EditorModel: false, Mode: ""}, {reload: true});
                }
            }

            //显示菜单
            $scope.ShowMenu = function () {
                if ($scope.user) {
                    //重新定义菜单显示逻辑
                    if ($scope.menuIndex) {}
                    else {
                        $scope.menuIndex = menuhandle.getMenuIndex($scope.user.FunctionViewModels);
                    }
                    $scope.menuData = menuhandle.getAsideMenus($scope.user.FunctionViewModels, $scope.menuIndex);
                    // console.log($scope.menuData,' $scope.menuData')
                }
            }
            //收起左侧
            $scope.openAside = function () {
                $scope.app.settings.asideFolded =  !$scope.app.settings.asideFolded
            }
            $scope.GetTitleName =function() {
                // console.log($localStorage.settings, '$localStorage.settings;')
            }
            // 获取当前用户登录状态并回调callbackFun
            $scope.getUserLoginStatus = function (callbackFun) {
                // 获取当前用户
                $.ajax({
                    url: ControllerConfig.Organization.GetCurrentUser + '?' +new Date().getTime(),
                    type: "GET",
                    dataType: "JSON",
                    async: false,
                    params: {
                        random: new Date().getTime()
                    },
                    success: function (result, header, config, status) {
                        var loginStatus = false;
                        if (result.Success) {
                            loginStatus = true;
                        }

                        callbackFun && callbackFun(loginStatus);
                    }
                })
            }

            //取消登录态监听器
            $scope.unregisterListenerOfLoginStatus = function () {
                if ($scope.goLoginByInvalid) {
                    $interval.cancel($scope.goLoginByInvalid);
                }
            }

            //注册登录态监听器 每35分钟执行一次
            $scope.registerListenerOfLoginStatus = function () {
                $scope.goLoginByInvalid = $interval(function () {
                    $scope.getUserLoginStatus(function(loginStatus){
                        if(loginStatus == false){
                            window.top.location.href = "./#/platform/login";
                            $scope.unregisterListenerOfLoginStatus();
                        }
                    })
                }, 60 * 1000 * 35);
            }

            //刷新
            $scope.refresh = function () {
                // 获取当前用户
                $.ajax({
                    url: ControllerConfig.Organization.GetCurrentUser + '?' +new Date().getTime(),
                    type: "GET",
                    dataType: "JSON",
                    async: false,
                    params: {
                        random: new Date().getTime()
                    },
                    success: function (result, header, config, status) {

                        if(result.casEnable){
                            window.localStorage.setItem("H3.casEnable", true);
                        } else {
                            window.localStorage.setItem("H3.casEnable", false);
                        }

                        var currLocation = window.location.href;
                        if (!result.Success) {

                            if(result.casEnable){
                                window.top.location.href = result.loginUrl;
                            } else {
                                if(currLocation.indexOf('/platform/login') != -1 || window.location.pathname == '/Portal/'){
                                    return;
                                } else {
                                    window.top.location.href = "./#/platform/login";
                                }
                            }
                        }

                         else {
                            $scope.user = result.User;
                            $scope.user.ManagerName = result.ManagerName;
                            $scope.user.OUDepartName = result.OUDepartName;
                            $scope.user.chkEmail = result.chkEmail;
                            $scope.user.chkMobileMessage = result.chkMobileMessage;
                            $scope.user.chkWeChat = result.chkWeChat;
                            $scope.user.chkApp = result.chkApp;
                            $scope.user.chkDingTalk = result.chkDingTalk;
                            $scope.user.FunctionViewModels = result.Functions;
                            $scope.user.ImageUrl = $scope.user.ImageUrl + "?" + $filter("date")(new Date(), "yyyyMMddHHmmss");
                            $scope.ShowMenu();
                            //update by ouyangsk refresh方法与$viewContentLoaded方法因为是异步请求存在导致先后顺序不一定，所以在得到CurrentUser后再设置一次锁定状态，避免view.enter方法里的锁定状态失效
                            if ($scope.user.DoLock) {
                                $scope.app.locked = true;
                            }
                            if (result.PortalRoot == null) {
                                window.localStorage.setItem("H3.PortalRoot", "/Portal");
                            }else {
                                window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                            }

                            if(currLocation.indexOf('/platform/login') != -1 || currLocation.endWith('/index.html') || window.location.pathname == '/Portal/'){
                                window.top.location.href = "./#/app/Workflow/MyUnfinishedWorkItem";
                            }
                        }
                    },
                    error: function (a, b, c) {
                        //$state.go("platform.login");
                        // alert("error");
                        window.top.location.href = "./#/platform/login"
                    }
                })
            }
            //钉钉单点登录开始
            // 处理单点登录
            $scope.getUrlParam = function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            };
            var loginFrom = $scope.getUrlParam("loginfrom");
            if (loginFrom !== "dingtalk") { //TODO
                $scope.refresh();
            }
            //获取待办、待阅、我的流程数量
            $scope.GetItemCount = function () {
                var random = new Date().getTime();
                $http({
                    cache: false,
                    url: ControllerConfig.WorkItem.GetWorkCount,
                    params: {
                        random: random
                    }
                })
                    .success(function (result, header, config, status) {
                        if (result.Success == false && result.ExceptionCode == 1) {
                            //登陆超时
                            $scope.unregisterAutoRefresh();
                            $state.go("platform.login");
                        } else {
                            $scope.MyCount = result.Extend;
                        }
                    })
            }
            //取消自动刷新
            $scope.unregisterAutoRefresh = function () {
                if ($scope.autoRefresh) {
                    $interval.cancel($scope.autoRefresh);
                }
            }
            //注册自动刷新
            $scope.registerAutoRefresh = function () {
                $scope.autoRefresh = $interval(function () {
                    $scope.GetItemCount();
                }, 60 * 1000);
            }

            // 退出系统
            $scope.loginOut = function (){
                $scope.unregisterListenerOfLoginStatus();

                var casEnable = window.localStorage.getItem("H3.casEnable");
                if(casEnable == 'true'){
                    window.top.location.href = "/logout"
                } else {
                    $http({
                        url: ControllerConfig.Organization.LoginOut,
                        params: {
                            rendom: new Date().getTime()
                        }
                    })
                        .success(function (result, header, config, status) {
                            $scope.user = null;
                            $state.go("platform.login");
                        })
                        .error(function (data, header, config, status) {
                            $state.go("platform.login");
                        })
                }


            }

            // 每次进入View时触发
            $scope.$on('$viewContentLoaded', function (event) {
                $.notify.closeAll();//关闭所有弹窗
                // 每次进入view的时候判断监听器是否正在运行，并且用户是否是登录状态
                /*$scope.getUserLoginStatus(function(loginStatus){
                    if(!$scope.goLoginByInvalid && loginStatus == true){
                        $scope.registerListenerOfLoginStatus();
                    }
                })*/

                /*$scope.getUserLoginStatus(function(loginStatus){
                    if(loginStatus == true){
                        //$scope.registerListenerOfLoginStatus();
                        window.top.location.href = "./#/app/Workflow/MyUnfinishedWorkItem";
                    }
                })*/
                setTimeout(function () {
                    if($('.apps-wrapper').length > 0) {
                        $scope.myScroll = new IScroll('.apps-wrapper', {
                            scrollbars: true,
                            bounce: false,
                            mouseWheel: true,
                            interactiveScrollbars: true,
                            shrinkScrollbars: 'scale',
                            fadeScrollbars: true
                        });
                    }
                }, 1500);

                if ($state.current.name != "" && $state.current.name.indexOf("platform.login") == -1) {
                    $scope.GetItemCount();
                } else {
                    $scope.unregisterAutoRefresh();
                }
                // 关闭表单
                $(".app-aside-right").removeClass("show");

                //锁定
                if ($scope.user && $scope.user.DoLock) {
                    $scope.app.locked = true;
                }

                // add by kinson.guo/郭臣  for 打开流程监控页面不显示左侧菜单栏 begin
                // 第三方系统调用URL 为 http://localhost:8099/Portal/index.html#/app/Workflow/QueryInstance?from=portal
                var from = $location.search()['from'];
                if (from == "portal") {
                    $scope.app.settings.asideFolded = true;
                } else {
                    // $scope.app.settings.asideFolded = false;
                }
                // add by kinson.guo/郭臣  for 打开流程监控页面不显示左侧菜单栏 end
            });

            // 登录事件，由LoginController触发
            $scope.$on("LoginIn", function (event, args) {
                if (args.Success) {
                    // console.log("$rootScope.PageId:" + $rootScope.PageId);
                    $rootScope.PageId = args.pageId;
                    $scope.Name = $translate.instant("HomePage.Workspace_MyUnfinishedWorkItem");
                    $scope.user = args.User;
                    $scope.user.ManagerName = args.ManagerName;
                    $scope.user.OUDepartName = args.OUDepartName;
                    $scope.user.chkEmail = args.chkEmail;
                    $scope.user.chkMobileMessage = args.chkMobileMessage;
                    $scope.user.chkWeChat = args.chkWeChat;
                    $scope.user.chkApp = args.chkApp;
                    $scope.user.chkDingTalk = args.chkDingTalk;
                    $scope.user.ImageUrl = $scope.user.ImageUrl + "?" + $filter("date")(new Date(), "yyyyMMddHHmmss");
                    $scope.user.FunctionViewModels = args.Functions;
                    // 记录当前PortalRoot的路径
                    // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   begin
                    if (args.PortalRoot == null) {
                        window.localStorage.setItem("H3.PortalRoot", "/Portal");
                    }
                    else {
                        window.localStorage.setItem("H3.PortalRoot", args.PortalRoot);
                    }
                    // modify by kinson.guo@20180621 解决edge浏览器第一次登录BPM访问路径拼接错误   end
                    //window.localStorage.setItem("H3.PortalRoot", args.PortalRoot);
                    // 隐藏当前窗体
                    if (window.parent && window.parent.hideLogin) {
                        window.parent.hideLogin();
                    }
                    $scope.user.Password = "";
                    //注册自动刷新
                    $scope.registerAutoRefresh();
                //    $scope.registerListenerOfLoginStatus();
                }
            });


            $scope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            });
            $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
                $scope.ShowMenu();

            });
            $scope.showApps = function() {
                setTimeout(function(){
                    $scope.myScroll.refresh();
                },300);
            }
            $scope.showMoreApps = function() {
            }
            $scope.switchFunction = function(list){
                if (list.Children.length<=0) {
                    $.notify({message: $translate.instant("HomePage.NoMenu"), status: "danger"});
                }
            };
            // 注册整个文档点击事件，关闭表单
            $document.on("click", function (event) {
                //update by ouyangsk 处理流程表单点两次菜单然后空白的问题
                if ($scope.$state.current.name == "app.EditBizObject") {
                    return;
                }
                //非待办发起
                if ($scope.$state.current.name != "app.MyUnfinishedWorkItem"
                    && $scope.$state.current.name != "app.MyWorkflow"
                    && $scope.$state.current.name != "app.MyUnfinishedWorkItemByGroup"
                    && $scope.$state.current.name != "app.MyUnfinishedWorkItemByBatch") {
                    $scope.ClosePage();
                    return;
                }

                //已经保存
                if ($scope.IsSave == true || $(event.target).parents("ul").hasClass("nav")) {
                    $scope.ClosePage();
                    return;
                }

                //点击收起左侧菜单时，不关闭表单
                if ($(event.target).hasClass("asideFolded")
                    || $(event.target).hasClass("fa-dedent")
                    || $(event.target).hasClass("fa-dedent-add")) {
                    return;
                }

                if ($(event.target).parents("form").length == 1) {
                    return;
                }


                if (!$(event.target).attr("target") || $(event.target).attr("target") != ".app-aside-right") {
                    var targeturl = $(".app-aside-right").find("iframe").attr("src");
                    if (targeturl && targeturl.indexOf("InstanceDetail") == -1) {
                        event.stopPropagation();
                        event.preventDefault();
                        // 弹出模态框
                        var modalInstance = $modal.open({
                            templateUrl: 'template/ProcessCenter/ConfirmModal.html',
                            size: "sm",
                            controller: function ($scope, $modalInstance) {
                                $scope.Title = $translate.instant("WarnOfNotMetCondition.Tips");
                                $scope.Message = $translate.instant("msgGlobalString.ConfirmLeave");
                                $scope.Button_OK = true;
                                $scope.Button_OK_Text = $translate.instant("QueryTableColumn.Button_OK");
                                $scope.Button_Cancel = true;
                                $scope.Button_Cancel_Text = $translate.instant("QueryTableColumn.Button_Cancel");
                                $scope.ok = function () {
                                    $modalInstance.close();  // 点击确定按钮
                                };
                                $scope.cancel = function () {
                                    // console.log('cancel')
                                    $modalInstance.dismiss('cancel'); // 退出
                                }
                            }
                        });
                        //弹窗点击确定的回调事件
                        modalInstance.result.then(function () {
                            $scope.ClosePage();
                        });
                        return;
                    }
                }
                $scope.ClosePage();
            });

            $scope.ClosePage = function () {
                $(".app-aside-right").find("iframe").attr("src", "");
                $(".app-aside-right").removeClass("show");
                $scope.IsSave = false;
            }

            $scope.modalDialogs = [];

            // 多语言设置
            $scope.lang = {isopen: false};

            $scope.langs = {zh_CN: '中文', en: 'English'};

            $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "中文";

            var setItem = function (langKey) {
                if (!langKey) {
                    if ($scope.selectLang == "中文") {
                        langKey = "zh_CN";
                    }
                }
                if (langKey == "zh_CN") {
                    window.localStorage.setItem("H3.Language", "zh_cn");
                } else {
                    window.localStorage.setItem("H3.Language", "en_us");
                }
            }

            setItem();

            // 获取当前是否移动端访问
            $scope.isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

            // 打开个人信息
            $scope.showUserInfoModal = function (userId) {
                // console.log(userId)
                //关闭流程状态图的div
                angular.element("div[class='ActivitySummary']").hide();
                // 弹出模态框
                var modalInstance = $modal.open({
                    templateUrl: "template/ProcessCenter/UserInfo.html",// 指向上面创建的视图
                    controller: 'UserInfoModalController',// 初始化模态范围
                    size: "lg",
                    resolve: {
                        params: function () {
                            return {
                                userId: userId,
                                user: $scope.user
                            };
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'WFRes/_Scripts/jquery/ajaxfileupload.js',
                                'js/factory/file-reader.js'
                            ]);
                        }]
                    }
                });
                // 弹窗点击确定的回调事件
                modalInstance.result.then(function (arg) {
                    if (arg.Success && arg.Extend && arg.Extend.ImageUrl) {
                        $scope.user.ImageUrl = arg.Extend.ImageUrl + "?" + $filter("date")(new Date(), "yyyyMMddHHmmss");
                    }
                });
            }
            // 编辑密码
            $scope.showUserPasswordModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'template/ProcessCenter/UserPassword.html',         // 指向上面创建的视图
                    controller: 'UserPasswordModalController', // 初始化模态范围
                });
                // 弹窗点击确定的回调事件
                modalInstance.result.then(function () {
                    // 弹出模态框
                    var modalInstance = $modal.open({
                        templateUrl: 'template/ProcessCenter/ConfirmModal.html',
                        size: "sm",
                        backdrop: "static",
                        keyboard: false,
                        controller: function ($scope, $modalInstance) {
                            $scope.Title = $translate.instant("WarnOfNotMetCondition.Tips");
                            $scope.Message = $translate.instant("LoginLog.ResetPasswordSuccess");
                            $scope.Button_OK = true;
                            $scope.Button_OK_Text = $translate.instant("QueryTableColumn.Button_OK");
                            $scope.ok = function () {
                                $modalInstance.close();  // 点击确定按钮
                            };
                        }
                    });
                });
            }
            //查看任务催办信息
            $scope.showUrgeWorkItemInfoModal = function (WorkItemID) {
                var modalInstance = $modal.open({
                    templateUrl: "template/ProcessCenter/UrgeWorkItemInfo.html",
                    controller: "UrgeWorkItemInfo",
                    size: "lg",
                    resolve: {
                        params: function () {
                            return {
                                WorkItemID: WorkItemID
                            };
                        }
                    }
                });
            }

            //页面与iframe消息传递
            window.addEventListener('message', function (event) {
                var msg = event.data.toString();
                if (msg.indexOf("TotalCount") > -1) {
                    setTimeout(function () {
                        $scope.GetItemCount();
                    }, 2500);
                } else if (msg.indexOf("ClosePage") > -1) {
                    $scope.ClosePage();
                    $scope.GetItemCount();
                    $state.go($state.$current.self.name, {}, {reload: true});
                } else if (msg.indexOf("IsSave") > -1) {
                    $scope.IsSave = true;
                } else if (msg.indexOf("showUserInfoModal") > -1) {
                    var id = msg.split(":")[1];
                    $scope.showUserInfoModal(id);
                } else if (msg.indexOf("ParentReload") > -1) {
                    $timeout(function () {
                        top.window.location.reload();
                    }, 1000 * 2);
                }
            })
        }]);

app.filter('cut', function() {
    return function(value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 5);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }
        return value + (tail || ' …');//'...'可以换成其它文字
    };
});

// 用户信息Controller
app.controller('UserInfoModalController', ['$scope', '$http', '$state', '$modalInstance', '$filter', '$timeout', 'datecalculation', 'ControllerConfig', 'fileReader', 'params',
    function ($scope, $http, $state, $modalInstance, $filter, $timeout, datecalculation, ControllerConfig, FileReader, params) {

        // TODO:通过 userId 获取指定的用户信息，如果是当前用户，则直接获取 $scope.user 对象
        if (params.userId == params.user.ObjectID) {
            $scope.editAble = true; // 获取当前用户是否有权限编辑和保存 
            $scope.user = params.user;
            $scope.user.BirthdayFormat = datecalculation.changeDateFormat($scope.user.Birthday);
            $scope.imageSrc = $scope.user.ImageUrl + "?" + $filter("date")(new Date(), "yyyyMMddHHmmss");
        } else {
            $scope.editAble = false;
            $http({
                url: ControllerConfig.PersonalInfo.GetUserInfo,
                params: {
                    UserID: params.userId
                }
            })
                .success(function (result, header, config, status) {
                    $scope.user = JSON.parse(result.User);
                    $scope.user.ManagerName = result.ManagerName;
                    $scope.user.OUDepartName = result.OUDepartName;
                    $scope.user.chkEmail = result.chkEmail;
                    $scope.user.chkMobileMessage = result.chkMobileMessage;
                    $scope.user.chkWeChat = result.chkWeChat;
                    $scope.user.chkApp = result.chkApp;
                    $scope.user.chkDingTalk = result.chkDingTalk;
                    $scope.user.BirthdayFormat = datecalculation.changeDateFormat($scope.user.Birthday);
                    $scope.imageSrc = $scope.user.ImageUrl + "?" + $filter("date")(new Date(), "yyyyMMddHHmmss");
                })
                .error(function (data, header, config, status) {
                    return;
                });
        }

        //用户图片预览
        $scope.getFile = function () {
            FileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.imageSrc = result;
                });
        }
        $scope.ok = function () {
            // TODO：如果是当前用户有权限编辑，那么保存至数据库

            // 手机号
            var regPhone = /^1[|3|4|5|6|7|8|9][0-9]{9}$/;
            if ($scope.user.Mobile !== "" && !regPhone.test($scope.user.Mobile)) {
                $scope.invalidPhone = true;
                $timeout(function () {
                    $scope.invalidPhone = false;
                }, 3000);
                return false
            }
            var regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+((\.[a-zA-Z0-9\u4e00-\u9fa5_-]+)+)?@[a-zA-Z0-9\u4e00-\u9fa5_-]+(\.[a-zA-Z0-9\u4e00-\u9fa5_-]+)+$/;   //门户个人信息验证邮箱
            if ($scope.user.Email != "" && !regEmail.test($scope.user.Email)) {
                $scope.invalidEmail = true;
                $timeout(function () {
                    $scope.invalidEmail = false;
                }, 3000);
                return false
            }
            // 办公电话
            // var regExps = /[>|<]/g;
            var regExps = /^0\d{2,3}-?\d{7,8}$/;
            if ($scope.user.OfficePhone !== "" && !regExps.test($scope.user.OfficePhone)) {
                $scope.invalidOfficePhone = true;
                $timeout(function () {
                    $scope.invalidOfficePhone = false;
                }, 3000);
                return false
            }
            // 传真
            var regFax = /^(\d{3,4}-)?\d{7,8}$/
            if ($scope.user.FacsimileTelephoneNumber !== "" && !regFax.test($scope.user.FacsimileTelephoneNumber)) {
                $scope.invalidFax = true;
                $timeout(function () {
                    $scope.invalidFax = false;
                }, 3000);
                return false
            }
            var params = {
                UserID: $scope.user.ObjectID,
                Mobile: $scope.user.Mobile,
                OfficePhone: $scope.user.OfficePhone,
                Email: $scope.user.Email,
                FacsimileTelephoneNumber: $scope.user.FacsimileTelephoneNumber,
                chkEmail: $scope.user.chkEmail,
                chkApp: $scope.user.chkApp,
                chkWeChat: $scope.user.chkWeChat,
                chkMobileMessage: $scope.user.chkMobileMessage,
                chkDingTalk: $scope.user.chkDingTalk,
            }
            $scope.saveData(params);
        };

        $scope.saveData = function (params) {
            // console.log(params)
            $.ajaxFileUpload({
                url: ControllerConfig.PersonalInfo.UpdateUserInfo,
                fileElementId: "file",
                secureuri: false,
                type: "post",
                data: params,
                dataType: 'json',
                async: false,
                success: function (result) {
                    $modalInstance.close(result);
                }
            });
        }
        $scope.cancel = function () {
            // console.log('cancel')
            $modalInstance.dismiss('cancel'); // 退出
        };
    }]);

// 编辑密码Controller
app.controller('UserPasswordModalController', ['$scope', '$http', '$interval', '$modalInstance', '$modal', 'ControllerConfig',
    function ($scope, $http, $interval, $modalInstance, $modal, ControllerConfig) {
    $scope.editResult = true;
    $scope.ok = function () {
        // TODO：更新密码
        if ($scope.NewPassword !== $scope.ConfirmPassword) {
            $scope.ShowMsg2 = true;
            return;
        }
        // var encryptedOldPwd = $scope.OldPassword;
        var encryptedOldPwd = $.md5($scope.OldPassword);
        // var encryptedNewPwd = $.md5($scope.NewPassword);
        var encryptedNewPwd = $scope.NewPassword;
        $http({
            url: ControllerConfig.PersonalInfo.SetPassword,
            method: 'post',
            params: {
                OldPassword: encryptedOldPwd,
                NewPassword: encryptedNewPwd,
            }
        })
            .success(function (result, header, config, status) {
                if (result) {
                    $modalInstance.close();  // 点击保存按钮
                } else {
                    $scope.editResult = false;
                    if (!$scope.editResult) {
                        $interval(function () {
                            $scope.editResult = true;
                        }, 1000);
                    }
                }
            })
            .error(function (data, header, config, status) {
            })
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    }
}]);

//任务催办信息Controller
app.controller('UrgeWorkItemInfo', ['$scope', '$http', '$modalInstance', 'ControllerConfig', 'params',
    function ($scope, $http, $modalInstance, ControllerConfig, params) {
        $scope.WorkItemID = params.WorkItemID;
        $http({
            url: ControllerConfig.InstanceDetail.GetUrgeWorkItemInfo,
            params: {
                WorkItemID: $scope.WorkItemID
            }
        })
            .success(function (result, header, config, status) {
                $scope.UrgeWorkItemInfo = result;
            })
            .error(function (data, header, config, status) {
                return;
            });
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel'); // 退出
        }
    }]);

// 获取根目录
function getRootPath_web() {
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht = curWwwPath.substring(0, pos);
    //获取带"/"的项目名，如：/uimcardprj
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    console.log(" >>>> GET WEB ROOT:" + localhostPaht + projectName);
    return (localhostPaht + projectName);
}