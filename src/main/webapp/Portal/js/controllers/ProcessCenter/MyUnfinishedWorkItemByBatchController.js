//待办-批量模式
app.controller('MyUnfinishedWorkItemByBatchController', ['$scope', "$rootScope", "$translate", "$state",
    "$http", "$interval", "$modal", "$compile", "ControllerConfig", "jq.datables",
    function ($scope, $rootScope, $translate, $state, $http, $interval, $modal, $compile, ControllerConfig, jqdatables) {
        $scope.checkAll = false;

        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });
        $scope.getLanguage = function () {
            $scope.LanJson = {
                search: $translate.instant("uidataTable.UninishedWorkitemSearch"),
                sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
                sZeroRecords: $translate.instant("uidataTable.sZeroRecords"),
                sInfo: $translate.instant("uidataTable.sInfo"),
                sProcessing: $translate.instant("uidataTable.sProcessing"),
                WorkFlow: $translate.instant("QueryTableColumn.WorkFlow"),
                NoSelectWorkItem: $translate.instant("WarnOfNotMetCondition.NoSelectWorkItem"),
                Approval: $translate.instant("WorkItemBatchModal.Approval"),
                DisApproval: $translate.instant("WorkItemBatchModal.DisApproval")
            }
        }
        $scope.getLanguage();

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

        $scope.WorkflowOptions = {
            Editable: true, Visiable: true, Mode: "WorkflowTemplate", IsMultiple: false,
            PlaceHolder: $scope.LanJson.WorkFlow
        }

        // 获取列定义
        $scope.getColumns = function () {
            var columns = [];
            columns.push(
            {
                "mData": "ObjectID",
                "mRender": function (data, type, full) {
                    //return "<input type=\"checkbox\" ng-checked=\"checkAll\" class=\"WorkItemBatchItem\" data-id=\"" + data + "\"/>";
                    return "<input ng-click=\"checkAllSelect(false)\" type=\"checkbox\" class=\"WorkItemBatchItem\" ng-checked=\"\" data-id=\"" + data + "\"/>";
                }
            });
            columns.push({
                "mData": "Priority",
                "sClass": "hide1024",
                "mRender": function (data, type, full) {
                    var rtnstring = "";
                    //紧急程度
                    if (full.Priority == "0") {
                        // rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" ></i>";
                        rtnstring = "<i class=\"glyphicon glyphicon-bell\" ></i>";
                    } else if (full.Priority == "1") {
                        rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:green;\"></i>";
                        // rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#D6DBE5;\"></i>";
                    } else {
                        rtnstring = "<i class=\"glyphicon glyphicon-bell\" style=\"color:red;\"></i>";
                        // rtnstring = "<i class=\"icon aufontAll h-icon-all-clock-circle-o\" style=\"color:#F4454E;\"></i>";
                    }
                    //是否催办
                    if (full.Urged == false) {
                        rtnstring = rtnstring + "<a> <i class=\"glyphicon glyphicon-bullhorn\"></i></a>";
                        // rtnstring = rtnstring + "<a> <i class=\"icon aufontAll h-icon-all-bells-o\" style=\"color:#D6DBE5;\"></i></a>";
                    } else {
                        rtnstring = rtnstring + "<a ng-click=\"showUrgeWorkItemInfoModal('" + full.ObjectID + "')\"> <i class=\"glyphicon glyphicon-bullhorn\" style=\"color:orangered;\"></i></a>";
                        // rtnstring = rtnstring + "<a ng-click=\"showUrgeWorkItemInfoModal('" + full.ObjectID + "')\"> <i class=\"icon aufontAll h-icon-all-bells-o\" style=\"color:#FFA940;\"></i></a>";
                    }
                    return rtnstring;
                }
            })

            columns.push({
                "mData": "InstanceName",
                "mRender": function (data, type, full) {
                    //打开待办表单
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                	// //console.log(data, type, full);
                    // return "<a ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                    return "<a title='"+data+"' ui-toggle-class='show' target='.app-aside-right' targeturl='WorkItemSheets.html?WorkItemID=" + full.ObjectID + "'>" + data + "</a>";
                }
            });
            columns.push({
                "mData": "DisplayName",
                "mRender": function (data, type, full) {
                    //打开流程状态
                    data = data != "" ? data : full.ActivityCode;
                  //update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                    return "<td><a href='index.html#/InstanceDetail/" + full.InstanceId + "/" + full.ObjectID + "/" + "/' target='_blank'>" + data + "</a></td>";
                }
            });
            columns.push({
                "mData": "ReceiveTime",
                "sClass": "hide414",
            });
            columns.push({
                "mData": "OriginatorName",
                "sClass": "hide414",
                "mRender": function (data, type, full) {
                	//update by xl@Future 2018.8.10
                    //data = data ? data.replace(/\</g,"&lt;"):data;
                	data = $scope.htmlEncode(data);
                    return "<a ng-click=\"showUserInfoModal('" + full.Originator + "');\" new-Bindcompiledhtml>" + data + "</a>";
                }
            });
            columns.push({ 
            	"mData": "OriginatorOUName", 
            	"sClass": "hide1024", 
            	"mRender": function (data, type, full) {
            		//update by xl@Future 2018.8.10
                	data = $scope.htmlEncode(data);
                	return data;
            	}
            });
            return columns;
        };

        $scope.options_UnfinishWorkItemByBatch = {
            "bProcessing": true,
            "bServerSide": true,    // 是否读取服务器分页
            "paging": true,         // 是否启用分页
            "bPaginate": true,      // 分页按钮  
            "bLengthChange": false, // 每页显示多少数据
            "bFilter": false,        // 是否显示搜索栏  
            "searchDelay": 1000,    // 延迟搜索
            "iDisplayLength": 10,   // 每页显示行数  
            "bSort": false,         // 排序  
            "columnDefs": [{
                "orderable": false,
                "className": "select-checkbox",
                "targets": 0
            }],
            "order": [[2, "asc"]],
            "bInfo": true,
            "pagingType": "full_numbers",
            "language": {           // 语言设置
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "<i class=\"icon-emoticon-smile\"></i>" + $translate.instant("uidataTable.sZeroRecords"),
                "sInfo": $translate.instant("uidataTable.sInfo"),
                "infoEmpty": "",
                "sProcessing": "正在努力加载...",
                "search": "搜索：",
                "paginate": {
                    "first": "<<",
                    "last": ">>",
                    "previous": "<",
                    "next": ">"
                }
            },
            "sAjaxSource": ControllerConfig.WorkItem.MyUnfinishedWorkItemByBatch,
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
            "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
            "sPaginationType": "full_numbers",
            "fnServerParams": function (aoData) {  // 增加自定义查询条件
                aoData.push({ "name": "keyWord", "value": $scope.searchKey });
            },
            "aoColumns": $scope.getColumns(),
            "initComplete": function (settings, json) {
                var filter = angular.element(document.querySelectorAll(".searchContainer"));
                filter.find("button").off("click.DT").on("click.DT", function () {
                    angular.element(document.querySelectorAll("#" + settings.sInstance)).dataTable().fnDraw()
                });
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                $compile(nRow)($scope);
            },
            "fnDrawCallback": function () {
                jqdatables.trcss();
            }
        }

        $scope.searchKeyChange = function () {
            if ($scope.searchKey == "") {
                $("#tabUnfinishWorkItemByBatch").dataTable().fnDraw();
            }
        }

        $scope.showCommentModal = function (approval) {  //打开模态 
            $scope.selectedWorkItems = [];
            //$scope.actionText = approval ? "提交" : "拒绝";
            //$translate.instant("WorkItemBatchModal.PleaseInputComment"),

            $scope.actionText = approval ? $scope.LanJson.Approval : $scope.LanJson.DisApproval;

            // 获取所有选中的行
            var items = angular.element(document.querySelectorAll(".WorkItemBatchItem"));
            angular.forEach(items, function (data, index, array) {
                if (data.checked) {
                    $scope.selectedWorkItems.push(data.getAttribute("data-id"));
                }
            });

            // 没有选择任何记录，弹出提示
            if (!$scope.selectedWorkItems.length) {
                $.notify({ message: $scope.LanJson.NoSelectWorkItem, status: "danger" });
                return;
            }

            // 弹出模态框
            var modalInstance = $modal.open({
                templateUrl: 'WorkItemBatchModal.html',    // 指向上面创建的视图
                controller: 'WorkItemBatchModalController',// 初始化模态范围
                // size: size,
                resolve: {
                    params: function () {
                        return {
                            selectedCount: $scope.selectedWorkItems.length,
                            actionText: $scope.actionText
                        };
                    }
                }
            });

            // 弹窗点击确定的回调事件
            modalInstance.result.then(function (commentText) {
                $http({
                    url: ControllerConfig.WorkItem.HandleWorkItemByBatch,
                    method: 'post',
                    data: {
                        Approval: approval,
                        WorkItemIDs: $scope.selectedWorkItems,
                        CommentText: commentText
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function(obj) {
                        var str = [];
                        for (var s in obj) {
                            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
                        }
                        return str.join("&");
                    }
                })
                .success(function (result, header, config, status) {
                    $state.go($state.$current.self.name, {}, { reload: true });
                })
                .error(function (result, header, config, status) {
                });
            });
        }
    }]);

// 弹窗的 Controller
app.controller('WorkItemBatchModalController', ['$rootScope', '$scope', '$http', '$state', '$translate', '$modalInstance', 'ControllerConfig', 'params',
    function ($rootScope, $scope, $http, $state, $translate, $modalInstance, ControllerConfig, params) {
        $scope.commentText = "";
        $scope.selectedCount = params.selectedCount;
        $scope.actionText = params.actionText;

        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });

        $scope.getLanguage = function () {
            $scope.LanJson = {
                PleaseInputComment: $translate.instant("WorkItemBatchModal.PleaseInputComment"),
            }
        }
        $scope.getLanguage();

        $http({
            url: ControllerConfig.PersonalInfo.GetFrequentlyUsedCommentsByUser
        })
        .success(function (data) {
            $scope.MyComment = data.Rows;
        })
        .error()
        $scope.SetCommentValue = function () {
            $scope.commentText = $scope.Comment;
        }

        $scope.ok = function () {
            $modalInstance.close($scope.commentText);  // 点击确定按钮
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel'); // 退出
        }
    }]);