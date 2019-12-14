//待阅
app.controller('MyUnReadWorkItemController', ['$scope', '$rootScope', '$translate', '$http', '$state', '$compile', '$interval', 'ControllerConfig', 'jq.datables',
    function ($scope, $rootScope, $translate, $http, $state, $compile, $interval, ControllerConfig, jqdatables) {
        // 获取语言
        $scope.name = $translate.instant("WorkItemController.MyUnReadWorkItem");
        $scope.isFolded = true;
        $scope.$on('$viewContentLoaded', function (event) {
            $scope.myScroll = null
        });
        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });

        $scope.getLanguage = function () {
            $scope.LanJson = {
                search: $translate.instant("uidataTable.InitiateProcessSearch"),
                sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
                sZeroRecords: $translate.instant("uidataTable.sZeroRecords_UnReadWorkItem"),
                sInfo: $translate.instant("uidataTable.sInfo"),
                sProcessing: $translate.instant("uidataTable.sProcessing"),
                NoSelectWorkItem: $translate.instant("WarnOfNotMetCondition.NoSelectWorkItem"),
            }
        }
        $scope.getLanguage();
        
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
        // 获取列定义
        $scope.getColumns = function () {
            var columns = [];
            columns.push({
                "mData": "ObjectID",
                "mRender": function (data, type, full) {
                    return '<span class="checkbox checkbox-primary checkbox-single" style="padding-left:0;display: flex"><input ng-click="checkAllSelect(false)" type="checkbox" ng-checked="" class="WorkItemBatchItem" data-id=\'' + data + '\' /><label></label></span>';
                    // return "<input ng-click=\"checkAllSelect(false)\" type=\"checkbox\" ng-checked=\"\" class=\"WorkItemBatchItem\" data-id=\"" + data + "\"/>";
                }
            });
            columns.push({
                "mData": "InstanceName",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    if(data=="null"||data==null){
                        data = "";
                    }
                	data = $scope.htmlEncode(data);
                    var realData = data ? data: '-' ;
                    // return "<a ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                    return "<a  href='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'  target='_blank'>" + realData + "</a>";
                }
            });
            columns.push({
                "mData": "DisplayName",
                "mRender": function (data, type, full) {
                    //传阅来源  有传阅人显示传阅人，没有显示节点名称
                    var ShowText = "";
                    var CreatorName = full.CirculateCreatorName;
                    if (CreatorName == "") {
                        ShowText = data != "" ? data : full.ActivityCode;
                    } else {
                        ShowText = CreatorName;
                    }
                  //update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                    if(ShowText=="null"||ShowText==null){
                        ShowText="";
                    }
                    ShowText = $scope.htmlEncode(ShowText);
                    return ShowText;
                }
            });
            columns.push({ "mData": "ReceiveTime", "sClass": "center hide414" });
            columns.push({
                "mData": "OriginatorName",
                "sClass": "center hide1024",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                    if(data=="null"||data==null){
                        data = "";
                    }
                	data = $scope.htmlEncode(data);
                    return "<a ng-click=\"showUserInfoModal('" + full.Originator + "');\" new-Bindcompiledhtml>" + data + "</a>";
                }
            });
            columns.push({ 
            	"mData": "OriginatorOUName", 
            	"sClass": "center hide1024",
            	"mRender": function (data, type, full) {
            		//update by xl@Future 2018.8.10
                    if(data=="null"||data==null){
                        data = "";
                    }
                	data = $scope.htmlEncode(data);
                	return data;
            	}
            });
            return columns;
        };
        // TODO:下面的需要获取语言
        $scope.dtOptions = {
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
            "sAjaxSource": ControllerConfig.WorkItem.GetUnReadWorkItems,
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
            // "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
            "sDom": '<"top"f>rt<"row"ipl>',
            "sPaginationType": "full_numbers",
            "fnServerParams": function (aoData) {  // 增加自定义查询条件
                aoData.push(
                    { "name": "keyWord", "value": $scope.searchKey })
            },
            "aoColumns": $scope.getColumns(),  // 字段定义
            // 初始化完成事件,这里需要用到 JQuery ，因为当前表格是 JQuery 的插件
            "initComplete": function (settings, json) {
                var filter = $(".searchContainer");
                filter.find(".aufontAll").unbind("click.DT").bind("click.DT", function () {
                    $("#tabUnReadWorkitem").dataTable().fnDraw();
                });
                $scope.loadScroll();
                // filter.find("button").unbind("click.DT").bind("click.DT", function () {
                //     $("#tabUnReadWorkitem").dataTable().fnDraw();
                // });
            },
            //创建行，未绘画到屏幕上时调用
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                //将添加的angular事件添加到作用域中
                $compile(nRow)($scope);
                setTimeout(function(){
                    $scope.myScroll.refresh();
                },300);
            },
            //datables被draw完后调用
            "fnDrawCallback": function () {
                jqdatables.trcss();
                if($scope.checkAll){//暂时使用此方法解决点击搜索或者下一页按钮时，全选按钮勾勾无法取消的问题
                	$("thead input[type='checkbox']").click();
                }
            }
        };

        $scope.searchKeyChange = function () {
            if ($scope.searchKey == "") {
            	$scope.checkAll = false;
                $("#tabUnReadWorkitem").dataTable().fnDraw();
            }
        };

        $scope.showCommentModal = function () {  //打开模态 
            $scope.selectedCirculateItems = [];
            // 获取所有选中的行
            var items = angular.element(document.querySelectorAll(".WorkItemBatchItem"));
            angular.forEach(items, function (data, index, array) {
                if (data.checked) {
                    $scope.selectedCirculateItems.push(data.getAttribute("data-id"));
                }
            });

            // 没有选择任何记录，弹出提示
            if (!$scope.selectedCirculateItems.length) {
                $.notify({ message: $scope.LanJson.NoSelectWorkItem, status: "danger" });
                return;
            }

            //执行批量已阅
            $http({
                url: ControllerConfig.CirculateItem.ReadCirculateItemsByBatch,
                params: {
                    CirculateItemIDs: $scope.selectedCirculateItems
                }
            })
            .success(function (data) {
                $state.go($state.$current.self.name, {}, { reload: true });
            })
            .error()
        }
    }]);