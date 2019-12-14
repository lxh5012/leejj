//查询流程实例
app.controller('processTimeQryController', ['$location','$scope', "$rootScope", "$translate", "$http", "$timeout","$interval", "$state", "$filter", "$compile", "ControllerConfig", "datecalculation", "jq.datables",
    function ($location, $scope, $rootScope, $translate, $http, $timeout,$interval, $state, $filter, $compile, ControllerConfig, datecalculation, jqdatables) { 
	

	//统计大类
	$scope.qryWorkItemVariety=function(){
		var resp="";
		var resultCode=99;
		var msg = "";
		
		var workFlowCodeArr = new Array();
		$("#sheetWorkflow").find(".select2-search-choice").each(function(){
			workFlowCodeArr.push($(this).attr("data-code"));
		})
		
		//选择部分流程，必须选择流程模板
		if($("#allOrPart").val() == 2){
			if(workFlowCodeArr.length==0){
				$.notify({message:"选择部分时，流程模板不能为空！"},{status:"danger"});
				$scope.data="";
				return;
			}
		}
		
		var condition={
				allOrPart:$("#allOrPart").val(),
				workFlowCode:workFlowCodeArr.join(","),
				StartTime:$("#StartTime").val(),
				EndTime:$("#EndTime").val(),
				FinishStartTime:$("#FinishStartTime").val(),
				FinishEndTime:$("#FinishEndTime").val()
		}
		
		 $.ajax({
			 	async: false,
			 	url: "/Portal/ActivityTimeStatistics/qryWorkItemFinished",
		        data: condition,
		        type: "Post",
		        success: function(result){
		        	resp = result[0].data;
		        	resultCode = result[0].resultCode;
		        	msg = result[0].msg;
		        }
		 });
		//设置时间
    	if(resultCode == 0){

			var totalTm = 0;
			var percent="";
            for (var p in resp) {
                totalTm = 0;
                for(var i in resp[p]){
                    //计算流程平均时间
                    totalTm +=parseFloat(resp[p][i].usedtime);
				}
                //设置平均时间
                totalTm = totalTm.toFixed(2);
                setJson(resp[p], "totalTm", totalTm);

				for (var i in resp[p]){
                    //计算时间占比
                    percent = GetPercent(resp[p][i].usedtime, totalTm);
                    //设置时间占比
                    setJson(resp[p][i], "percent", percent);

                    //时间格式化
                    resp[p][i].usedtime = formatSeconds(resp[p][i].usedtime);
                }
                //时间格式化
                resp[p].totalTm = formatSeconds(resp[p].totalTm);
            }
            console.log(resp);
            $scope.data = resp;
		}else{
			$scope.data="";
			$.notify({message:"未查到数据"},{status:"danger"});
		}
		
	}
	

    $scope.exportByCase = function(){
    	$("#tabInfoList").table2excel({
            exclude  : ".noExl", //过滤位置的 css 类名
            filename : "流程绩效-" + new Date().getTime() + ".xls"//文件名称
        });
    }
	
    $scope.WorkflowOptions = {
            Editable: true,
            Visiable: true,
            Mode: "WorkflowTemplate",
            IsMultiple: true,
            PlaceHolder: "流程模板",
            IsSearch:true
        }
    $scope.allOrPartChange=function(){
    	if($("#allOrPart").val() == 1){//全部流程
    		//清空流程模板所选数据
    		$("#sheetWorkflow").find(".select2-search-choice").each(function(){
    			$(this).find("a").click();
    		})
    		
    		//隐藏流程模板
    		$("#sheetWorkflow").appendTo(".forHide");
    	}
    	if($("#allOrPart").val() == 2){
    		//显示流程模板
    		$(".forHide").after($("#sheetWorkflow"));
    	}
    }
    
  ///计算两个整数的百分比值 
    function GetPercent(num, total) { 
    	num = parseFloat(num); 
    	total = parseFloat(total); 
    if (isNaN(num) || isNaN(total)) { 
    	return "-"; 
    } 
    	return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%"); 
    } 

    //时间格式化
    function formatSeconds(value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if(theTime > 60) {
            theTime1 = parseInt(theTime/60);
            theTime = parseInt(theTime%60);
                if(theTime1 > 60) {
                theTime2 = parseInt(theTime1/60);
                theTime1 = parseInt(theTime1%60);
                }
        }
            var result = ""+parseInt(theTime)+"秒";
            if(theTime1 > 0) {
            result = ""+parseInt(theTime1)+"分"+result;
            }
            if(theTime2 > 0) {
            result = ""+parseInt(theTime2)+"小时"+result;
            }
        return result;
    }

    //添加或者修改json数据
    function setJson(jsonStr, name, value) {
        if (!jsonStr) jsonStr = "{}";
        jsonStr[name] = value;
        return JSON.stringify(jsonStr);
    }

        ///计算两个整数的百分比值
    function GetPercent(num, total) {
        num = parseFloat(num);
        total = parseFloat(total);
        if (isNaN(num) || isNaN(total)) {
            return "-";
        }
        return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%");
    }
}]);




