//常用意见
app.controller('MyCommentsController', ['$scope', "$rootScope", "$translate", "$http", "$state", "$filter", "$modal", "$compile", "ControllerConfig", "jq.datables",
function ($scope, $rootScope, $translate, $http, $state, $filter, $modal, $compile, ControllerConfig, jqdatables) {
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.myScroll = null
    });
    $scope.getLanguage = function () {
        $scope.LanJson = {
            sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
            sZeroRecords: $translate.instant("uidataTable.sZeroRecords_NoComments"),
            sInfo: $translate.instant("uidataTable.sInfo"),
            sProcessing: $translate.instant("uidataTable.sProcessing"),

            Confirm_Delete: $translate.instant("WarnOfNotMetCondition.Confirm_Delete"),
            NoSelectComments: $translate.instant("WarnOfNotMetCondition.NoSelectComments")
        }
    };
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
            "mData": "CommentID",
            "mRender": function (data, type, full) {
                // return "<input ng-click=\"checkAllSelect(false)\" type=\"checkbox\" ng-checked=\"\" class=\"CommentItem\" data-id=\"" + data + "\"/>";
                return '<span class="checkbox checkbox-primary checkbox-single" style="padding-left:0;display: flex"><input ng-click="checkAllSelect(false)" type="checkbox" ng-checked="" class="CommentItem" data-id=' + data + ' /><label></label></span>';
            }
        });
        columns.push({
            "mData": "CommentText",
            "mRender": function (data, type, full) {
            	//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
            	data = $scope.htmlEncode(data);
            	return "<label style='white-space:normal;'>" + data + "</label>";
            }
        });
        columns.push({ "mData": "CommentIndex" });
        columns.push({
            "mData": "CommentID",
            "mRender": function (data, type, full) {
                return "<a ng-click=\"btn_addComment('" + data + "')\"><span data-id=\"" + data + "\" translate=\"QueryTableColumn.Edit\"></span></a>";
            }
        });
        return columns;
    }

    //常用意见详情
    $scope.tabMyComments = {
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
        "sAjaxSource": ControllerConfig.PersonalInfo.GetFrequentlyUsedCommentsByUser,
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
        "aoColumns": $scope.getColumns(),
        // 初始化完成事件,这里需要用到 JQuery ，因为当前表格是 JQuery 的插件
        "initComplete": function (settings, json) {
            var filter = $(".searchContainer");
            filter.find("button").unbind("click.DT").bind("click.DT", function () {
                $("#tabMyComments").dataTable().fnDraw();
            });
            $scope.loadScroll();
        },
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
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
        var items = angular.element(document.querySelectorAll(".CommentItem"));
        angular.forEach(items, function (data, index, array) {
            if (data.checked) {
                $scope.selectedAgency.push(data.getAttribute("data-id"));
            }
        });
        if (!$scope.selectedAgency.length) {
            $.notify({ message: $scope.LanJson.NoSelectComments, status: "danger",timeout:2000 });
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
                url: ControllerConfig.PersonalInfo.RemoveFrequentlyUsedComment,
                params: {
                    CommentsID: $scope.selectedAgency
                }
            })
            .success(function (result, header, config, status) {
                $state.go($state.$current.self.name, {}, { reload: true });
            })
            .error(function (data, header, config, status) {

            });
        });
    }

    $scope.btn_addComment = function (data) {
        if (data == undefined) CommentID = "";
        else CommentID = data;
        // 弹出模态框
        var modalInstance = $modal.open({
            templateUrl: 'EditComment.html',    // 指向上面创建的视图
            controller: 'EditCommentController',// 初始化模态范围
            size: "md",
            resolve: {
                params: function () {
                    return {
                        CommentID: CommentID
                    };
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'vendor/jquery/notify/jquery.notify.js'
                    ]);
                }]
            }
        });
    }

}]);

app.controller("EditCommentController", ["$scope", "$http", "$state", "$translate", "$modalInstance", "ControllerConfig", "params", function ($scope, $http, $state, $translate, $modalInstance, ControllerConfig, params) {
    //编辑初始化
    $scope.LanJson = {
        FrequentlyUsedComment_AddFailed: $translate.instant("NotEnoughAuth.FrequentlyUsedComment_AddFailed"),
        NoEnterComments: $translate.instant("WarnOfNotMetCondition.NoEnterComments")
    }
    $scope.SortKeyText = 1;

    if (params.CommentID) {
        $http({
            url: ControllerConfig.PersonalInfo.GetFrequentlyUsedComment,
            params: {
                CommentID: params.CommentID
            }
        })
        .success(function (result, header, config, status) {
            var Comment = result.Rows[0];
            $scope.SortKeyText = Number(Comment.CommentIndex);
            $scope.CommentText = Comment.CommentText;
        })
        .error(function (data, header, config, status) {

        });
    }
    $scope.ok = function () {
    	if($scope.CommentText == null || $scope.CommentText == ""){
    		$.notify({ message: $scope.LanJson.NoEnterComments, status: "danger" });
    		return;
    	}
        //添加、编辑
        $http({
            url: ControllerConfig.PersonalInfo.AddFrequentlyUsedComment,
            method: 'POST',
            data: {
                CommentID: params.CommentID,
                SortKeyText: $scope.SortKeyText,
                CommentText: $scope.CommentText
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
            if (result.Success == false) {
                $.notify({ message: $scope.LanJson.FrequentlyUsedComment_AddFailed, status: "danger" });
            } else {
                $state.go($state.$current.self.name, {}, { reload: true });
            }
            $modalInstance.close();  // 点击保存按钮
        })
        .error(function (data, header, config, status) {
            
        });        
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    }
}])