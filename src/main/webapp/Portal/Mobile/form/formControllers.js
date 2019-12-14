﻿var formModule = angular.module('formApp.controllers', ['ionic', 'ngFileUpload'])
// 全局Controller
    .controller("mainCtrl", function ($rootScope, $scope, $state, $compile, $http, $ionicPopup, $timeout) {
        $rootScope.dingMobile = {
            isDingMobile: false, //是否钉钉移动端，如果是钉钉移动端，需要隐藏当前header，重写钉钉APP Header
            dingHeaderClass: "has-header", //隐藏header后 subHeader ion-content需要修改相关样式
            dingSubHeaderClass: "has-header has-subheader", //隐藏header后 subHeader ion-content需要修改相关样式
            hideHeader: false,                                //是否需要隐藏当前Header
            select: []
        }
        // 设置左侧返回
        $scope.SetDingDingLeft = function () {
            //设置Header标题
            if (dd) {
                dd.biz.navigation.setLeft({
                    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                    android: true, // 安卓端如果需要控制左上角返回事件加上这个字段，并设置为true
                    text: '返回',//控制显示文本，空字符串表示显示默认文本
                    onSuccess : function(result) {
                        dd.biz.navigation.goBack({});
                    },
                    onFail : function(err) {
                        dd.biz.navigation.goBack({});
                    }
                })
            }
        }
        //update by ouyangsk 记录用户设置的语言
        var lang = window.localStorage.getItem('H3.Language') || 'zh_cn';
        if (lang == 'zh_cn' || lang == "null") {
            $scope.sheetSettingLanguage = false;
        } else {
            $scope.sheetSettingLanguage = true;
        }
        //判断是否钉钉移动端
        $scope.GetDingMobile = function () {
            var loginfrom = "";
            var source = "";
            var reg = new RegExp("(^|&)loginfrom=([^&]*)(&|$)");
            var r = top.window.location.search.substr(1).match(reg);
            if (r != null)
                loginfrom = unescape(r[2]);

            reg = new RegExp("(^|&)source=([^&]*)(&|$)");
            r = top.window.location.search.substr(1).match(reg);
            if (r != null)
                source = unescape(r[2]);
            $rootScope.source = source;
            if (loginfrom == "dingtalk" && dd && dd.version) {
                $rootScope.dingMobile.isDingMobile = true;
                $rootScope.dingMobile.dingHeaderClass = "";
                $rootScope.dingMobile.dingSubHeaderClass = "has-subheader";
                $rootScope.dingMobile.hideHeader = true;
                // console.log($rootScope.dingMobile.hideHeader)
                $scope.SetDingDingLeft(); // 设置左侧返回
                //钉钉打开消息返回 测试只对android有效
                document.addEventListener('backbutton', function () {
                    if ($state.current.name == "form.detail" && loginfrom == "dingtalk" && dd) {
                        // dd.biz.navigation.close({});
                        dd.biz.navigation.goBack({});
                    }
                });
            }
            if (dd && dd.version) {
                //if (loginfrom == "dingtalk" && dd && dd.version) {
                $rootScope.dingMobile.isDingMobile = true;
                $rootScope.dingMobile.dingHeaderClass = "";
                $rootScope.dingMobile.dingSubHeaderClass = "has-subheader";
                $rootScope.dingMobile.hideHeader = true;
                // $scope.SetDingDingLeft(); // 设置左侧返回
                dd.biz.navigation.setLeft({
                    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                    android: true, // 安卓端如果需要控制左上角返回事件加上这个字段，并设置为true
                    text: '返回',//控制显示文本，空字符串表示显示默认文本
                    onSuccess : function(result) {
                        dd.biz.navigation.goBack({});
                    },
                    onFail : function(err) {
                        dd.biz.navigation.goBack({});
                    }
                })
                $rootScope.loginfrom = "dingtalk";
            } else if (loginfrom == "app") {
                $rootScope.loginfrom = "app";
            } else if (loginfrom == "wechat") {
                $rootScope.loginfrom = "wechat";
            }
        }
        $scope.GetDingMobile();
        $scope.SetDingDingHeader = function (title) {
            //设置Header标题
            if (dd && dd.version) {
                dd.biz.navigation.setTitle({
                    title: title, //控制标题文本，空字符串表示显示默认文本
                    onSuccess: function (result) {
                    },
                    onFail: function (err) {
                        alert(err);
                    }
                });
            }
        }

        // 移动端重写alert方法
        window.alert = function (msg, callback) {
            if (msg.length >= 256) {
                msg = msg.substr(0, 256) + "...";
            }
            if (!callback) {
                var myPopup = $ionicPopup.show({
                    cssClass: 'bpm-sheet-alert',
                    template: '<span class="">' + msg + '<span>'
                });

                $timeout(function () {
                    myPopup.close();
                }, 1500);
            } else {
                $ionicPopup.show({
                    cssClass: 'bpm-sheet-confirm',
                    template: '<span class="bpm-sheet-confirm">' + msg + '<span>',
                    buttons: [{
                        text: '确定',
                        type: 'button-clear',
                        onTap: function (e) {
                            callback();
                        }
                    }]
                });
            }
        }
        //微信表单返回逻辑参数
        $rootScope.orgIndex = window.history.length;
    })

    .controller("formSheetCtrl", function ($rootScope, $scope, $state, $timeout, $compile, $http, $ionicPopup, $ionicPlatform, $ionicTabsDelegate, $cordovaDevice, $cordovaAppVersion, $cordovaNetwork, $ionicScrollDelegate, $ionicActionSheet, $ionicHistory, $ionicModal, fcommonJS, $ionicPopover, httpService, $stateParams, $ionicPosition, $ionicLoading) {
        //PC端html内容
        var _ChildNodes = document.getElementById("content-wrapper").childNodes;
        //内容放置滚动div内，否则不能上下滚动
        $("#mobile-content").find("div.scroll").prepend(_ChildNodes);
        //支持移动端滚动
        $(_ChildNodes).css("overflow", "hidden");
        $scope.includeInit = function() {
            //do nothing
        };
        $scope.scrollEvent = function(e) {
            console.log(e,'e')
        }
        //移动端流程状态
        // console.log(_PORTALROOT_GLOBAL, '_PORTALROOT_GLOBAL');
        $scope.portalroot = _PORTALROOT_GLOBAL;
        $scope.instanceInfo = {};
        $scope.showMoreInfo = false;
        $scope.showHide = function () {
            $scope.showMoreInfo = !$scope.showMoreInfo;
            $ionicScrollDelegate.resize();
            if ($scope.showMoreInfo) {
                $ionicScrollDelegate.scrollBottom();
            }
        }

        //随机头像颜色
        $scope.getRandom = function () {
            var num = Math.floor(Math.random() * 4);
            return num;
        };
        $scope.randomNumbers = [];
        for (var i = 0; i < 5; i++) {
            $scope.randomNumbers.push($scope.getRandom());
        }
        // console.log($scope.randomNumbers[0]);

        //在移动端删除PC框架
        $("div[id*=sheetContent]:first").remove();
        $scope.showCirculate = true;
        $scope.showCirculateHide = function () {
            $scope.showCirculate = !$scope.showCirculate;
        }
        //$("div.row").removeClass("row").addClass("list");
        //add by luwei : 将一行多列的全部转换成一行两列的
        //TODO 只能处理偶数列且必须按照label-value的顺序排列
        $("div.row").each(function () {
            $(this).removeClass("row").addClass("list");

            var rowSelf = $(this);
            var childrenLen = $(this).children().length;

            var emptyRow = $(this).clone().empty();

            $(this).children().each(function (index, element) {
                var bootstrapClass = $(this).attr("class");
                var isFirstCol = index % 2 == 0;
                var indexOfLastDash = bootstrapClass.lastIndexOf("-");
                var prefix = bootstrapClass.substring(0, indexOfLastDash + 1);
                var newClass = isFirstCol ? prefix + "2" : prefix + "10";
                if (bootstrapClass.indexOf("col-") > -1) { //包含栅栏样式
                    var classArray = bootstrapClass.split(" ");
                    for (x in classArray) {
                        if (classArray[x].indexOf("col-") > -1) {
                            $(this).removeClass(classArray[x]);
                            break;
                        }
                    }
                    $(this).addClass(newClass);
                    emptyRow.append($(this));
                    if (!isFirstCol) {
                        rowSelf.before(emptyRow);
                        emptyRow = emptyRow.clone().empty()
                    } else if (isFirstCol && childrenLen - 1 == index) {
                        //FIXME 奇数列的处理
                        rowSelf.before(emptyRow);
                        emptyRow = emptyRow.clone().empty()
                    }
                } else {
                    return true;
                }
            });
            rowSelf.remove();
        });

        //传入ionic 服务
        $.MvcSheetUI.IonicFramework = {
            $rootScope: $rootScope,
            $scope: $scope,
            $state: $state,
            $timeout: $timeout,
            $compile: $compile,
            $ionicActionSheet: $ionicActionSheet,
            $ionicScrollDelegate: $ionicScrollDelegate, // 授权控制滚动视图
            $ionicPosition: $ionicPosition,
            $compile: $compile,
            $ionicPopup: $ionicPopup,
            $ionicModal: $ionicModal,
            $ionicPlatform: $ionicPlatform,
            $ionicLoading: $ionicLoading,
            fcommonJS: fcommonJS,
            $ionicPopover: $ionicPopover//单选多选效果改为侧滑
        };
        //执行入口
        $.MvcSheet.Init(function () {
            try {
                //Header 标题
                var _InstanceTitle = $.MvcSheetUI.SheetInfo.BizObject.DataItems["Sheet__DisplayName"].V;
                $rootScope.InstanceId = $.MvcSheetUI.SheetInfo.InstanceId;
                $rootScope.SheetMode = $.MvcSheetUI.SheetInfo.SheetMode;
                $rootScope.WorkflowCode = $.MvcSheetUI.SheetInfo.WorkflowCode;
                $rootScope.WorkflowVersion = $.MvcSheetUI.SheetInfo.WorkflowVersion;
                $rootScope.InstanceTitle = _InstanceTitle;
                //标签名中英文切换
                $rootScope.names = {
                    Back: SheetLanguages.Current.Back,
                    Spread: SheetLanguages.Current.Spread,
                    Retract: SheetLanguages.Current.Retract,
                    WorkflowCharts: SheetLanguages.Current.WorkflowCharts,
                    Close: SheetLanguages.Current.Close,
                    OK: SheetLanguages.Current.OK,
                    SelectAll: SheetLanguages.Current.SelectAll,
                    UnselectAll: SheetLanguages.Current.UnselectAll,
                    Search: SheetLanguages.Current.Search,
                    Day: SheetLanguages.Current.Day,
                    Hour: SheetLanguages.Current.Hour,
                    Minute: SheetLanguages.Current.Minute,
                    Second: SheetLanguages.Current.Second,
                    State: SheetLanguages.Current.State,
                    SheetUser: SheetLanguages.Current.SheetUser,
                    Approve: SheetLanguages.Current.Approver,
                    Waiting: SheetLanguages.Current.Waiting,
                    Confirm: SheetLanguages.Current.Confirm,
                    Cancel: SheetLanguages.Current.Cancel,
                    PleaseSelect: SheetLanguages.Current.PleaseSelect,
                    Query: SheetLanguages.Current.Query,
                    AssociatedSheet: SheetLanguages.Current.AssociatedSheet,
                    Reset: SheetLanguages.Current.Reset,
                    NoMoreData: SheetLanguages.Current.NoMoreData,
                    States: SheetLanguages.Current.States
                };
                // console.log($rootScope.names);
                //修改样式为每个item加上下划线
                $("#masterContent_divContent .list>div.item").addClass('hasBorderBottom');
                $(".attachment.item").removeClass("hasBorderBottom");
                $(".slider-slides .item").removeClass("hasBorderBottom");
                $(".SheetGridView").addClass('hasBorderBottom');
                $(".SignaturePanel").addClass("hasBorderBottom");
                $(".InputPanel").addClass("hasBorderBottom");
                $scope.SetDingDingHeader($rootScope.InstanceTitle)
                //流程状态初始化
                // console.log($rootScope.InstanceId);
                httpService.get('Mobile/LoadInstanceState', {instanceID: $rootScope.InstanceId}).then(function (res) {
                    // console.log(res, '流程状态初始化');
                    // Fixed: ZAF-2019年1月14日 后台接口改变 导致审批流程无法显示
                    // console.log(res,'res')
                    if (res.code == 200) {
                        var data = res.data;
                        $scope.instanceInfo.BaseInfo = data.baseInfo;
                        if (data.baseInfo.Approvers.length > 3) {
                            $scope.instanceInfo.BaseInfo.Approvers = data.baseInfo.Approvers.slice(0, 3).join(',') + '...';
                        } else {
                            $scope.instanceInfo.BaseInfo.Approvers = data.baseInfo.Approvers.join(',');
                        }
                        $scope.instanceInfo.InstanceLogInfo = data.instanceLogInfoList;
                    }  else if(res.Success) { // 旧版的移动端
                        var data = res;
                        $scope.instanceInfo.BaseInfo = data.BaseInfo;
                        if (data.BaseInfo.Approvers.length > 3) {
                            $scope.instanceInfo.BaseInfo.Approvers = data.BaseInfo.Approvers.slice(0, 3).join(',') + '...';
                        } else {
                            $scope.instanceInfo.BaseInfo.Approvers = data.BaseInfo.Approvers.join(',');
                        }
                        $scope.instanceInfo.InstanceLogInfo = data.InstanceLogInfo;
                    }
                    else {
                        $scope.instanceInfo = false;
                    }
                }, function (reason) {
                    fcommonJS.showShortTop(reason);
                });
            } catch (e) {
            }
        });
        //打开流程图
        $scope.openFlowChart = function (e) {
            $state.go("form.instancestate", {
                Mode: $rootScope.SheetMode,
                InstanceID: $rootScope.InstanceId,
                WorkflowCode: $rootScope.WorkflowCode,
                WorkflowVersion: $rootScope.WorkflowVersion
            })
        }

        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            if ($rootScope.fetchUserSelect) {
                $rootScope.fetchUserSelect.ClearChoices();
                $rootScope.fetchUserSelect.SetValue("");
            }
            if ($rootScope.dingMobile.isDingMobile && dd) {
                $scope.SetDingDingHeader($rootScope.InstanceTitle)
                //设置header 右边按钮
                dd.biz.navigation.setRight({
                    show: false
                });
                //ios的消息返回
                dd.biz.navigation.setLeft({
                    control: true,
                    onSuccess: function (result) {
                        if ($state.current.name == "form.detail") {
                            dd.biz.navigation.goBack({});
                        } else {
                            window.history.back()
                        }
                    },
                    onFail: function (err) {
                    }
                });
            }
        });

        //SheetUser完成事件
        $rootScope.$on('sheetUserFinished', function (event, data) {
            if (data.dataField == "fetchUserSelectundefined") {
                var ngmodel = data.dataField;
                var the = $scope[ngmodel];
                if (!the)
                    return;
                the.ClearChoices();
                the.SetValue(data.obj);
                var tagName = ngmodel;
                if (tagName.indexOf('.') > -1) {
                    tagName = tagName.replace('.', '_');
                }
                $scope["sheetUsers" + tagName] = data.SelectItems;
            } else {
                var ngmodel = data.dataField + data.rowNum;
                var the = $scope[ngmodel];
                the.ClearChoices();
                the.SetValue(data.obj);
            }
        });

        $scope.delUserItem = function (index, tagName) {
            var deleteItem = $scope["sheetUsers" + tagName][index];
            $scope["sheetUsers" + tagName].splice(index, 1);
            if (tagName.indexOf('_') > -1) {
                tagName = tagName.replace('_', '.').replace('_', '.').replace('.', '_');
            }
            $scope[tagName].RemoveChoice(deleteItem.id);
        }
        //表单上的返回按钮
        $scope.ClosePage = function () {
            if ($rootScope.dingMobile.isDingMobile) {
                window.history.back();
                //钉钉的已隐藏
            } else if (typeof (WeixinJSBridge) != "undefined") {
                //微信关闭
                if ($rootScope.source == "message") {
                    WeixinJSBridge.call("closeWindow");
                } else {
                    //update by ouyangsk 微信中点击返回按钮会出现点击无效的情况，所以注释
                    window.history.back();
                }
            } else {
                //update by ouyangsk 判断PC端还是app
                // if (window.cordova) {
                 if (window.plugins) {
                    //app关闭
                    // window.open($.MvcSheetUI.PortalRoot + "/Mobile/index.html/tab.home", '_self');
                    console.log($scope,'app关闭')
                } else {
                    // add by zcw 移动端流程表单关闭 // go 移动端 流程表单返回按钮 区分 与发起流程做区别
                    /*var reg= new RegExp("(^|&)" +"go" +"=([^&]*)(&|$)","i");
                     var r = window.location.search.substr(1).match(reg);
                     var go;
                     try{
                     go=unescape(r[2]);
                     }catch(error){}

                     if(go==-2){
                     //var appCenterItemUrl = window.localStorage.getItem("OThinker.H3.Mobile.AppCenterItemUrl");
                     //window.localStorage.removeItem("OThinker.H3.Mobile.AppCenterItemUrl");
                     //window.location.href = appCenterItemUrl;
                     }else {
                     window.history.back();
                     }*/
                    window.history.back();
                    // window.open($.MvcSheetUI.PortalRoot + "/Mobile/index.html/tab.home", '_self');
                }
            }
        }
    })

    //选人控件
    .controller('sheetUserCtrl', function ($rootScope, $scope, $ionicActionSheet, $state, $stateParams, $ionicBackdrop, $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicHistory, sheetUserService, $ionicScrollDelegate) {
        $scope.sheetUserHandler = "SheetUser/LoadOrgTreeNodes";
        $scope.SelectFormStructure = !($.MvcSheetUI.sheetUserParams.loadOptions.indexOf("RootUnitID") < 0 && $.MvcSheetUI.sheetUserParams.options.UserVisible && $.MvcSheetUI.sheetUserParams.loadOptions.indexOf("VisibleUnits") < 0);
        $scope.init = function () {
            $scope.UserOUMembers = [];//所在部门人员
            $scope.Organizations = []; //部门成员
            $scope.deptNav = [];  //导航数据项  { id;"",name:"",index:""}
            $scope.showDeptID = "";//当前部门id
            $scope.CacheData = {};//缓存数据
            $scope.SelectItems = [];//已选
            $scope.checkedstetus = false;//全选
            //搜索相关
            $scope.searchKey = "";
            $scope.SearchMode = false;
            $scope.searchedKeys = [];
            $scope.searchItems = [];//搜索结果
            $scope.searchedItems = [];//搜索缓存数据
            //搜索展示人员还是部门
            $scope.SearchEmp = false;
            $scope.SearchDep = false;
            //是否进行过搜索标记
            $scope.searchOver = false;
        };
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.sheetUserParams = $.MvcSheetUI.sheetUserParams;
            // $scope.sheetUserParams.isMutiple = false;
            // console.log($scope.sheetUserParams, 'scope.sheetUserParams');
            $scope.ShowCurrentDept = $scope.sheetUserParams.loadOptions.indexOf("RootUnitID") < 0 && $scope.sheetUserParams.options.UserVisible && $scope.sheetUserParams.loadOptions.indexOf("VisibleUnits") < 0;
            $scope.init();
            $scope.SelectItems = sheetUserService.initItems($scope.sheetUserParams.initUsers);
            //设置已选-从组织架构中选择
            $scope.selectedName = sheetUserService.getSelectedName($scope.SelectItems);
            $scope.InitOUMembers();
            if (!$scope.ShowCurrentDept) {
                $scope.SelectStructure(true);
            } else {
                $scope.SelectFormStructure = false;
                $scope.checkedpagestaue();//检测组织页面是否选中
                $scope.checkedstetus = true;
            }
        });

        //初始化本部门人员
        $scope.InitOUMembers = function () {
            //if (!$.MvcSheetUI.SheetInfo.UserOUMembers && $scope.sheetUserParams.options.UserVisible) {
            $.MvcSheetUI.SheetInfo.UserOUMembers = [];
            var parentUnits = $.MvcSheetUI.SheetInfo.DirectParentUnits;
            //update by luxm
            //选人控件进入时设置了UserCodes的情况
            // var querystr = $scope.sheetUserParams.loadOptions.replace("&VisibleUnits=", "&V=");
            var querystr = $scope.sheetUserParams.loadOptions;
            var UserCodes = '';
            if (querystr) {
                var str = querystr.split('&');
                var strlist = null;
                for (var query in str) {
                    if (str[query].indexOf('UserCodes') != -1) {
                        strlist = str[query].split('=');
                        UserCodes = strlist[1];
                    }
                }
            }
            // console.log("查询字符串" + querystr);
            // console.log(parentUnits, 'parentUnits');
            for (var key in parentUnits) {
                sheetUserService.loadData($scope.sheetUserHandler + "?IsMobile=true&ParentID=" + key + "&o=U&UserCodes=" + UserCodes, null).then(function (res) {
                    var filterdata = $.grep(res, function (value) {
                        if (value.ExtendObject.UnitType == "U") {
                            return value;
                        }
                    });
                    $.MvcSheetUI.SheetInfo.UserOUMembers = $.MvcSheetUI.SheetInfo.UserOUMembers.concat(filterdata);
                    //获取所在部门人员
                    $scope.UserOUMembers = sheetUserService.sheetUserAdapter($.MvcSheetUI.SheetInfo.UserOUMembers, $scope.sheetUserParams.selecFlag);
                    //update by luxm
                    //钉钉有缓存会导致计数错误需要初始化
                    checkedUI = 0;
                    checkedNumber = 0;
                    //所在部门设置已选-所在部门
                    $scope.UserOUMembers = sheetUserService.checkItems($scope.UserOUMembers, $scope.SelectItems);
                    angular.forEach($scope.SelectItems, function (obj) {
                        if (obj.type == "G" || obj.type == "O") {
                            checkedUI++;
                        } else {
                            if (obj.type == "U") {
                                checkedNumber++;
                            }
                        }
                    })
                    $scope.countNumber();
                })
            }
            //update by luxm
            //加载选人控件时需要动态计数，动态显示，待优化
//         } else {
//             $scope.UserOUMembers = sheetUserService.sheetUserAdapter($.MvcSheetUI.SheetInfo.UserOUMembers, $scope.sheetUserParams.selecFlag);
//             //所在部门设置已选-所在部门
//             $scope.UserOUMembers = sheetUserService.checkItems($scope.UserOUMembers, $scope.SelectItems);
//         }
        };

        //从组织架构中选择
        $scope.SelectStructure = function (SelectFormStructure) {
            $scope.SelectFormStructure = SelectFormStructure;
            //获取根节点信息
            // var querystr = $scope.sheetUserParams.loadOptions.replace("&VisibleUnits=", "&V=");
            var querystr = $scope.sheetUserParams.loadOptions;
            sheetUserService.loadData($scope.sheetUserHandler + "?LoadTree=true&Recursive=true&isMobile=true&" + querystr, null).then(function (res) {
                window.console.log("querystr" + querystr);
                //update by luxm
                if (querystr.indexOf("UserCodes") < 0) {
                    $scope.showDeptID = res[0].ObjectID;
                    $scope.deptNav.push({
                        id: res[0].ObjectID,
                        // name: sheetUserService.decrypt(res[0].Text),
                        name: res[0].Text,
                        pid: "",
                        index: "0"
                    });
                }
            });
            //加载数据
            if ($scope.CacheData[""]) {
                $scope.getCacheData("");
            } else {
                $scope.getData("");
            }
        };
        //
        $scope.itemClick = function (e, org) {
            //if ($scope.deptNav.length && $scope.deptNav[$scope.deptNav.length - 1].id == org.id) {
            //    return;
            //}
            var Percent = e.clientX / screen.availWidth * 100;
            if (org.type != "U" && org.root != true && !$scope.SearchMode && (!org.canSelect || Percent > 15)) {
                //展开部门
                $ionicScrollDelegate.scrollTop();
                org.checked = !org.checked;
                $scope.deptNav.push({
                    id: org.id,
                    name: org.name,
                    pid: $scope.showDeptID,
                    index: "1"
                });
                $scope.showDeptID = org.id;
                //加载数据
                if ($scope.CacheData[org.id]) {
                    $scope.getCacheData(org.id);
                } else {
                    $scope.getData(org.id)
                }
            } else {
                //选中
                $scope.addItem(e, org)
            }
        };
        //添加
        $scope.addItem = function (e, item) {
            var i = item;
            if (e.target.tagName.toLowerCase() != "input") {
                item.checked = !item.checked;
            }
            if (item.checked) {
                if (!$scope.sheetUserParams.isMutiple) {
                    if (item.type == "U") {
                        checkedNumber++;
                    } else {
                        checkedUI++;
                    }
                    $scope.countNumber();
                    $scope.SelectItems = new Array();
                    $scope.SelectItems.push(i);
                    $scope.sheetUserFinished();
                } else {
                    if (item.type == "U") {
                        checkedNumber++;
                    } else {
                        checkedUI++;
                    }
                    $scope.countNumber();
                    $scope.SelectItems.push(i);
                }
            } else {
                //删除已选
                if (item.type == "U") {
                    checkedNumber--;
                } else {
                    checkedUI--;
                }
                $scope.countNumber();
                $scope.SelectItems = sheetUserService.removeItem($scope.SelectItems, item);
            }
            $scope.initcheckedStetus($scope.Organizations, $scope.SelectItems.length);//改变全选按钮状态
            $scope.selectedName = sheetUserService.getSelectedName($scope.SelectItems);
            if (!$scope.SelectFormStructure) {
                $scope.checkedpagestaue();
            }
        };
        //删除已选
        $scope.delItem = function (index) {
            var deleteItem = $scope.SelectItems[index];
            if (deleteItem.type == "U") {
                checkedNumber--;
            } else {
                checkedUI--;
            }
            $scope.countNumber();
            $scope.SelectItems.splice(index, 1);
            //更新当前页面数据
            $scope.Organizations = sheetUserService.deleteSelectItem($scope.Organizations, $scope.SelectItems);
            $scope.UserOUMembers = sheetUserService.deleteSelectItem($scope.UserOUMembers, $scope.SelectItems);
            $scope.SelectItems = sheetUserService.removeItem($scope.SelectItems, deleteItem);
            $scope.selectedName = sheetUserService.getSelectedName($scope.SelectItems);
            $scope.initcheckedStetus($scope.Organizations, $scope.SelectItems.length);//改变全选按钮状态
        };
        //部门导航点击事件
        $scope.navClick = function (deptId, index) {
            $scope.deptNav = $scope.deptNav.slice(0, index + 1);
            //加载数据
            if ($scope.CacheData[deptId]) {
                $scope.getCacheData(deptId);
            } else {
                $scope.getData(deptId);
            }
            $scope.showDeptID = deptId;
        };
        //加载数据
        $scope.getData = function (parentid) {
            // console.log(parentid, 'parentid')
            // var querystr = $scope.sheetUserParams.loadOptions.replace("&VisibleUnits=", "&V=");
            var querystr = $scope.sheetUserParams.loadOptions;
            sheetUserService.loadData($scope.sheetUserHandler + "?ParentID=" + parentid + "&isMobile=true&" + querystr, null).then(function (res) {
                $scope.Organizations = sheetUserService.sheetUserAdapter(res, $scope.sheetUserParams.selecFlag);
                // console.log($scope.Organizations, '$scope.Organizations')
                //是否加根节点
                //update by luxm
                //如果设置了sheetusercode则不加载组织根节点
                if (parentid == "" && $scope.sheetUserParams.options.RootSelectable &&
                    $scope.sheetUserParams.options.OrgUnitVisible == "true" &&
                    !$scope.sheetUserParams.options.UserCodes) {
                    var root = {
                        Icon: "icon-zuzhitubiao",
                        canSelect: true,
                        checked: false,
                        code: $scope.deptNav[0].id,
                        id: $scope.deptNav[0].id,
                        name: $scope.deptNav[0].name,
                        type: "O",
                        root: true
                    };
                    $scope.Organizations.unshift(root);
                }
                $scope.checkedstetus = true;//是否全选
                $scope.Organizations = sheetUserService.checkItems($scope.Organizations, $scope.SelectItems);
                $scope.initcheckedStetus($scope.Organizations, $scope.SelectItems.length);//改变全选按钮状态
                // console.log($scope.Organizations, '$scope.Organizations')
                if (parentid == "" && $scope.sheetUserParams.options.RootSelectable && $scope.sheetUserParams.options.OrgUnitVisible == "true") {
                    //update by luxm
                    if (!$scope.sheetUserParams.options.UserCodes) {
                        $scope.CacheData[$scope.deptNav[0].id] = $scope.Organizations;
                    }
                } else {
                    $scope.CacheData[parentid] = $scope.Organizations;
                }
            })
        };
        //加载缓存数据
        $scope.getCacheData = function (deptId) {
            $scope.Organizations = $scope.CacheData[deptId];
            $scope.Organizations = sheetUserService.checkItems($scope.Organizations, $scope.SelectItems);
            $scope.Organizations = sheetUserService.deleteSelectItem($scope.Organizations, $scope.SelectItems);
            $scope.initcheckedStetus($scope.Organizations, $scope.SelectItems.length);//改变全选按钮状态
        }

        //选择完成，回到表单页面
        $scope.sheetUserFinished = function () {
            var objs = sheetUserService.convertItems($scope.SelectItems);
            var rowNum = $scope.sheetUserParams.options.RowNum;
            //$rootScope.$broadcast("sheetUserFinished", { dataField: $scope.sheetUserParams.dataField, obj: objs, rowNum: rowNum });
            $rootScope.$broadcast("sheetUserFinished", {
                dataField: $scope.sheetUserParams.dataField,
                obj: objs,
                rowNum: rowNum,
                SelectItems: $scope.SelectItems,
                scope: $scope
            });
            $scope.init();
            //update by ouyangsk 因为ionic控件goBack会导致后退循环，故此处改用history.back
            //$ionicHistory.goBack();
            window.history.back();
        };
        //搜索
        $scope.goToSeach = function () {
            $scope.SearchMode = true;
        };
        //清理缓存数据
        $scope.$watch('SearchMode', function (n, o) {
            if (n != true) {
                $scope.searchItems = [];
            }
        })
        //添加
        $scope.addSearchItem = function (e, item) {
            $scope.addItem(e, item);
            if (item.checked) {
                if (!$scope.sheetUserParams.isMutiple) {
                    $scope.closeSearchModal();
                }
            }
        };
        //清除
        $scope.resetSearchKey = function (e) {
            var Percent = e.clientX / screen.availWidth * 100;
            if ($scope.searchKey != "" && Percent > 90) {
                //清除搜索关键词
                $scope.searchKey = "";
            }
        };
        var timer = null;
        $scope.doSearch = function (key) {
            $timeout.cancel(timer);
            //搜索展示人员还是部门
            $scope.SearchEmp = false;
            $scope.SearchDep = false;
            $scope.searchOver = false;
            if (!key)
                return;
            var cacheKey = key + ($scope.showDeptID || "");
            $scope.searchItems = [];
            //查询是否已经缓存
            var isSearched = $scope.searchedKeys.some(function (n) {
                return n === cacheKey;
            });
            //已经缓存，从缓存中获取
            if (isSearched) {
                $scope.searchedItems.forEach(function (currentItem) {
                    if (currentItem.key === cacheKey) {
                        if (currentItem.type == "U") {
                            $scope.SearchEmp = true;
                        }
                        if (currentItem.type == "O" || currentItem.type == "G") {
                            $scope.SearchDep = true;
                        }
                        var text = currentItem.name;
                        var regExp = new RegExp(cacheKey, 'g');
                        var result = text.replace(regExp, '<b class="userSearched">' + cacheKey + '</b>');
                        currentItem.names = result;
                        $scope.searchItems.push(currentItem);
                    }
                });
                $scope.searchItems = sheetUserService.checkItems($scope.searchItems, $scope.SelectItems);
                $scope.searchOver = true;
            } else { //从服务器端获取数据
                //延迟加载数据
                timer = $timeout(function () {
                    $scope.searchedKeys.push(cacheKey);
                    // var querystr = $scope.sheetUserParams.loadOptions.replace("&VisibleUnits=", "&V=");
                    var querystr = $scope.sheetUserParams.loadOptions;
                    var loadUrl = $scope.sheetUserHandler + "?" + querystr;
                    var params = {
                        ParentID: $scope.showDeptID || "",
                        SearchKey: encodeURI(key),
                        IsMobile: true
                    };
                    sheetUserService.loadData(loadUrl, params).then(function (res) {
                        var users = sheetUserService.sheetUserAdapter(res);
                        users.forEach(function (currentItem) {
                            if (currentItem.type == "U") {
                                $scope.SearchEmp = true;
                            } else if (currentItem.type == "O" || currentItem.type == "G") {
                                $scope.SearchDep = true;
                            }
                            currentItem.key = cacheKey;
                            var text = currentItem.name;
                            var regExp = new RegExp(cacheKey, 'g');
                            var result = text.replace(regExp, '<b class="userSearched">' + cacheKey + '</b>');
                            currentItem.names = result;
                            $scope.searchedItems.push(currentItem)
                            $scope.searchItems.push(currentItem);
                        });
                        $scope.searchItems = sheetUserService.checkItems($scope.searchItems, $scope.SelectItems);
                        $scope.searchOver = true;
                    });
                }, 500);
            }

        };
        //关闭
        $scope.cancel = function () {
            $scope.sheetUserFinished();
            //$(".detail").filter(".item-icon-right").children("span");
        };
        //全选按钮状态
        /*$scope.checkedstetus = true;标识全选按钮不选中
         *objs：当前能选的数据
         *stetus：已经选中的数组的长度
         */
        $scope.initcheckedStetus = function (objs, len) {//$scope.SelectItems.length
            // console.log(objs, len, 'objs----------')
            if ($scope.Organizations.length == 0 || !$scope.SelectFormStructure) {
                objs = $scope.UserOUMembers;
            }
            if (len == 0) {
                $scope.checkedstetus = true;
                return false;
            }
            var going = true;
            angular.forEach(objs, function (obj) {
                if (going) {
                    if (obj.canSelect && obj.checked) {//已经选中则跳过
                        $scope.checkedstetus = false;
                    } else if (obj.canSelect && !obj.checked) {//能选但是未选中则直接返回
                        $scope.checkedstetus = true;
                        going = false;
                    }
                }
            });
        };
        //用于检测组织结构页面的数据是否选中
        $scope.checkedpagestaue = function () {
            if (!$scope.SelectFormStructure && $scope.SelectItems.length != 0) {//组织结构的页面
                var i = 0;
                angular.forEach($scope.UserOUMembers, function (obj) {
                    var going = true;
                    angular.forEach($scope.SelectItems, function (SelectItem) {
                        if (going) {
                            if (obj.id == SelectItem.id) {//选中
                                i = i + 1;
                                obj.checked = true;
                                going = false;
                            } else {
                                obj.checked = false;
                            }
                        }
                    });
                });
                if (i == $scope.UserOUMembers.length) {
                    $scope.checkedstetus = false;//全选按钮选中
                } else {
                    $scope.checkedstetus = true;//全选按钮B部选中
                }
            } else if (!$scope.SelectFormStructure && $scope.SelectItems.length == 0) {//当没有选中的情况下，相当于要把当前部门取消全选
                $scope.checkedObj($scope.UserOUMembers, false);//取消选中
            }
        }
        //全选
        $scope.checkedObj = function (objs, stetus) {
            $timeout(function () {
                angular.forEach(objs, function (obj) {
                    if (obj.canSelect && stetus) {//选中
                        var i = obj;
                        if (!obj.checked) {//没有选中的要选中
                            obj.checked = true;
                            if (!$scope.sheetUserParams.isMutiple) {//单选
                                $scope.SelectItems = new Array();
                                $scope.SelectItems.push(i);
                                $scope.sheetUserFinished();
                            } else {
                                $scope.SelectItems.push(i);
                            }
                        }
                    } else if (obj.canSelect && !stetus) {
                        obj.checked = false;
                        $scope.SelectItems = sheetUserService.removeItem($scope.SelectItems, obj);
                    }
                });

                angular.forEach($scope.SelectItems, function (obj) {
                    if (obj.type == "G" || obj.type == "O") {
                        checkedUI++;
                    } else {
                        checkedNumber++;
                    }
                })
                $scope.countNumber();
            });
        }
        //前端展示已选人的数目
        var checkedNumber = 0;
        //前端展示已选组和部门数
        var checkedUI = 0;
        $scope.checkedAll = function ($event) {
            if ($scope.checkedstetus) {//全选
                if ($scope.Organizations.length == 0 || !$scope.SelectFormStructure) {
                    checkedNumber = 0;
                    checkedUI = 0;
                    $scope.checkedObj($scope.UserOUMembers, true);
                } else {
                    checkedNumber = 0;
                    checkedUI = 0;
                    $scope.checkedObj($scope.Organizations, true);
                    /*angular.forEach($scope.SelectItems,function(obj){
                     if(obj.type=="G" || obj.type=="O"){
                     checkedUI++ ;
                     }else {
                     checkedNumber++;
                     }
                     })
                     $scope.countNumber();*/
                }
                $scope.checkedstetus = false;
            }
            else {
                if ($scope.Organizations.length == 0 || !$scope.SelectFormStructure) {
                    checkedNumber = 0;
                    checkedUI = 0;
                    $scope.checkedObj($scope.UserOUMembers, false);
                    /*angular.forEach($scope.SelectItems,function(obj){
                     if(obj.type=="G" || obj.type=="O"){
                     checkedUI++ ;
                     }else {
                     checkedNumber++;
                     }
                     })
                     $scope.countNumber();*/
                } else {
                    checkedNumber = 0;
                    checkedUI = 0;
                    $scope.checkedObj($scope.Organizations, false);
                    /* angular.forEach($scope.SelectItems,function(obj){
                     if(obj.type=="G" || obj.type=="O"){
                     checkedUI++ ;
                     }else {
                     checkedNumber++;
                     }
                     })
                     $scope.countNumber();*/
                }
                $scope.checkedstetus = true;
            }
        };
        //update by luxm前端展示选中数量
        $scope.countNumber = function () {
            angular.element($('#selectAll').children("span")).remove();
            //update by ouyangsk
            var lang = window.localStorage.getItem('H3.Language') || 'zh_cn';
            if (lang == 'en_us') {
                angular.element($('#selectAll')).append("<span>All(People" + checkedNumber + ",Dept" + checkedUI + ")</span>");
                angular.element($('#confirm')).empty();
                angular.element($('#confirm')).append("OK(" + checkedNumber + ")");
            } else {
                angular.element($('#selectAll')).append("<span>全选(已选" + checkedNumber + "人,部门" + checkedUI + ")</span>");
                angular.element($('#confirm')).empty();
                angular.element($('#confirm')).append("确定(" + checkedNumber + ")");
            }
        };
        //返回上级组织
        $scope.goBack = function () {
            $ionicScrollDelegate.scrollTop();
            if ($scope.SearchMode) {
                $("input[type='search']").blur();
                $scope.SearchMode = false;
                $scope.searchItems = [];
                $scope.searchKey = "";
                $scope.Organizations = sheetUserService.checkItems($scope.Organizations, $scope.SelectItems);
                $scope.UserOUMembers = sheetUserService.checkItems($scope.UserOUMembers, $scope.SelectItems);

                $scope.Organizations = sheetUserService.deleteSelectItem($scope.Organizations, $scope.SelectItems);
                $scope.UserOUMembers = sheetUserService.deleteSelectItem($scope.UserOUMembers, $scope.SelectItems);
                //update by luxm
                if ($scope.deptNav && $scope.deptNav.length > 0) {
                    var id = $scope.deptNav[$scope.deptNav.length - 1].id;
                    if ($scope.CacheData[id]) {
                        $scope.getCacheData(id);
                    } else {
                        $scope.getData(id);
                    }
                    $scope.showDeptID = id;
                }
                $scope.SearchMode = false;
                return;
            }
            if ($scope.deptNav.length == 0 || ($scope.deptNav.length == 1 && !$scope.ShowCurrentDept)) {
                $scope.sheetUserFinished();
                //update by ouyangsk
                //$ionicHistory.goBack();
            } else {
                $scope.deptNav = $scope.deptNav.slice(0, $scope.deptNav.length - 1);
                if ($scope.deptNav.length == 0) {
                    $scope.SelectFormStructure = false;
                    $scope.checkedpagestaue();//组织结构页面
                } else {
                    var id = $scope.deptNav[$scope.deptNav.length - 1].id;
                    if ($scope.CacheData[id]) {
                        //$scope.Organizations = $scope.CacheData[id];
                        $scope.getCacheData(id);
                    } else {
                        $scope.getData(id);
                    }
                    $scope.showDeptID = id;
                }
            }
            $scope.countNumber();
            //$(".detail").filter(".item-icon-right").children("span").removeAttr("style");
        };

    })

    //查询列表
    .controller("sheetQueryCtrl", function ($rootScope, $scope, $state, $stateParams, $http, $ionicActionSheet, $ionicHistory, fcommonJS, $SheetQuery) {
        console.log($stateParams);
        $scope.choosedObjectId = $stateParams.objectid;
        //查询需要参数
        var sheetQuery = {
            controlManager: {}, //父控件实例
            dataField: "",
            rowNum: "",
            schemaCode: "",
            queryCode: "",
            filter: [],
            inputMappings: "",
            outputMappings: ""
        }
        $scope.OutputMapJson = {};
        $scope.InputMapJson = {};
        $scope.viewModel = [];
        $scope.displayColumns = [];
        $scope.columnNames = [];
        $scope.PageSize = 10; //分页数据
        $scope.NextPageIndex = 0; //当前页数，
        $scope.LoadFinished = false; //是否加载完成
        $scope.IsBindInputVlues = false;
        $scope.HasBindFilters = false;

        //初始化参数
        $scope.initParams = function () {
            sheetQuery.dataField = $stateParams.datafield;
            sheetQuery.rowNum = $stateParams.rownum;
            sheetQuery.controlManager = $.MvcSheetUI.GetElement(sheetQuery.dataField, sheetQuery.rowNum).SheetUIManager();
            if (sheetQuery.controlManager) {
                sheetQuery.schemaCode = sheetQuery.controlManager.SchemaCode;
                sheetQuery.queryCode = sheetQuery.controlManager.QueryCode;
                if (sheetQuery.controlManager.InputMappings) {
                    sheetQuery.inputMappings = sheetQuery.controlManager.InputMappings;
                }
                if (sheetQuery.controlManager.OutputMappings) {
                    sheetQuery.outputMappings = sheetQuery.controlManager.OutputMappings;
                }
            }
        }

        $scope.SetQueryValue = function (item) {
            console.log(item);
            //选中效果
            $scope.choosedObjectId = item.oldItem.ObjectID;
            console.log($scope.OutputMapJson);
            for (var key in $scope.OutputMapJson) {
                if (key == sheetQuery.dataField) {
                    var objValue = $scope.OutputMapJson[key];
                    var objArry = objValue.split(';');
                    if (objArry && objArry.length > 0) {
                        var dataArry = [];
                        for (var j = 0; j < objArry.length; j++) {
                            dataArry[j] = item.oldItem[objArry[j]];
                        }
                        console.log(dataArry);
                        sheetQuery.controlManager.SetValue(dataArry);
                    } else {
                        console.log(item.oldItem[$scope.OutputMapJson[key]]);
                        sheetQuery.controlManager.SetValue(item.oldItem[$scope.OutputMapJson[key]])
                    }
                    //当前控件，直接赋值
                    //赋值后自动验证
                    try {
                        sheetQuery.controlManager.Validate()
                    } catch (e) {
                    }
                } else {
                    var e = $.MvcSheetUI.GetElement(key, sheetQuery.rowNum);
                    if (e != null && e.data($.MvcSheetUI.SheetIDKey)) {
                        e.SheetUIManager().SetValue(item.oldItem[$scope.OutputMapJson[key]]);
                        if (e.SheetUIManager().Validate) {
                            e.SheetUIManager().Validate();
                        }
                    }
                }
            }
            //$ionicHistory.goBack();
        }

        //读取inputmapping映射值
        $scope.GetInputMappings = function () {
            var inputJson = {};
            if ($scope.InputMapJson) {
                for (var key in $scope.InputMapJson) {
                    if ($scope.InputMapJson[key])
                        if ($scope.InputMapJson[key].GetValue() !== "") {
                            inputJson[key] = $scope.InputMapJson[key].GetValue();
                        }
                }
            }
            return JSON.stringify(inputJson);
        }
        //处理传入参数映射配置，对应的值是控件的实例
        $scope.InputMappingSetting = function () {
            var mapping = sheetQuery.inputMappings.split(',');
            if (!mapping) {
                $scope.InputMapJson = null;
            }
            for (var i = 0; i < mapping.length; i++) {
                var map = mapping[i].split(':');
                var targetDataField = map[0];
                var e = $.MvcSheetUI.GetElement(targetDataField, sheetQuery.rowNum);
                if (e != null) {
                    $scope.InputMapJson[map[1]] = e.SheetUIManager();
                }
            }
        }
        //处理映射配置
        $scope.MappingSetting = function () {
            var mapping = sheetQuery.outputMappings.split(',');

            for (var i = 0; i < mapping.length; i++) {
                var map = mapping[i].split(':');
                $scope.OutputMapJson[map[0]] = map[1];
            }
            $scope.InputMappingSetting();
        }

        //初始化参数
        $scope.initParams();
        $scope.MappingSetting();

        $scope.GetDisplayName = function (key) {
            if (!$scope.columnNames)
                return key;
            return $scope.columnNames[key] || key;
        }

        /// <summary>
        /// 控件类型
        /// </summary>
        $scope.ControlType = {
            /// <summary>
            /// 文本框类型
            /// </summary>
            TextBox: 0,
            /// <summary>
            /// 下拉框类型
            /// </summary>
            DropdownList: 1,
            /// <summary>
            /// 单选框类型
            /// </summary>
            RadioButtonList: 2,
            /// <summary>
            /// 复选框类型
            /// </summary>
            CheckBoxList: 3,
            /// <summary>
            /// 长文本框类型
            /// </summary>
            RichTextBox: 4
        }

        //绑定过滤条件控件
        $scope.BindFilter = function () {
            $scope.HasBindFilters = true;
            if (!sheetQuery.filter || sheetQuery.filter.length == 0)
                return;
            $scope.FilterPanelID = $.MvcSheetUI.NewGuid();
            this.FilterPanel = $("#divFilter");
            //添加过滤项
            var ulElement = $("<ul>").addClass("list").appendTo(this.FilterPanel);
            for (var i = 0; i < sheetQuery.filter.length; i++) {
                var filterItem = sheetQuery.filter[i];
                if (!filterItem.Visible)
                    continue; //不可见
                if (filterItem.FilterType == 3)
                    continue; //系统参数

                var defaultVal = filterItem.DefaultValue;
                if (this.InputMapJson[filterItem.PropertyName]) {
                    //传入参数
                }
                var liElement = $("<li>").appendTo(ulElement).addClass("item item-input");
                var label = $("<label for='" + $scope.FilterPanelID + filterItem.PropertyName + "'>" + $scope.GetDisplayName(filterItem.PropertyName) + "</label>").addClass("input-label");
                liElement.append(label);
                switch (filterItem.DisplayType) {
                    case $scope.ControlType.DropdownList:
                        var input = $("<select id='" + $scope.FilterPanelID + filterItem.PropertyName + "' data-property='" + filterItem.PropertyName + "'>");
                        input.append("<option value=''>" + SheetLanguages.Current.All + "</option>");
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                input.append("<option value='" + vals[j] + "'>" + vals[j] + "</option>");
                            }
                        }
                        input.val(filterItem.DefaultValue);
                        liElement.append(input);
                        break;

                    case $scope.ControlType.RadioButtonList:
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                var newid = $.MvcSheetUI.NewGuid();
                                liElement.append("<input id='" + newid + "' type='radio' name='" + filterItem.PropertyName + "' value='" + vals[j] + "'></input>");
                                liElement.append("<label for='" + newid + "'>" + vals[j] + "</label>");
                            }
                        }
                        $("input[name='" + filterItem.PropertyName + "'][value='" + filterItem.DefaultValue + "']").attr("checked", "checked")
                        liElement.append("<br style='clear: both;'></br>");
                        break;

                    case $scope.ControlType.CheckBoxList:
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                var newid = $.MvcSheetUI.NewGuid();
                                liElement.append("<input id='" + newid + "' type='checkbox' name='" + filterItem.PropertyName + "' value='" + vals[j] + "'></input>");
                                liElement.append("<label for='" + newid + "'>" + vals[j] + "</label>");
                            }
                        }
                        $("input[name='" + filterItem.PropertyName + "'][value='" + filterItem.DefaultValue + "']").attr("checked", "checked")
                        liElement.append("<br style='clear: both;'></br>");
                        break;

                    default:
                        //Error:文本类型，需要判断FilterType 和 LogicType,日期、数字 范围
                        liElement.append("<input type='text' id='" + $scope.FilterPanelID + filterItem.PropertyName + "' data-property='" + filterItem.PropertyName + "' placeholder='" + $scope.GetDisplayName(filterItem.PropertyName) + "' autocomplete='off'></input>");
                        $("#" + filterItem.PropertyName).val(filterItem.DefaultValue);
                        break;
                }
            }
        }
        //绑定过滤条件的传入数据,显示时
        $scope.BindFilterInputValues = function () {
            $scope.IsBindInputVlues = true;
            for (var i = 0; i < sheetQuery.filter.length; i++) {
                var filterItem = sheetQuery.filter[i];
                if (!filterItem.Visible)
                    continue; //不可见
                if (filterItem.FilterType == 3)
                    continue; //系统参数
                if (!$scope.InputMapJson[filterItem.PropertyName])
                    continue;
                switch (filterItem.DisplayType) {
                    case $scope.ControlType.RadioButtonList:
                    case $scope.ControlType.CheckBoxList:
                        $scope.FilterPanel.find("input[name='" + filterItem.PropertyName + "'][value='" + $scope.InputMapJson[filterItem.PropertyName].GetValue() + "']").attr("checked", "checked");
                        break;
                    default:
                        $("#" + $scope.FilterPanelID + filterItem.PropertyName).val($scope.InputMapJson[filterItem.PropertyName].GetValue());
                        break;
                }
            }
        }

        //读取过滤数据，查询时
        $scope.GetFilters = function () {
            var filters = {};
            for (var i = 0; i < sheetQuery.filter.length; i++) {
                var filterItem = sheetQuery.filter[i];
                if (!filterItem.Visible)
                    continue; //不可见
                if (filterItem.FilterType == 3)
                    continue; //系统参数
                switch (filterItem.DisplayType) {
                    case $scope.ControlType.RadioButtonList:
                    case $scope.ControlType.CheckBoxList:
                        if ($scope.FilterPanel.find("input[name='" + filterItem.PropertyName + "']:checked").val()) {
                            filters[filterItem.PropertyName] = $("input[name='" + filterItem.PropertyName + "']:checked").val();
                        }
                        break;
                    default:
                        if ($("#" + $scope.FilterPanelID + filterItem.PropertyName).val()) {
                            filters[filterItem.PropertyName] = $("#" + this.FilterPanelID + filterItem.PropertyName).val();
                        }
                        break;
                }
            }
            return JSON.stringify(filters);
        }

        $scope.getPropertyNameFromData = function (bizObject, propertyName) {
            for (var k in bizObject) {
                if (k.toLocaleLowerCase() == propertyName.toLocaleLowerCase()) {
                    return k;
                }
            }
        }

        //从后台读取数据后，绑定到前端
        $scope.BindData = function (data) {
            // console.log(data);
            //列显示
            if (data) {
                //需要显示的列
                if (data.QuerySetting) {
                    for (var index in data.QuerySetting.Columns) {
                        if (data.QuerySetting.Columns[index].Visible == 1) {
                            $scope.displayColumns.push(data.QuerySetting.Columns[index].PropertyName);
                        }
                    }
                }
                //列编码和显示名称
                $scope.columnNames = data.Columns;
                //当前数据项需要显示的字段
                var NameKey = $scope.OutputMapJson[sheetQuery.dataField];
                var tmpArray = [];
                //显示视图
                for (var index in data.QueryData) {
                    var itemName;
                    var i = 0;
                    var d = data.QueryData[index];
                    var summary = "";
                    for (var key in d) {
                        if ($scope.displayColumns.indexOf(key) > -1) {
                            //if (!NameKey && i == 0) {
                            //    itemName = d[key];
                            //    continue;
                            //} else if (key == NameKey) {
                            //    itemName = d[key];
                            //    continue;
                            //}
                            var val = d[key] == null ? "" : d[key];
                            summary += $scope.columnNames[key] + ":" + val + "<br/>";
                            i++;

                        }
                    }

                    tmpArray.push({itemName: itemName, summary: summary, oldItem: d});
                }
                $scope.LoadFinished = data.LoadFinished;
                //合并数组
                $scope.viewModel.splice($scope.NextPageIndex * 10, tmpArray.length);
                for (var i = $scope.NextPageIndex * 10, j = 0; i < $scope.NextPageIndex * 10 + tmpArray.length; i++, j++) {
                    $scope.viewModel.splice(i, 0, tmpArray[j]);
                }
                //页数加1,改变NetWorkFlag的状态##
                if (!data.LoadFinished) {
                    $scope.NextPageIndex += 1;
                    $scope.NetWorkFlag.index = $scope.NextPageIndex;
                    $scope.NetWorkFlag.status = false;
                }

                sheetQuery.filter = data.QuerySetting.QueryItems;
                if (!$scope.HasBindFilters) {
                    $scope.BindFilter();
                }

                if (!$scope.IsBindInputVlues) {
                    $scope.BindFilterInputValues();
                }
            }
        };
        //从后台读取数据
        $scope.NextPageIndex = 0;
        //防止发送重复的请求##
        $scope.NetWorkFlag = {
            index: 0,
            status: false
        };
        $scope.viewModel = [];
        $scope.LoadQueryData = function (isSearch, InputMapping) {
            var localInpuptMapping
            if (InputMapping) {
                localInpuptMapping = InputMapping;
            } else {
                localInpuptMapping = $scope.GetInputMappings();
            }
            if (!isSearch) {
                localInpuptMapping = {};
            }
            var params = {
                Action: "GetQuerySettingAndData",
                SchemaCode: sheetQuery.schemaCode,
                QueryCode: sheetQuery.queryCode,
                InputMapping: localInpuptMapping,
                PageSize: $scope.PageSize,
                NextPageIndex: $scope.NextPageIndex
            };
            //筛选数据
            if (sheetQuery.filter.length > 0) {
                //params["Action"] = "GetQueryData";
                //如何没绑定inputmapping的值，得绑定
                params["Filters"] = $scope.GetFilters();
            }

            if ($scope.NextPageIndex == $scope.NetWorkFlag.index && !$scope.NetWorkFlag.status) {
                //已经发送了请求不再重复发送请求##
                $scope.NetWorkFlag.status = true;
                var promise = $SheetQuery.QueryData(params);
                promise.then(function (data) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.BindData(data)
                })
            } else {
                // console.log("repeat network!");
            }
        };
        $scope.conditionLoadQueryData = function (isSearch) {
            $scope.NextPageIndex = 0;
            $scope.viewModel = [];
            $scope.NetWorkFlag = {
                index: 0,
                status: false
            };
            var InputMapping = {};
            $("[data-property]").each(function (i, v) {
                if ($(v).val() !== "") {
                    InputMapping[$(v).data("property")] = $(v).val();
                }
            })
            console.log(InputMapping);
            $scope.LoadQueryData(isSearch, InputMapping);
        }
        //$scope.RefreshData = function (isSearch) {
        //    var localInpuptMapping = $scope.GetInputMappings();
        //    if (isSearch) { localInpuptMapping = {}; }
        //    var params = {
        //        Action: "GetQuerySettingAndData",
        //        SchemaCode: sheetQuery.schemaCode,
        //        QueryCode: sheetQuery.queryCode,
        //        InputMapping: localInpuptMapping,
        //        PageSize: $scope.PageSize,
        //        NextPageIndex: $scope.NextPageIndex
        //    };
        //    //筛选数据
        //    if (sheetQuery.filter.length > 0) {
        //        //params["Action"] = "GetQueryData";
        //        //如何没绑定inputmapping的值，得绑定
        //        params["Filters"] = $scope.GetFilters();
        //    }
        //    var promise = $SheetQuery.QueryData(params);
        //    promise.then(function (data) {
        //        $scope.BindData(data);
        //        $scope.$broadcast('scroll.infiniteScrollComplete');
        //    })
        //}
        $scope.goBack = function () {
            window.history.back();
        }
        //开窗重置update by luxm
        $scope.reset = function () {
            sheetQuery.controlManager.SetValue("");
            $scope.choosedObjectId = "";
        }
        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            if ($rootScope.dingMobile.isDingMobile) {
                //设置header 右边按钮
                dd.biz.navigation.setMenu({
                    items: [
                        {
                            "id": "1", //字符串
                            "text": "查询"
                        }
                    ],
                    onSuccess: function (data) {
                        $scope.conditionLoadQueryData(true);
                    }
                });
            }
            $scope.LoadQueryData(true);
        });

    })

    //传阅、转发
    .controller('fetchUserCtrl', ['$rootScope', '$scope', '$ionicHistory', '$ionicPopup', function ($rootScope, $scope, $ionicHistory, $ionicPopup) {
        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.NavBarShow = true;
            if ($.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk" && dd) {
                $scope.NavBarShow = false;
            }
            $.MvcSheetUI.IonicFramework.$scopeFetchUser = $scope;
            $scope.Params = $.MvcSheetUI.actionSheetParam;
            // console.log($scope.Params, '传阅、转发,征询，协办，加签');
            if (dd && dd.version) {
                $scope.SetDingDingHeader($scope.Params.title)
            }
            $("#fetchUserSelect").html();
            $scope.SheetUser = $("#fetchUserSelect").SheetUser($scope.Params.ueroptions);
            if (!$scope.SheetUser && $rootScope.fetchUserSelect) {
                $scope.SheetUser = $rootScope.fetchUserSelect;
            }
//        $($(".fetchUserContainer")[0].children).show();
//        $($(".fetchUserContainer")[0]).find("span").attr("style", "width: auto;word-break: normal;word-wrap: break-word;white-space: initial;");
            $($(".fetchUserContainer")[0].children).after($(".divContentImg"));//将加减号移动到感应区
            //update by ouyangsk 意见展示区
            $scope.ActionShow = true;
            if ($scope.Params.Action == "Circulate") { //传阅不应该展示意见
                $scope.ActionShow = false;
            }
        });

        //SelectUser完成事件
        $rootScope.$on('sheetUserFinished', function (event, data) {
            var ngmodel = data.dataField;
            var the = $scope[ngmodel];
            if (!the)
                return;
            the.ClearChoices();
            the.SetValue(data.obj);
            var tagName = ngmodel;
            $scope["sheetUsers" + tagName] = data.SelectItems;
            //$scope.fetchUserSelectData = data.obj;
            $scope.fetchUserSelectData = data.obj;
            //$rootScope.fetchUserSelect = the;
            //tll:存在数据则需要把加减号移动到人员后面
            if ((angular.isArray(data.obj) && data.obj.length > 0) || !(angular.isArray($scope.fetchUserSelectData))) {
                console.log(1);
                $($(".breadcrumb-wrapper")[1]).append($(".fetchUserContainer"));
            }
        });
        //update by lum
        //返回按钮事件
        $scope.BackPage = function () {
            //update by ouyangsk 点击返回时，清空已选择的内容
            $scope['sheetUsersfetchUserSelectundefined'] = [];
            $scope.SheetUser.ClearChoices();
            $scope.fetchUserSelectData = [];
            $scope.Params.commentVaule = '';
            $scope.Params.title = '';
            window.history.back();
        };
        // 确定 -> 转办，协办， 征询
        $scope.doAction = function () {
            var Datas = [];
            if (angular.isUndefined($scope.fetchUserSelectData) || (angular.isArray($scope.fetchUserSelectData) && $scope.fetchUserSelectData.length == 0)) {
                alert($scope.Params.Text);
                return;
            } else if (angular.isArray($scope.fetchUserSelectData)) {
                var datas = "";
                angular.forEach($scope.fetchUserSelectData, function (data, index, full) {
                    if (datas == "") {
                        datas = data.Code;
                    } else {
                        datas = datas + "," + data.Code;
                    }
                });
                Datas.push(datas);
            } else {
                var data = $scope.fetchUserSelectData.Code;
                if (data != "")
                    Datas.push(data);
            }
            //update by ouyangsk 转发后台方法只接受两个参数
            if ($scope.Params.Action != $.MvcSheet.Action_Forward) {
                Datas.push(false);
            }
            //update by ouyangsk 转办，协办， 征询请求意见
            if ($scope.Params.Action == $.MvcSheet.Action_Forward || $scope.Params.Action == $.MvcSheet.Action_Assist || $scope.Params.Action == $.MvcSheet.Action_Consult) {
                var commentVaule = $.trim($("#commentVaule").val()) ? $.trim($("#commentVaule").val()) : "同意";
                Datas.push(commentVaule);  // 转发/协助/征询意见，暂时用默认值替代
            }
            var action = {
                Action: $scope.Params.Action,
                Datas: Datas
            };
            $.MvcSheet.Action(action);
            //update by ouyangsk ionic的goBack方法会造成页面循环，此处用history.back
            //$ionicHistory.goBack();
            window.history.back();
        }
    }])
    //ping论
    .controller('comment', ['$rootScope', '$scope', '$ionicHistory', '$ionicPopup', function ($rootScope, $scope, $ionicHistory, $ionicPopup) {
        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.NavBarShow = true;
            if ($.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk" && dd) {
                $scope.NavBarShow = false;
            }
            $.MvcSheetUI.IonicFramework.$scopeFetchUser = $scope;
            $scope.Params = $.MvcSheetUI.actionSheetParam;
            // console.log($scope.Params, '传阅、转发');
            $("#fetchUserSelect").html();
            $scope.SheetUser = $("#fetchUserSelect").SheetUser($scope.Params.ueroptions);
            if (!$scope.SheetUser && $rootScope.fetchUserSelect) {
                $scope.SheetUser = $rootScope.fetchUserSelect;
            }
//        $($(".fetchUserContainer")[0].children).show();
//        $($(".fetchUserContainer")[0]).find("span").attr("style", "width: auto;word-break: normal;word-wrap: break-word;white-space: initial;");
            $($(".fetchUserContainer")[0].children).after($(".divContentImg"));//将加减号移动到感应区
            //update by ouyangsk 意见展示区
            $scope.ActionShow = true;
            if ($scope.Params.Action == "Circulate") { //传阅不应该展示意见
                $scope.ActionShow = false;
            }
        });

        //SelectUser完成事件
        $rootScope.$on('sheetUserFinished', function (event, data) {
            var ngmodel = data.dataField;
            var the = $scope[ngmodel];
            if (!the)
                return;
            the.ClearChoices();
            the.SetValue(data.obj);
            var tagName = ngmodel;
            $scope["sheetUsers" + tagName] = data.SelectItems;
            //$scope.fetchUserSelectData = data.obj;
            $scope.fetchUserSelectData = data.obj;
            //$rootScope.fetchUserSelect = the;
            //tll:存在数据则需要把加减号移动到人员后面
            if ((angular.isArray(data.obj) && data.obj.length > 0) || !(angular.isArray($scope.fetchUserSelectData))) {
                console.log(1);
                $($(".breadcrumb-wrapper")[1]).append($(".fetchUserContainer"));
            }
        });
        //update by lum
        //返回按钮事件
        $scope.BackPage = function () {
            //update by ouyangsk 点击返回时，清空已选择的内容
            $scope['sheetUsersfetchUserSelectundefined'] = [];
            $scope.SheetUser.ClearChoices();
            $scope.fetchUserSelectData = [];
            $scope.Params.commentVaule = '';
            $scope.Params.title = '';
            window.history.back();
        };
        // 确定 -> 转办，协办， 征询
        $scope.doAction = function () {
            var Datas = [];
            if (angular.isUndefined($scope.fetchUserSelectData) || (angular.isArray($scope.fetchUserSelectData) && $scope.fetchUserSelectData.length == 0)) {
                alert($scope.Params.Text);
                return;
            } else if (angular.isArray($scope.fetchUserSelectData)) {
                var datas = "";
                angular.forEach($scope.fetchUserSelectData, function (data, index, full) {
                    if (datas == "") {
                        datas = data.Code;
                    } else {
                        datas = datas + "," + data.Code;
                    }
                });
                Datas.push(datas);
            } else {
                var data = $scope.fetchUserSelectData.Code;
                if (data != "")
                    Datas.push(data);
            }
            //update by ouyangsk 转发后台方法只接受两个参数
            if ($scope.Params.Action != $.MvcSheet.Action_Forward) {
                Datas.push(false);
            }

            //update by ouyangsk 转办，协办， 征询请求意见
            if ($scope.Params.Action == $.MvcSheet.Action_Forward || $scope.Params.Action == $.MvcSheet.Action_Assist || $scope.Params.Action == $.MvcSheet.Action_Consult) {
                var commentVaule = $.trim($("#commentVaule").val()) ? $.trim($("#commentVaule").val()) : "同意";
                Datas.push(commentVaule);  // 转发/协助/征询意见，暂时用默认值替代
            }

            var action = {
                Action: $scope.Params.Action,
                Datas: Datas
            };
            $.MvcSheet.Action(action);
            //update by ouyangsk ionic的goBack方法会造成页面循环，此处用history.back
            //$ionicHistory.goBack();
            window.history.back();
        }
    }])

    // 评论详情
    .controller('commentDetail', ['$rootScope', '$scope', '$ionicHistory', '$ionicPopup', '$http', function ($rootScope, $scope, $ionicHistory, $ionicPopup, $http) {

        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $.LoadingMask.Show('加载中...', false);
            $scope.NavBarShow = true;
            $scope.detailParams = $.MvcSheetUI.actionCommentParam;
            // console.log($scope.detailParams, '评论详情');
            // console.log($rootScope.InstanceId, '$rootScope.InstanceId');
            $scope.getData();
            $scope.showToast()
        });
        $scope.showToast = function() {

        };
        $scope.commentsDetail = {
            list: []
        };

        // 获取评论
        $scope.getData = function() {
            $http({
                url: '/Portal/Workflow/WorkflowComments',
                params: {
                    workitemId: '',
                    instanceId: $rootScope.InstanceId,
                    sheetCode: '',
                    random: new Date().getTime()
                }
            })
                .success(function (result, header, config, status) {
                    // console.log(result.data, '获取评论');
                    $.LoadingMask.Hide();
                    if (result.code === 200 && result.data) {
                        $scope.commentsDetail.list = result.data;
                    }
                })
                .error(function (status) {
                    $.LoadingMask.Hide();
                });
        };

        // 预览附件
        $scope.fileDown = function(item, index) {
            // console.log(item, index)
            if (dd.version && DingTalkPC.ua.isInDingTalk) {
                DingTalkPC.biz.util.downloadFile({
                    url: item.url, //要下载的文件的url
                    name: item.fileName, //定义下载文件名字
                    onProgress: function(msg){
                        // 文件下载进度回调
                    },
                    onSuccess : function(result) {
                        // console.log(result)
                    },
                    onFail : function() {}
                })
            }
            else {
                var list = '';
                var url = window.location.href;

                var _PORTALROOT_GLOBAL = window.localStorage.getItem("H3.PortalRoot") ? window.localStorage.getItem("H3.PortalRoot") : "/Portal";
                url = url.split(_PORTALROOT_GLOBAL)[0];
                list = url + _PORTALROOT_GLOBAL + '/' + item.url;
                const a = document.createElement('a'); // 创建a标签
                a.setAttribute('download', item.fileName);// download属性
                a.setAttribute('href', list);// href链接
                a.click()
            }
        };

        // 图片预览
        $scope.imgPreview = function(item, index) {
            // console.log(item, index)
            let list = '';
            var url = window.location.href;

            var _PORTALROOT_GLOBAL = window.localStorage.getItem("H3.PortalRoot") ? window.localStorage.getItem("H3.PortalRoot") : "/Portal";
            url = url.split(_PORTALROOT_GLOBAL)[0];
            list = url + _PORTALROOT_GLOBAL + '/' + item.url;
            if (dd.version && DingTalkPC.ua.isInDingTalk) {
                DingTalkPC.biz.util.openLink({
                    url: list,//要打开链接的地址
                    onSuccess : function(result) {
                        /**/
                    },
                    onFail : function() {}
                })
            } else {
                const a = document.createElement('a'); // 创建a标签
                a.setAttribute('download', item.fileName);// download属性
                a.setAttribute('href', list);// href链接
                a.click()
            }

        };

        // 去评论
        $scope.doComment = function () {
            $scope.detailParams = $.MvcSheetUI.actionSheetParam;
            $.MvcSheetUI.IonicFramework.$state.go("form.AddComment");
        };

        //返回按钮事件
        $scope.BackPage = function () {
            if ($scope.detailParams && $scope.detailParams.title) {
                $scope.detailParams.title = ''
            }
            window.history.back();
        };
    }])

    //添加评论
    .controller('addComment', ['$rootScope', '$scope', '$ionicHistory', '$ionicPopup', '$ionicLoading', 'Upload', '$http', function ($rootScope, $scope,$ionicHistory, $ionicPopup, $ionicLoading, Upload, $http) {

        // 评论参数
        $scope.comments = {
            inner: '',
            commentCheck: false,
            isEditor: false,
            PersonLists: [],
            PartLists: [],
            AltUserLists: [],
            HistAltLists: [], // 已经@过的
            imgList: [],
            filesList: [],
            atUser: []
        };

        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.NavBarShow = true;
            $scope.comments.isEditor = true;
            $scope.addParams = $.MvcSheetUI.actionCommentParam;

            // console.log($scope.comments.AltUserLists, '----已选用户');

            // console.log($.MvcSheetUI.selectPersons, '$.MvcSheetUI.selectPersons');

            let MvcSheetUIPersons = $.MvcSheetUI.selectPersons ? $.MvcSheetUI.selectPersons.selectedPersonList: []; // 已选用户

            // console.log(MvcSheetUIPersons, 'MvcSheetUIPersons');
            if (MvcSheetUIPersons.length) { // 如果又重新@
                $scope.comments.AltUserLists = MvcSheetUIPersons
            }
            for(let e of $scope.comments.atUser) {
                $scope.addTag(e);
            }
        });

        // 清除复制样式
        $("#editor").on("paste", function (e) {
            $scope.textInit(e);
        });

        $scope.textInit = function(e) {
            e.preventDefault();
            let text;
            let clp = (e.originalEvent || e).clipboardData;
            if (clp === undefined || clp === null) {
                text = window.clipboardData.getData("text") || "";
                if (text !== "") {
                    if (window.getSelection) {
                        let newNode = document.createElement("span");
                        newNode.innerHTML = text;
                        window.getSelection().getRangeAt(0).insertNode(newNode);
                    } else {
                        document.selection.createRange().pasteHTML(text);
                    }
                }
            } else {
                text = clp.getData('text/plain') || "";
                if (text !== "") {
                    document.execCommand('insertText', false, text);
                }
            }
        };

        // 人员选择
        $scope.goToSelectPerson = function() {
            // console.log($scope.comments.AltUserLists, '$scope.comments.selectedPersonList');
            let options = {
                options: {},
                selecFlag: "PU",
                dataField: "fetchUserSelectundefined",
                ngmodel: "fetchUserSelectundefined",
                loadUrl: "null/SheetUser/LoadOrgTreeNodes?IsMobile=true&Recursive=true",
                loadOptions: "o=U",
                initUsers: $scope.GetChoices(),
                isMutiple: true
            };
            // console.log(options, 'options');
            $.MvcSheetUI.sheetUserParams = options;
            $.MvcSheetUI.IonicFramework.$state.go("form.sheetuser", {index: 0, parentID: ""});
        };

        //SelectUser完成事件
        $rootScope.$on('sheetUserFinished', function (event, data) {
            // console.log(data, 'data----------');
            let selectList = $rootScope.dingMobile.select;
            let list = data.SelectItems;
            // console.log(selectList, 'selectList----------');
            // console.log(list, 'list----------');
            if (!selectList.length) {
                $scope.comments.AltUserLists = list;
                $rootScope.dingMobile.select = list;
                $scope.comments.atUser = list;
            } else {
                let newSelect = [];
                list.forEach((item) => {
                    selectList.forEach((inner) => {
                        if (item.id === inner.ObjectID) {
                            // console.log(item, 'selectList-item');
                            newSelect.push(item)
                        }
                    })
                });
                // console.log(newSelect, 'newSelect');
                let a = new Set(list);
                let b = new Set(newSelect);
                let difference = new Set([...a].filter(x => !b.has(x)));
                $scope.comments.AltUserLists = list;
                $scope.comments.atUser = difference;
            }
        });
        //转化为对象
        $scope.GetChoices = function () {
            var choices = [];
            $scope.comments.AltUserLists.map((item) => {
                item.ChoiceID = $.MvcSheetUI.NewGuid();
                item.Name = item.name;
                item.ObjectID = item.id;
                choices.push(item)
            });
            // console.log(choices, 'choices');
            return choices == undefined ? [] : choices;
        };

        // 添加评论
        $scope.addDataDetail = function(personId) {
            var str = $scope.comments.inner.replace(/<span\s*[^>]*>(.*?)<\/span>/ig,"");
            $http({
                method: 'POST',
                url: '/Portal/Workflow/addWorkflowComment',
                data:{
                    workItemId:  $scope.addParams.workItemId,
                    userId: $scope.addParams.UserId,
                    userName : $scope.addParams.UserName,
                    instanceId: $rootScope.InstanceId,
                    sheetCode: '',
                    notifyUserIds: personId,
                    content: $scope.comments.inner,
                    contentStr: str, // 不带标签的文本
                    needCC: false,
                    attachments: [...$scope.comments.imgList,...$scope.comments.filesList]
                }
            })
                .success(function (result, header, config, status) {
                    $.LoadingMask.Hide();
                    if (result.code === 200) {
                        //设置评论
                        $.MvcSheetUI.SheetInfo.IsComment = true;
                        if($.MvcSheetUI.SheetInfo.ActionType == "Submit"){
                            //执行提交操作
                            $(".SheetToolBar").SheetToolBar($.MvcSheet.Actions).ControlManagers["Submit"].ActionClick();
                        }else if($.MvcSheetUI.SheetInfo.ActionType == "Reject"){
                            //执行驳回操作
                            $(".SheetToolBar").SheetToolBar($.MvcSheet.Actions).ControlManagers["Reject"].ActionClick();
                        }
                        // $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow('提交成功');
                        setTimeout(() => {
                            $scope.BackPage()
                        },300);
                    } else {
                        $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow(result.extendMsg);
                        setTimeout(() => {
                            $.MvcSheetUI.IonicFramework.fcommonJS.loadingHide()
                        },1000);
                    }
                })
                .error(function (status) {
                    $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow('服务器响应错误');
                    setTimeout(() => {
                        $.MvcSheetUI.IonicFramework.fcommonJS.loadingHide()
                    },1000);
                });
        };

        // 图片
        $scope.uploadImg = function (file) {
            if (!file) {
                return false
            }
            if ((file.size / (1024*1024)) > 10) {
                $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow('图片大小不能大于10M');
                setTimeout(() => {
                    $.MvcSheetUI.IonicFramework.fcommonJS.loadingHide()
                },2000);
                return false
            }
            $.LoadingMask.Show('图片上传中...', true);
            Upload.upload({
                url: '/Portal/Workflow/uploadWorkflowCommentAttachment',
                fields: {'MultipartFile': file.name, 'uploadByImage': true},
                file: file
            })
                .progress(function (evt) {
                    // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                })
                .success(function (result, status, headers, config) {
                    $.LoadingMask.Hide();
                    if (result.code === 200) {
                        $scope.comments.imgList.push(result.data);
                        $ionicPopup.alert({
                            title: '提示',
                            template: '<i class="icon ion-checkmark-circled"></i>上传成功'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '<p><i class="icon ion-close-circled"></i>上传失败</p>'
                        });
                    }
                })
                .error(function (data, status, headers, config) {
                    $.LoadingMask.Hide();
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '<p><i class="icon ion-close-circled"></i>上传失败</p>'
                    });
                    alertPopup.then(function(res) {
                        // console.log('Thank you for not eating my delicious ice cream cone');
                        $ionicLoading.hide();
                    });
                })
        };

        // 附件
        $scope.uploadFiles = function (files) {
            // console.log(files, 'file');
            if (!files[0]) {
                return false
            }
            if((files[0].size/ (1024*1024)) > 30) {
                $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow('附件大小不能大于20M');
                setTimeout(() => {
                    $.MvcSheetUI.IonicFramework.fcommonJS.loadingHide()
                },2000);
                return files
            }
            $.LoadingMask.Show('图片上传中...', true);
            Upload.upload({
                url: '/Portal/Workflow/uploadWorkflowCommentAttachment',
                fields: {'MultipartFile ': files[0].name, 'uploadByImage': false},
                file: files[0]
            })
                .progress(function (evt) {
                    // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                })
                .success(function (result, status, headers, config) {
                    $.LoadingMask.Hide();
                    if (result.code === 200) {
                        $scope.comments.filesList.push(result.data);
                        $ionicPopup.alert({
                            title: '提示',
                            template: '<i class="icon ion-checkmark-circled"></i>上传成功'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '提示',
                            template: '<p><i class="icon ion-close-circled"></i>上传失败</p>'
                        });
                    }
                })
                .error(function (data, status, headers, config) {
                    $.LoadingMask.Hide();
                    $ionicLoading.hide();
                    let alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '<p><i class="icon ion-close-circled"></i>上传失败</p>'
                    });
                    alertPopup.then(function(res) {
                        // console.log('Thank you for not eating my delicious ice cream cone');
                        $ionicLoading.hide();
                    });
                })
        };

        //删除图片
        $scope.deleteImg = function(item, index) {
            $scope.comments.imgList.splice(index,1)
        };

        // 删除文件
        $scope.deleteFile = function(item, index) {
            $scope.comments.filesList.splice(index,1)
        };

        // 预览附件
        $scope.PreviewFile = function(item, index) {
            if (dd.version && DingTalkPC.ua.isInDingTalk) {
                DingTalkPC.biz.util.downloadFile({
                    url: item.url, //要下载的文件的url
                    name: item.fileName, //定义下载文件名字
                    onProgress: function(msg){
                        // 文件下载进度回调
                    },
                    onSuccess : function(result) {
                        // console.log(result)
                    },
                    onFail : function() {}
                })
            }
            else {
                let list = '';
                var url = window.location.href;

                var _PORTALROOT_GLOBAL = window.localStorage.getItem("H3.PortalRoot") ? window.localStorage.getItem("H3.PortalRoot") : "/Portal";
                url = url.split(_PORTALROOT_GLOBAL)[0];
                list = url + _PORTALROOT_GLOBAL + '/' + item.url;
                const a = document.createElement('a'); // 创建a标签
                a.setAttribute('download', item.fileName);// download属性
                a.setAttribute('href', list);// href链接
                a.click()
            }
        };

        // 图片预览
        $scope.imgPreview = function(item, index) {
            // console.log(item,index);
            // let previewUrl = [];
            let list = '';
            // let arr = [];
            var url = window.location.href;

            var _PORTALROOT_GLOBAL = window.localStorage.getItem("H3.PortalRoot") ? window.localStorage.getItem("H3.PortalRoot") : "/Portal";
            url = url.split(_PORTALROOT_GLOBAL)[0];
            list = url + _PORTALROOT_GLOBAL + '/' + item.url;
            // console.log(list, 'list');
            // console.log(url, 'url');
            if(dd.version) {
                DingTalkPC.biz.util.openLink({
                    url: list,//要打开链接的地址
                    onSuccess : function(result) {
                        /**/
                    },
                    onFail : function() {}
                })
            }
            else {
                const a = document.createElement('a'); // 创建a标签
                a.setAttribute('download', item.fileName);// download属性
                a.setAttribute('href', list);// href链接
                a.click();
            }
        };

        //提交新评论
        $scope.SubmitComment = function() {
            if (!$scope.comments.inner.trim()) {
                $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow('评论内容不能为空');
                setTimeout(() => {
                    $.MvcSheetUI.IonicFramework.fcommonJS.loadingHide();
                },1000)
             }
            else {
                let list = $scope.comments.AltUserLists;
                let personIds = [];
                list.forEach((item) => {
                    personIds.push(item.id)
                });
                let personId = personIds.join(',');
                $.LoadingMask.Show('提交中...', false);
                $scope.addDataDetail(personId);
            }
        };

        //返回按钮事件
        $scope.BackPage = function () {
            if($.MvcSheetUI.selectPersons) {
                $.MvcSheetUI.selectPersons.selectedPersonList = []
            }
            $scope.comments.inner = '';
            // $.MvcSheetUI.IonicFramework.$state.go("form.commentDetail");
            window.history.back();
        };

        //   添加tag
        $scope.addTag = function (item) {
            let selectPastedContent = false;
            // let text = '@' + item.Text;
            let text = document.createTextNode('@' + item.name);
            let tag = document.createElement("span");
            tag.setAttribute("id", item.id);
            tag.setAttribute("contenteditable", false);
            tag.setAttribute("class", "at-user");
            tag.appendChild(text);
            // let tag = "<span contenteditable='false' class='at-user'>" + text +"</span>";
            $scope.pasteHtmlAtCaret(tag, selectPastedContent);
        };

        // 删除已选tag
        $scope.deleteUser = function(item, index) {
            // console.log(item, 'item')
            let tags = $("#editor").find("span");
            $.each(tags, function(i, inner){
                if (inner.id === item.id) {
                    inner.remove();
                }
            });
            $scope.comments.AltUserLists.splice($scope.comments.AltUserLists.indexOf(item), 1);
            $scope.comments.PersonLists.splice($scope.comments.PersonLists.indexOf(item), 1);
            // $scope.comments.PartLists.splice($scope.comments.PartLists.indexOf(item), 1);
        };

        //创建标签
        $scope.pasteHtmlAtCaret = function(html, selectPastedContent) {
            $("#editor").focus();
            let sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    let el = document.createElement("div");
                    el.appendChild(html);
                    let frag = document.createDocumentFragment(), node, lastNode;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    let firstNode = frag.firstChild;
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        if (selectPastedContent) {
                            range.setStartBefore(firstNode);
                        } else {
                            range.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
            else if ( (sel = document.selection) && sel.type !== "Control") {
                // IE < 9
                let originalRange = sel.createRange();
                originalRange.collapse(true);
                sel.createRange().pasteHTML(html);
                if (selectPastedContent) {
                    range = sel.createRange();
                    range.setEndPoint("StartToStart", originalRange);
                    range.select();
                }
            }
        };

        $scope.$watch('comments.inner',function(nv,ov){//nv代表新的值，ov代表旧的值
            if(nv){
                // console.log($scope.comments.inner)
            }
        })
    }])

    // 可编辑
    .directive('contenteditable', ['$timeout', function($timeout) { return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            // console.log(element,ngModel,'element', 'ngModel');
            // don't do anything unless this is actually bound to a model
            scope.$watch(attrs.focusItem, function() {
                element[0].focus();
            });

            if (!ngModel) {
                return
            }

            // options
            let opts = {};
            angular.forEach([
                'stripBr',
                'noLineBreaks',
                'selectNonEditable',
                'moveCaretToEndOnChange',
            ], function(opt) {
                let o = attrs[opt];
                opts[opt] = o && o !== 'false'
            });
            element.bind("keydown keypress", function (event) {
                if(event.keyCode===13) {
                    event.preventDefault(); //Prevent default browser behavior
                    if (window.getSelection) {
                        var selection = window.getSelection(),
                            range = selection.getRangeAt(0),
                            br = document.createElement("br"),
                            textNode = document.createTextNode("\u00a0"); //Passing " " directly will not end up being shown correctly
                        range.deleteContents();//required or not?
                        range.insertNode(br);
                        range.collapse(false);
                        range.insertNode(textNode);
                        range.selectNodeContents(textNode);

                        selection.removeAllRanges();
                        selection.addRange(range);
                        return false;
                    }
                }
                // if(event.which === 8) {
                //     scope.$apply(function (){
                //         // console.log(event,'event');
                //         scope.$eval(attrs);
                //     });
                //     event.preventDefault();
                // }
            });
            // view -> model
            element.bind('input', function(e) {
                scope.$apply(function() {
                    let html, html2, rerender;
                    html = element.html().replace(/&nbsp;/g, ' ');
                    rerender = false;
                    if (opts.stripBr) {
                        html = html.replace(/<br>$/, '')
                    }
                    if (opts.noLineBreaks) {
                        html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '');
                        if (html2 !== html) {
                            rerender = true;
                            html = html2
                        }
                    }
                    ngModel.$setViewValue(html);
                    if (rerender) {
                        ngModel.$render();
                    }
                    if (html === '') {
                        // the cursor disappears if the contents is empty
                        // so we need to refocus
                        $timeout(function(){
                            element[0].blur();
                            element[0].focus();
                        })
                    }
                })
            });

            // model -> view
            let oldRender = ngModel.$render;
            ngModel.$render = function() {
                let el, el2, range, sel;
                if (!!oldRender) {
                    oldRender()
                }
                element.html(ngModel.$viewValue || '');
                if (opts.moveCaretToEndOnChange) {
                    el = element[0];
                    range = document.createRange();
                    sel = window.getSelection();
                    if (el.childNodes.length > 0) {
                        el2 = el.childNodes[el.childNodes.length - 1];
                        range.setStartAfter(el2)
                    } else {
                        range.setStartAfter(el)
                    }
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range)
                }
            };
            if (opts.selectNonEditable) {
                element.bind('click', function(e) {
                    // console.log(e);
                    let range, sel, target;
                    target = e.toElement;
                    // console.log(target, 'target');
                    if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
                        range = document.createRange();
                        sel = window.getSelection();
                        range.setStartBefore(target);
                        range.setEndAfter(target);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                })
            }
        }}}
    ])

    .directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs);
                    });
                    event.preventDefault();
                }
            });
        };
    })

    //选人控件
    .controller('selectPersons', ['$rootScope', '$scope','$http' ,'$ionicLoading', function ($rootScope, $scope, $http,$ionicLoading) {
        //定义数据
        $scope.selectPersons = {
            userLists: [], // 用户列表
            checkedAllStatus: false,
            selectedPersonList: [] // 已选
        };

        // 每次进入View时触发
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.NavBarShow = true;
            $scope.detailParams = $.MvcSheetUI.actionCommentParam;
            $.LoadingMask.Show('加载中...', false);
            $scope.getUserLists($scope.detailParams.OriginatorOU);
            // console.log($.MvcSheetUI.selectPersons, 'MvcSheetUI.selectPersons');
            $scope.selectPersons.selectedPersonList = $.MvcSheetUI.selectPersons ? $.MvcSheetUI.selectPersons.selectedPersonList: []; // 是否有历史所选
        });

        //用户列表
        $scope.getUserLists = function(OriginatorOU) {
            $http({
                url: 'SheetUser/LoadOrgTreeNodes',
                params: {
                    IsMobile: true,
                    ParentID: OriginatorOU,
                    o: 'U',
                    UserCodes:''
                }
            })
                .success(function (result, header, config, status) {
                    $ionicLoading.hide();
                    if (!result) {
                        return false
                    }
                    $.LoadingMask.Hide();
                    result.map((item) => {item.checked = false});
                    // console.log(result, '用户列表');
                    $scope.selectPersons.userLists = Object.assign(result, $scope.selectPersons.selectedPersonList); //合并历史已选
                })
                .error(function (status) {
                    $.LoadingMask.Hide();
                });
        };

        // 点击全选
        $scope.checkedAll = function() {
            let status = true;
            let data = $scope.selectPersons.userLists;
            if ($scope.selectPersons.checkedAllStatus === true) { // 全选状态
                data.map((item) => {item.checked = !$scope.selectPersons.checkedAllStatus});
                // $scope.selectPersons.checkedAllStatus = !status;
                $scope.selectPersons.selectedPersonList=[];
            } else { // 非全选
                $scope.selectPersons.selectedPersonList = []; //清空已选再push
                data.map((item) => {
                    if (!item.checked) {
                        item.checked = status
                    }
                });
                // for(var g=0;g<data.length;g++) {
                //     $scope.selectPersons.selectedPersonList.push(data[g])
                // }
                data.forEach((item) => {
                    $scope.selectPersons.selectedPersonList.push(item)
                })
            }
        };

        // 单击选择
        $scope.selectPersonItem = function(item, index) {
            if (item.checked === false) {
                item.checked = true;
                $scope.selectPersons.selectedPersonList.push(item);
            } else {
                item.checked = false;
                $scope.selectPersons.selectedPersonList.splice($scope.selectPersons.selectedPersonList.indexOf(item), 1)
            }
        };

        //监听列表
        $scope.$watch('selectPersons.userLists',function(newValue, oldValue){
            let selectedData = $scope.selectPersons.selectedPersonList;
            // console.log(selectedData, 'selectedPersonList');
            // console.log(newValue, 'personList');
            if (newValue.length > 0 && newValue.length === selectedData.length) {
                $scope.selectPersons.checkedAllStatus = true;
            } else {
                $scope.selectPersons.checkedAllStatus = false;
            }
        }, true);

        // 确认选择用户
        $scope.selectedPerson = function () {
            $.MvcSheetUI.selectPersons = {
                selectedPersonList: $scope.selectPersons.selectedPersonList
            };
            // console.log($scope.selectPersons.selectedPersonList, '已选----');
            setTimeout(function () {
                window.history.back();
            }, 100)
        };

        //返回按钮事件
        $scope.BackPage = function () {
            if($.MvcSheetUI.selectPersons) {
                $.MvcSheetUI.selectPersons.selectedPersonList = []
            }
            setTimeout(function () {
                window.history.back();
            }, 100);
        };
    }])
    //流程状态
    .controller('instanceStateCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$ionicScrollDelegate', '$ionicHistory', 'fcommonJS', function ($rootScope, $scope, $stateParams, $http, $ionicScrollDelegate, $ionicHistory, fcommonJS) {
        $scope.$on("$ionicView.enter", function (scopes, states) {
        });
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader("流程图");
        }

        //保证上下滑动
        if (document.body.scrollHeight) {
            // $scope.scrollHeight = { 'height': document.body.scrollHeight + "px" };
        }

        // console.log($stateParams, '流程状态');
        $scope.Mode = $stateParams.Mode;
        $scope.InstanceID = $stateParams.InstanceID;
        $scope.WorkflowCode = $stateParams.WorkflowCode;
        $scope.WorkflowVersion = $stateParams.WorkflowVersion;
        $scope.closePage = function () {
            //update by ouyangsk 因为ionic控件goBack会导致后退循环，故此处改用history.back
            window.history.back();
            //$ionicHistory.goBack();
        }
        if ($scope.Mode == 3) {
            $scope.IsOriginate = true;
        } else {
            $scope.IsOriginate = false;
        }

        $scope.init = function () {
            $scope.type = "base";
            if ($scope.IsOriginate) {
                MobileLoader.ShowWorkflow($scope.InstanceID, $scope.WorkflowCode, $scope.WorkflowVersion, _PORTALROOT_GLOBAL);
            } else {
                MobileLoader.ShowWorkflow($scope.InstanceID, "", -1, _PORTALROOT_GLOBAL);
            }
            fcommonJS.loadingHide();
        }
        $scope.init();
    }])

    //文件预览
    .controller('downLoadFileCtrl', ['$rootScope', '$scope', '$state', '$location', '$http', '$stateParams', '$ionicHistory', '$window', '$sce', function ($rootScope, $scope, $state, $location, $http, $stateParams, $ionicHistory, $window, $sce) {
        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.extension = $stateParams.extension;
            $scope.url = $rootScope.AttachmentUrl;
            $scope.url = $sce.trustAsResourceUrl($rootScope.AttachmentUrl);
            var pic_extension = ".jpg,.gif,.jpeg,.png";
            var txt_extension = ".txt,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.pdf,.html,.csv,.xml";
            var mp3_extension = ".mp3";
            $scope.isImg = pic_extension.indexOf($scope.extension) > -1 ? true : false;
            $scope.isTxt = txt_extension.indexOf($scope.extension) > -1 ? true : false;
            $scope.isMp3 = mp3_extension.indexOf($scope.extension) > -1 ? true : false;
            // console.log($scope.isTxt)
        });
    }])
