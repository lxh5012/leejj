//已阅
app.controller('MyReadWorkItemController', ['$scope', '$rootScope', '$translate', '$http', '$timeout', '$state', '$filter', '$compile', '$interval', 'ControllerConfig', 'datecalculation', 'jq.datables',
function ($scope, $rootScope, $translate, $http, $timeout, $state, $filter, $compile, $interval, ControllerConfig, datecalculation, jqdatables) {
    $scope.init = function () {
        $scope.name = $translate.instant("WorkItemController.MyReadWorkItem");
        $scope.StartTime = datecalculation.redDays(new Date(), 30);
        $scope.EndTime = datecalculation.addDays(new Date(), 30);
    }

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.init();
        $scope.myScroll = null
    });


    // 获取语言
    $rootScope.$on('$translateChangeEnd', function () {
        $scope.getLanguage();
        $state.go($state.$current.self.name, {}, { reload: true });
    });

    $scope.getLanguage = function () {
        $scope.LanJson = {
            search: $translate.instant("uidataTable.search"),
            ProcessName: $translate.instant("QueryTableColumn.ProcessName"),
            WorkFlow: $translate.instant("QueryTableColumn.WorkFlow"),
            FinishTime: $translate.instant("QueryTableColumn.FinishTime"),
            StartTime: $translate.instant("QueryTableColumn.StartTime"),
            EndTime: $translate.instant("QueryTableColumn.EndTime"),
            sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
            sZeroRecords: $translate.instant("uidataTable.sZeroRecords"),
            sInfo: $translate.instant("uidataTable.sInfo"),
            sProcessing: $translate.instant("uidataTable.sProcessing")
        }
    }
    $scope.getLanguage();

    $scope.WorkflowOptions = {
        Editable: true,
        Visiable: true,
        Mode: "WorkflowTemplate",
        IsMultiple: true,
        PlaceHolder: $scope.LanJson.WorkFlow,
        IsSearch:true
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
    // 获取列定义
    $scope.getColumns = function () {
        var columns = [];
        columns.push({
            "mData": "InstanceName",
            "mRender": function (data, type, full) {
            	//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
            	data = $scope.htmlEncode(data);
            	// return "<a ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
            	return "<a target='_blank' href='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
            }
        });
        columns.push({ 
        	"mData": "DisplayName",
        	"mRender": function (data, type, full) {
        		//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
            	data = $scope.htmlEncode(data);
            	return data;
        	}
        });
        columns.push({ "mData": "ReceiveTime", "sClass": "center hide1024" });
        columns.push({ "mData": "FinishTime", "sClass": "center hide414" });
        columns.push({
            "mData": "OriginatorName",
            "sClass": "center hide414",
            "mRender": function (data, type, full) {
            	//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
            	data = $scope.htmlEncode(data);
                return "<a ng-click=\"showUserInfoModal('" + full.Originator + "');\" new-Bindcompiledhtml>" + data + "</a>";
            }
        });
        columns.push({ 
        	"mData": "OriginatorOUName", 
        	"sClass": "center hide1024",
        	"mRender": function (data, type, full) {
        		//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
            	data = $scope.htmlEncode(data);
            	return data;
        	 }
        });
        return columns;
    }

    // TODO:下面的需要获取语言
    $scope.options_ReadWorkitem = {
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
        "sAjaxSource": ControllerConfig.WorkItem.GetReadWorkItems,
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
                    //每次搜索成功后清空搜索关键字
                    $(".input-text").val("");
                }
            });
        },
        "sAjaxDataProp": 'Rows',
        "sDom": '<"top"f>rt<"row"ipl>',
        "sPaginationType": "full_numbers",
        "fnServerParams": function (aoData) {  // 增加自定义查询条件
        	//ie9不兼容placeholder属性 ie9下当value为空时，其value取placeholder值
            if($("#StartTime").attr("placeholder")==$("#StartTime").val()){
                $scope.StartTime="";
            }else{
                $scope.StartTime = $("#StartTime").val();
            }
            if($("#EndTime").attr("placeholder")==$("#EndTime").val()){
                $scope.EndTime="";
            }else{
                $scope.EndTime = $("#EndTime").val();
            }
          //将时间转化为时间戳
            var startTimes = new Date($scope.StartTime.replace(/-/g,"/")).getTime();
            var EndTimes = new Date($scope.EndTime.replace(/-/g,"/")).getTime();
            if(startTimes>EndTimes){
            	$.notify({message:"时间区间错误",status:"danger"});
        		$("#EndTime").css("color","red");
            	return false;
            }
            aoData.push(
                { "name": "startTime", "value": $filter("date")($scope.StartTime, "yyyy-MM-dd") },
                { "name": "endTime", "value": $filter("date")($scope.EndTime, "yyyy-MM-dd") },
                { "name": "workflowCode", "value": $scope.WorkflowCode },
                { "name": "instanceName", "value": $scope.InstanceName }
                );
        },
        "aoColumns": $scope.getColumns(), // 字段定义
        "initComplete": function (settings, json) {
            $scope.loadScroll()
            var filter = $(".searchContainer");
            filter.find("button").unbind("click.DT").bind("click.DT", function () {
                $scope.WorkflowCode = $("#sheetWorkflow").SheetUIManager().GetValue();
                $("#tabReadWorkitem").dataTable().fnDraw();
            });
        },
        //创建行，未绘画到屏幕上时调用
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            $compile(nRow)($scope);
            setTimeout(function(){
                $scope.myScroll.refresh();
            },300);
        },
        //datables被draw完后调用
        "fnDrawCallback": function () {
            jqdatables.trcss();
        }
    }
}]);

