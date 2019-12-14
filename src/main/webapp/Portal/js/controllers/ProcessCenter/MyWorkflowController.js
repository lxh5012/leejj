app.controller('MyWorkflowController', ['$scope', '$rootScope', '$translate', '$http', '$state', '$compile', '$interval', '$timeout', 'ControllerConfig', 'jq.datables',
    function ($scope, $rootScope, $translate, $http, $state, $compile, $interval, $timeout, ControllerConfig, jqdatables) {
        window.FrequentEvents = {
            'click .like': function (e, value, row, index) {
                SetFrequent(row, index);
            }
        };
        $scope.$on('$viewContentLoaded', function (event) {
            $scope.myScroll = null
        });
        // 获取语言
        $rootScope.$on('$translateChangeEnd', function () {
            $scope.getLanguage();
            $state.go($state.$current.self.name, {}, { reload: true });
        });
        $scope.gobackUnfinish = function() {
            $state.go("app.MyUnfinishedWorkItem");
        }
        $scope.getLanguage = function () {
            $scope.LanJson = {
                bootstrap_table_Loading: $translate.instant("uidataTable.sProcessing"),
                bootstrap_table_NoResult: $translate.instant("uidataTable.sNoResult"),
                search: $translate.instant("uidataTable.InitiateProcessSearch"),

                ProcessName: $translate.instant("QueryTableColumn.ProcessName"),
                Publisheddate: $translate.instant("QueryTableColumn.Publisheddate"),
                Version: $translate.instant("QueryTableColumn.Version"),
                Saveusual: $translate.instant("QueryTableColumn.Saveusual"),
                Initiate: $translate.instant("QueryTableColumn.Initiate"),
                FrequentFlow: $translate.instant("QueryTableColumn.FrequentFlow")
            }
        }
        $scope.getLanguage();
        $scope.loadScroll = function() {
            $scope.myScroll = new IScroll('.fixed-table-body', {
                scrollbars: true,
                bounce: false,
                mouseWheel: true,
                interactiveScrollbars: true,
                shrinkScrollbars: 'scale',
                fadeScrollbars: true
            });
        };
        //是否是移动端
        var IsMobile = false;
        $scope.bootstrapTableOptions = {
            cache: false,
            url: ControllerConfig.Workflow.QueryWorkflowNodes + "?IsMobile=" + IsMobile + "&random=" + new Date().getTime() + "&from=portal_myWorkflow",
            columns: [
                { field: "DisplayName", title: $scope.LanJson.ProcessName, formatter: DisplayFormatter },
                { field: "PublishedTime", title: $scope.LanJson.Publisheddate, formatter: DateFormatter, align: "center" },
                { field: "Version", title: $scope.LanJson.Version, formatter: VersionFormatter, width: 80, align: "center" },
                {
                    field: "Frequent", title: $scope.LanJson.Saveusual, formatter: FrequentFormatter, events: FrequentEvents,
                    width: 100, align: "center"
                },
                { field: "DisplayName", title: $scope.LanJson.Initiate, formatter: OperateFormatter, width: 100, align: "center" }
            ],
            pageNumber : 1, //初始化加载第一页
            pagination : true,//是否分页
            locale: "zh-CN",
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize :20,//单页记录数
            pageList : [ 10, 20, 50, 100 ],//可选择单页记录数
            treegrid: true,
            searchFromServer : true,  // 服务端搜索 add by luwei
            autoExpand : false, // 是否自动展开 add by luwei
            expandFirst : true, // 是否展开第一行 add by luwei
            rowChildrenUrl : ControllerConfig.Workflow.queryWorkflowNodesByParentCode, // 展开时请求的url add by luwei
            rowChildrenParamColumn : [ // 展开时请求需要携带的参数列 add by luwei
            	"Code"
            ],
            striped: false,
            height:"800",
            width:"100%",
            loadingText: $scope.LanJson.bootstrap_table_Loading,
            search: $scope.LanJson.search,
            bootstrap_table_NoResult: $scope.LanJson.bootstrap_table_NoResult,
            rowStyle: rowStyle,
            onAll: function (name, args) {
                $compile($("#MyWorkflowTable"))($scope);
                $compile($("input"))($scope);
                // setTimeout(function(){
                //     $scope.loadScroll();
                // },300);
            },
            searchChanged: function () {
                $compile($("#MyWorkflowTable"))($scope);
                // setTimeout(function(){
                //     $scope.myScroll.refresh();
                // },300);
            },
            onLoadSuccess: function (data) {
                // setTimeout(function(){
                //     $scope.loadScroll();
                // },300);
            }
        }

        function rowStyle(row, index) {
            if (row.IsLeaf == false) {
                return {
                    classes: "whitesmoke"
                }
            } else {
                return {}
            }
        }

        function DisplayFormatter(value, row, index) {
            if (row.IsLeaf == 0) {
                if (value == "FrequentFlow")
                    value = $scope.LanJson.FrequentFlow;
                return '<a class="like"  href="javascript:void(0)" title="'+value+'" >' + value + '</a>';
            } else {
                // return '<a class="like" ui-toggle-class="show"  title="'+value+'" target=".app-aside-right" targeturl="StartInstance.html?WorkflowCode=' + encodeURI(row.Code) + '">' + value + '</a>';;
                return '<a class="like"  title="'+value+'" target="_blank" href="StartInstance.html?WorkflowCode=' + encodeURI(row.Code) + '">' + value + '</a>';
            }
        }

        function DateFormatter(value, row, index) {
            if (row.IsLeaf == 0) return "";
            if (value == null) return "";
            return value;
        }

        function VersionFormatter(value, row, index) {
            if (row.IsLeaf == 0) return "";
            return value;
        }

        function FrequentFormatter(value, row, index) {
            if (row.IsLeaf == 0) return "";
            if (row.Frequent == 1) {
                return '<a class="likelink like" href="javascript:void(0)" ><i class="fa fa-heart"></i></a>';
            }
            else {
                return '<a class="unlikelink like" href="javascript:void(0)" ><i class="fa fa-heart-o"></i></a>';
            }
        }

        var SetFrequent = function (row, index) {
            row.Frequent = row.Frequent == 1 ? false : true;
            $http({
                url: ControllerConfig.Workflow.ChangeFrequence + "?WorkflowCode=" + row.Code + "&IsFrequence=" + row.Frequent + "&random=" + new Date().getTime()
            })
            .success(function (result) {
                $("#MyWorkflowTable").bootstrapTable2('refresh', { silent: true });
            })
        }

        function OperateFormatter(value, row, index) {
            if (row.IsLeaf == 0) return "";
            return '<a class="like link" ui-toggle-class="show" target=".app-aside-right" targeturl="StartInstance.html?WorkflowCode=' + encodeURI(row.Code) + '&PageAction=Close"><span translate="QueryTableColumn.Initiate"></span></a>';
        }
    }]);