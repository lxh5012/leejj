module.controller('startworkflowCtrl', function ($scope, $rootScope, categories, 
		$ionicSlideBoxDelegate,$ionicScrollDelegate, $ionicLoading, commonJS, startInstanceService) {
    $scope.$on("$ionicView.enter", function (scopes, states) {
        //update by luxm 每次进入清除发起流程搜索关键字缓存
        if ($scope.searchKey) {
        	$scope.searchKey = "";
        	$scope.doSearch();
        }
        //设置钉钉头部
        if ($rootScope.dingMobile.isDingMobile) {
            $scope.SetDingDingHeader($rootScope.languages.tabs.InitiateProcess);
            dd.biz.navigation.setRight({
                show: false,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                text: "",//控制显示文本，空字符串表示显示默认文本
                onSuccess: function (result) {
                },
                onFail: function (err) { }
            });
        }
        if ($scope.userId != $scope.user.ObjectID) {
            $scope.categories = [];
            $scope.loadWorkflows();
        }
        else {
            //var dateNow = new Date();    //结束时间
            //var times = dateNow.getTime() - $scope.lastLoadTime.getTime();  //时间差的毫秒数
            //if (times > 1000 * 60 * 10 || $scope.exception) {// 超过10分钟，重新刷新一次
            //    $scope.lastLoadTime = new Date();
            //    $scope.loadWorkflows();
            //}
        }
        //无常用流程自动切换到全部
        if ($scope.FavoriteNum == 0) {
            $scope.activeSlide(1);
        }
    });

    /*切换副标题*/
    $scope.slectIndex = 0;
    $scope.searchKey = '';
    $scope.tabNames = $rootScope.languages.tabMyInstances.tab;
    $scope.sampleData = false;//是否存在样列数据
    // 常用流程数量
    $scope.FavoriteNum = 0;
    $scope.FavoriteNumBeforeSearch = 0;//记录没有不符合搜索前的数据
    $scope.exception = false;//是否刷新数据
    $scope.initCompleted = true;//是否加载完成
    $scope.sourceCategories = null;
    $scope.userId = $scope.user.ObjectID;
    $scope.lastLoadTime = new Date();
    //搜索
    $scope.searchKey = "";
    $scope.SearchMode = false;
    //update by luxm
    //是否刷新
    $scope.isRefresh = false;
    //存储原始数据
    $scope.sourceCategories = null;
    $scope.init = function () {
        commonJS.loadingShow();
        $scope.activeSlide = function (index) {//点击时候触发
            $scope.slectIndex = index;
            $ionicSlideBoxDelegate.slide(index);
            //update by luxm
            $ionicScrollDelegate.scrollTop(true);
        };
        $scope.slideChanged = function (index) {//滑动时候触发
            $scope.slectIndex = index;
        };
        $scope.loadWorkflows();//加载全部数据
        /*处理微信的表单返回*/
        if ($rootScope.loginInfo.loginfrom == "wechat" && $scope.JumpParams.tab) {
            $scope.slectIndex = $scope.JumpParams.tab;
            $scope.renderJumpParams();
        }
    }
    //下拉刷新
    var search="";
    $scope.doRefresh = function () {
        commonJS.loadingShow();
        search = $scope.searchKey;
        $scope.CancelSearch();//清空
        //update by luxm
        //下拉刷会重新加载数据，常用流程数目会重复计算
        $scope.FavoriteNum = 0;
        $scope.FavoriteNumBeforeSearch = 0;
        $scope.isRefresh = true;
        $scope.loadWorkflows();
    }

    $scope.loadWorkflows = function () {
        commonJS.loadingShow();
        //第一次加载数据
        var url = "";
        var params = null;
//        if (window.cordova) {
//            url = $scope.setting.httpUrl + "/LoadWorkflows?callback=JSON_CALLBACK&userCode=" + encodeURI($scope.user.Code) + "&mobileToken=" + $scope.user.MobileToken;
//        }
//        else {
//            url = $scope.setting.httpUrl + "/Mobile/LoadWorkflows";
            params = {
                userId: $scope.user.ObjectID,
                userCode: $scope.user.Code,
                mobileToken: $scope.user.MobileToken,
            }
//        }
        categories.all(params).then(function (result) {
            if (result.hasOwnProperty('Success')) {
                commonJS.TimeoutHandler();
            }
            // console.log(result);
            $scope.url = $scope.setting.httpUrl.toLocaleLowerCase().split(config.portalroot.toLocaleLowerCase())[0];
            $scope.exception = false;
            $scope.categories = [];
            var FavoriteCategories = [];
            if (result.Workflows) {
                angular.forEach(result.Workflows, function (data, index, full) {
                    if (data.DisplayName == "FrequentFlow") {
                        angular.forEach(data.Workflows, function (Workflow) {
                            $scope.FavoriteNum++;
                            $scope.FavoriteNumBeforeSearch++;
                        })
                    } else {
                        $scope.categories.push(data);
                    }
                })
                //update by luxm
                if (($scope.FavoriteNum == 0 && !($scope.isRefresh)) || ($scope.slectIndex == 1 && $scope.isRefresh) || ($scope.slectIndex == 1 && $scope.FavoriteNum == 0)) {
                    $scope.activeSlide(1);
                } else {
                    $scope.activeSlide(0);
                }
            }
            $scope.sourceCategories = JSON.stringify($scope.categories);
            $scope.initCompleted = true;
            $scope.$broadcast('scroll.refreshComplete');
        }).finally(function () {
            commonJS.loadingHide();
            //update by luxm 
            //刷新时保持原查询数据不变
            $scope.searchKey=search;
            $scope.doSearch();
            //此处设为false不会影响其它地方
            $scope.isRefresh = false;
        });

    }
    //改变是否常用流程,todo:待优化
    $scope.changeFavorite = function (workflowCode, category) {
        var stetus = "";
        if (category == undefined) {
            angular.forEach($scope.categories, function (data, i, full) {
                angular.forEach(data.Workflows, function (Workflow, j, full) {
                    if (Workflow.WorkflowCode == workflowCode) {
                        Workflow.IsFavorite = false;
                        $scope.categories[i].Workflows[j].IsFavorite = false;
                        $scope.setFavorite(Workflow);
                        stetus = $rootScope.languages.tabMyInstances.cancelFrequent;
                    }
                });
            });
        }
        else {
            angular.forEach($scope.categories, function (data, i, full) {
                if (data.DisplayName == category) {
                    angular.forEach(data.Workflows, function (Workflow, j, full) {
                        if (Workflow.WorkflowCode == workflowCode) {
                            Workflow.IsFavorite = !Workflow.IsFavorite;
                            $scope.categories[i].Workflows[j].IsFavorite = Workflow.IsFavorite;
                            $scope.setFavorite(Workflow);
                            if (Workflow.IsFavorite) {
                                stetus = $rootScope.languages.tabMyInstances.setFrequent;
                            }
                            else if (!Workflow.IsFavorite) {
                                stetus = $rootScope.languages.tabMyInstances.cancelFrequent;
                            }
                        }
                    });
                }
            });
        }
        $scope.sourceCategories = JSON.stringify($scope.categories);
       // event.stopPropagation();
        //提示信息
        $ionicLoading.show({
            template: '<span class="setcommon f15">' + stetus + '</span>',
            duration: 1.5 * 1000,
            animation: 'fade-in',
            showBackdrop: false,
        });
    };
    $scope.setFavorite = function (workflow) {
        if (workflow.IsFavorite) {
            $scope.FavoriteNum++;
            $scope.FavoriteNumBeforeSearch++;
        }
        else {
            $scope.FavoriteNum--;
            $scope.FavoriteNumBeforeSearch--;
        }
        params = {
                userId: $scope.user.ObjectID,
                userCode: $scope.user.Code,
                mobileToken: $scope.user.MobileToken,
                workflowCode: workflow.WorkflowCode,
                isFavorite: workflow.IsFavorite
            }
        console.log(params);
        categories.setFavorite( params).then(function (result) {
            console.log(params);
        });
    }
    $scope.init();


    // 发起流程
    $scope.startWorkflow = function (workflowCode) {
        var absurl = {
            state: 'tab.startworkflow',
            tab: $scope.slectIndex
        }
        var params = {
	    		'LoginName': encodeURI($scope.user.Code),
	    		'LoginSID': $scope.clientInfo.UUID,
	    		'MobileToken': $scope.user.MobileToken,
	    }
    	startInstanceService.startInstance(workflowCode, params).then(
    		function(data) {
    			if (data.Success) {
                    var url = data.Message;
                    commonJS.openWorkItem($scope, url)
                } else {
                	commonJS.TimeoutHandler();
                }	
    		}
    	);
    };

    //搜搜
    $scope.CancelSearch = function (event) {
        $scope.categories = JSON.parse($scope.sourceCategories);
        $scope.searchKey = "";
        $scope.SearchMode = false;
        $scope.FavoriteNum = $scope.FavoriteNumBeforeSearch;
    }
    // 搜索流程（本地搜索）
    $scope.doSearch = function () {
        $scope.categories = JSON.parse($scope.sourceCategories);
        $scope.FavoriteNum = $scope.FavoriteNumBeforeSearch;
        $scope.SearchMode = false;
        if ($scope.searchKey) {
            $scope.SearchMode = true;
            for (var i = 0; i < $scope.categories.length; i++) {
                for (var j = 0; j < $scope.categories[i].Workflows.length; j++) {
                    if ($scope.categories[i].Workflows[j].DisplayName.indexOf($scope.searchKey) == -1) {
                        if ($scope.categories[i].Workflows[j].IsFavorite) {
                            $scope.FavoriteNum--;
                        }
                        $scope.categories[i].Workflows.splice(j, 1);
                        j--;
                    }
                }
                if ($scope.categories[i].Workflows.length == 0) {
                    $scope.categories.splice(i, 1);
                    i--;
                }
            }
        }
    };

});