/*
H3 表单引用脚本
*/
// NTKO 附件对象
var NTKO_AttachInfo = new Array(); // 保存服务器上的控件列表信息
var NTKO_AttachObj = new Array();  // NTKO 控件对象

var _Sheet_GlobalString = {
    "Sheet_Loading": "数据加载中……",
    "Sheet_Wait": "系统正在处理{0}操作,请稍候。。。",
    "Sheet_Search": "搜索：",
    "Sheet_Close": "关闭",
    "Sheet_More": "更多..."
};
//// 获取本地化字符串
//$.get(_PORTALROOT_GLOBAL + "/Ajax/GlobalHandler.ashx", { "Code": "Sheet_Loading,Sheet_Wait,Sheet_Search,Sheet_Close,Sheet_More" }, function (data) {
//    if (data.IsSuccess) {
//        _Sheet_GlobalString = data.TextObj;
//    }
//}, "json");

// 页面初始化设置信息
var pageInfo =
{
    LockImage: '<%=ResolveUrl("~/WFRes/images/WaitProcess.gif")%>'   // 锁屏时显示图片
};

var Sheet = function (container) {
    this.autoHiddenEmptyRow = false;  // 是否隐藏空值行
    this.AttrDatafield = "data-datafield";
    this.init(container);
}

Sheet.prototype = {
    // 函数初始化事件
    init: function (container) {
        this.container = container;

        this.Computation = new Sheet.Computation(this);
        this.Validate = new Sheet.Validate(this);
        this.Display = new Sheet.Display(this);

        this.autoFinishWorkItem();
        if (this.autoHiddenEmptyRow) {
            this.hiddenEmptyRow();
        }
    },
    // 计算结果值
    getResultValue: function (express) {
        // console.log(express, 'express')
        if (express.indexOf("return") == -1) {
        	//update by luwei : 日期计算啊啊啊啊啊啊啊啊啊啊啊
        	try {
        		if(express) {
        			//只处理日期的减法, 其他的我就不管了-_-
        			var array = express.split(")-(");
        			if(array.length != 2) {
        				//add by luwei : 移除数字开始的0，防止进行八进制计算
                      /*   express = express.replace(/\d+/g, function(word){
                             function _removeZero(_str) {
                                 if(_str && _str.indexOf("0") == 0) {
                                     return _removeZero(_str.substring(1));
                                 } else {
                                     return _str;
                                 }
                             }
                             if(word == 0) {
                                 return 0;
                             }
                             return _removeZero(word);
                         });*/
        				return eval(express);
        			} else {
        				var index1 = array[0].lastIndexOf("(");
        				var index2 = array[1].lastIndexOf(")");
        				if(index1 == -1 || index2 == -1) {
        					return eval(express);
        				}
        				var timeStr1 = array[0].substring(index1 + 1);
        				var timeStr2 = array[1].substring(0, index2);
        				if(timeStr1.length != timeStr2.length) {
        					return eval(express);
        				}
        				
        				var reg1 = /^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])(\s+(20|21|22|23|[0-1]\d):[0-5]\d(:[0-5]\d)*)*)|(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d)$/;
						var regExp1 = new RegExp(reg1);
						if(!regExp1.test(timeStr1) || !regExp1.test(timeStr2)){
						　　	return eval(express);
						}
						
						var reg2 = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
						var regExp2 = new RegExp(reg2);
						if(regExp2.test(timeStr1) && regExp2.test(timeStr2)){
						　　	timeStr1 = "1999-01-01 " + timeStr1;
						　　	timeStr2 = "1999-01-01 " + timeStr2;
						}
						
        				var time1 = new Date(timeStr1).getTime();
        				var time2 = new Date(timeStr2).getTime();
        				var days = Number((time1 - time2) / (1000 * 60 * 60 * 24.0));
        				if((days + "").indexOf(".") > -1) {					
	        				days = days.toFixed(1);
        				}

        				if(days < 0) {
        					return "";
        				}
        				
        				var prefix = "";
        				if(index1 != 0) {
        					prefix = express.substring(0, index1);
        				}
        				
        				var suffix = "";
        				if(index2 != array[1].length - 1) {
        					suffix = express.substring(array[0].length + index2 + 4);
        				}
        				
        				var days2 = prefix + days + suffix;
        				
        				if(days == days2) {
        					return days + "$Date";
        				} else {        					
	        				return eval(days2) + "$Date";
        				}
        			}
        		}
        	} catch (err) {
        		console.log(err);
        	}
        } else {
            return new Function(express).call(this);
        }
    },
    // 获取URL参数的值，相当于 Request.QueryString
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    },
    // 判断浏览器是否IE 
    isIE: function () {
        return (!!window.ActiveXObject || "ActiveXObject" in window);
    },
    // 打印预览
    preview: function () {
        document.write("<object id=\"WebBrowser\" classid=\"CLSID:8856F961-340A-11D0-A96B-00C04FD705A2\" height=\"0\" width=\"0\"></object>");
        document.all.WebBrowser.ExecWB(7, 1);
    },
    // 自动完成任务
    autoFinishWorkItem: function () {
        var parmAction = this.getQueryString("ParmAction");
        if (parmAction == "Submit") {
            var submits = $("#divTopBars a:contains('提交')");
            if (submits.length == 0)
                submits = $("#divTopBars a:contains('通过')");
            if (submits.length == 0)
                submits = $("#divTopBars a:contains('已阅')");
            if (submits.length > 0) {
                var submitId = submits[0].id;
                __doPostBack(submitId, "");
            }
        }
        else if (parmAction == "Return") {
            var returns = $("#divTopBars a:contains('驳回')");
            if (returns.length == 0)
                returns = $("#divTopBars a:contains('退回')");
            if (returns.length > 0) {
                var returnId = returns[0].id;
                __doPostBack(returnId, "");
            }
        }
    },
    // 隐藏不需要看到的空行
    hiddenEmptyRow: function () {
        $("#tbTable tr,#tbBasicInfo tr").each(function (index) {
            if (index > 2) {
                if ($(this).find("table[id^='tbComment']").length > 0) {
                    if ($.trim($(this).find("table[id^='tbComment']").text()) == ""
                        && $(this).find("select").length == 0
                        && $(this).find("td").length == 2
                    ) {
                        $(this).hide();
                    }
                }
            }
        });
    },
    // 解除锁屏幕操作
    unLockScreen: function () {
        $("#divLock").remove();
        $("#frameLock").remove();
    },
    // 锁定屏幕操作
    lockScreen: function (msg) {
        var sWidth, sHeight, top;
        sWidth = $(document).width();
        sHeight = $(document).height();
        top = $(document).scrollTop() + $(window).height() / 2;
        $("<iframe></iframe>")
                .attr("id", "frameLock")
                .css("position", "absolute")
                .css("top", 0)
                .css("left", 0)
                .css("width", sWidth)
                .css("height", sHeight)
                .css("zIndex", 9999)
                .css("backgroundColor", "Transparent")
                .css("frameborder", 0)
                .css("filter", "Alpha(Opacity=0)")
                .css("allowtransparency", true)
                .appendTo("body");
        $("<div></div>")
                .html("<table id=\"spanLockMessage\" border=\"0\" style=\"width:" + sWidth + "px;font-size:26px;font-weight:bold;position:absolute;top:" + top + "px\"><tr><td align=\"center\"><img src=\"" + pageInfo.LockImage + "\"></td></tr></table>")
                .attr("id", "divLock")
                .css("position", "absolute")
                .css("top", 0)
                .css("left", 0)
                .css("width", sWidth)
                .css("height", sHeight)
                .css("zIndex", 10000)
                .css("backgroundColor", "#CCCCCC")
                .css("filter", "progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=55")
                .css("opacity", "0.6")
                .css("allowtransparency", true)
                .appendTo("body");
        $(window).scroll(function () {
            $("#spanLockMessage").css("top", $(document).scrollTop() + $(window).height() / 2);
        });
    },
    // FUN:获取控件的值，兼容文本框、下拉框、单选框三种类型的控件
    getControlValue: function (id) {
        var ctl = document.getElementById(id);
        if (ctl != null && ctl.type != null) {
            return $(ctl).val();
        }
        if ($("input[name='" + id + "']").length > 0) {
            return $("input[name='" + id + "']:checked").val();
        }
        return "";
    },
    // 设置控件为只读状态
    setControlReadOnly: function (itemName) {
        var ctl = this.findControlByDataField(window, itemName);
        if (ctl.length > 0) {
            ctl.keydown(function (e) {
                return false;
            });
        }
    },
    // 查找离源控件最近的DataField控件
    findControlByDataField: function (startObj, dataField) {
        var ctl = startObj.find("select[" + this.AttrDatafield + "='" + dataField + "'],div[" + this.AttrDatafield + "='" + dataField + "'],input[" + this.AttrDatafield + "='" + dataField + "'],span[" + this.AttrDatafield + "='" + dataField + "'],table[" + this.AttrDatafield + "='" + dataField + "'],textarea[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            for (var i = 0; i < ctl.length; i++) {
                var c = $(ctl[i]);
                if (c.is("span")) {
                    if (c.find("input").length > 0) return c.find("input");
                    if (c.attr("data-type")
                            && c.attr("data-type") == "SheetLabel"
                            && c.attr("data-bindtype")
                            && c.attr("data-bindtype") == "OnlyData") {
                        return c;
                    }
                    continue;
                }
                if (c.is("div")) {
                    return c.find("input");
                }
                else {
                    return c;
                }
            }
        }
        startObj = startObj.parent();
        if (startObj.is("body")) return null;
        return this.findControlByDataField(startObj, dataField);
    },
    // 获取离源控件最近的DataField控件的值
    getDataFieldValue: function (startObj, dataField) {
        var ctl = startObj.find("input[" + this.AttrDatafield + "='" + dataField + "'],select[" + this.AttrDatafield + "='" + dataField + "'],textarea[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
        	//add by luwei : 当字段不可写时，值时存储在下面的span中
        	var next = ctl.next();
        	if (next.length > 0 && next.is("label") && next.attr("for") == ctl.attr("id")) {
        		if (ctl.is("select")) {
        			var selectedText = next.text();
        			var value = "";
        			ctl.find("option").each(function(){ 
        				if ($(this).text() == selectedText) {
        					value = $(this).val();
        					return false;
        				}
        			})
        			return value;
        		} else if (ctl.is("input")) {
        			return next.find("span").eq(0).text();
        		}
        	}else if(next.length > 0 && next.is("label")){
        		if (ctl.is("input") && next.find("span").length == 0) {
        			return next.text();
        		}
        	}
            return ctl.val();
        }
        ctl = startObj.find("span[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            if (ctl.find("input").length > 0) {
                return ctl.find("input").is(":checked");
            }

            if (ctl.find("input").length > 0) return ctl.find("input").is(":checked");
            if (ctl.attr("data-type")
                    && ctl.attr("data-type") == "SheetLabel"
                    && ctl.attr("data-bindtype")
                    && ctl.attr("data-bindtype") == "OnlyData") {
                return ctl.html();
            }
        }
        ctl = startObj.find("table[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            var input = ctl.find("input");
            for (var i = 0; i < input.length; i++) {
                if (input[i].checked) return input[i].value;
            }
            return "";
        }
        ctl = startObj.find("div[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            var input = ctl.find("input");
            for (var i = 0; i < input.length; i++) {
                if (input[i].checked) return input[i].value;
            }
            return "";
        }

        startObj = startObj.parent();
        if (startObj.is("body") || startObj.is("html")) return null;
        return this.getDataFieldValue(startObj, dataField);
    },
    // 获取离源控件最近的DataField控件的值
    getDataFieldControlValue: function (startObj, dataField) {
        var ctl = startObj.find("input[" + this.AttrDatafield + "='" + dataField + "'],textarea[" + this.AttrDatafield + "='" + dataField + "'],select[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            return ctl.val();
        }
        ctl = startObj.find("span[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            return ctl.html();
        }
        startObj = startObj.parent();
        if (startObj.is("body") || startObj.is("html")) return null;
        return this.getDataFieldValue(startObj, dataField);
    },
    // 获取离源控件最近的DataField控件的值
    setDataFieldControlValue: function (startObj, dataField, value) {
        var ctl = startObj.find("input[" + this.AttrDatafield + "='" + dataField + "'],textarea[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            ctl.val(value);
            return;
        }
        ctl = startObj.find("span[" + this.AttrDatafield + "='" + dataField + "']");
        if (ctl.length > 0) {
            ctl.html(value);
            return;
        }
        startObj = startObj.parent();
        if (startObj.is("body") || startObj.is("html")) return;
        return this.setDataFieldControlValue(startObj, dataField, value);
    },
    // 执行业务服务方法，返回的是单个值
    // serviceCode:业务服务Code
    // methodName:方法名称
    // options:传递的输入参数,格式:{数据项:业务属性,数据项:业务属性}
    // [startCtrl],开始查找的控件名称
    // [propertyName],返回对象中的属性名称
    executeService: function (serviceCode, methodName, options, startCtrl, propertyName) {
        var result;
        var returnValue = this.executeBizService(serviceCode, methodName, options, startCtrl);
        if (propertyName) {
            result = returnValue[propertyName]
        }
        else {
            for (var o in returnValue) {
                result = returnValue[o];
                break;
            }
        }
        return result;
    },
    // 执行业务服务方法，返回的是实体对象JOSN
    // serviceCode:业务服务Code
    // methodName:方法名称
    // options:传递的输入参数,格式:{数据项:业务属性,数据项:业务属性}
    // [startCtrl],开始查找的控件名称
    // [propertyName],返回对象中的属性名称
    executeBizService: function (serviceCode, methodName, options, startCtrl) {
        var param = { cmd: "ExecuteServiceMethod", "ServiceCode": serviceCode, "MethodName": methodName };
        if (!startCtrl) startCtrl = $("body");
        if (options) {
            for (var item in options) {
                param[item] = this.getDataFieldControlValue(startCtrl, options[item]);
                if (!param[item])
                    param[item] = options[item];
            }
            // 兼容旧版本而存在
            for (var item in options) {
                if (!param[item]) {
                    param[options[item]] = this.getDataFieldControlValue(startCtrl, item);
                }
            }
        }
        var returnValue;
        $.ajax({
            type: "POST",
            async: false,
            url: _PORTALROOT_GLOBAL + "/AjaxServices/executeServiceMethod",
            data: param,
            dataType: "json",
            success: function (data) {
                returnValue = data;
            },
            error: function (e) {
                var msg = e.toString();
                alert(msg);
            }
        });
        return returnValue;
    }
    // End prototype
}

// 打印模式
var winPrint = function () {
    window.print();
}

// 检测浏览器是否是 IPad 类型
function isBrowseIPad() {
    var ua = navigator.userAgent.toLowerCase();
    var s;
    s = ua.match(/iPad/i);

    if (s == "ipad") {
        return true;
    }
    else {
        return false;
    }
}