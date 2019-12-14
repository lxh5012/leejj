var module = angular.module('starter.controllers', [])
// 全局Controller
    .controller("mainCtrl", function ($rootScope, $scope, $state, $http, $ionicPopup, $ionicLoading, $ionicSideMenuDelegate, $cordovaDevice, $cordovaAppVersion, $cordovaNetwork, $ionicScrollDelegate, $cordovaToast, $cordovaBadge, $ionicHistory, $timeout, commonJS) {

        //设置popup的样式
//        function setPopupStyle() {
//            var dpr = document.documentElement.getAttribute('data-dpr');
//            var head = document.getElementsByTagName('head')[0];
//            var style = document.createElement('style');
//            style.setAttribute('type', 'text/css');
//            style.innerHTML = '.ion-datetime-picker-popup{pointer-events: auto;}.ion-datetime-picker-popup .popup{zoom:' + dpr + ' !important;transform:scale(' + dpr + ') !important;width: min-content; min-width: 300px; } ';
//            head.appendChild(style);
//        }
//        setPopupStyle();

        $rootScope.loginInfo = {
            success: false,
            loginfrom: commonJS.getUrlParam('loginfrom')
        };

        $scope.UrlSplitStr = "mobile";
        //重置钉钉，微信头部样式
        $rootScope.dingMobile = {
            isDingMobile: false,                              //是否钉钉移动端，如果是钉钉移动端，需要隐藏当前header，重写钉钉APP Header
            dingHeaderClass: "menu-tittle",                   //隐藏header后 subHeader ion-content需要修改相关样式
            dingSubHeaderClass: "has-header has-subheader",  //隐藏header后 subHeader ion-content需要修改相关样式
            dingContentClass: "scroll-content ionic-scroll  has-tabs",
            hideHeader: false,                                //是否需要隐藏当前Header
            hideOther: true//钉钉微信共同需要隐藏的
        };
        $scope.SetDingDingHeader = function (title) {
            // console.log(title, 'title----------')
            //设置Header标题
            dd.biz.navigation.setTitle({
                title: title,//控制标题文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                },
                onFail: function (err) {
                    console.log(err);
                }
            });
        };
        //设置钉钉header右侧
        $scope.SetDingDingHeaderRight = function (title) {
            //设置Header右侧标题
            dd.biz.navigation.setRight({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: title,//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                    // console.log(result);
                },
                onFail: function (err) {
                }
            });
        };

        //判断登陆平台：App,微信，钉钉
        $scope.GetLoginFrom = function () {
            var loginfrom = commonJS.getUrlParam('loginfrom');
            // console.log("loginfrom..." + loginfrom);
            if (loginfrom == 'dingtalk' && dd.version) {
                $rootScope.loginInfo.loginfrom = 'dingtalk';
                $rootScope.dingMobile.isDingMobile = true;
                $rootScope.dingMobile.dingHeaderClass = 'dingtalk-menu';
                $rootScope.dingMobile.dingSubHeaderClass = 'has-header';
                $rootScope.dingMobile.dingContentClass = 'dingtalk-menu-scroll-content scroll-content';
                $rootScope.dingMobile.hideHeader = true;
                $rootScope.dingMobile.hideOther = false;
                console.log($rootScope.dingMobile.hideHeader)
            } else if (window.cordova) {
                $rootScope.loginInfo.loginfrom = 'app';
                $rootScope.dingMobile.hideOther = true;
            } else {
                //微信在做单点登录处判断
                // $rootScope.loginInfo.loginfrom = "wechat";
                $rootScope.dingMobile.hideOther = true;
            }
        };

        $scope.GetLoginFrom();
        $scope.IsSSO = false;

        // 是否微信
        $scope.isWeiXin = function(){
            return (/micromessenger/i).test(navigator.userAgent)
        };

        // 当前系统设置信息
        $scope.jpushWorkItemId = "";
        $scope.startworkflowDisplay = config.defaultStartworkflowDisplay;
        $scope.unfinishedWorkItemSortable = config.defaultUnfinishedWorkItemSortable;
        $scope.defaultImageUrl = config.defaultImageUrl;
        // 客户端信息
        $scope.clientInfo = {
            AppVersion: "",                 // 版本号
            UUID: "",                       // UUID
            JPushID: "",                    // JPUSHID
            Platform: "",                   // 客户端类型
            isOffline: false                // 是否在线状态
        };
        // 设置信息
        $scope.setting = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.Setting')) || {
                autoLogin: config.defaultAutoLogin, // 是否自动登录
                serviceUrl: config.defaultServiceUrl, // 服务地址
                httpUrl: '', //http请求地址
                workItemUrl: '', // 打开待办的URL地址
                startInstanceUrl: '', // 发起流程的链接
                instanceSheetUrl: '', // 打开在办流程的链接
                uploadImageUrl: '', // 图片上传URL
                tempImageUrl: '' // 图片存放路径
            };
        //设置语言
        $scope.H3 = {};
        $scope.H3.language = window.localStorage.getItem('H3.Language') || config.defaultLanguage;
        if ($scope.H3.language == 'en_us') {
            config.languages.current = config.languages.en;
        } else {
            config.languages.current = config.languages.zh;
        }

        //微信表单跳出，回到进入页
        $scope.JumpParams = JSON.parse(window.localStorage.getItem('absurl')) || {
                state: '',
                tab: 0
            };
        window.localStorage.removeItem("absurl");

        $scope.renderJumpParams = function () {
            $scope.JumpParams = {
                state: '',
                tab: 0
            };
        };

        if (window.cordova) {
            if ($scope.setting.httpUrl.indexOf("http") > -1 && $scope.setting.httpUrl.indexOf("m.asmx") > -1) {
            } else {
                $scope.setting.httpUrl = $scope.setting.serviceUrl.toLocaleLowerCase();
            }
        } else {
            $scope.setting.httpUrl = document.location.href.toLocaleLowerCase().split("/" + $scope.UrlSplitStr + "/")[0];
        }

        // 2019-01-14 modify by ousf ------------
        // 当前登录的用户信息
        $scope.user = JSON.parse(window.localStorage.getItem("OThinker.H3.Mobile.User")) || {
                ObjectID: "",
                Code: "",
                Password: "",
                Image: "",
                Name: "",
                MobileToken: "" // 服务器端返回的Token
            };

        $scope.autoLogin = function () {
            // if (!$rootScope.loginInfo.success && !dd && !dd.version) { // 判断用户是否已经登陆（静默登陆用）
                if (!$rootScope.loginInfo.success && ((!dd && !dd.version) || !$scope.isWeiXin())) { // 判断用户是否已经登陆（静默登陆用）
                // console.log("Check for silence login by sso")
                $.ajax({
                    url: '../Organization/GetCurrentUser',
                    type: "GET",
                    dataType: "JSON",
                    async: false,
                    params: {
                        random: new Date().getTime()
                    },
                    beforeSend: function () {
                        commonJS.loadingShow();
                    },
                    complete:function () {
                        commonJS.loadingHide();
                    },
                    success: function (result, header, config, status) {
                        if (result.Success) {
                            if (!result.PortalRoot) {
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
                            $scope.user.ObjectID = result.User.ObjectID;
                            $scope.user.ParentID = result.User.ParentID;
                            $scope.user.DirectParentUnits = result.DirectoryUnits;
                            $scope.user.Code = result.User.Code;
                            $scope.user.Name = result.User.Name;
                            $scope.user.MobileToken = result.User.MobileToken;
                            if (result.User.ImageUrl.indexOf("/user") > -1) {
                                result.User.ImageUrl = "";
                            }
                            $scope.user.ImageUrl = result.User.ImageUrl == "" ? "" : $scope.setting.tempImageUrl + result.User.ImageUrl;
                            $scope.user.Email = result.User.Email;
                            $scope.user.DepartmentName = result.User.DepartmentName;
                            $scope.user.OfficePhone = result.User.OfficePhone;
                            $scope.user.Mobile = result.User.Mobile;
                            $scope.user.WeChat = result.User.WeChat;
                            $scope.user.Appellation = result.User.Appellation;
                            //所在部门信息
                            $rootScope.departmentInfo = {};
                            $rootScope.departmentInfo.UserName = result.User.Name;
                            $rootScope.departmentInfo.UserId = result.User.ObjectID;
                            $rootScope.departmentInfo.DepartmentName = result.OUDepartName;
                            $rootScope.departmentInfo.DepartmentId = result.User.ParentID;
                            $rootScope.departmentInfo.UserGender = result.User.Gender;
                            //本人登录时获取到的imageurl为空，所以根据gender加img
                            if (result.User.ImageUrl.length == 0 && result.User.Gender == 2) {
                                $rootScope.departmentInfo.UserImageUrl = "../img/TempImages/userfemale.jpg";
                            } else if (result.User.ImageUrl.length == 0 && result.User.Gender != 2) {
                                $rootScope.departmentInfo.UserImageUrl = "../img/TempImages/usermale.jpg";
                            } else {
                                $rootScope.departmentInfo.UserImageUrl = result.User.ImageUrl;
                            }
                            // 存储最近一次登录的用户信息
                            window.localStorage.setItem("OThinker.H3.Mobile.User", JSON.stringify($scope.user));
                            // 登录成功，转向主页面
                            //$state.go("tab.home");
                            console.log("静默登陆成功 ......")
                        }
                    },
                    error: function (a, b, c) {
                        console.log("静默登陆错误 ......")
                    }
                });
            }
        };

        $scope.autoLogin();
        // 微信单点登录开始
        var code = commonJS.getUrlParam("code");
        var state = commonJS.getUrlParam("state");
        // console.log("-------------------------------------");
        // console.log(code+" "+state+" "+(code&&state));
        // 微信单点登录
        if (!$rootScope.loginInfo.success && code && state) {
            $scope.IsSSO = true;
            commonJS.loadingShow();
            var url = document.location.href.toLocaleLowerCase();
            $scope.serviceUrl = url.split("/" + $scope.UrlSplitStr + "/")[0] + "/WeChat/ValidateLoginForWeChat";
            $http({
                url: $scope.serviceUrl,
                params: {
                    state: state,
                    code: code
                }
            })
                .success(function (result) {
                    $scope.IsSSO = false;
                    commonJS.loadingHide();
                    if (result.Success) {
                        if (!result.PortalRoot) {
                            window.localStorage.setItem("H3.PortalRoot", "/Portal");
                        }
                        else {
                            window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                        }
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        $rootScope.loginInfo.loginfrom = "wechat";
                        $rootScope.loginInfo.success = true;
                        config.portalroot = result.PortalRoot;
                        $scope.user.ObjectID = result.MobileUser.ObjectID;
                        $scope.user.DirectParentUnits = result.DirectoryUnits;
                        $scope.user.Code = result.MobileUser.Code;
                        $scope.user.Name = result.MobileUser.Name;
                        $scope.user.MobileToken = result.MobileUser.MobileToken;
                        $scope.user.ImageUrl = result.MobileUser.ImageUrl == "" ? "" : $scope.setting.tempImageUrl + result.MobileUser.ImageUrl;
                        $scope.user.Email = result.MobileUser.Email;
                        $scope.user.DepartmentName = result.MobileUser.DepartmentName;
                        $scope.user.OfficePhone = result.MobileUser.OfficePhone;
                        $scope.user.Mobile = result.MobileUser.Mobile;
                        $scope.user.WeChat = result.MobileUser.WeChat;
                        $scope.user.Appellation = result.MobileUser.Appellation;
                        //  $scope.GetBadge();
                        $scope.setLocalStorage();//存储最近一次登录，解决首页报objectID为空
                        $rootScope.$broadcast("LoginIn", "");
                        $rootScope.dingMobile.hideOther = false;//登陆成功隐藏退出按钮
                        //TODO:此处为默认路由，微信在表单返回时也会经过这里
                        //这里如果有跳转路由，会导致表单关闭后跳转到此路由
                        // $state.go("home.index");
                        if ($scope.JumpParams.state != "") {
                            $state.go($scope.JumpParams.state);
                        }
                    } else {
                        //提示信息
                        commonJS.MsgErrorHandler("登录失败，请联系管理员！");
                        if (typeof (WeixinJSBridge) != "undefined") {
                            //登陆失败,关闭页面
                            WeixinJSBridge.call("closeWindow");
                        }
                    }
                })
                .error(function () {
                    $scope.IsSSO = false;
                    commonJS.loadingHide();

                    if (commonJS.checkOnline()) {
                        commonJS.MsgErrorHandler("远程服务链接错误，请稍候再试！");
                        //commonJS.showShortTop("远程服务链接错误，请稍候再试！");
                    }
                    else {
                        commonJS.MsgErrorHandler("您处理离线状态，请先检查网络！！");
                        // commonJS.showShortTop("您处理离线状态，请先检查网络！");
                    }
                });
        }

        //钉钉单点登录开始
        if (!$rootScope.loginInfo.success && dd && dd.version) {
            // alert('登录失败，请联系管理员2！')
            $scope.dingLog = '登陆开始：' + new Date().Format('yyyy-MM-dd HH:mm:ss');
            $scope.IsSSO = true;
            commonJS.loadingHide();
            var _config = {};
            var sourceUrl = document.location.href;
            var url = sourceUrl.toLocaleLowerCase();
            $scope.serviceUrl = url.split('/' + $scope.UrlSplitStr + '/')[0];
            console.log(sourceUrl,'sourceUrl');
            $http({
                url: $scope.serviceUrl + '/DingTalk/GetSignConfig',
                params: {url: sourceUrl}
            })
                .success(function (res) {
                    console.log(res,'获取签名信息成功')
                    //获取签名信息成功
                    _config = res;
                    // 配置jsAPI
                    dd.config({
                        agentId: _config.agentId,
                        corpId: _config.corpId,
                        timeStamp: _config.timeStamp,
                        nonceStr: _config.nonce,
                        signature: _config.signature,
                        jsApiList: [
                            'runtime.info',
                            'device.notification.prompt',
                            'biz.chat.pickConversation',
                            'device.notification.confirm',
                            'device.notification.alert',
                            'device.notification.prompt',
                            'biz.chat.open',
                            'biz.util.open',
                            'biz.user.get',
                            'biz.contact.choose',
                            'biz.telephone.call',
                            'biz.util.uploadImage',
                            'biz.ding.post']
                    });
                    //执行签名信息验证和登录操作
                    $scope.dingLog = $scope.dingLog + "||获取签名完成：" + new Date().Format("yyyy-MM-dd HH:mm:ss");
                    $scope.ddReady();
                })
                .error(function (err) {
                //提示信息
                commonJS.MsgErrorHandler("登录失败，请联系管理员！");
                // console.log('Error:' + err);
                console.log(err,'钉钉登录出错')
            });
        }
        //End 钉钉单点登录结束
        //钉钉免登签名信息校验及登录
        $scope.ddReady = function () {
            $scope.dingLog = $scope.dingLog + '||开始登陆：' + new Date().Format('yyyy-MM-dd HH:mm:ss');
            console.log(_config.corpId,'_config.corpId');
            dd.ready(function () {
                $scope.IsSSO = false;
                commonJS.loadingHide();
                //获取免登授权码 -- 注销获取免登服务，可以测试jsapi的一些方法
                dd.runtime.permission.requestAuthCode({
                    corpId: _config.corpId,
                    onSuccess: function (result) {
                        var code = result['code'];
                        var state = commonJS.getUrlParam('state');
                        var tartget = commonJS.getUrlParam('target');
                        //WorkItemID 参数要和后台配置打开URL中的参数一致
                        var WorkItemID = commonJS.getUrlParam('WorkItemID');
                        $http({
                            url: $scope.setting.httpUrl + '/DingTalk/ValidateLoginForDingTalk',
                            params: {
                                state: state,
                                code: code
                            }
                        })
                            .success(function (result) {
                                if (!result.PortalRoot) {
                                    window.localStorage.setItem("H3.PortalRoot", "/Portal");
                                }
                                else {
                                    window.localStorage.setItem("H3.PortalRoot", result.PortalRoot);
                                }
                                // console.log(result);
                                $scope.dingLog = $scope.dingLog + '||登陆完成：' + new Date().Format('yyyy-MM-dd HH:mm:ss');
                                $ionicHistory.clearCache();
                                $ionicHistory.clearHistory();
                                $rootScope.loginInfo.loginfrom = 'dingtalk';
                                $rootScope.loginInfo.success = true;
                                config.portalroot = result.PortalRoot;
                                $scope.user.ObjectID = result.MobileUser.ObjectID;
                                $scope.user.DirectParentUnits = result.DirectoryUnits;
                                $scope.user.Code = result.MobileUser.Code;
                                $scope.user.Name = result.MobileUser.Name;
                                $scope.user.MobileToken = result.MobileUser.MobileToken;
                                $scope.user.ImageUrl = result.MobileUser.ImageUrl == '' ? '' : $scope.setting.tempImageUrl + result.MobileUser.ImageUrl;
                                $scope.user.OfficePhone = result.MobileUser.OfficePhone;
                                $scope.user.Mobile = result.MobileUser.Mobile;
                                $scope.user.Appellation = result.MobileUser.Appellation;
                                //  $scope.GetBadge();


                                //所在部门信息
                                $rootScope.departmentInfo = {};
                                $rootScope.departmentInfo.UserName = result.MobileUser.Name;
                                $rootScope.departmentInfo.UserId = result.MobileUser.ObjectID;
                                for (var p in result.DirectoryUnits) {
                                    $rootScope.departmentInfo.DepartmentName = result.DirectoryUnits[p];
                                    $rootScope.departmentInfo.DepartmentId = p;
                                }
                                $rootScope.departmentInfo.UserGender = result.MobileUser.Gender;
                                //本人登录时获取到的imageurl为空，所以根据gender加img

                                $rootScope.departmentInfo.UserImageUrl = $scope.setting.tempImageUrl + result.MobileUser.ImageUrl;

                                // console.log("钉钉登陆成功");
                                $scope.setLocalStorage();//存储最近一次登录，解决首页报objectID为空
                                $rootScope.$broadcast("LoginIn", "");
                                //update by luxm
                                //钉钉登录跳转到应用中心
                                if (tartget == "appCenter") {
                                    //$state.go('tab.appCenter');
                                    //update by ouyangsk 直接进入钉钉应用当前目录
                                    var appCode = commonJS.getUrlParam('appCode');
                                    $http({
                                        url: $scope.setting.httpUrl + '/Mobile/getAppName',
                                        params: {
                                            appCode: appCode,
                                        }
                                    })
                                        .success(function (resData) {
                                            if (resData.success) {
                                                $state.go("appCenterItem", {
                                                    'AppCode': appCode,
                                                    'DisplayName': resData.appName
                                                });
                                            }
                                        });
                                } else {
                                    $state.go('tab.home');
                                }
                            });
                    },
                    onFail: function (err) {
                        //提示信息
                        commonJS.MsgErrorHandler("登录失败，请联系管理员！");
                        console.log('error fail:' + err);
                    }
                });
            });
            dd.error(function (err) {
                $scope.IsSSO = false;
                //提示信息
                commonJS.MsgErrorHandler("登录失败，请联系管理员！");
                console.log(err,'钉钉验证出错')
                //钉钉验证出错
                // console.log(err);
            });
        };

        // 计算待办打开的 URL
        $scope.getWorkItemUrl = function () {
            var url = document.location.href.toLocaleLowerCase();
            // console.log(url);
            if ($rootScope.loginInfo.loginfrom == "app") {
                String.prototype.startWith=function(s){
                    if(s==null||s==""||this.length==0||s.length>this.length)
                        return false;
                    if(this.substr(0,s.length) == s)
                        return true;
                    else
                        return false;
                    return true;
                };
                var setIp = window.localStorage.getItem('OThinker.H3.Mobile.setIP');
                url = setIp ? setIp + '/Portal' : config.defaultAppServiceUrl;
                if (!url.startWith("http://")) {
                    url = "http://" + url;
                }
                $rootScope.appServiceUrl = setIp ? 'http://' + setIp + '/Portal/Mobile' : config.defaultAppServiceUrl;
                $rootScope.appServerPortal = setIp ? 'http://' + setIp + '/Portal' : config.defaultAppServerPortal;
            } else {
                url = url.split("/" + $scope.UrlSplitStr + "/")[0];
                // console.log(url);
                //update by ouyangsk 当不是app的情况下
                $rootScope.appServerPortal = "/Portal";
            }

            $scope.setting.workItemUrl = url + "/WorkItemSheets.html?IsMobile=true&WorkItemID=";

            $scope.setting.startInstanceUrl = url + "/StartInstance.html?IsMobile=true&WorkflowCode=";

            $scope.setting.instanceSheetUrl = url + "/InstanceSheets.html?IsMobile=true&InstanceId=";

            $scope.setting.uploadImageUrl = url + "/OrgUser/UploadUserImage";

            $scope.setting.tempImageUrl = url.replace("portal", "Portal") + "/TempImages/";

            $scope.setting.serviceUrl = url;

            $scope.setLocalStorage();

            $rootScope.startInstanceUrl = $scope.setting.startInstanceUrl;
        };
        // 本地存储
        $scope.setLocalStorage = function () {
            // 存储设置信息
            window.localStorage.setItem("OThinker.H3.Mobile.Setting", JSON.stringify($scope.setting));
            window.localStorage.setItem("OThinker.H3.Mobile.User", JSON.stringify($scope.user));
            // window.localStorage.setItem("H3.Language", $scope.H3.language);
        };
        // 计算打开待办的表单URL
        $scope.getWorkItemUrl();

        document.addEventListener("deviceready", function () {
            if (window.plugins) {
                $scope.clientInfo.Platform = $cordovaDevice.getPlatform();
                $scope.clientInfo.UUID = $cordovaDevice.getUUID();

                if (window.plugins.jPushPlugin) {
                    // 获取JPushID
                    window.plugins.jPushPlugin.getRegistrationID(function (id) {
                        $scope.clientInfo.JPushID = id;
                        console.log("get jpubsh id:" + id);
                    });

                    // 注册消息推送内容点击事件
                    window.plugins.jPushPlugin.openNotificationInAndroidCallback = function (data) {
                        //data = JSON.parse(data);
                        var pushId = window.localStorage.getItem("OThinker.H3.Mobile.WorkItemID");
                        if (pushId != data.extras["cn.jpush.android.EXTRA"].workItemId) {
                            $scope.jpushWorkItemId = data.extras["cn.jpush.android.EXTRA"].workItemId;
                            window.localStorage.setItem("OThinker.H3.Mobile.WorkItemID", $scope.jpushWorkItemId);
                        }
                        //app已经打开时，点击直接打开表单，否则先登陆再打开
                        if ($state && $state.current && $state.current.name != "" && $state.current.name != "login") {
                            if ($scope.jpushWorkItemId != "") {
                                $scope.worksheetUrl = $scope.setting.workItemUrl + $scope.jpushWorkItemId + "&LoginName=" + encodeURI($scope.user.Code) + "&LoginSID=" + $scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
                                commonJS.GetWorkItemSheetUrl($scope, $scope.worksheetUrl, $scope.jpushWorkItemId);
                                $scope.jpushWorkItemId == "";
                            }
                        }

                    }
                }

                //                if ($cordovaDevice.getPlatform().toLocaleLowerCase().indexOf("android") > -1) {
                //                    $scope.layout.noSearchTop = $scope.android.noSearchTop;
                //                    $scope.layout.hasSearchTop = $scope.android.hasSearchTop;
                //                    $scope.layout.bannerImageTop = $scope.android.bannerImageTop;
                //                } else {
                //                    $scope.layout.noSearchTop = $scope.ios.noSearchTop;
                //                    $scope.layout.hasSearchTop = $scope.ios.hasSearchTop;
                //                    $scope.layout.bannerImageTop = $scope.ios.bannerImageTop;
                //                }
            }

            // 离线检测
            if (!commonJS.checkOnline()) {
                $scope.clientInfo.isOffline = true;
            }

            // 版本与升级检测
            $cordovaAppVersion.getVersionNumber().then(function (version) {
                $scope.clientInfo.AppVersion = version;
                if (!$scope.clientInfo.isOffline) {
                    commonJS.checkVersion($scope.setting.httpUrl, $cordovaDevice.getPlatform(), version);
                }
            });
            // 隐藏Splash画面
            if (navigator.splashscreen) navigator.splashscreen.hide();
        });

        // 打开通知事件，Android测试无反应，iOS可以，待继续验证
        document.addEventListener("jush.openNotification", function (data) {
            if (data && data.workItemId) {
                $scope.jpushWorkItemId = data.workItemId;
            }
        });

        // Jpush 接收新通知事件，实际测试只有App在前台有效
        document.addEventListener("jush.receiveNotification", function (data) {
                console.log(data,'Jpush')
        });

        $rootScope.loginfrom = $rootScope.loginInfo.loginfrom;//赋值，以防改版后还用到$rootScope.loginfrom
        //重写alert，confirm方法
        window.alert = function (msg) {
            var myPopup = $ionicPopup.show({
                popupclass: 'bpm-sheet-alert',
                template: '<span>' + msg + '<span>'
            });
            $timeout(function () {
                myPopup.close();
            }, 1500);
        };
        window.confirm = function (message, doneCallback) {
            var myPopup = $ionicPopup.show({
                popupclass: 'bpm-sheet-confirm',
                template: '<span>' + message + '<span>',
                buttons: [
                    {
                        text: '取消',
                        type: 'button-clear'
                    },
                    {
                        text: '确定',
                        type: 'button-clear',
                        onTap: function (e) {
                            doneCallback();
                        }
                    }
                ]
            });
        };
        commonJS.setLanguages();
    });