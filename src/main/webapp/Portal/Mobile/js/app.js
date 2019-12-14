/// <reference path="app.js" />
angular.module('starter', ['ui.bootstrap', 'ui.load', 'ui.jq', 'ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ngCordova', 'ion-datetime-picker'])
    .run(function ($ionicPlatform, $location, $timeout, $rootScope, $ionicHistory, $state, $ionicPickerI18n,commonJS) {
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
        //时间控件自定义设定
        var lang = window.localStorage.getItem('H3.Language') || 'zh_cn';
        // 初始化语言
        //安卓 app
        if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
            commonJS.AndroidJsBridge(function(bridge) {
                try {
                    bridge.init(function(message, responseCallback) {
                        console.log('JS got a message', message);
                        responseCallback(data);
                    });
                } catch (e) {
                    console.log(e)
                }
                bridge.registerHandler('functionInJs', function (data, responseCallback) {
                    // console.log(data,'-------');
                    if(data && data == 'LANGUAGE_EN') {
                        lang = 'en_us';
                        config.languages.current = config.languages.en;
                        window.localStorage.setItem("H3.Language", "en_us");
                    } else if(data && data=='LANGUAGE_ZH') {
                        lang = 'zh_cn';
                        config.languages.current = config.languages.zh;
                        window.localStorage.setItem("H3.Language", "zh_cn");
                    }  else if(data && data == 'SETTING_BACK') {
                        $state.reload('app.login');
                    }
                    commonJS.setLanguages();
                });
            })
        }
        // ios app
        if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
            commonJS.IosJsBridge(function(bridge) {
                bridge.registerHandler('ios_lan', function(data, responseCallback) {
                    // alert(data,'ios_lan')
                    if(data && data == 'en') {
                        lang = 'en_us';
                        config.languages.current = config.languages.en;
                        window.localStorage.setItem("H3.Language", "en_us");
                    } else if(data && data == 'zh-Hans') {
                        lang = 'zh_cn';
                        config.languages.current = config.languages.zh;
                        window.localStorage.setItem("H3.Language", "zh_cn");
                    }
                    commonJS.setLanguages();
                })
            });
        }
        if (lang == 'en_us') {
            $ionicPickerI18n.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $ionicPickerI18n.months = ["Jan", "Fed", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Otc", "Nov", "Dec"];
            $ionicPickerI18n.ok = "OK";
            $ionicPickerI18n.cancel = "Clear";
            $ionicPickerI18n.okClass = "button-balanced";
            // $ionicPickerI18n.cancelClass = "button-balanced";
            //安卓 app
            if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
                commonJS.AndroidJsBridge(function(bridge) {
                    bridge.callHandler(
                        'submitFromWeb'
                        , {'param': 'LANGUAGE_EN'}
                        , function(responseData) {
                            // console.log(JSON.stringify(responseData))
                            console.log(responseData,'responseData')
                        }
                    );
                })
            }
            //ios app
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
        else {
            $ionicPickerI18n.weekdays = ["日", "一", "二", "三", "四", "五", "六"];
            $ionicPickerI18n.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
            $ionicPickerI18n.ok = "确定";
            $ionicPickerI18n.cancel = "取消";
            $ionicPickerI18n.okClass = "button-balanced";
            // $ionicPickerI18n.cancelClass = "button-balanced";
            //安卓 app
            if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
                commonJS.AndroidJsBridge(function(bridge) {
                    bridge.callHandler(
                        'submitFromWeb'
                        , {'param': 'LANGUAGE_ZN'}
                        , function(responseData) {
                            // console.log(JSON.stringify(responseData))
                            console.log(responseData,'responseData')
                        }
                    );
                })
            }

            //ios app
            if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
                // 这里主要是注册 OC 将要调用的 JS 方法。
                commonJS.IosJsBridge(function(bridge) {
                    bridge.callHandler(
                        'ios_change_lan'
                        ,'zh-Hans'// 中文
                        , function(responseData) {
                        }
                    );
                });
            }
        }
        //添加事件监听
        $rootScope.$on("$stateChangeStart", function (e, ts, tp, fs, ft) {
            if (fs.name.indexOf("app.") != -1) {
                $("[name='app-view']").find("ion-view").attr("nav-view", "cached");
            }
        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        //安卓手机不能滑动的bug
        $ionicConfigProvider.scrolling.jsScrolling(true);


        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        /*   $ionicConfigProvider.platform.android.navBar.alignTitle('left');*/

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
        var defaultState = "/tab/home";
        if (window.cordova) {
            defaultState = "/login";
            // defaultState = "/tab/home";
        }
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive

        ////表单页-编辑-展示
        //.state('inputGroup', {
        //    url: '/inputGroup',
        //    templateUrl: 'templates/input-group.html',
        //    controller: 'inputGroupCtrl'
        //})
        ////流程详情
        //.state('details', {
        //    url: '/details',
        //    templateUrl: 'templates/details.html',
        //    controller: 'detailsCtrl'
        //})
        ////普通流程详情
        //.state('listDetails', {
        //    url: '/listDetails',
        //    templateUrl: 'templates/listDetails.html',
        //    controller: 'listDetailsCtrl'
        //})


        //底部
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html?v=201811291612&time=' + new Date()// add by zcw
            })
            .state('tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html?v=201811291612&time=' + new Date(),
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('tab.startworkflow', {
                url: '/startworkflow',
                views: {
                    'tab-startworkflow': {
                        templateUrl: 'templates/tab-startworkflow.html?v=201811291612&time=' + new Date(),
                        controller: 'startworkflowCtrl'
                    }
                }
            })
            .state('tab.myInstances', {
                url: '/myInstances',
                views: {
                    'tab-myInstances': {
                        templateUrl: 'templates/tab-myInstances.html?v=201811291612&time=' + new Date(),
                        controller: 'myInstancesCtrl'
                    }
                }
            })
            .state('sheetUser', {
                url: '/sheetUser/:isReport/:displayName',
                templateUrl: 'templates/sheetUser.html?v=201811291612&time=' + new Date(),
                controller: 'sheetUserCtrl'
            })
            //系统设置
            .state('settings', {
                url: '/settings',
                templateUrl: 'templates/settings.html?v=201811291612&time=' + new Date(),
                controller: 'settingsCtrl'
            })
            .state('language', {
                url: '/language',
                templateUrl: 'templates/language.html?v=201811291612&time=' + new Date(),
                controller: 'settingsLangCtrl'
            })
            //            //报表
            //            .state('report', {
            //                url: '/report/:ReportCode',
            //                templateUrl: 'report/templates/ReportView.html?v=201801241103',
            //                controller: 'ShowReportCtrl'
            //            })
            //登陆
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html?v=201811291612&time=' + new Date(),
                controller: 'loginCtrl'
            })

            //应用中心
            .state('tab.appCenter', {
                url: '/appCenter',
                views: {
                    'tab-appCenter': {
                        templateUrl: 'templates/tab-appCenter.html?v=201811291612&time=' + new Date(),
                        controller: 'appCenterCtrl'
                    }
                }
            })
            //应用中心子页面
            .state('appCenterItem', {
                url: '/appCenterItem/:AppCode/:DisplayName',
                templateUrl: 'templates/appCenterItem.html?v=201811291612&time=' + new Date(),
                controller: 'appCenterItemCtrl'
            })
            //应用中心
            .state('app', {
                abstract: true,
                url: '/app/:TopAppCode',
                templateUrl: 'templates/app.html?v=201811291612&time=' + new Date()
            })
            .state('app.ShowReport', {
                url: '/report/:ReportCode',
                views: {
                    'app-view': {
                        templateUrl: 'report/templates/ReportView.html?v=201811291612&time=' + new Date(),
                        controller: 'ShowReportCtrl'
                    }
                }
            })
            //我的流程
            .state('app.MyInstance', {
                url: '/myInstances/:SchemaCode/:State',
                views: {
                    'app-view': {
                        templateUrl: 'templates/tab-myInstances.html?v=201811291612&time=' + new Date(),
                        controller: 'myInstancesCtrl'
                    }
                }
            })
        //自定义表单
        /*.state('app.EditBizObject', {
            url: '/EditBizObject/:SchemaCode/:SheetCode/:Mode/:FunctionCode',
            views: {
                'app-view': {
                    template: "<div></div>",
                    controller: "EditBizObjectController",
                }
            }
        });*/

        $urlRouterProvider.otherwise(defaultState);
    });


