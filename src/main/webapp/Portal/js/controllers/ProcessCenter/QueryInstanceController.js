//查询流程实例
app.controller('QueryInstanceController', ['$location','$scope', "$rootScope", "$translate", "$http", "$timeout","$interval", "$state", "$filter", "$compile", "ControllerConfig", "datecalculation", "jq.datables",
    function ($location, $scope, $rootScope, $translate, $http, $timeout,$interval, $state, $filter, $compile, ControllerConfig, datecalculation, jqdatables) {
		$scope.$on('$viewContentLoaded', function (event) {
        		$scope.init();
                $scope.myScroll = null
        });

        $scope.init = function () {
            $scope.UnfinishedText = $translate.instant("InstanceController.Unfinished");
            $scope.FinishedText = $translate.instant("InstanceController.Finished");
            $scope.CanceledText = $translate.instant("InstanceController.Canceled");
            $scope.UnspecifiedText = $translate.instant("InstanceController.Unspecified");

            $scope.Originator = $scope.user == undefined?"": $scope.user.ObjectID;
            $scope.InstanceState = 0;

        }

        $scope.getLanguage = function () {
            $scope.LanJson = {
                search: $translate.instant("uidataTable.search"),
                ProcessName: $translate.instant("QueryTableColumn.ProcessName"),
                WorkFlow: $translate.instant("QueryTableColumn.WorkFlow"),
                Originator: $translate.instant("QueryTableColumn.Originator"),
                StartTime: $translate.instant("QueryTableColumn.StartTime"),
                EndTime: $translate.instant("QueryTableColumn.EndTime"),
                sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
                sZeroRecords: $translate.instant("uidataTable.sZeroRecords_NoRecords"),
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
                QueryInstanceByProperty_NotEnoughAuth3: $translate.instant("NotEnoughAuth.QueryInstanceByProperty_NotEnoughAuth3")
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
            ResignVisible:true,
            Editable: true,
            Visiable: true,
            OrgUnitVisible: true,
            V: $scope.user == undefined ? "": $scope.user.ObjectID,
            PlaceHolder: $scope.LanJson.Originator,
            IsMultiple : true
        };
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
                	return '<a class="like" target="_blank" href="InstanceSheets.html?InstanceId=' + full.InstanceID + '">' + data + '</a>';
                	// return '<a class="like" ui-toggle-class="show" target=".app-aside-right" targeturl="InstanceSheets.html?InstanceId=' + full.InstanceID + '">' + data + '</a>';
                }
            });
            columns.push({ 
            	"mData": "WorkflowName",
            	"sClass": "center",
            	"mRender": function (data, type, full) {
            		//update by xl@Future 2018.8.10
                	data = $scope.htmlEncode(data);
                	return data;
            	}
            });
            columns.push({
                "mData": "OriginatorName",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                	data = $scope.htmlEncode(data);
                    return "<a ng-click=\"showUserInfoModal('" + full.Originator + "');\" new-Bindcompiledhtml>" + data + "</a>";
                }
            });
            columns.push({ "mData": "CreatedTime", "sClass": "center hide414" });
            //审批环节
            columns.push({
                "mData": "ApproverLink",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                    var link = data.split(",");
                    var text = "";
                    if (link.length == 1) {
                        text = data;
                    } else {
                        text = link[0] + "...";
                    }
                  //update by xl@Future 2018.8.10
                	data = $scope.htmlEncode(data);
                	text = $scope.htmlEncode(text);
                    return "<span id=\"tooltip\" data-toggle=\"tooltip\" data-placement=\"left\" class='ApproverLink' title=\"" + data + "\">" + text + "</span>";
                }
            });
            //审批人
            columns.push({
                "mData": "Approver",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                    var link = data.split(",");
                    var text = "";
                    if (full.Exceptional == true) {
                        text = "出现异常，请与管理员联系！";
                    }
                    else if (link.length == 1) {
                        text = data;
                    }
                    else {
                        text = link[0] + "...";
                    }
                  //update by xl@Future 2018.8.10
                	data = $scope.htmlEncode(data);
                	text = $scope.htmlEncode(text);
                    return "<span id=\"tooltip\" data-toggle=\"tooltip\" data-placement=\"left\" class='Approver InstanceExceptionInfo' title=\"" + data + "\">" + text + "</span>";
                }
            });
            //结束时间
            columns.push({
                "mData": "FinishedTime",
                "sClass": "center hide414",
                "mRender": function (data, type, full) {
                    return "<span id=\"FinishedTime\">" + data + "</span>";
                }
            });
            //取消时间
            columns.push({
                "mData": "FinishedTime",
                "sClass": "center hide414",
                "mRender": function (data, type, full) {
                    return "<span id=\"CancelTime\">" + data + "</span>";
                }
            });
            return columns;
        }

        $scope.tabQueryInstance = {
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
            "sAjaxSource": ControllerConfig.Instance.QueryInstance,
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
                            }
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
                //ie9不兼容placeholder属性
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
                    { "name": "searchKey", "value": $scope.SearchKey },
                    { "name": "workflowCode", "value": $scope.WorkflowCode },
                    { "name": "unitID", "value": $scope.Originator },
                    { "name": "startTime", "value": $filter("date")($scope.StartTime, "yyyy-MM-dd") },
                    { "name": "endTime", "value": $filter("date")($scope.EndTime, "yyyy-MM-dd") },
                    { "name": "instaceState", "value": $scope.InstanceState }
                    );
            },
            "aoColumns": $scope.getColumns(), // 字段定义
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
                    $scope.Originator = $("#sheetUser").SheetUIManager().GetValue();
                    $("#tabQueryInstance").dataTable().fnDraw();
                });
                filter.find("select").unbind("change.Load").bind("change.Load", function () {
                    $scope.WorkflowCode = $("#sheetWorkflow").SheetUIManager().GetValue();
                    $scope.Originator = $("#sheetUser").SheetUIManager().GetValue();
                    $("#tabQueryInstance").dataTable().fnDraw();
                });
                $scope.loadScroll();
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if (aData.InstanceState == "2" && aData.Approver == "" && aData.ApproverLink == "") {
                    $(nRow).addClass("InstanceException");
                }
                $compile(nRow)($scope);
                setTimeout(function(){
                    $scope.myScroll.refresh();
                },300);
            },
            //datables被draw完后调用
            "fnDrawCallback": function () {
                $("[data-toggle='tooltip']").tooltip();
                jqdatables.trcss();
                if ($scope.InstanceState == 0) {
                    //进行中
                    this.find("td #FinishedTime").parent().hide();
                    this.find("td #CancelTime").parent().hide();
                }
                if ($scope.InstanceState == 1) {
                    //已完成
                    this.find("td #CancelTime").parent().hide();
                    this.find("td .ApproverLink").parent().hide();
                    this.find("td .Approver").parent().hide();
                    this.find("th[id=FinishedTime]").css("width", "110px");
                }
                if ($scope.InstanceState == 2) {
                    this.find("td #FinishedTime").parent().hide();
                    this.find("td .ApproverLink").parent().hide();
                    this.find("td .Approver").parent().hide();
                    this.find("th[id=CancelTime]").css("width", "110px");
                }
                setTimeout(function(){
                    $scope.myScroll.refresh();
                },300);
            }
        }
    }]);