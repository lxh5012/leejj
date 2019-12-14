module.controller('HomeCtrl', function ($scope, $rootScope, $state, $timeout, $ionicLoading, UnfinishedWorkItems, finishedworkitems, Unreadedworkitems, Readedworkitems,
                                        $http, $ionicScrollDelegate, $ionicSlideBoxDelegate, httpService, commonJS, GetWorkItemCount, $ionicHistory, workItemService,$ionicPlatform) {
    $scope.filter = {};//当前搜索的字段
    $scope.searchItemShow = true;//是否显示选人控件选项
    $scope.filterFlag = false;//点击选人控件之后重新要打开筛选页
    $scope.searchflag = true;//是否展示筛选框
    $scope.searchKeyArry = [];//记住三个部门的前一个字段
    //update by ousihang
    $scope.getWorkItemUrl();
    //$scope.filterFlag = false;
    //监听ios缓存刷新问题
    window.onpageshow = function(event) {
        if (event.persisted) {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $scope.init();
        }
    };
    $scope.$on("$ionicView.enter", function (scopes, states) {
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
        if(mobile.endWith('h3officeplat') && $ionicPlatform.is('ios')) {
            // 这里主要是注册 OC 将要调用的 JS 方法。
            commonJS.IosJsBridge(function(bridge){
                bridge.callHandler(
                    'ios_set'
                    ,{'type': '2'} // type 1表示显示 2表示隐藏
                    , function(responseData) {
                    }
                );
            });
        }
        if(mobile.endWith('h3officeplat') && $ionicPlatform.is('android')) {
            if (window.WebViewJavascriptBridge) {
                commonJS.AndroidJsBridge(function(bridge) {
                    bridge.callHandler(
                        'submitFromWeb'
                        , {'param': 'SETTING_HIDE'}
                        , function(responseData) {
                            console.log(responseData,'responseData')
                        }
                    );
                })
            }
        }
        //update by ouyangsk 处理两次进入设置页面，点击返回按钮，然后首页中ionic的scroll的索引不回到顶端的问题
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $scope.$broadcast('scroll.infiniteScrollComplete');//关闭初始状态触发上啦拉刷新
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            console.log("window.open works well");
            window.open = cordova.InAppBrowser.open;
        }
        if ($scope.filterFlag) {//已经点击选人控件，重新打开
            $scope.openPopover();
            //update by ouyangsk 打后开将标记重置
            $scope.filterFlag = false;
        }
        else if (!$scope.filterFlag) {
            //区分第一次和之后点击选人控件是否关闭
            $scope.user = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.User'));
            // console.log($scope.user);
            // console.log($scope.user.ObjectID);

            //update by ouyangsk 当从其它tab切换回首页时，清空上次的搜索条件
            $scope.filter = {};//重置搜索的字段
            $scope.searchKeyArry[$scope.slectIndex] = $scope.filter;
            $rootScope.filterUsers = "";
            //if ($scope.user.ObjectID == "") {//存在缓存id就应该初始
            //    var loginfrom = commonJS.getUrlParam('loginfrom');
            //    if (window.cordova || !loginfrom) {
            //        $state.go("login");
            //    } else {
            //        commonJS.loadingShow();
            //    }
            //}
            var reloadData = commonJS.getUrlParam('reloadData');
            if ($rootScope.loginInfo.success || reloadData) {
                $scope.init();
            } else {
                if (window.cordova || !$rootScope.loginInfo.loginfrom) {
                    $state.go("login");
                } else {
                    commonJS.loadingShow();
                }
            }
            //update by ouyangsk 处理筛选加急按钮有时打开两次的问题
            if (!$scope.popover) {
                commonJS.sideSlip($scope, 'templates/filter.html');
            }
        }
        //设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.tabs.home);
            dd.biz.navigation.setMenu({
                backgroundColor: "#ADD8E6",
                textColor: "#A7A7A7",
                items: [
                    {
                        "id": "1",
                        "text": $rootScope.languages.tabHome.setting
                    },
                    {
                        "id": "2",
                        "text": $rootScope.languages.filter
                    }
                ],
                onSuccess: function (data) {
                    if (data && Number(data.id) == 1) {
                        $scope.gosetting();
                    }
                    if (data && Number(data.id) == 2) { //侧滑框 筛选
                        $scope.openPopover();
                    }
                },
                onFail: function (err) {
                }
            });
        }
    });

    //update by ouyangsk 当切换tab时，更改状态，防止切换tab后仍会显示批量阅读相关按钮
    $scope.$on("$ionicView.beforeLeave", function (scopes, states) {
        $scope.batchReadedShow = false;
        //update by ouyangsk 当离开此活动页面时，若筛选框还存在，则移除，防止对下一个页面造成影响
        if ($scope.popover) {
            $scope.popover.hide();
        }
    });

    $rootScope.$on("LoginIn", function () {
        //update by ouyangsk TODO 移动端tab-home首页中 ionic.view-enter方法有时设置钉钉头不生效，在登陆成功后的方法需再设置一次钉钉头，暂不知其原因，推测可能HomeCtrl快于MainCtrl执行
        $scope.SetDingDingHeader($rootScope.languages.tabs.home);
        dd.biz.navigation.setMenu({
            backgroundColor: "#ADD8E6",
            textColor: "#A7A7A7",
            items: [
                {
                    "id": "1",
                    "text": $rootScope.languages.tabHome.setting
                },
                {
                    "id": "2",
                    "text": $rootScope.languages.filter
                }
            ],
            onSuccess: function (data) {
                if (data && Number(data.id) == 1) {
                    $scope.gosetting();
                }
                if (data && Number(data.id) == 2) { //侧滑框 筛选
                    $scope.openPopover();
                }
            },
            onFail: function (err) {
            }
        });
        //获取缓存的用户信息
        // $scope.user = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.User'));
        //update by ouyangsk 从缓存中取User信息，因为Scope中无User信息
        $scope.user = JSON.parse(window.localStorage.getItem('OThinker.H3.Mobile.User'));
        $scope.init();
    });
    //入口初始化程序，页面初次加载的事件
    $scope.init = function () {
        //数据已全部加载完毕 第一次自动上拉刷新的bug
        $scope.allDataLoaded = false;
        // $ionicHistory.clearCache();
        // $ionicHistory.clearHistory();
        $scope.sampleData = false;//是否存在样列数据
        $ionicSlideBoxDelegate.enableSlide(false);
        $scope.tabNames = $rootScope.languages.tabHome.tab;
        $scope.pullingText = "松开刷新";
        $scope.refreshingText = "努力加载中...";
        //搜索字段
        $scope.searchIndex = false;//索引
        $scope.searchfinishedBefore = [];//当前搜索的字段
        /*切换副标题*/
        $scope.slectIndex = 0;
        $scope.selectItems = [];//批量已阅
        $initAllData();
    };
    $scope.activeSlide = function (index) {//切换头部类型
        $scope.batchReadedShow = false;
        $scope.initReaded(true);//批量已阅
        switch (index) {
            case 0:
                if (!$scope.GetUndo) {
                    $scope.GetUndo = true;
                }
                break;
            case 1:
                if (!$scope.GetUnreade) {
                    commonJS.loadingShow();
                    $scope.GetUnReadedWorkItems().then(function (res) {
                        $scope.unreadedworkitems = res.CirculateItems;
                        $scope.unReadNum = res.TotalCount;
                        $scope.searchfinishedBefore[1] = res;//存储搜索前的数据
                        $scope.unreadedworkLoadComplete = res.LoadComplete;
                    }, function (reason) {

                    }).finally(function () {
                        $scope.GetUnreade = true;
                        // 滚动到顶部(避免会直接多一次上拉刷新的操作)
                        $ionicScrollDelegate.scrollTop(true);
                        commonJS.loadingHide();
                    })
                }
                break;
            case 2:
                if (!$scope.Getdo) {
                    commonJS.loadingShow();
                    $scope.GetfinishedWorkItems().then(function (res) {
                        $scope.finishedworkitems = res.WorkItems;
                        $scope.searchfinishedBefore[2] = res;//存储搜索前的数据
                        $scope.finishedWorkLoadComplete = res.LoadComplete;
                    }, function (reason) {

                    }).finally(function () {
                        $scope.Getdo = true;
                        // 滚动到顶部(避免会直接多一次上拉刷新的操作)
                        $ionicScrollDelegate.scrollTop(true);
                        commonJS.loadingHide();
                    })
                }
                break;
            case 3:
                if (!$scope.Getreade) {
                    commonJS.loadingShow();
                    $scope.GetReadedWorkItems().then(function (res) {
                        $scope.readedworkitems = res.CirculateItems;
                        $scope.searchfinishedBefore[3] = res;//存储搜索前的数据
                        $scope.readedworkLoadComplete = res.LoadComplete;
                    }, function (reason) {

                    }).finally(function () {
                        $scope.Getreade = true;
                        // 滚动到顶部(避免会直接多一次上拉刷新的操作)
                        $ionicScrollDelegate.scrollTop(true);
                        commonJS.loadingHide();
                    })
                }
                break;
        }
        $scope.slectIndex = index;
        $ionicSlideBoxDelegate.slide(index);
    };
    //获取当前的Tab的数据长度用于搜索
    $scope.getCurrentTabLength = function (tab) {
        switch (tab) {
            case 0:
                return $scope.unfinishedWorkItems.length;
                break;
            case 1:
                return $scope.unreadedworkitems.length;
                break;
            case 2:
                return $scope.finishedworkitems.length;
                break;
            case 3:
                return $scope.readedworkitems.length;
                break;
        }
    }
//    回到顶部按钮
    $("#scrollc").scroll(function () {
        if (parseInt($(this).find(".scroll").prop("style").transform.split(",")[1]) <= -200) {
            $("#toTop").show();
        } else {
            $("#toTop").hide();
        }
    })
    $scope.toTop = function () {
        $("#scrollc").find(".scroll").css("transform", "translate3d(0px,0px,0px) scale(1)");
        $(".scroll-bar-indicator").css("transform", "translate3d(0px,0px,0px) scale(1)");
        $ionicScrollDelegate.scrollTop(true);
        $("#toTop").hide();
    }

    //待办和待阅数
    $scope.unReadNum = 0;
    $scope.unDoNum = 0;
    $scope.GetWorkItemCount = function (extend) {
        var options = {};
        if (extend) {
            $scope.extend(options, extend);
        }
        return GetWorkItemCount.all(options);
    };

    //待办
    $scope.unfinishedWorkItems = [];//存放数据
    $scope.unfinishedWorkLoadComplete = true;//是否还有数据
    // $scope.unfinishedWorkLastTime = '';//上次加载时间
    $scope.GetUnfinishedWorkItems = function (extend) {
        var options = {
            finishedWorkItem: false,
            keyWord: '',
            //  lastTime: new Date().Format("yyyy-MM-dd HH:mm:ss"),
            sortDirection: 'Desc',
            sortKey: 'ReceiveTime',
            userId: $scope.user.ObjectID
        }
        if (extend) {
            $scope.extend(options, extend);
        }
        return UnfinishedWorkItems.all(options);
    };
    //待阅
    $scope.unreadedworkitems = [];
    $scope.unreadedworkLoadComplete = true;
    $scope.GetUnReadedWorkItems = function (extend) {
        var options = {
            keyWord: '',
            readWorkItem: false,
            sortDirection: 'Desc',
            sortKey: 'ReceiveTime',
            userCode: $scope.user.Code,
            userId: $scope.user.ObjectID
        }
        if (extend) {
            $scope.extend(options, extend);
        }
        return Unreadedworkitems.all(options);
    };
    //已办
    $scope.finishedworkitems = [];
    $scope.finishedWorkLoadComplete = true;
    $scope.GetfinishedWorkItems = function (extend) {
        var options = {
            finishedWorkItem: true,
            keyWord: '',
            sortDirection: 'Desc',
            sortKey: 'OT_WorkItemFinished.FinishTime',
            userId: $scope.user.ObjectID
        }
        if (extend) {
            $scope.extend(options, extend);
        }
        return finishedworkitems.all(options);
    };
    //已阅
    $scope.readedworkitems = [];
    $scope.readedworkLoadComplete = true;
    $scope.GetReadedWorkItems = function (extend) {
        var options = {
            keyWord: '',
            readWorkItem: true,
            sortDirection: 'Desc',
            sortKey: 'ReceiveTime',
            userId: $scope.user.ObjectID
        }
        if (extend) {
            $scope.extend(options, extend);
        }
        return Readedworkitems.all(options);
    };
    //初始化所有数据
    $initAllData = function () {
        commonJS.loadingShow();
        //点击加载(只控制第一次)
        $scope.GetUndo = true;
        $scope.GetUnreade = false;
        $scope.Getdo = false;
        $scope.Getreade = false;
        //待办
        $scope.GetUnfinishedWorkItems().then(function (res) {
            if (res.hasOwnProperty('Success')) {
                commonJS.TimeoutHandler();
            }
            $scope.unfinishedWorkItems = res.WorkItems;
            $scope.unDoNum = res.TotalCount;
            $scope.searchfinishedBefore[0] = res;//存储搜索前的数据
            $scope.unfinishedWorkLoadComplete = res.LoadComplete;
        }, function (reason) {

        }).finally(function () {
            // 滚动到顶部
            $ionicScrollDelegate.scrollTop(true);
            commonJS.loadingHide();
        })
        //代办待阅数
        $scope.GetWorkItemCount().then(function (res) {
            if (!res.Success && res.ExceptionCode == 1) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $ionicLoading.show({
                    template: '<span class="lodingspan f15">' + res.Message + '</span>',
                    duration: 4 * 1000,
                    animation: 'fade-in',
                    showBackdrop: false
                });
            } else {
                $scope.unReadNum = res.Extend.UnreadWorkItemCount;
                $scope.unDoNum = res.Extend.UnfinishedWorkItemCount;
            }
        }, function (reason) {
        }).finally(function () {
        })
        /*处理微信的表单返回*/
        if ($rootScope.loginInfo.loginfrom == "wechat" && $scope.JumpParams.tab) {
            $scope.slectIndex = $scope.JumpParams.tab;
            $scope.renderJumpParams();
            $scope.activeSlide($scope.slectIndex);
        }
    }
    //跳转设置页
    $scope.gosetting = function () {
        $state.go("settings");
    }
    //切换tab回到顶部
    $scope.$watch("slectIndex", function (newVal, oldVal) {
        // 滚动到顶部
        $scope.filter = $scope.searchKeyArry[$scope.slectIndex] || {};//重置搜索的字段
        $rootScope.filterUsers = $scope.filter.filterUsers || "";
        $ionicScrollDelegate.scrollTop(true);
        //区别搜索传值
        switch (newVal) {
            case 1:
            case 0:
                $scope.searchIndex = false;
                break;
            case 2:
            case 3:
                $scope.searchIndex = true;
                break;
        }
    });
    //标记为已阅
    $scope.setReaded = function (id) {
        var options = {
            CirculateItemIDs: id,
            ReadAll: false,
            userCode: $scope.user.Code,
            userId: $scope.user.ObjectID
        };
        commonJS.loadingShow();
        Unreadedworkitems.remove(options).then(function (res) {
            //  console.log(res);
            //删除该元素
            var len = $scope.unreadedworkitems.length;
            for (var i = 0; i < len; i++) {
                if ($scope.unreadedworkitems[i].ObjectID == id) {
                    $scope.unreadedworkitems.splice(i, 1);
                    $scope.unReadNum = $scope.unReadNum - 1;
                    commonJS.loadingHide();
                    return;
                }
            }
            //代办待阅数
            $scope.GetWorkItemCount().then(function (result) {
                $scope.unReadNum = result.Extend.UnreadWorkItemCount;
                $scope.unDoNum = result.Extend.UnfinishedWorkItemCount;
            }, function (reason) {

            }).finally(function () {
            })
        }, function (reason) {
        })
    }

    //下拉刷新
    $scope.refresh = function (e) {
        var index = $scope.slectIndex;
        var extend = {};
        var complete = 0;
        function completeAll() {
            complete++;
            if (complete == 1) {
                $scope.$broadcast('scroll.refreshComplete');
            }
        }
        //刷新代办和待阅数目
        $scope.$broadcast('scroll.refreshComplete');
        if (index === 0) {
            extend = $scope.addsearchKey(index);
            extend.existsLength = $scope.unfinishedWorkItems.length;
            //console.log(" 下拉。。。。console.log(extend);");
            // console.log(extend);
            $scope.GetUnfinishedWorkItems(extend).then(function (res) {
                //update by ouyangsk 每次上拉刷新，都初始化刷新10条数据
                /*if ($scope.unfinishedWorkItems.length < 10) {
                    $scope.unfinishedWorkItems = res.WorkItems;
                } else {
                    $scope.unfinishedWorkItems.splice(0, 10);
                    $scope.unfinishedWorkItems = res.WorkItems.concat($scope.unfinishedWorkItems);
                	//$scope.unfinishedWorkItems = res.WorkItems;
                }*/
                $scope.unfinishedWorkItems = res.WorkItems;
                $scope.unfinishedWorkLoadComplete = res.LoadComplete;
                $scope.unDoNum = res.TotalCount;
            }, function (reason) {

            }).finally(function () {
                completeAll();
            })
        } else if (index === 1) {
            extend = $scope.addsearchKey(index);
            extend.existsLength = $scope.unreadedworkitems.length;
            $scope.GetUnReadedWorkItems(extend).then(function (res) {
                /*if ($scope.unreadedworkitems.length < 10) {
                    $scope.unreadedworkitems = res.CirculateItems;
                } else {
                    $scope.unreadedworkitems.splice(0, 10);
                    $scope.unreadedworkitems = res.CirculateItems.concat($scope.unreadedworkitems);
                }*/
                $scope.allRead = false; // 初始批量勾选
                $scope.selectItems = [];
                $scope.unreadedworkitems = res.CirculateItems;
                $scope.unreadedworkLoadComplete = res.LoadComplete;
                $scope.unReadNum = res.TotalCount;
            }, function (reason) {
            }).finally(function () {
                completeAll();
            })
        } else if (index === 2) {
            extend = $scope.addsearchKey(index);
            extend.existsLength = $scope.finishedworkitems.length;
            $scope.GetfinishedWorkItems(extend).then(function (res) {
                //update by ouyangsk
                /*if ($scope.finishedworkitems.length < 10) {
                    $scope.finishedworkitems = res.WorkItems;
                } else {
                    $scope.finishedworkitems.splice(0, 10);
                    $scope.finishedworkitems = res.WorkItems.concat($scope.finishedworkitems);
                }*/
                $scope.finishedworkitems = res.WorkItems;
                $scope.finishedWorkLoadComplete = res.LoadComplete;
            }, function (reason) {

            }).finally(function () {
                completeAll();
            })
        } else if (index === 3) {
            extend = $scope.addsearchKey(index);
            extend.existsLength = $scope.readedworkitems.length;
            $scope.GetReadedWorkItems(extend).then(function (res) {
                //update by ouyangsk
                /*if ($scope.readedworkitems.length < 10) {
                    $scope.readedworkitems = res.CirculateItems;
                } else {
                    $scope.readedworkitems.splice(0, 10);
                    $scope.readedworkitems = res.CirculateItems.concat($scope.readedworkitems);
                }*/
                $scope.readedworkitems = res.CirculateItems;
                $scope.readedworkLoadComplete = res.LoadComplete;
            }, function (reason) {

            }).finally(function () {
                completeAll();
            })
        }
    }


    //加载更多
    $scope.loadMore = function () {
        function completeAll() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            //  console.log('complete scroll!');
        }

        var extend = {};
        var index = $scope.slectIndex;
        // 待办
        if (index === 0) {
            extend = $scope.addsearchKey(index);
            extend.loadStart = $scope.getCurrentTabLength(index);
            $scope.GetUnfinishedWorkItems(extend).then(function (res) {
                $scope.$broadcast('scroll.refreshComplete');
                $scope.unfinishedWorkItems = $scope.unfinishedWorkItems.concat(res.WorkItems);
                $scope.unfinishedWorkLoadComplete = res.LoadComplete;
                //  $scope.unfinishedWorkLastTime = new Date(Number(res.LastTime.match(/\((\d+)\)/)[1])).Format("yyyy-MM-dd HH:mm:ss");

            }, function (reason) {

            }).finally(function () {
                completeAll();
            })
        } else if (index === 1) {
            // 待阅
            extend = $scope.addsearchKey(index);
            extend.loadStart = $scope.getCurrentTabLength(index);
            $scope.GetUnReadedWorkItems(extend).then(function (res) {
                var newRes = res.CirculateItems;
                // 自动勾选 zaf-12-1
                if ($scope.allRead && newRes.length > 0) {
                    angular.forEach(newRes, function (item, index, full) {
                        // console.log(item.IsChecked);
                        item.IsChecked = !status;
                        $scope.selectItems.push(item.ObjectID);
                    })
                }
                $scope.unreadedworkitems = $scope.unreadedworkitems.concat(newRes);
                $scope.unreadedworkLoadComplete = res.LoadComplete;
                // 批量状态
                //  $scope.unreadedworkLastTime = new Date(Number(res.LastTime.match(/\((\d+)\)/)[1])).Format("yyyy-MM-dd HH:mm:ss");
            }, function (reason) {
            }).finally(function () {
                completeAll();
            })
        } else if (index === 2) {
            extend = $scope.addsearchKey(index);
            extend.loadStart = $scope.getCurrentTabLength(index);
            $scope.GetfinishedWorkItems(extend).then(function (res) {
                $scope.finishedworkitems = $scope.finishedworkitems.concat(res.WorkItems);
                $scope.finishedWorkLoadComplete = res.LoadComplete;
                //   $scope.finishedWorkLastTime = new Date(Number(res.LastTime.match(/\((\d+)\)/)[1])).Format("yyyy-MM-dd HH:mm:ss");
            }, function (reason) {
            }).finally(function () {
                completeAll();
            })
        } else if (index === 3) {
            extend = $scope.addsearchKey(index);
            extend.loadStart = $scope.getCurrentTabLength(index);
            $scope.GetReadedWorkItems(extend).then(function (res) {
                $scope.readedworkitems = $scope.readedworkitems.concat(res.CirculateItems);
                $scope.readedworkLoadComplete = res.LoadComplete;
                // $scope.readedworkLastTime = new Date(Number(res.LastTime.match(/\((\d+)\)/)[1])).Format("yyyy-MM-dd HH:mm:ss");
            }, function (reason) {
            }).finally(function () {
                completeAll();
            })
        }
    };
    ////////////////////////////////////////////////////////////////////////////////
    //扩充对象
    $scope.extend = function (o, n) {
        for (var p in n)
            if (n.hasOwnProperty(p)) o[p] = n[p];
    };
    // 打开待办待阅已办已阅
    $scope.openWorkItem = function (workItemId) {
        if (!workItemId) return;
        // //debugger;
        var absurl = {
            state: 'tab.home',
            tab: $scope.slectIndex
        }
        window.localStorage.setItem("absurl", JSON.stringify(absurl));
        var localLan = window.localStorage.getItem("H3.Language");
        $scope.worksheetUrl = $scope.setting.workItemUrl + workItemId + "&LoginName=" + encodeURI($scope.user.Code) + "&MobileToken=" + $scope.user.MobileToken + "&localLan=" + localLan;
        //$scope.worksheetUrl = $scope.setting.workItemUrl + workItemId + "&LoginName=" + encodeURI($scope.user.Code) + "&LoginSID=" + $scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
        commonJS.GetWorkItemSheetUrl($scope, $scope.worksheetUrl, workItemId);
    }

    //搜索赋值
    $scope.setCurrentTab = function (tab, data) {
        switch (tab) {
            case 0:
                $scope.unfinishedWorkLoadComplete = data.LoadComplete;
                $scope.unDoNum = data.TotalCount;//更新微数据q
                return $scope.unfinishedWorkItems = data.WorkItems;
                break;
            case 1:
                $scope.unreadedworkLoadComplete = data.LoadComplete;
                $scope.unReadNum = data.TotalCount;//更新微数据
                return $scope.unreadedworkitems = data.CirculateItems;
                break;
            case 2:
                $scope.finishedWorkLoadComplete = data.LoadComplete;
                return $scope.finishedworkitems = data.WorkItems;
                break;
            case 3:
                $scope.readedworkLoadComplete = data.LoadComplete;
                return $scope.readedworkitems = data.CirculateItems;
                break;
        }
    };
    //我的流程搜索
    $scope.toSearch = function (filter) {
        $scope.filter.filterUsers = $rootScope.filterUsers;
        var array = $scope.initItemsCode($rootScope.filterUsers);//选人控件传数据的特殊格式
        if (!angular.equals({}, filter)) {
            //存储搜索数组
            $scope.searchKeyArry[$scope.slectIndex] = filter;  //时间区间不对校验
            $scope.overtme = commonJS.timeCheck(filter.startDate, filter.endDate);
            if ($scope.overtme) {
                //commonJS.showShortMsg("setcommon f15", "时间区间错误", 2000);
                //update by ouyangsk
                commonJS.showShortMsg("setcommon f15", $rootScope.languages.dateInError, 2000);
                return false;
            }
            //update by ouyangsk 如果前台请求发送"null"，会导致后台 SpringMVC 绑定参数报错
            if (!filter.IsPriority || filter.IsPriority == "null") {
                filter.IsPriority = "";
            }
            var options = {
                sortDirection: "Desc",
                sortKey: "ReceiveTime",
                userId: $scope.user.ObjectID,
                keyWord: filter.keyWord || "",//流程名称
                IsPriority: filter.IsPriority || "",//2:加急，0：不加。空：不限
                startDate: filter.startDate || "",//开始时间
                endDate: filter.endDate || "",//开始时间
                Originators: array,
            };
            //keyWord关键字符过滤 add by hxc
            if (options.keyWord.match(/["|']/g)) {
                alert("查询的流程名不规范，带有\'和\"");
                return;
            }
            var urlTail = "";
            var url = "";
            if ($scope.slectIndex == 0 || $scope.slectIndex == 2) {
                var url = "";//待办
                urlTail = "/GetWorkItems";
                //update by ouyangsk
                //options.finishedworkItem = $scope.searchIndex;
                options.finishedWorkItem = $scope.searchIndex;
            }
            else {
                var url = "";//待阅
                urlTail = "/LoadCirculateItems";
                options.readWorkItem = $scope.searchIndex;
            }
            if (window.cordova) {
                url = $rootScope.appServiceUrl + urlTail;
            } else {
                url = $scope.setting.httpUrl + "/Mobile" + urlTail;
            }
            // console.log("筛选。。。。。。" + url);
            // console.log(options);
            workItemService.search(url, options).then(function (data) {
                $scope.filterFlag = false;
                // $scope.popover.hide();
                $scope.setCurrentTab($scope.slectIndex, data);
            });
        }
        else {//没有搜索条件点确定=重置
            $scope.setCurrentTab($scope.slectIndex, $scope.searchfinishedBefore[$scope.slectIndex]);
        }
        // 滚动到顶部
        $ionicScrollDelegate.scrollTop(true);
        $scope.popover.hide();
    };
    $scope.resetSearch = function () {
        $scope.filter = {};//重置搜索的字段
        $scope.searchKeyArry[$scope.slectIndex] = $scope.filter;
        $rootScope.filterUsers = "";
        $scope.setCurrentTab($scope.slectIndex, $scope.searchfinishedBefore[$scope.slectIndex]);
        //  $scope.popover.hide();
    };
    $scope.initItemsCode = function (users) {
        var objs = [];
        if (users && !angular.equals({}, users)) {
            if (users.constructor == Object) {
                var tempUser = users.Code;
                objs.push(tempUser);
            } else {
                users.forEach(function (n, i) {
                    var tempUser = n.Code;
                    objs.push(tempUser);
                });
            }
        }
        return objs;
    };
    //上下拉刷新所带searchkey
    $scope.addsearchKey = function (index) {
        var indexfilter = $scope.searchKeyArry[index] || {};
        var array = [];
        if (!angular.equals({}, indexfilter)) {
            var array = $scope.initItemsCode(indexfilter.filterUsers);//选人控件传数据的特殊格式
        }
        //搜索条件
        var options = {
            sortDirection: "Desc",
            sortKey: "ReceiveTime",
            userId: $scope.user.ObjectID,
            keyWord: indexfilter.keyWord || "",//流程名称
            IsPriority: indexfilter.IsPriority || "",//2:加急，0：不加。空：不限
            startDate: indexfilter.startDate || "",//开始时间
            endDate: indexfilter.endDate || "",//开始时间
            Originators: array
        };
        if ($scope.slectIndex == 0 || $scope.slectIndex == 2) {
            options.finishedworkItem = $scope.searchIndex;
        }
        else {
            options.readWorkItem = $scope.searchIndex;
        }
        return options;
    };

    //点击批量
    $scope.batchReadedShow = false;
    $scope.allRead = false;
    $scope.batchReaded = function (isshow) {
        $scope.selectItems = [];
        //update by ouyangsk 点击批量按钮时，清空之前所有已选择的
        $scope.initReaded(true);
        $scope.batchReadedShow = !$scope.batchReadedShow;
    }
    //批量阅读（点击单个）
    $scope.checkWorkItem = function (unreadworkitem) {
        var isSelected = true;
        var sourceselectItems = $scope.selectItems;
        angular.forEach($scope.selectItems, function (id, index, full) {
            if (id == unreadworkitem.ObjectID) {
                //取消选中
                isSelected = false;
                sourceselectItems.splice(index, 1);
                unreadworkitem.IsChecked = false;
            }
        })
        if (isSelected) {
            sourceselectItems.push(unreadworkitem.ObjectID);
            unreadworkitem.IsChecked = true;
        }
        $scope.selectItems = sourceselectItems;
        $scope.initcheckedStetus($scope.unreadedworkitems, $scope.selectItems.length);//改变全选按钮状态
        // console.log($scope.selectItems);
    };
    // 全选
    $scope.initReaded = function (status) {
        $scope.selectItems = [];
        // console.log(status)
        //全选 status == false和取消全选status == true
        angular.forEach($scope.unreadedworkitems, function (item, index, full) {
            $scope.unreadedworkitems[index].IsChecked = !status;
            if (status === false) {
                //选中
                $scope.selectItems.push($scope.unreadedworkitems[index].ObjectID);
            }
        });
        $scope.allRead = !status;
        // console.log($scope.selectItems);
    };
    //全选事件
    //执行批量已阅
    $scope.httpreadItems = function () {
        // console.log($scope.selectItems)
        if (!$scope.selectItems.length) {
            return false
        }
        var options = {
            CirculateItemIDs: $scope.selectItems,
            ReadAll: false,
            userCode: $scope.user.Code,
            userId: $scope.user.ObjectID
        };
        commonJS.loadingShow();
        Unreadedworkitems.remove(options).then(function (res) {
            commonJS.loadingHide();
            if (res.Success) {
                var selectItem = {};
                var unreadedworkitem = [];
                angular.forEach($scope.selectItems, function (data, index, full) {
                    selectItem[data] = true;
                });
                //删除该元素
                var len = $scope.unreadedworkitems.length;
                for (var i = 0; i < len; i++) {
                    if (!selectItem[$scope.unreadedworkitems[i].ObjectID]) {
                        unreadedworkitem.push($scope.unreadedworkitems[i]);
                    }
                }
                $scope.unreadedworkitems = unreadedworkitem;
                $scope.selectItems = [];
                $scope.batchReadedShow = false;
                // $scope.refresh();
                //update by ouyangsk 批量阅读后待阅数目由refresh方法获取，所以注释此处，否则待阅数目会有一个快速的闪现变化
                //$scope.unReadNum = $scope.unreadedworkitems.length;
                $ionicScrollDelegate.scrollTop(true); // toTop zaf-12-1
                setTimeout(function () {
                    $scope.refresh();
                }, 300)
            }
        }, function (reason) {
            // console.log(reason)
        })
    };
    //全选按钮状态
    /*$scope.checkedstetus = true;标识全选按钮不选中
    *objs：当前能选的数据
    *stetus：已经选中的数组的长度
    */
    $scope.initcheckedStetus = function (objs, len) {//$scope.SelectItems.length
        // console.log(objs, len, 'objs----------')
        if (len == 0) {
            $scope.allRead = false;
            return false;
        }
        var going = true;
        angular.forEach(objs, function (obj) {
            if (going) {
                if (obj.IsChecked) {//已经选中则跳过
                    $scope.allRead = true;
                }
                else if (!obj.IsChecked) {//能选但是未选中则直接返回
                    $scope.allRead = false;
                    going = false;
                }
            }
        });
    };
});
