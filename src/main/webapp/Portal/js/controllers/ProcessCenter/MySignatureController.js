//签章设置  
app.controller('MySignatureController', ['$scope', "$rootScope", "$translate", "$http", "$state", "$compile", "$modal", "ControllerConfig", "jq.datables",
function ($scope, $rootScope, $translate, $http, $state, $compile, $modal, ControllerConfig, jqdatables) {
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.myScroll = null
    });
    $scope.getLanguage = function () {
        $scope.LanJson = {
            sLengthMenu: $translate.instant("uidataTable.sLengthMenu"),
            sZeroRecords: $translate.instant("uidataTable.sZeroRecords_NoSignature"),
            sInfo: $translate.instant("uidataTable.sInfo"),
            sProcessing: $translate.instant("uidataTable.sProcessing"),
            Confirm_Delete: $translate.instant("WarnOfNotMetCondition.Confirm_Delete"),
            NoSelectSignatures: $translate.instant("WarnOfNotMetCondition.NoSelectSignatures")
        }
    };
    $scope.getLanguage();
    // 获取语言
    $rootScope.$on('$translateChangeEnd', function () {
        $scope.getLanguage();
        $state.go($state.$current.self.name, {}, { reload: true });
    });
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
            "mData": "ObjectID",
            "mRender": function (data, type, full) {
                // return "<input type=\"checkbox\" class=\"SignatureItem\" ng-checked=\"checkAll\" data-id=\"" + data + "\">";
                return '<span class="checkbox checkbox-primary checkbox-single" style="padding-left:0;display: flex"><input type="checkbox" ng-checked="checkAll" class="SignatureItem" data-id=' + data + ' /><label></label></span>';
            }
        });
        columns.push({ 
        	"mData": "Name",
        	"mRender": function (data, type, full) {
        		//update by xl@Future 2018.8.10
                //data = data ? data.replace(/\</g,"&lt;"):data;
        		data = $scope.htmlEncode(data);
        		return "<span title=\"" + data + "\">" + data + "</span>";
        	}
        });
        columns.push({
            "mData": "Icon",
            "mRender": function (data, type, full) {
                return "<span><img src='" + data + "' style='width:46px;height:46px'></img></span>";
            }
        });
        columns.push({
            "mData": "SortKey",
            "mRender": function (data, type, full) {
                return "<label>" + data + "</label>";
            }
        });
        columns.push({
            "mData": "IsDefault",
            "mRender": function (data, type, full) {
                var id = full.ObjectID;
                var isDefault = "";
                if (data) {
                    isDefault = "IsDefault";
                }
                // return "<input type=\"checkbox\" class=\"" + isDefault + "\" data-id=\"" + id + "\" ng-click=\"SetDefault('" + full.ObjectID + "')\">";
                return "<span class='checkbox checkbox-primary checkbox-single' style='padding-left:0;display: flex'><input type=\"checkbox\" class=\"" + isDefault + "\" data-id=\"" + id + "\" ng-click=\"SetDefault('" + full.ObjectID + "')\"><label></label></span>";
            }
        });
        return columns;
    }
    $scope.tabMySignature = {
        "bProcessing": true,
        "bServerSide": true,    // 是否读取服务器分页
        "paging": false,         // 是否启用分页
        "bPaginate": false,      // 分页按钮
        "bLengthChange": true, // 每页显示多少数据
        "bFilter": false,        // 是否显示搜索栏  
        "searchDelay": 1000,    // 延迟搜索
        // "iDisplayLength": 20,   // 每页显示行数
        "bSort": false,         // 排序  
        "singleSelect": true,
        "bInfo": false,          // Showing 1 to 10 of 23 entries 总记录数没也显示多少等信息
        "pagingType": "full_numbers",  // 设置分页样式，这个是默认的值
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
        "sAjaxSource": ControllerConfig.PersonalInfo.GetSignaureList,
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
        "fnServerParams": function (aoData) {  // 增加自定义查询条件
            aoData.push(
                { "name": "userId", "value": $scope.user.ObjectID }
                );
        },
        "aoColumns": $scope.getColumns(), // 字段定义
        "initComplete": function (settings, json) {
            var filter = $(".searchContainer");
            filter.find("button").unbind("click.DT").bind("click.DT", function () {
                $("#tabMySignature").dataTable().fnDraw();
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
            var items = angular.element(document.querySelectorAll(".IsDefault"));
            items.attr("checked", "checked")
        }
    }

    $scope.SetDefault = function (SignatureID) {
        var DefaultItem = angular.element(document.querySelectorAll(".IsDefault"));
        var OldSignatureID = "";
        angular.forEach(DefaultItem, function (data, index, array) {
            OldSignatureID = data.getAttribute("data-id");
        });
        var IsDedault = true;
        if (SignatureID == OldSignatureID) {
            IsDedault = false;
        }
        $http({
            url: ControllerConfig.PersonalInfo.SetDefaultSignature,
            params: {
                signaureId: SignatureID,
                isDefault: IsDedault
            }
        })
        .success(function (result, header, config, status) {
            $state.go($state.$current.self.name, {}, { reload: true });
        })
        .error(function (result, header, config, status) {
            $state.go($state.$current.self.name, {}, { reload: true });
        });
    }

    $scope.btn_removeSignature = function () {
        $scope.selectedSignature = "";
        var items = angular.element(document.querySelectorAll(".SignatureItem"));
        angular.forEach(items, function (data, index, array) {
            if (data.checked) {
                $scope.selectedSignature = $scope.selectedSignature + ";" + data.getAttribute("data-id");
            }
        });
        if (!$scope.selectedSignature.length) {
            $.notify({ message: $scope.LanJson.NoSelectSignatures, status: "danger" });
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
                url: ControllerConfig.PersonalInfo.RemoveSignature,
                params: {
                    SignaureIds: $scope.selectedSignature
                }
            })
            .success(function (result, header, config, status) {
                $state.go($state.$current.self.name, {}, { reload: true });
            })
            .error(function (result, header, config, status) {
                $state.go($state.$current.self.name, {}, { reload: true });
            });
        });
    }

    $scope.btn_addEditSignature = function () {
        // 弹出模态框
        var modalInstance = $modal.open({
            templateUrl: 'EditSignature.html',    // 指向上面创建的视图
            controller: 'EditSignatureController',// 初始化模态范围
            size: "md",
            resolve: {
                params: function () {
                    return {
                    };
                },
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'WFRes/_Scripts/jquery/ajaxfileupload.js',
                         'js/factory/file-reader.js'
                    ]);
                }]
            }
        });
    }
}]);

app.controller("EditSignatureController", ["$scope", "$http", "$state", "$translate", "$modalInstance", "$timeout", "fileReader", "ControllerConfig", function ($scope, $http, $state, $translate, $modalInstance, $timeout, FileReader, ControllerConfig) {
    $scope.LanJson = {
        EditSignatureDetail_AddFailed: $translate.instant("NotEnoughAuth.EditSignatureDetail_AddFailed")
    }
    
    $scope.htmlEncode=function(v){
    	return $("<div/>").text(v).html();
    }
    $scope.ok = function (SignatureImage) {
    	//update by xl@Future 2018.8.10
        var SignatureData = {
            Name: $scope.Name = $scope.htmlEncode($scope.Name),
            Description: $scope.Description = $scope.htmlEncode($scope.Description),
            SortKeyText: $scope.SortKey
        }
        $scope.saveData(SignatureData);
        if ($scope.imgover || $scope.NoFile || $scope.ErrorFile) {
        	//FIXME luwei  bug here : 不上传文件提交，然后上传文件，文件会被清空
            $timeout(function () {
                $scope.imgover = false;
                $scope.NoFile = false;
                $scope.ErrorFile = false;
                //add by luwei : 清空
                document.getElementById("pic").value='';
                document.getElementById("preview").src='';
            }, 1000 * 3);
        }
    };

    $scope.saveData = function (SignatureData) {
        if ($scope.CheckFile($("#pic")[0]) && !$scope.imgover) {
            $.ajaxFileUpload({
                url: ControllerConfig.PersonalInfo.AddSignature,
                fileElementId: "pic",
                secureuri: false,
                type: "post",
                data: SignatureData,
                dataType: 'json',
                async: false,
                success: function (result) {
                    if (result.Success) {
                        $modalInstance.close();  // 点击保存按钮
                        $state.go($state.$current.self.name, {}, { reload: true });
                    }
                    else if (result.Message == "EditSignatureDetail_ImgOver") {
                        $scope.imgover = true;
                    }
                    //update by zhangj
                    else if (!result.Success && null != result.Message) {//no auth
                    	$modalInstance.close();
                    	$.notify({ message: $translate.instant(result.Message), status: "danger" });
                    }
                    else {
                        $modalInstance.close();  // 点击保存按钮
                        $.notify({ message: $scope.LanJson.EditSignatureDetail_AddFailed, status: "danger" });
                    }
                },
                error: function (result) {
                }
            });
        }
    }
    //检查图片
    $scope.CheckFile = function (obj) {
        var fileTypes = new Array("gif", "jpg", "png", "jpeg", 'bmp');
        if (obj.value == "") {
            $scope.NoFile = true;
            return false;
        }
        else {
            var fileContentType = obj.value.match(/^(.*)(\.)(.{1,8})$/)[3];//取文件类型的正则法则
            var isExists = false;
            for (var i in fileTypes) {
                if (fileContentType.toLocaleLowerCase() == fileTypes[i]) {
                    isExists = true;
                    return true;
                }
            }
            if (!isExists) {
                $scope.ErrorFile = true;
                return false;
            }
        }
        return false;
    }
    $scope.getFile = function () {
        FileReader.readAsDataUrl($scope.file, $scope)
        .then(function (result) {
            $scope.imageSrc = result;
        });
    }
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel'); // 退出
    };
}]);

