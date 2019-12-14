app.controller('QueryParticipantWorkItemController', ['$scope',"$location", "$rootScope", "$translate", "$http", "$timeout", "$state", "$filter", "$compile", "ControllerConfig", "datecalculation", "jq.datables",
    function ($scope,$location, $rootScope, $translate, $http, $timeout, $state, $filter, $compile, ControllerConfig, datecalculation, jqdatables) {
        $scope.State = 0;
        $scope.FirstTime = true;
        $scope.$on("$viewContentLoaded", function (event) {
            $timeout(function(){
            	 $scope.Participant = $scope.user == undefined?"": $scope.user.ObjectID;
            },100)
            $scope.myScroll = null
            //$scope.name = $translate.instant("WorkItemController.QueryParticipantWorkItem");
        })

        $scope.getLanguage = function () {
            $scope.LanJson = {
                search: $translate.instant("uidataTable.search"),
                ProcessName: $translate.instant("QueryTableColumn.ProcessName"),
                WorkFlow: $translate.instant("QueryTableColumn.WorkFlow"),
                Originator: $translate.instant("QueryTableColumn.Originator"),
                Approver: $translate.instant("QueryTableColumn.Approver"),
                StartTime: $translate.instant("QueryTableColumn.StartTime"),
                EndTime: $translate.instant("QueryTableColumn.EndTime"),
                sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
                sZeroRecords: $translate.instant("uidataTable.sZeroRecords"),
                sInfo: $translate.instant("uidataTable.sInfo"),
                sProcessing: $translate.instant("uidataTable.sProcessing"),
                UnfinishedText: $translate.instant("InstanceState.Unfinished"),
                FinishedText: $translate.instant("InstanceState.Finished"),
                CanceledText: $translate.instant("InstanceState.Canceled"),
                UnspecifiedText: $translate.instant("InstanceState.Unspecified"),
                FinishTime: $translate.instant("QueryTableColumn.FinishTime"),
                State: $translate.instant("QueryTableColumn.State"),
                //权限
                QueryInstanceByProperty_NotEnoughAuth1: $translate.instant("NotEnoughAuth.QueryInstanceByProperty_NotEnoughAuth1"),
                QueryInstanceByProperty_NotEnoughAuth2: $translate.instant("NotEnoughAuth.QueryInstanceByProperty_NotEnoughAuth2"),
                QueryInstanceByProperty_NotEnoughAuth3: $translate.instant("NotEnoughAuth.QueryInstanceByProperty_NotEnoughAuth3"),
                QueryParticipantWorkItem_NoParticipant: $translate.instant("NotEnoughAuth.QueryParticipantWorkItem_NoParticipant"),
                DataFilter_NotEnoughAuth: $translate.instant("NotEnoughAuth.DataFilter_NotEnoughAuth")
            }
        }
        $scope.getLanguage();
        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });

        $scope.WorkflowOptions = {
            Editable: true, Visiable: true, Mode: "WorkflowTemplate", IsMultiple: true, PlaceHolder: $scope.LanJson.WorkFlow, IsSearch:true
        }
        $scope.UserOptions = {
            Editable: true, Visiable: true, OrgUnitVisible: false, V: $scope.user == undefined?"": $scope.user.ObjectID, PlaceHolder: $scope.LanJson.Approver
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
                "mData": "Priority",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                    var rtnstring = "";
                    //紧急程度
                    if (full.Priority == "0") {
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"margin-left:5px;\"></i>";
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" ></i>";
                    } else if (full.Priority == "1") {
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:green;margin-left:5px;\"></i>";
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#D6DBE5;\"></i>";
                    } else {
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:red;margin-left:5px;\"></i>";
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#F4454E;\"></i>";
                    }
                    return rtnstring;
                }
            });
            columns.push({
                "mData": "InstanceName",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                	return "<a  target='_blank' href='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                	// return "<a ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";

                }
            });
            columns.push({ 
            	"mData": "WorkflowName",
            	"mRender": function (data, type, full) {
            		//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                	return data;
                }
            });
            columns.push({
                "mData": "DisplayName",
                "sClass": "center hide414",
                "mRender": function (data, type, full) {
                    data = data != "" ? data : full.ActivityCode;
                    //update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                    return "<a target='_blank' href='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                    // return "<a ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                }
            });
            columns.push({
                "mData": "ParticipantName",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                    return "<a ng-click=\"showUserInfoModal('" + full.Participant + "');\" new-Bindcompiledhtml>" + data + "</a>";
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

            if ($scope.State == 0) {
                columns.push({ "mData": "ReceiveTime", "sClass": "center hide414" });
            } else {
                columns.push({ "mData": "FinishTime", "sClass": "center hide414" });
            }
            return columns;
        }

        $scope.dtOptions_tabQueryParticipantWorkItem = {
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
            "sAjaxSource": ControllerConfig.WorkItem.QueryParticipantWorkItems,
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
                        if (json.ExtendProperty != null && json.ExtendProperty.Success == false) {
                            // 没有权限，弹出提示
                            if (json.ExtendProperty.Message == "QueryInstanceByProperty_NotEnoughAuth1") {
                                $.notify({ message: $scope.LanJson.QueryInstanceByProperty_NotEnoughAuth1, status: "danger" });
                            } else if (json.ExtendProperty.Message == "QueryInstanceByProperty_NotEnoughAuth2") {
                                $.notify({ message: $scope.LanJson.QueryInstanceByProperty_NotEnoughAuth2, status: "danger" });
                            } else if (json.ExtendProperty.Message == "QueryInstanceByProperty_NotEnoughAuth3") {
                                $.notify({ message: $scope.LanJson.QueryInstanceByProperty_NotEnoughAuth3, status: "danger" });
                            } else if (json.ExtendProperty.Message == "DataFilter_NotEnoughAuth") {
                                $.notify({
                                    message: $scope.LanJson.DataFilter_NotEnoughAuth,
                                    status: "danger"
                                });
                            }
                            return;
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
                    { "name": "instanceName", "value": $scope.InstanceName },
                    { "name": "workflowCode", "value": $scope.WorkflowCode },
                    { "name": "participant", "value": $scope.Participant },
                    { "name": "startTime", "value": $filter("date")($scope.StartTime, "yyyy-MM-dd") },
                    { "name": "endTime", "value": $filter("date")($scope.EndTime, "yyyy-MM-dd") },
                    { "name": "state", "value": $scope.State }
                    );
            },
            "aoColumns": $scope.getColumns(),  // 字段定义           
            // 初始化完成事件,这里需要用到 JQuery ，因为当前表格是 JQuery 的插件
            "initComplete": function (settings, json) {
            	// add by kinson.guo/郭臣  for 打开流程监控页面不显示左侧菜单栏 begin
                // 第三方系统调用URL 为 http://localhost:8099/Portal/index.html#/app/Workflow/QueryInstance?from=portal
                var from = $location.search()['from'];
                if(from == "portal"){
               	 $('.slimScrollDiv')[0].style.display='none';
               	 $('.asideFolded')[0].style.display='none';
               	 $('.hidden-xs')[0].style.display='none';
               	 $('.hidden-sm')[0].style.display='none';
                }
                // add by kinson.guo/郭臣  for 打开流程监控页面不显示左侧菜单栏 end
                
                var filter = $(".searchContainer");
                filter.find("button").unbind("click.DT").bind("click.DT", function () {
                    $scope.WorkflowCode = $("#sheetWorkflow").SheetUIManager().GetValue();
                    $scope.Participant = $("#sheetUser").SheetUIManager().GetValue();
                    $("#tabQueryParticipantWorkItem").dataTable().fnDraw();
                });
                filter.find("select").unbind("change.Load").bind("change.Load", function () {
                    $scope.WorkflowCode = $("#sheetWorkflow").SheetUIManager().GetValue();
                    $scope.Participant = $("#sheetUser").SheetUIManager().GetValue();
                    $("#tabQueryParticipantWorkItem").dataTable().fnDraw();
                });
                $scope.loadScroll();
            },
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