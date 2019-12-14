//任务委托
app.controller('MyAgentsController', ['$scope', "$rootScope", "$translate", "$http", "$state", "$filter", "$modal", "$compile", "ControllerConfig", "jq.datables",
function ($scope, $rootScope, $translate, $http, $state, $filter, $modal, $compile, ControllerConfig, jqdatables) {
    //进入视图触发
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.myScroll = null
    });

    $scope.getLanguage = function () {
        $scope.LanJson = {
            sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
            sZeroRecords: $translate.instant("uidataTable.sZeroRecords_NoAgnets"),
            sInfo: $translate.instant("uidataTable.sInfo"),
            sProcessing: $translate.instant("uidataTable.sProcessing"),

            Confirm_Delete: $translate.instant("WarnOfNotMetCondition.Confirm_Delete"),
            NoSelectItem: $translate.instant("WarnOfNotMetCondition.NoSelectAgent")
        }
    }
    $scope.getLanguage();
    // 获取语言
    $rootScope.$on('$translateChangeEnd', function () {
        $scope.getLanguage();
        $state.go($state.$current.self.name, {}, { reload: true });
    });

    $scope.checkAll = false;
    
    $scope.checkAllSelect = function (mark) {//检查是否全选
    	if(mark){//true表示点击的是 全选/全不选 按钮
    		$("tbody input[type='checkbox']").each(function(){
        	    $(this).prop("checked",$scope.checkAll);
        	});
    	}else{
    		var flag = true;
        	$("tbody input[type='checkbox']").each(function(){
        	    if(!this.checked){
        	    	flag = false;
        	    }
        	});
        	$scope.checkAll = flag;
    	}
    }
    $scope.loadScroll = function() {
        $scope.myScroll = new IScroll('.dataTables_scrollBody', {
            scrollbars: true,
            bounce: false,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
    };
    $scope.getColumns = function () {
        var columns = [];
        columns.push({
            "mData": "AgencyID",
            "mRender": function (data, type, full) {
                // return "<input ng-click=\"checkAllSelect(false)\" type=\"checkbox\" class=\"AgencyItem\" ng-checked=\"\" data-id=\"" + data + "\"/>";
                return '<span class="checkbox checkbox-primary checkbox-single" style="padding-left:0;display: flex"><input ng-click="checkAllSelect(false)" type="checkbox" ng-checked="" class="AgencyItem" data-id=' + data + ' /><label></label></span>';
            }
        });

        columns.push({
            "mData": "WorkflowName",
            "mRender": function (data, type, full) {
                if (data == "") data = "所有的";
                return "<span>" + data + "</span>";
            }
        });
        columns.push({ "mData": "WasAgentName", "sClass": "center" });
        columns.push({ "mData": "StartTime" });
        columns.push({ "mData": "EndTime" });
        columns.push({
            "mData": "AgencyID",
            "mRender": function (data, type, full) {
                return "<a ng-click=\"btn_addAgents('" + data + "')\"><span data-id=\"" + data + "\" translate=\"QueryTableColumn.Edit\"></span></a>";
            }
        });
        return columns;
    }

    //委托详情
    $scope.tabMyAgents = {
        "bProcessing": true,
        "bServerSide": true,    // 是否读取服务器分页
        "paging": true,         // 是否启用分页
        "bPaginate": true,      // 分页按钮
        "bFilter": false,        // 是否显示搜索栏  
        "searchDelay": 1000,    // 延迟搜索
        "iDisplayLength": 20,   // 每页显示行数
        "bSort": false,         // 排序  
        "singleSelect": true,
        "bInfo": true,          // Showing 1 to 10 of 23 entries 总记录数没也显示多少等信息  
        "pagingType": "full_numbers",  // 设置分页样式，这个是默认的值
        "bLengthChange": true, // 每页显示多少数据
        "aLengthMenu": [[10, 20, 50, 100], [10, 20, 50, 100]],//设置每页显示数据条数的下拉选项
        "sScrollY": "500px",
        "bScrollCollapse": true,
        "iScrollLoadGap": 50,
        "language": {           // 语言设置
            "sLengthMenu": $scope.LanJson.sLengthMenu,
            "sZeroRecords": "<div class='no-data'><p class='no-data-img'></p><p>"+$scope.LanJson.sZeroRecords+"</p></div>",
            "sInfo": $scope.LanJson.sInfo,
            "infoEmpty": "",
            "sProcessing": '<div class="loading-box"><i class="icon-loading"></i><p>'+$scope.LanJson.sProcessing+'</p></div> ',
            "paginate": {
                "first": "<<",
                "last": ">>",
                "previous": "<",
                "next": ">"
            }
        },
        "sAjaxSource": ControllerConfig.Agents.GeyAgencyTable,
        "fnServerData": function (sSource, aDataSet, fnCallback) {
            $.ajax({
                "dataType": 'json',
                "type": 'POST',
                "url": sSource,
                "data": aDataSet,
                "success": function (json) {
                    if (json.ExceptionCode == 1 && json.Success == false) {
                        json.Rows = [];
                        json.sEcho = 1;
                        json.Total = 0;
                        json.iTotalDisplayRecords = 0;
                        json.iTotalRecords = 0;
                        $state.go("platform.login");
                    }
                    fnCallback(json);
                }
            });
        },
        "sAjaxDataProp": 'Rows',
        "sDom": '<"top"f>rt<"row"ipl>',
        "sPaginationType": "full_numbers",
        "aoColumns": $scope.getColumns(),// 字段定义
        // 初始化完成事件,这里需要用到 JQuery ，因为当前表格是 JQuery 的插件
        "initComplete": function (settings, json) {
            var filter = $(".searchContainer");
            filter.find("button").unbind("click.DT").bind("click.DT", function () {
                $("#tabMyAgents").dataTable().fnDraw();
            });
            $scope.loadScroll();
        },
        //创建行，未绘画到屏幕上时调用
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            //将添加的angular事件添加到作用域中
            $compile(nRow)($scope);
            setTimeout(function(){
                $scope.myScroll.refresh();
            },300);
        },
        "fnDrawCallback": function () {
            jqdatables.trcss();
            if($scope.checkAll){//暂时使用此方法解决点击搜索或者下一页按钮时，全选按钮勾勾无法取消的问题
            	$("thead input[type='checkbox']").click();
            }
        }
    }

    $scope.btn_removeAgents = function () {
        $scope.selectedAgency = [];
        var items = angular.element(document.querySelectorAll(".AgencyItem"));
        angular.forEach(items, function (data, index, array) {
            if (data.checked) {
                $scope.selectedAgency.push(data.getAttribute("data-id"));
            }
        });
        if (!$scope.selectedAgency.length) {
            $.notify({ message: $scope.LanJson.NoSelectItem, status: "danger" });
            return;
        }
        // 弹出模态框
        var modalInstance = $modal.open({
            templateUrl: 'template/ProcessCenter/ConfirmModal.html',
            size: "sm",
            controller: function ($scope, $modalInstance) {
                $scope.Title = $translate.instant("WarnOfNotMetCondition.Tips");
                $scope.Message = $translate.instant("WarnOfNotMetCondition.Confirm_Delete");
                $scope.Button_OK = true;
                $scope.Button_OK_Text = $translate.instant("QueryTableColumn.Button_OK");
                $scope.Button_Cancel = true;
                $scope.Button_Cancel_Text = $translate.instant("QueryTableColumn.Button_Cancel");
                $scope.ok = function () {
                    $modalInstance.close();  // 点击确定按钮
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel'); // 退出
                }
            }
        });
        //弹窗点击确定的回调事件
        modalInstance.result.then(function () {
            //删除
            $http({
                url: ControllerConfig.Agents.RemoveAgency,
                params: {
                    AgencysID: $scope.selectedAgency
                }
            })
            .success(function (result, header, config, status) {
                $state.go($state.$current.self.name, {}, { reload: true });
            })
            .error(function (data, header, config, status) {

            });
        });
    }

    $scope.btn_addAgents = function (data) {
        if (data == undefined) AgencyID = "";
        else AgencyID = data;

        $http({
            url: ControllerConfig.Agents.GetAgency,
            params: {
                agentID: AgencyID,
                random: new Date().getTime()
            }
        })
        .success(function (result, header, config, status) {
            var Agency = result.Rows[0];
            // 弹出模态框
            var modalInstance = $modal.open({
                templateUrl: 'EditAgency.html',    // 指向上面创建的视图
                controller: 'EditAgencyController',// 初始化模态范围
                size: "md",
                resolve: {
                    params: function () {
                        return {
                            user: $scope.user,
                            Agency: Agency,
                            AgencyID: AgencyID
                        };
                    },
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-all.min.css',
                            'WFRes/assets/stylesheets/sheet.css',
                            'WFRes/_Scripts/jquery/jquery.lang.js',
                            'WFRes/_Scripts/ligerUI/ligerui.all.min.js',
                            'WFRes/_Scripts/MvcSheet/SheetControls.js',
                            'WFRes/_Scripts/MvcSheet/MvcSheetUI.js'
                        ]).then(function () {
                            return $ocLazyLoad.load([
                            'WFRes/_Scripts/MvcSheet/Controls/SheetWorkflow.js',
                            'WFRes/_Scripts/MvcSheet/Controls/SheetUser.js'
                            ])
                        });
                    }]
                }
            });
            modalInstance.opened.then(function() {
          		//TODO not work
            });
            
        })
        
       	var times = setInterval(function() {
       		if($("#WorkflowCodes").length>0){
       			clearInterval(times);
       			$(".select2-search-field").find("input").css("z-index", 0);
           		//console.log($("#WorkflowCodes"));
           		$("#WorkflowCodes").css("width","246px");
       		}
       	}, 50)
       
    }
}]);

app.controller("EditAgencyController", ["$scope", "$rootScope", "$http", "$translate", "$state", "$filter", "$modal", "$modalInstance", "$interval", "$timeout", "ControllerConfig", "notify", "datecalculation", "params",
    function ($scope, $rootScope, $http, $translate, $state, $filter, $modal, $modalInstance, $interval, $timeout, ControllerConfig, notify, datecalculation, params) {

        $scope.getLanguage = function () {
            $scope.LanJson = {
                StartTime: $translate.instant("QueryTableColumn.StartTime"),
                EndTime: $translate.instant("QueryTableColumn.EndTime"),
                //update by zhangj
                InvalidAgency: $translate.instant("Agent.WorkflowExists"),
                NoSelectWorkItem: $translate.instant("WarnOfNotMetCondition.NoSelectWorkItem"),
                NoSelectWasAgent: $translate.instant("WarnOfNotMetCondition.NoSelectWasAgent"),
                NoSelectWorkflows: $translate.instant("WarnOfNotMetCondition.NoSelectWorkflows"),
                InvalidOfTime: $translate.instant("WarnOfNotMetCondition.InvalidOfTime"),
                NoSelectOriginatorRange: $translate.instant("WarnOfNotMetCondition.NoSelectOriginatorRange")
            }
        }
        $scope.getLanguage();
        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });

        //控件初始化参数
        $scope.EtartTimeOption = {
            dateFmt: 'yyyy-MM-dd', realDateFmt: "yyyy-MM-dd", minDate: '2012-1-1', maxDate: '2099-12-31',
            onpicked: function (e) {
                $scope.StartTime = e.el.value;
            }
        }
        $scope.EndTimeOption = {
            dateFmt: 'yyyy-MM-dd',
            realDateFmt: "yyyy-MM-dd", minDate: '2012-1-1', maxDate: '2099-12-31',
            onpicked: function (e) {
                $scope.EndTime = e.el.value;
            }
        }
        $scope.WorkflowOptions = {
            Editable: true, Visiable: true, Mode: "WorkflowTemplate", IsMultiple: true, PlaceHolder: $scope.LanJson.WorkFlow, IsSearch:true
        }
        $scope.WasAgentOptions = {
            Editable: true, Visiable: true, PlaceHolder: $scope.LanJson.Originator
        } 
        $scope.OriginatorRangeOptions = {
            Editable: true, Visiable: true, OrgUnitVisible: true, UserVisible: false, PlaceHolder: $scope.LanJson.Originator
        }
        
        $scope.init = function () {
            $scope.user = params.user;
            $scope.IsAllWorkflow = "true";
            //编辑初始化
            if (params.AgencyID != "") {
                $scope.IsEdit = true;
                var Agency = params.Agency;
                if (Agency.WorkflowCode == "") {
                    $scope.IsAllWorkflow = "true";
                }
                else {
                    $scope.IsAllWorkflow = "false";
                    $scope.WorkflowOptions.V = Agency.WorkflowCode;
                    $scope.WorkflowCodes = Agency.WorkflowCode;
                }
                $scope.StartTime = Agency.StartTime;
                $scope.EndTime = Agency.EndTime;

                $scope.WorkflowOptions.Editable = false;
                $scope.WasAgentOptions.V = Agency.WasAgentID;
                $scope.OriginatorRangeOptions.V = Agency.OriginatorRange

            }
        }
        $scope.init();

        $scope.ok = function () {
            // TODO：如果是当前用户有权限编辑，那么保存至数据库
            $scope.WasAgent = $("#WasAgent").SheetUIManager().GetValue();
            $scope.WorkflowCodes = $("#WorkflowCodes").SheetUIManager().GetValue();
            $scope.OriginatorRange = $("#OriginatorRange").SheetUIManager().GetValue();
            if ($scope.WasAgent == "") {
                $scope.FailMessage = $scope.LanJson.NoSelectWasAgent;
                $scope.Messagetype = 'danger';
                var ctrl = angular.element(document.querySelector("#EditError"));
                notify.showMessage(ctrl);
                return;
            }

            if ($scope.StartTime == null || $scope.EndTime == null) {
                $scope.FailMessage = $scope.LanJson.InvalidOfTime;
                $scope.Messagetype = 'danger';
                var ctrl = angular.element(document.querySelector("#EditError"));
                notify.showMessage(ctrl);
                return;
            }
            if (!datecalculation.isOrderBy($scope.StartTime, $scope.EndTime)) {
                $scope.FailMessage = $scope.LanJson.InvalidOfTime;
                $scope.Messagetype = 'danger';
                var ctrl = angular.element(document.querySelector("#EditError"));
                notify.showMessage(ctrl);
                return;
            }
            if ($scope.IsAllWorkflow == "false" && $scope.WorkflowCodes.length <= 0) {
                $scope.Messagetype = 'danger';
                $scope.FailMessage = $scope.LanJson.NoSelectWorkflows;
                var ctrl = angular.element(document.querySelector("#EditError"));
                notify.showMessage(ctrl);
                return;
            }
            if ($scope.OriginatorRange.length <= 0) {
                $scope.Messagetype = 'danger';
                $scope.FailMessage = $scope.LanJson.NoSelectOriginatorRange;
                var ctrl = angular.element(document.querySelector("#EditError"));
                notify.showMessage(ctrl);
                return;
            }
            var WorkflowCodes = $scope.WorkflowCodes;
            $http({
                url: ControllerConfig.Agents.AddAgency,
                params: {
                    AgencyID: params.AgencyID,
                    IsAllWorkflow: $scope.IsAllWorkflow,
                    WorkflowCodes: $scope.WorkflowCodes,
                    StartTime: $scope.StartTime,
                    EndTime: $scope.EndTime,
                    OriginatorRange: $scope.OriginatorRange,
                    WasAgent: $scope.WasAgent
                }
            })
            .success(function (result, header, config, status) {
                if (result.Success == true) {
                    $modalInstance.close();
                    $state.go($state.$current.self.name, {}, { reload: true });
                }
                else {
                    $scope.Messagetype = 'danger';
                    $scope.FailMessage = $scope.LanJson.InvalidAgency;
                    var ctrl = angular.element(document.querySelector("#EditError"));
                    notify.showMessage(ctrl);
                    return;
                }
            })
            .error(function (result, header, config, status) {

            })
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel'); // 退出
        }
    }])