module.controller('myInstancesCtrl', function ($scope, $rootScope, instanceService, $ionicSlideBoxDelegate, $ionicModal, commonJS, $ionicScrollDelegate, $http,$stateParams,$state) {
	$scope.filter = {};//当前搜索的字段
    $scope.instances = -1;
    $scope.searchKeyArry = [];//记住三个部门的前一个字段
    $scope.searchItemShow = false;
    $scope.$on("$ionicView.enter", function (scopes, states) {
        commonJS.loadingShow();
        if ($scope.filter) {
        	$scope.filter = {};
        }
        //如果刚进入页面
        $scope.firstTimeEnter = true;
        //update by luxm 应用中心过来会多加载一次
        if (!($stateParams.TopAppCode)) {
        	$scope.loadUnfinishedData();
        }
        $scope.init();
        //加载我的实例
        if ($stateParams.TopAppCode) {
            //应用中心跳转过来
            $scope.loadUnfinishedData(function () {
                //回调函数
                document.getElementsByClassName("tab-myInstances")[0].getElementsByTagName("ion-content")[0].style.cssText = "bottom:0px;";
            });
        }

        //加载侧滑页面
        commonJS.sideSlip($scope, 'templates/filter.html');
        //设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.tabs.myProcess);
            dd.biz.navigation.setRight({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: $rootScope.languages.filter,//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                    $scope.openPopover();
                },
                onFail: function (err) { }
            });
        }
    });

    //监听instances发生的错误
    $scope.$watch("instances", function (newVal, oldVal) {
        if ($scope.instances) {
        	$scope.currentTab = $scope.getCurrentTab($scope.selectIndex);
        }
    }, true);
    //入口初始化程序，页面初次加载的事件
    $scope.init = function () {
        /*sousu*/
        $scope.tabNames = $rootScope.languages.tabMyProcess.tab;
        $scope.selectIndex = 0;
        /*处理微信的表单返回*/
        if ($rootScope.loginInfo.loginfrom == "wechat" && $scope.JumpParams.tab) {
            $scope.selectIndex = $scope.JumpParams.tab;
            $scope.renderJumpParams();
        }
        //处理应用中心返回
        if ($stateParams.TopAppCode) {
            if ($stateParams.State == "Unfinished") {
                $scope.selectIndex = 0;
            } else if ($stateParams.State == "Finished") {
                $scope.selectIndex = 1;
            }
            //查询码 Code
            $scope.appCenterCode = $stateParams.SchemaCode;
            $scope.appCenterFlag = true;
        }

        //初始化数据
        var instances = {
            finished: {
                LoadComplete : false,
                WorkItems : []
            },
            cancel: {
                LoadComplete : false,
                WorkItems : []
            },
            unfinished: {
                LoadComplete : false,
                WorkItems : []
            }
        }
        // console.log(instances)
        $scope.instances = instances;
        $scope.unfinishNum = 0;
        $scope.searchKey = '';
        $scope.sampleData = false;//是否存在样列数据
        //控制隐藏，解决side-boxs的隐形bug
        $scope.finishedComplete = false;
        $scope.unfinishedComplete = false;
        $scope.cancelComplete = false;
        //搜索用到的变量
        $scope.searchIndex = 2;//区分搜索的页面
        $scope.searchfinishedBefore = [];//当前搜索的字段

        //激活进行中标签
        $scope.activeSlide($scope.selectIndex);
    };
    $scope.$watch("selectIndex", function (newVal, oldVal) {
        // 滚动到顶部
        $ionicScrollDelegate.scrollTop(true);
        $scope.filter = $scope.searchKeyArry[$scope.selectIndex] || {};//重置搜索的字段
        if ($scope.instances) {
            $scope.currentTab = $scope.getCurrentTab(newVal);
        }
    });
    //返回应用中心
    $scope.backToAppCenter = function () {
        $state.go("appCenterItem");
    };
    /*点击切换副标题*/
    $scope.activeSlide = function (index) {//点击时候触发
        $scope.selectIndex = index;
        $scope.slideShow(index);
        //切换当前标签之后刷新标签下数据
        var currentTab = $scope.getCurrentTab(index);
        $scope.currentTab = currentTab;
        // console.log($scope.currentTab);
        //如果不是第一次进入，即为切换页签并且数据为空时，自动加载
        if (!$scope.firstTimeEnter && currentTab.WorkItems.length == 0 && !currentTab.LoadComplete) {
        // if (!$scope.firstTimeEnter && !currentTab) {
        	$scope.loadMore();
            $scope.currentTab.LoadComplete = true
        }
        $ionicSlideBoxDelegate.slide(index);

    };
    $scope.slideShow = function (index) {
        //控制隐藏，解决side-boxs的隐形bug
        switch (index) {
            case 1:
                $scope.searchIndex = 4;
                $scope.finishedComplete = true;
                $scope.unfinishedComplete = false;
                $scope.cancelComplete = false;
                break;
            case 2:
                $scope.searchIndex = 5;
                $scope.cancelComplete = true;
                $scope.finishedComplete = false;
                $scope.unfinishedComplete = false;
                break;
            default:
                $scope.searchIndex = 2;
                $scope.unfinishedComplete = true;
                $scope.finishedComplete = false;
                $scope.cancelComplete = false;
                break;
        }
    }
    /*滑动切换副标题*/
    $scope.slideChanged = function (index) {//滑动时候触发
        if ($scope.searchKey != "") {
            $scope.clearSearch(function () {
                $scope.selectIndex = index;
            });
        } else {
            $scope.selectIndex = index;
        }
        $scope.slideShow(index);
    };

    //获取APP请求流程数据地址
    $scope.GetInstanceHandlerUrl = function (url, extend) {
        var params = {
            userId: $scope.user.ObjectID,
            mobileToken: $scope.user.MobileToken,
            loadStart: ($scope.currentTab ? $scope.currentTab.WorkItems.length : 0),
            refreshTime: '',
            instanceState: ($scope.currentTab ? $scope.currentTab.InstanceState : -1),
            keyWord: $scope.existsParameter("keyWord", $scope.searchKeyArry[$scope.selectIndex]),
            IsPriority: ($scope.existsParameter("IsPriority", $scope.searchKeyArry[$scope.selectIndex]) ? $scope.existsParameter("IsPriority", $scope.searchKeyArry[$scope.selectIndex]) : -1),
            status: $scope.searchIndex,
            startDate: $scope.existsParameter("startDate", $scope.searchKeyArry[$scope.selectIndex]),
            endDate: $scope.existsParameter("endDate", $scope.searchKeyArry[$scope.selectIndex]),
            Code:$scope.appCenterCode ?$scope.appCenterCode:""//应用中心绑定流程
        };

        for (var p in extend)
            if (params.hasOwnProperty(p)) params[p] = extend[p];

        url += "&userId=" + params.userId;
        url += "&mobileToken=" + params.mobileToken;
        url += "&loadStart=" + params.loadStart;
        url += "&refreshTime=" + params.refreshTime;
        url += "&instanceState=" + params.instanceState;
        url += "&Code=" + params.Code;
        //搜索
        url += "&keyWord=" + params.keyWord;
        url += "&IsPriority=" + params.IsPriority;
        url += "&status=" + params.status;
        url += "&startDate=" + params.startDate,
        url += "&endDate=" + params.endDate
        return url;
    };


    //加载面板信息
    $scope.loadUnfinishedData = function (fn) {
        //url = $scope.setting.appServiceUrl + "/LoadAllInstances?callback=JSON_CALLBACK&userId=" + $scope.user.ObjectID;
        //url += "&mobileToken=" + $scope.user.MobileToken;
        var params = {
            userId: $scope.user.ObjectID,
            mobileToken: $scope.user.MobileToken,
            Code:$scope.appCenterCode,
            status: 2
        };
        instanceService.queryInstances(params).then(function (result) {
            // console.log(result);
            if (result.Success) {
                if (result.Extend) {
                    $scope.instances.unfinished = result.Extend;
                    $scope.unfinishNum = $scope.instances.unfinished.TotalCount;
                    //记录为搜索前的数据
                    $scope.searchfinishedBefore[0] = angular.copy($scope.instances.unfinished, {});
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                $scope.currentTab.LoadComplete = true;
            } else {
                // commonJS.TimeoutHandler();
            }
            //静默的加载其他数据
            if (!fn) {
            	$scope.silentLoadOtherData();
            }
            //首次加载数据完成之后标记改变
            $scope.firstTimeEnter = false;
        }).finally(function () {
            commonJS.loadingHide();
            if (typeof fn == "function") {
                fn();//应用中心回调函数
            }
        });
    };
    //静默加载其他数据
    $scope.silentLoadOtherData = function () {
        console.log('silentLoadOtherData ... ...');
    	var finishedParams = {
            userId: $scope.user.ObjectID,
            mobileToken: $scope.user.MobileToken,
            Code:$scope.appCenterCode,
            status: 4
    	};
    	var canceledParams = {
			userId: $scope.user.ObjectID,
            mobileToken: $scope.user.MobileToken,
            Code:$scope.appCenterCode,
            status: 5
    	};

    	var finishedPromise = instanceService.queryInstances(finishedParams);
    	var canceledPromise = instanceService.queryInstances(canceledParams);

    	finishedPromise.then(function (result) {
    		if (result.Success && result.Extend) {
    			$scope.instances.finished = result.Extend;
    			//缓存数据
    			$scope.searchfinishedBefore[1] = angular.copy(result.Extend, {});
    		}
    	},function (error) {

    	});
    	canceledPromise.then(function (result) {
    		if (result.Success && result.Extend) {
    			$scope.instances.cancel = result.Extend;
    			//缓存数据
   			 	$scope.searchfinishedBefore[2] = angular.copy(result.Extend, {});
    		}
    	},function (error) {

    	});
    }

    //获取当前的Tab
    $scope.getCurrentTab = function (tab) {
        switch (tab) {
            case 0:
                return $scope.instances.unfinished;
                break;
            case 1:
                return $scope.instances.finished;
                break;
            case 2:
                return $scope.instances.cancel;
                break;
        }
    }

    //加载更多数据
    $scope.loadMore = function (callback) {
        // console.log($scope.currentTab)
        if ($scope.currentTab && $scope.currentTab.WorkItems.length) {
            // console.log($scope.currentTab);
            commonJS.loadingShow();
            var url = "";
            var params = null;
            params = {
                userId: $scope.user.ObjectID,
                mobileToken: $scope.user.MobileToken,
                keyWord: encodeURI($scope.searchKey),
                loadStart: $scope.currentTab.WorkItems ? $scope.currentTab.WorkItems.length : 0,
               // lastTime: commonJS.getDateFromJOSN($scope.currentTab.LastTime).Format("yyyy-MM-dd HH:mm:ss"),
                instanceState: $scope.currentTab.InstanceState,
                keyWord: $scope.existsParameter("keyWord", $scope.searchKeyArry[$scope.selectIndex]),//流程名称
                isPriority: $scope.existsParameter("IsPriority", $scope.searchKeyArry[$scope.selectIndex]),//2:加急，0：不加。空：不限
                status: $scope.searchIndex,//2,代办，4已完成，5取消
                startDate: $scope.existsParameter("startDate", $scope.searchKeyArry[$scope.selectIndex]),//开始时间
                endDate: $scope.existsParameter("endDate", $scope.searchKeyArry[$scope.selectIndex]),//开始时间
                Code:$scope.appCenterCode
            };
            instanceService.queryInstances(params).then(function (result) {
                commonJS.loadingHide();
                if (result.Success && result.Extend) {
                    //更新对象数据
                    $scope.updateInstances(result.Extend, "load");

                    commonJS.loadingHide();
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        } else {
            // $scope.currentTab.LoadComplete = true
        }
    };


    //下拉刷新
    $scope.doRefresh = function () {
        var url = "";
        var params = null;
        params = {
            userId: $scope.user.ObjectID,
            mobileToken: $scope.user.MobileToken,
            loadStart: 0,
            returnCount: 10,
           // lastTime: commonJS.getDateFromJOSN($scope.currentTab.LastTime).Format("yyyy-MM-dd HH:mm:ss"),
            keyWord: $scope.existsParameter("keyWord", $scope.searchKeyArry[$scope.selectIndex]),//流程名称
            isPriority: $scope.existsParameter("IsPriority", $scope.searchKeyArry[$scope.selectIndex]),//2:加急，0：不加。空：不限
            status: $scope.searchIndex,//2,代办，4已完成，5取消
            startDate: $scope.existsParameter("startDate", $scope.searchKeyArry[$scope.selectIndex]),//开始时间
            endDate: $scope.existsParameter("endDate", $scope.searchKeyArry[$scope.selectIndex]),//开始时间
            Code:$scope.appCenterCode
        };
        //刷新请求的数据
        instanceService.queryInstances(params).then(function (result) {
            commonJS.loadingHide();
            if (result.Success && result.Extend) {
        		$scope.updateInstances(result.Extend, "refresh");
        		$scope.currentTab.LoadComplete = result.Extend.LoadComplete;

        		//如果不是查询，更新缓存
        		if (angular.equals({}, $scope.filter)) {
        			$scope.searchfinishedBefore[$scope.selectIndex] = result.Extend;
        		}
                $scope.$broadcast('scroll.refreshComplete');
//              $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    //更新数据,type:load/refresh
    $scope.updateInstances = function (obj, type) {
        switch ($scope.selectIndex) {
            case 0:
                $scope.unfinishNum = obj.TotalCount;
                $scope.mergeData($scope.currentTab.WorkItems, $scope.instances.unfinished, obj, type);
                break;
            case 1:
                $scope.mergeData($scope.currentTab.WorkItems, $scope.instances.finished, obj, type);
                break;
            case 2:
                $scope.mergeData($scope.currentTab.WorkItems, $scope.instances.cancel, obj, type);
                break;
        }
    };
    /**
     * 合并数组中的数据,保证不重复
     *  @param {array} list   页面用于显示数据的临时数组
     *  @param {object} obj   每一个tab页对应的实例对象
     *  @param {object} ret   服务器返回的实例数据
     *  @param {string} type  加载方式
     *  @returns void
    **/
    $scope.mergeData = function (list, obj, ret, type) {
        if ($scope.searchKey != "") {
            list = [];
            obj.list = [];
        }
        if (type == "load") {
            obj.LoadComplete = ret.LoadComplete;
          //  obj.LastTime = ret.LastTime;
            if (ret.WorkItems && ret.WorkItems.length > 0) {
                for (var i = 0; i < ret.WorkItems.length; i++) {
                    if ($scope.existsInstance(list, ret.WorkItems[i])) continue;
                    obj.WorkItems.push(ret.WorkItems[i]);
                }
            }
        } else if (type == "refresh") {
          //  obj.RefreshTime = ret.RefreshTime;
        	//update by ousihang 下拉刷新默认加载10条数据
        	currentWorkItems = $scope.currentTab.WorkItems;
        	currentWorkItems.splice(0, currentWorkItems.length);
            if (ret.WorkItems && ret.WorkItems.length > 0) {
                for (var i = ret.WorkItems.length - 1; i > -1; i--) {
                    if ($scope.existsInstance(currentWorkItems, ret.WorkItems[i])) continue;
                    obj.WorkItems.splice(0, 0, ret.WorkItems[i]);
                }
            }
        }
    };
    //判断是否已经包含该对象
    $scope.existsInstance = function (list, obj) {
        if (!list || list.length == 0) return false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].ObjectID == obj.ObjectID) return true;
        }
        return false;
    };
    //(搜索条件传参)判断是否存在该对象
    $scope.existsParameter = function (e, obj) {
        if (angular.equals({}, obj)) {
            return "";
        }
        else {
            if (obj && obj.hasOwnProperty(e)) {
                return obj[e];
            } else {
                return "";
            }
        }
    };

    // 打开我的流程
    $scope.openWorkItem = function (instanceId) {
        if (!instanceId) return;
        var absurl = {
            state: 'tab.myInstances',
            tab: $scope.selectIndex
        }
        window.localStorage.setItem("absurl", JSON.stringify(absurl));
        $scope.worksheetUrl = $scope.setting.instanceSheetUrl + instanceId + "&LoginName=" + encodeURI($scope.user.Code) + "&LoginSID=" + $scope.clientInfo.UUID + "&MobileToken=" + $scope.user.MobileToken;
        commonJS.OpenInstanceSheet($scope, $scope.worksheetUrl, instanceId);
    }
    //搜索赋值
    $scope.setCurrentTab = function (tab, data) {
    	var copyData = angular.copy(data, {});
        switch (tab) {
            case 0:
                $scope.unfinishNum = data.TotalCount;
                return $scope.instances.unfinished = data;
                break;
            case 1:
                return $scope.instances.finished = data;
                break;
            case 2:
                return $scope.instances.cancel = data;
                break;
        }
    }
    //我的流程搜索
    $scope.toSearch = function (filter) {
        if (!angular.equals({}, filter)) {
            //存储搜索数组
            $scope.searchKeyArry[$scope.selectIndex] = filter;
            $scope.overtme = commonJS.timeCheck(filter.startDate, filter.endDate);
            if ($scope.overtme) {
                //commonJS.showShortMsg("setcommon f15", "时间区间错误", 2000);
            	//update by ouyangsk
            	commonJS.showShortMsg("setcommon f15", $rootScope.languages.dateInError, 2000);
                return false;
            }
           // console.log($scope.searchKeyArry);
            // console.log("那个页面点击的搜索。。。" + $scope.selectIndex);
            var promise = null;
            var options = {
                userId: $scope.user.ObjectID,
                keyWord: filter.keyWord ? encodeURI(filter.keyWord) : "",//流程名称
                isPriority: filter.IsPriority || "",//2:加急，0：不加。空：不限
                status: $scope.searchIndex,//2,代办，4已完成，5取消
                startDate: filter.startDate || "",//开始时间
                endDate: filter.endDate || "",//开始时间
            };
            promise = instanceService.queryInstances(options)
            promise.then(function (res) {
                var data = res.Extend;
                if (res.data) {
                    data = res.data;
                }
                // 滚动到顶部
                $ionicScrollDelegate.scrollTop(true);
                //if (data.WorkItems.length > 0)
                $scope.setCurrentTab($scope.selectIndex, data);
                //else commonJS.loadingShow("没有查找到内容!");
            })

        }
        else {//没有搜索条件点确定=重置$scope.searchfinishedBefore
            $scope.setCurrentTab($scope.selectIndex, $scope.searchfinishedBefore[$scope.selectIndex]);
        }
        $scope.popover.hide();
    };
    $scope.resetSearch = function () {
       // console.log($scope.filter);
        $scope.filter = {};//重置搜索的字段
        $scope.searchKeyArry[$scope.selectIndex] = $scope.filter;
        $ionicScrollDelegate.scrollTop(true);
        $scope.setCurrentTab($scope.selectIndex, $scope.searchfinishedBefore[$scope.selectIndex]);
       // $scope.popover.hide();
    };

})
