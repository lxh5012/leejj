//待办
app.controller('MyUnfinishedWorkItemController', ['$scope', '$rootScope', "$translate", "$http", "$state", "$compile", "$interval", "ControllerConfig", "jq.datables",
    function ($scope, $rootScope, $translate, $http, $state, $compile, $interval, ControllerConfig, jqdatables) {
        var PortalRoot = window.localStorage.getItem("H3.PortalRoot")?window.localStorage.getItem("H3.PortalRoot"):"/Portal";
        $scope.searchKey = "";
        //进入视图触发
        $scope.$on('$viewContentLoaded', function (event) {
            $scope.searchKey = "";
            $scope.myScroll = null
        });
        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });

        $scope.getLanguage = function () {
            $scope.LanJson = {
                search: $translate.instant("uidataTable.UninishedWorkitemSearch"),
                sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
                sZeroRecords: $translate.instant("uidataTable.sZeroRecords_UnfinishedWorkItem"),
                sInfo: $translate.instant("uidataTable.sInfo"),
                sProcessing: $translate.instant("uidataTable.sProcessing")
            }
        };
        $scope.getLanguage();
        $scope.loadScroll = function() {
            function loaded () {
                $scope.myScroll = new IScroll('.dataTables_scrollBody', {
                    scrollbars: true,
                    bounce: false,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: true
                });
            }
            loaded()
        };
        // 获取列定义
        $scope.getColumns = function () {
            var columns = [];
            columns.push({
                "mData": "Priority",
                "sClass": "hide1024",
                "mRender": function (data, type, full, a) {
                    var rtnstring = "";
                    //紧急程度
                    if (full.Priority == "0") {
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" ></i>";
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" ></i>";
                    } else if (full.Priority == "1") {
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:green;\"></i>";
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#D6DBE5;\"></i>";
                    } else {
                        // rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:red;\"></i>";
                        rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#F4454E;\"></i>";
                    }
                    //是否催办
                    if (full.Urged == false) {
                        // rtnstring = rtnstring + "<a> <i class=\"glyphicon glyphicon-bullhorn\"></i></a>";
                        rtnstring = rtnstring + "<a> <i class=\"icon aufontAll h-icon-all-bells-o\" style=\"color:#D6DBE5;\"></i></a>";
                    } else {
                        // rtnstring = rtnstring + "<a ng-click=\"showUrgeWorkItemInfoModal('" + full.ObjectID + "')\"> <i class=\"glyphicon glyphicon-bullhorn\" style=\"color:orangered;\"></i></a>";
                        rtnstring = rtnstring + "<a ng-click=\"showUrgeWorkItemInfoModal('" + full.ObjectID + "')\"> <i class=\"icon aufontAll h-icon-all-bells-o\" style=\"color:#FFA940;\"></i></a>";
                    }
                    return rtnstring;
                }
            });
            columns.push({
                "mData": "InstanceName",
                "mRender": function (data, type, full) {
                    // //console.log(data, type, full)
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                    // if(data==="null"||data==null){
                    if(!data){
                        data="";
                    }
                	// data = $scope.htmlEncode(filterXSS(data));
                    // //console.log(data, type, full);
                	data = $scope.htmlEncode(data);
                    return "<td><a title='" + data + "' href='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "' target='_blank'>" + data + "</a></td>";
                    // return "<td><a title='"+data+"' ui-toggle-class='show' target='.app-aside-right' target='_blank' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a></td>";
                }
            });
            columns.push({
                "mData": "DisplayName",
                "mRender": function (data, type, full) {
                    //打开流程状态
                    data = data != "" ? data : full.ActivityCode;
                    //update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                    if(data=="null"||data==null){
                        data="";
                    }
                	data = $scope.htmlEncode(data);
                    return "<td><a  href='index.html#/InstanceDetail/" + full.InstanceId + "/" + full.ObjectID + "/" + "/' target='_blank'>" + data + "</a></td>";
                }
            });
            columns.push({ "mData": "ReceiveTime", "sClass": "center hide414" });
            columns.push({
                "mData": "OriginatorName",
                "sClass": "hide414",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                    if(data=="null"||data==null){
                        data="";
                    }
                	data = $scope.htmlEncode(data);
                    return "<a ng-click=\"showUserInfoModal('" + full.Originator + "')\">" + data + "</a>";
                }
            });
            columns.push({ 
            	"mData": "OriginatorOUName", 
            	"sClass": "hide1024",
            	"mRender": function (data, type, full) {
            		//update by xl@Future 2018.8.10
                    if(data=="null"||data==null){
                        data="";
                    }
                	data = $scope.htmlEncode(data);
                	return data;
            	}
            });
            return columns;
        };

        $scope.options = function () {
            var options = {
                "bProcessing": true,
                "fixedHeader": true,
                "bServerSide": true,    // 是否读取服务器分页
                "paging": true,         // 是否启用分页
                "bPaginate": true,      // 分页按钮
                "bFilter": false,        // 是否显示搜索栏  
                "searchDelay": 1000,    // 延迟搜索
                "iDisplayLength": 20,   // 每页显示行数
                "responsive": true,
                "bSort": false,         // 排序
                "singleSelect": true,
                "bInfo": true,          // Showing 1 to 10 of 23 entries 总记录数没也显示多少等信息  
                "pagingType": "full_numbers",  // 设置分页样式，这个是默认的值
                "bLengthChange": true, // 每页显示多少数据
                "stripeClasses": [],
                "aLengthMenu": [[10, 20, 50, 100], [10, 20, 50, 100]],//设置每页显示数据条数的下拉选项
                "language": {           // 语言设置
                    "sProcessing": '<div class="loading-box"><i class="icon-loading"></i><p>'+$scope.LanJson.sProcessing+'</p></div> ',
                    "sLengthMenu": $scope.LanJson.sLengthMenu,
                    // "sZeroRecords": "<i class=\"icon-emoticon-smile\"></i>" + $scope.LanJson.sZeroRecords,
                    "sZeroRecords": "<div class='no-data'><p class='no-data-img'></p><p>"+$scope.LanJson.sZeroRecords+"</p></div>",
                    "sInfo": $scope.LanJson.sInfo,
                    "infoEmpty": "",
                    // "sProcessing": $scope.LanJson.sProcessing,
                    "paginate": {
                        "first": "<<",
                        "last": ">>",
                        "previous": "<",
                        "next": ">"
                    }
                },
                "sAjaxSource": ControllerConfig.WorkItem.GetUnfinishWorkItems,
                "fnServerData": function (sSource, aDataSet, fnCallback) {
                    $.ajax({
                        "dataType": 'json',
                        "type": 'POST',
                        "url": sSource,
                        "data": aDataSet,
                        "success": function (data) {
                         // console.log(data, 'data')
                            if (data.ExceptionCode == 1 && data.Success == false) {
                                data.Rows = [];
                                data.sEcho = 1;
                                data.Total = 0;
                                data.iTotalDisplayRecords = 0;
                                data.iTotalRecords = 0;
                                $state.go("platform.login");
                            }
                            fnCallback(data);
                        }
                    });
                },
                "sAjaxDataProp": 'Rows',
                "sScrollY": "500px",
                "bScrollCollapse": true,
                "iScrollLoadGap": 50,
                // "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                // "sDom": '<"top"f>rt<"bottom"lpi>',
                "sDom": '<"top"f>rt<"row"ipl>',
                // "sDom": '<"top"f>rt<"bottom"ipl>',
                "sPaginationType": "full_numbers",
                "fnServerParams": function (aoData) {  // 增加自定义查询条件
                    aoData.push({ "name": "keyWord", "value": $scope.searchKey });
                },
                "aoColumns": $scope.getColumns(), // 字段定义
                // 初始化完成事件,这里需要用到 JQuery ，因为当前表格是 JQuery 的插件
                "initComplete": function (settings, json) {
                    var filter = $(".searchContainer");
                    filter.find(".aufontAll").unbind("click.DT").bind("click.DT", function () {
                        $("#tabUnfinishWorkitem").dataTable().fnDraw();
                    });
                    $scope.loadScroll();
                    // $(".dataTables_scrollBody").niceScroll({cursorborder:"",cursorcolor:"rgba(0,0,0,.45)",boxzoom:false}); // First scrollable DIV
                },
                //创建行，未绘画到屏幕上时调用
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    setTimeout(function(){
                        $scope.myScroll.refresh();
                    },300);
                    // $('td', nRow).css('background-color', '#fff');
                    //将添加的angular事件添加到作用域中
                    if (aData.ItemSummary != "") {
                        $(nRow).attr("title", aData.ItemSummary);
                        //angular-tooltip暂不可用
                        //$(nRow).attr("tooltips", "");
                        //$(nRow).attr("tooltip-template", aData.ItemSummary);
                        //$(nRow).attr("tooltip-side", "bottom");
                    }
                },
                //datables被draw完后调用
                "fnDrawCallback": function () {
                    jqdatables.trcss();
                    $compile($("#tabUnfinishWorkitem"))($scope);
                    //重新注册
                    $interval.cancel($scope.interval);
                    $scope.registerInterval();
                }
            }
            return options;
        }
        $scope.initWorkFlow = function () {
            $state.go("app.MyWorkflow");
        }
        $scope.searchKeyChange = function () {
            if ($scope.searchKey == "")
                $("#tabUnfinishWorkitem").dataTable().fnDraw();
        }

        $scope.registerInterval = function () {
            $scope.interval = $interval(function () {
            	//update by luwei : 第一页才刷新
            	var pageNum = $(".dataTables_paginate").find(".active").find("a").text();
            	if (pageNum != 1) {
            		return;
            	}
                $("#tabUnfinishWorkitem").dataTable().fnDraw();
            }, 90 * 1000);
        }

        $scope.$on("$destroy", function () {
            $interval.cancel($scope.interval);
        })
    }]);