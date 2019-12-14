app.directive('myPage', function () {
    return {
        restrict: 'EAC',
        replace: true,
        transclude: true,
        scope: {
            dataVariety: "=variety"
        },
        template: [
		        '<tr class="bg-light text-dark">',
			        '<td ng-show="showMe" style="width:200px"><span class="glyphicon-plus"></span>',
		        	'<a class="clearTotal" ng-click="toggle($event,dataVariety);" href="javascript:void(0)">{{dataVariety.workitemName}}</a></td>',
		        	/*'<td ng-show="!showMe" style="width:200px">',
		        	'{{dataVariety.workitemName}}</td>',*/
			        '<td><span>{{dataVariety.workflowtype}}</span></td>',
			        '<td>{{dataVariety.totalNum}}</td>',
			        '<td>{{dataVariety.finishNum}}</td>',
			        '<td>{{dataVariety.unfinishNum}}</td>',
			        '<td>{{dataVariety.cancelNum}}</td>',
			        '<td>{{dataVariety.averageTime}}</td>',
			        '<td>{{dataVariety.exceptionNum}}</td>',
			        '<td>{{dataVariety.errorRate}}</td>',
			        /*'<td><font>{{dataVariety.workItemRate}}</font></td>',*/
			        '<td><div class="progress-bar" role="progressbar"  aria-valuemin="0" aria-valuemax="100" style="width: {{dataVariety.workItemRate}};  background-color:rgba(18, 153, 196, 1)"><span style="color:rgb(0,0,0)">{{dataVariety.workItemRate}}</span></div></td>',
		        '</tr>'
        ].join(""),
        link: function (scope, element, attrs) {
        	if(scope.dataVariety.workitemName == "总计"){
        		 scope.showMe = true;
                 $(".clearTotal").prev().removeClass().text(scope.dataVariety.workitemName);
        		 $(".clearTotal").remove();
        	}else{
        		scope.showMe = true;
        	}
           
            scope.$parent.addExpander(scope);
            scope.toggle = function toggle($event,dataVariety) {
            	scope.$parent.qryWorkItem($event,dataVariety);
                
            }
        }
    };
});




//查询流程实例
app.controller('processQryController', ['$location','$scope', "$rootScope", "$translate", "$http", "$timeout","$interval", "$state", "$filter", "$compile", "ControllerConfig", "datecalculation", "jq.datables",
    function ($location, $scope, $rootScope, $translate, $http, $timeout,$interval, $state, $filter, $compile, ControllerConfig, datecalculation, jqdatables) { 
	

    var expanders = []; //记录所有菜单
    $scope.addExpander = function (expander) {
        expanders.push(expander);
    };


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
			 	url: "/Portal/PerformanceStcs/qryWorkItemVariety",
		        data: condition,
		        type: "Post",
		        success: function(result){
		        	resp = result[0].data;
		        	resultCode = result[0].resultCode;
		        	msg = result[0].msg;
		        }
		 });
		//设置流程占比
    	if(resultCode == 0 && resp.length>0){
    		for(var i=1;i<resp.length;i++){
    			//流程占比
    			resp[i].workItemRate = GetPercent(resp[i].totalNum,resp[0].totalNum);
    			//审批时长格式化
    			if(resp[i].averageTime == "秒"){
    				resp[i].averageTime ="0";
    			}else{
    				//转化为 时分秒形式
    				resp[i].averageTime = formatSeconds(resp[i].averageTime.substr(0,resp[i].averageTime.length-1));
    			}
    		}
    		//总计
    		resp[0].workItemRate = "100%";
    		resp[0].averageTime = formatSeconds(resp[0].averageTime);
			$scope.data = resp;
		}else{
			$scope.data="";
			$.notify({message:"未查到数据"},{status:"danger"});
		}
		
	}
	
	//统计流程
    $scope.qryWorkItem = function qryWorkItem($event,dataVariety) {
    	function qry($event){
    		var items;
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
    				items="";
    				$scope.data="";
    				return;
    			}
    		}
    		
    		var inputStr={
    				allOrPart:$("#allOrPart").val(),
    				workFlowCode:workFlowCodeArr.join(","),
    				StartTime:$("#StartTime").val(),
    				EndTime:$("#EndTime").val(),
    				FinishStartTime:$("#FinishStartTime").val(),
    				FinishEndTime:$("#FinishEndTime").val(),
    				
    				workitemName:$($event.target).parent().next().text()
    		}
    		 $.ajax({
    		        async: false,
    		        data: inputStr,
    		        url: "/Portal/PerformanceStcs/qryWorkItemByName",
    		        type: "Post",
    		        success: function(result){
    		        	items = result[0].data;
    		        	resultCode = result[0].resultCode;
    		        	msg = result[0].msg;
    		        }
    		 });
    		if(resultCode == 0){
    			for(var i=0;i<items.length;i++){
    	   			//审批时长格式化
        			if(items[i].averageTime == "秒"){
        				items[i].averageTime ="0";
        			}else{
        				//转化为 时分秒形式
        				items[i].averageTime = formatSeconds(items[i].averageTime.substr(0,items[i].averageTime.length-1));
        			}
    			}
 
    			
    		}else{
    			items="";
    			$.notify({message:"未查到数据"},{status:"danger"});
    		}
    		return items;
    	}
    	
    	//1.调查询子类流程方法
    	//console.log(dataVariety.workitemName);
    	//2.页面逻辑
        $("#details").toggleClass("ng-hide");
        //获取增加元素节点的位置
        var ele = $($event.target).parent().parent("tr");
        //获得流程分类的名字
        var workItemNameType = $($event.target).parent().next().text();
        //加号、减号切换
        if($($event.target).prev("span").hasClass("glyphicon-plus")){
        	$($event.target).prev("span").removeClass("glyphicon-plus").addClass("glyphicon-minus");
        	insertHtml(ele,true,$event);
        }else if($($event.target).prev("span").hasClass("glyphicon-minus")){
        	$($event.target).prev("span").removeClass("glyphicon-minus").addClass("glyphicon-plus");
        	insertHtml(ele,false,$event);
        }
        
        //获取当前点击元素的属性,parent为父元素，parent().parent("tr")为爷爷元素
       //console.log($($event.target).parent().parent("tr").attr("indexNum"));
       //获取 点击事件的tr元素
       function insertHtml(element,flag,$event){
    	   
           if(flag){//展开子流程数据
        	   //1.如果没有渲染到表单，则查数据库
        	   if(element.next("tr").length>0 && !element.next("tr").hasClass(element.attr("indexnum"))){
        		   var itemsArr = qry($event);
	        	   var html="";
		    	   $.each(itemsArr,function(){
		    		   //计算流程占比
		    		   //大类的发起总量console.log(element.find("td").eq(2).text());
		    		   //总计的发起总量
		    		   //$("tr[indexnum=variety_0]").find("td").eq(2).text();
		    		   
		    		   this.workItemRate = GetPercent(this.totalNum,$("tr[indexnum=variety_0]").find("td").eq(3).text());
		    		   
		    					html += '<tr  class="' +element.attr("indexnum") +'">';
		    					html += '<td style="width:200px;"><span style="width:18px;display:inline-block;position:relative;"></span><span>'+ this.workitemName+'</span></td>';
		    					html += '<td><span>'+ this.workflowtype+'</span></td>';
		    					html += '<td>'+ this.totalNum+'</td>';
		    					html += '<td>'+ this.finishNum+'</td>';
		    					html += '<td>'+ this.unfinishNum+'</td>';
		    					html += '<td>'+ this.cancelNum+'</td>';
		    					html += '<td>'+ this.averageTime+'</td>';
		    					html += '<td>'+ this.exceptionNum+'</td>';
		    					html += '<td>'+ this.errorRate+'</td>';
		    					//html += '<td><font>'+ this.workItemRate+'</font></td>';
		    					html += '<td><div class="progress-bar" role="progressbar"  aria-valuemin="0" aria-valuemax="100" style="width:'+ this.workItemRate +';  background-color:rgba(18, 153, 196, 1)"><font color="black">'+ this.workItemRate+'</font></div></td>';
		    					html += '</tr>';
		    			
		    		});
		    	   element.after(html);
		    	   
        	   }else if(element.next("tr").length>0 && element.next("tr").hasClass(element.attr("indexnum"))){
        		   //如果渲染到表单则显示
        		   $("." + element.attr("indexnum")).show();
        		   $("." + element.attr("indexnum")).removeClass("noExl");
        	   }
           }else{ //合并
        		   $("." + element.attr("indexnum")).hide();
        		   $("." + element.attr("indexnum")).addClass("noExl");
           }
    	   
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
    		//e.data.FocusInput.apply(e.data);
    		//清空流程模板所选数据
    		$("#sheetWorkflow").find(".select2-search-choice").each(function(){
    			$(this).find("a").click();
    		})
    		
    		//隐藏流程模板
    		$("#sheetWorkflow").appendTo(".forHide");
    		//$("#sheetWorkflow").attr("ui-options","");
    		//$("#sheetWorkflow").find("*").hide();
    	}
    	if($("#allOrPart").val() == 2){
    		//显示流程模板
    		$(".forHide").after($("#sheetWorkflow"));
    		//$("#sheetWorkflow").attr("ui-options","WorkflowOptions");
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

    
}]);

