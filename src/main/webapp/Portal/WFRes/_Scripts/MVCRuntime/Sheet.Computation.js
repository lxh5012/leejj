/*
表单计算规则解析函数
支持格式：2,表达式
表达式为：{A}*{B}-({C}+{D})/SUM({数据项})，函数支持:SUM,AVG,COUNT,MAX,MIN
Authine 2013-9
*/

var _Sheet_Computation_GlobalString = { "Sheet_Computation_Msg0": "计算规则设置错误：" };
////获取本地化字符串
//$.get(_PORTALROOT_GLOBAL + "/Ajax/GlobalHandler.ashx", { "Code": "Sheet_Computation_Msg0" }, function (data) {
//    if (data.IsSuccess) {
//        _Sheet_Computation_GlobalString = data.TextObj;
//    }
//}, "json");

// 计算函数定义
var CompuationFun = [
    {
        Name: "",
        Accept: function (express) {
            return express.indexOf("(") == -1;
        },
        Compuator: function (obj, ctl, express) {
            var v = obj.sheet.getDataFieldValue(ctl, express);
            if (!v) return 0;
            return v.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
        },
        Field: function (express) {
            return express;
        },
        IsFunc: true
    },
    {
        Name: "SUM",
        Accept: function (express) {
            return express.toLocaleLowerCase().indexOf("sum(") == 0;
        },
        Compuator: function (obj, ctl, express, round) {
            var field = this.Field(express);
            express = this.Express(express);
            var val = 0;
            $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']").each(function (obj, express, round) {
                var thisValue = 0;
                if (express) {
                    thisValue = obj.executeCompute(this.id, round, express);
                }
                else {
                    if (this.tagName.toLocaleLowerCase() == "input" || this.tagName.toLocaleLowerCase() == "select")
                        thisValue = this.value;
                    else
                        thisValue = this.innerText;
                }
                if ($(this).attr("data-formatrule")) thisValue = thisValue.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (thisValue && !isNaN(thisValue)) {
                    val += parseFloat(thisValue);
                }
            }, [obj, express, round]);
            return val;
        },
        Field: function (express) {
            var field = express.substring(express.indexOf("{") + 1);
            field = field.substring(0, field.indexOf("}"));
            return field;
        },
        Express: function (express) {
            if (express.indexOf(",") == -1) return "";
            var str = express.substring(express.indexOf(",") + 1);
            return str.substring(0, str.length - 1);
        },
        IsFunc: true
    },
    {
        Name: "AVG",
        Accept: function (express) {
            return express.toLocaleLowerCase().indexOf("avg(") == 0;
        },
        Compuator: function (obj, ctl, express, round) {
            var field = this.Field(express);
            express = this.Express(express);
            var val = 0;
            var ctrls = $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']");
            $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']").each(function (obj, express, round) {
                var thisValue = 0;
                if (express) {
                    thisValue = obj.executeCompute(this.id, round, express);
                }
                else {
                    if (this.tagName.toLocaleLowerCase() == "input" || this.tagName.toLocaleLowerCase() == "select")
                        thisValue = this.value;
                    else
                        thisValue = this.innerText;
                }
                if ($(this).attr("data-formatrule")) thisValue = thisValue.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (thisValue && !isNaN(thisValue)) {
                    val += parseFloat(thisValue);
                }
            }, [obj, express, round]);
            return parseFloat(val / ctrls.length);
        },
        Field: function (express) {
            var field = express.substring(express.indexOf("{") + 1);
            field = field.substring(0, field.indexOf("}"));
            return field;
        },
        Express: function (express) {
            if (express.indexOf(",") == -1) return "";
            var str = express.substring(express.indexOf(",") + 1);
            return str.substring(0, str.length - 1);
        },
        IsFunc: true
    },
    {
        Name: "COUNT",
        Accept: function (express) {
            return express.toLocaleLowerCase().indexOf("count(") == 0;
        },
        Compuator: function (obj, ctl, express, round) {
            var field = this.Field(express);
            var val = 0;
            var ctrls = $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']");
            return ctrls.length;
        },
        Field: function (express) {
            var field = express.substring(express.indexOf("{") + 1);
            field = field.substring(0, field.indexOf("}"));
            return field;
        },
        Express: function (express) {
            if (express.indexOf(",") == -1) return "";
            var str = express.substring(express.indexOf(",") + 1);
            return str.substring(0, str.length - 1);
        },
        IsFunc: true
    },
    {
        Name: "MAX",
        Accept: function (express) {
            return express.toLocaleLowerCase().indexOf("max(") == 0;
        },
        Compuator: function (obj, ctl, express, round) {
            var field = this.Field(express);
            express = this.Express(express);
            var val = 0;
            $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']").each(function (obj, express, round) {
                var thisValue = 0;
                if (express) {
                    thisValue = obj.executeCompute(this.id, round, express);
                }
                else {
                    if (this.tagName.toLocaleLowerCase() == "input" || this.tagName.toLocaleLowerCase() == "select")
                        thisValue = this.value;
                    else
                        thisValue = this.innerText;
                }
                if ($(this).attr("data-formatrule")) thisValue = thisValue.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (thisValue && !isNaN(thisValue)) {
                    var v = parseFloat(thisValue);
                    if (v > val) {
                        val = v;
                    }
                }
            }, [obj, express, round]);
            return val;
        },
        Field: function (express) {
            var field = express.substring(express.indexOf("{") + 1);
            field = field.substring(0, field.indexOf("}"));
            return field;
        },
        Express: function (express) {
            if (express.indexOf(",") == -1) return "";
            var str = express.substring(express.indexOf(",") + 1);
            return str.substring(0, str.length - 1);
        },
        IsFunc: true
    },
    {
        Name: "MIN",
        Accept: function (express) {
            return express.toLocaleLowerCase().indexOf("min(") == 0;
        },
        Compuator: function (obj, ctl, express, round) {
            var field = this.Field(express);
            express = this.Express(express);
            var val;
            $("input[data-datafield='" + field + "'],span[data-datafield='" + field + "']").each(function (obj, express, round) {
                var thisValue = 0;
                if (express) {
                    thisValue = obj.executeCompute(this.id, round, express);
                }
                else {
                    if (this.tagName.toLocaleLowerCase() == "input" || this.tagName.toLocaleLowerCase() == "select")
                        thisValue = this.value;
                    else
                        thisValue = this.innerText;
                }
                if ($(this).attr("data-formatrule")) thisValue = thisValue.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (thisValue && !isNaN(thisValue)) {
                    var v = parseFloat(thisValue);
                    if (val == undefined) {
                        val = v;
                    }
                    else if (v < val) {
                        val = v;
                    }
                }
            }, [obj, express, round]);
            return val;
        },
        Field: function (express) {
            var field = express.substring(express.indexOf("{") + 1);
            field = field.substring(0, field.indexOf("}"));
            return field;
        },
        Express: function (express) {
            if (express.indexOf(",") == -1) return "";
            var str = express.substring(express.indexOf(",") + 1);
            return str.substring(0, str.length - 1);
        },
        IsFunc: true
    }
]

Sheet.Computation = function (sheet) {
    this.RegisterEventRules = [];
    this.RegisterEventOnLoad = [];
    this.sheet = sheet;
    this.operators = "+-*/()";
    this.AttrDataField = "data-datafield";
    this.AttrName = "data-computationrule";
    this.init(this);
}

/*
computerule,小数点最多允许9位
*/
Sheet.Computation.prototype = {
    init: function (o) {
        this.RegisterEventRules = [];
        this.RegisterEventOnLoad = [];
        if (!this.sheet.container) {
            this.sheet.container = $(":input[" + this.AttrName + "],span[" + this.AttrName + "],textarea[" + this.AttrName + "]");
        }
        else {
            this.sheet.container = $(this.sheet.container.context).find(":input[" + this.AttrName + "],span[" + this.AttrName + "],textarea[" + this.AttrName + "]");
        }

        this.sheet.container.each(function (e) {
            var computerule = $.trim($(this).attr(e.AttrName));

            if (computerule) {
                var round, express;
                if (computerule.indexOf(",") == 1) {
                    round = o.getRoundFromCompute(computerule);
                    express = o.getExpressFromCompute(computerule);
                }
                else {
                    round = 0;
                    express = computerule;
                }
                o.registerEvent(o, this.id, round, express, express);
                // 设置控件只读
                this.onkeydown = function () { return false; };
                this.onpasete = function () { return false; };
            }
        }, [this]);
    },
    // 注册计算事件主方法
    registerEvent: function (o, id, round, eventExpress, funcExpress) {
        /*
        o:Computation对象实例
        id:计算规则结果控件ID
        round:结果保留小数位
        eventExpress:计算规则中涉及控件的表达式
        funcExpress:计算规则结果值的计算公式
        */
        var fieldArray = eventExpress.split("{");
        var dataFieldArry = [];
        var dataField, isfunc;
        var isCount = false;
        for (var i = 1; i < fieldArray.length; i++) {
            var index = fieldArray[i].indexOf("}");
            if (index == -1) {
                alert(_Sheet_Computation_GlobalString.Sheet_Computation_Msg0 + eventExpress); return;
            }
            // 获取公式中的数据项名称
            var dataField = fieldArray[i].substring(0, index);
            // 检查是否已经注册事件
            for (var j = 0; j < o.RegisterEventRules.length; j++) {
                if (o.RegisterEventRules[j].Express == funcExpress
                    && o.RegisterEventRules[j].ID == id) {
                    if (o.RegisterEventRules[j].dataField && o.RegisterEventRules[j].dataField.length != 0) {
                        for (var k = 0; k < o.RegisterEventRules[j].dataField.length; k++) {
                            if (o.RegisterEventRules[j].dataField[k] == dataField) {
                                return;
                            }
                        }
                    }
                }
            }
            if (!dataField) {
                alert(_Sheet_Computation_GlobalString.Sheet_Computation_Msg0 + dataField); return;
            }
            dataFieldArry.push(dataField);
            if (isCount && fieldArray.length == 2) {
                break;
            }

            if (eventExpress.indexOf(",") > -1) {
                var changeField = eventExpress.substring(eventExpress.indexOf(","));
                if (changeField.indexOf("{") > -1 && changeField.indexOf("}") > -1) {
                    changeField = changeField.split("{")[1];
                    changeField = changeField.substring(0, changeField.indexOf("}"));
                }

                var dataFieldObject = $("input[" + this.AttrDataField + "='" + dataField + "'],span[" + this.AttrDataField + "='" + dataField + "'],select[" + this.AttrDataField + "='" + dataField + "'],input[" + this.AttrDataField + "='" + changeField + "'],select[" + this.AttrDataField + "='" + changeField + "']");
            }
            else {
                var dataFieldObject = $("input[" + this.AttrDataField + "='" + dataField + "'],span[" + this.AttrDataField + "='" + dataField + "'],textarea[" + this.AttrDataField + "='" + dataField + "']");
            }

            // 事件注册
            if (dataFieldObject) {
                dataFieldObject.each(function () {
                    o.registerControlEvent(o, id, round, $(this), funcExpress);
                });

                o.registerOnLoadEvent(o, id, round, funcExpress);
            }
        }
        o.RegisterEventRules.push({ ID: id, Express: funcExpress, dataField: dataFieldArry });
    },
    // 注册控件的事件
    registerControlEvent: function (o, id, round, dataFieldObject, funcExpress) {
        var newComputerule = dataFieldObject.attr(o.AttrName);
        if (!newComputerule) {
            dataFieldObject.change(function () {
                if ($("#" + id).length > 0) {
                    o.computator(id, round, funcExpress);
                }
            });
        }
        else {
            // 先注册子函数的事件
            var newEventExpress = o.getExpressFromCompute(newComputerule);
            var newRound = o.getRoundFromCompute(newComputerule);
            o.registerOnLoadEvent(o, dataFieldObject[0].id, newRound, newEventExpress);
            $("input[" + o.AttrName + "='" + newComputerule + "']").each(function () {
                o.registerEvent(o, this.id, newRound, newEventExpress, newEventExpress);
            });
            // 再注册父事件
            o.registerEvent(o, id, round, newEventExpress, funcExpress);
        }
    },
    registerOnLoadEvent: function (o, id, round, funcExpress) {
        for (var i = 0; i < o.RegisterEventOnLoad.length; i++) {
            if (o.RegisterEventOnLoad[i] == id) return;
        }
        // 汇总函数页面加载完成后，执行计算
        $(function () {
            o.computator(id, round, funcExpress);
        });
        o.RegisterEventOnLoad.push(id);
    },
    // 获取计算规则中保留的小数位
    getRoundFromCompute: function (compute) {
        if (compute.indexOf(",") == -1) return 2;
        return parseInt(compute.substring(0, compute.indexOf(",")));
    },
    // 获取计算规则中的函数表达式
    getExpressFromCompute: function (compute) {
        if (compute.indexOf(",") == -1) return compute;
        return compute.substring(compute.indexOf(",") + 1);
    },
    // 获取计算的结果值
    executeCompute: function (id, round, express) {
        var executeExpress = "";
        while (express.length > 0) {
            var word = "";
            var i = express[0];
            if (i == "{") {
                var datafield = express.substring(1, express.indexOf("}"));
                //executeExpress += CompuationFun[0].Compuator(this, $("#" + id), datafield, round);
                executeExpress = executeExpress + "(" + this.CheckIsDateAndGetDays(CompuationFun[0].Compuator(this, $("#" + id), datafield, round)) + ")";
                express = express.substring(express.indexOf("}") + 1);
            }
            else if (this.operators.indexOf(i) > -1) {
                express = express.substring(1);
                executeExpress += i;
            }
            else if (express.toLocaleLowerCase().indexOf("sum") == 0
                || express.toLocaleLowerCase().indexOf("avg") == 0
                || express.toLocaleLowerCase().indexOf("count") == 0
                || express.toLocaleLowerCase().indexOf("min") == 0
                || express.toLocaleLowerCase().indexOf("max") == 0) {
                var index = express.indexOf("(");
                var endIndex = 0;
                var o = ["("];
                for (var i = index + 1; i < express.length; i++) {
                    if (express[i] == "(") o.push("(");
                    if (express[i] == ")") o.pop();
                    if (o.length == 0) {
                        endIndex = i;
                        break;
                    }
                }
                word = express.substring(0, endIndex + 1);
                express = express.substring(endIndex + 1);

                for (var j = 0; j < CompuationFun.length; j++) {
                    if (CompuationFun[j].Accept(word)) {
                        executeExpress += this.CheckIsDateAndGetDays(CompuationFun[j].Compuator(this, $("#" + id), word, round));
                        break;
                    }
                }
            }
            else {
                executeExpress += i;
                express = express.substring(1);
            }
        }
        var v = this.sheet.getResultValue(executeExpress);
        return v;
    },
    // 执行计算主方法
    computator: function (id, round, express) {
        var v = this.executeCompute(id, round, express);
        // 结果四舍五入取小数位
        if (isFinite(v)) {
            v = this.toFixed(v, round);
            var target = $("#" + id);
            if (target.is("input,textarea")) {
                var oldV = target.val().replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (oldV != v) {
                    target.val(v);
                    target.trigger("change");// target.trigger("change.MobileMaskText");
                    target.blur();
                }
            }
            else if (target.is("div,span")) {
                var oldV = target.html().replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                if (oldV != v) {
                    target.html(v);
                    target.trigger("change"); //target.trigger("change.MobileMaskText");
                    target.blur();
                }
            }
        } else {
        	//add by luwei : 单独处理日期的返回,不需要toFixed
        	//TODO luwei 重复代码，待优化
        	if(v && v.indexOf("$Date") > -1) {
        		var _v = v.substring(0, v.length - 5);
        		if (isFinite(_v)) {
		            var target = $("#" + id);
		            if (target.is("input,textarea")) {
		                var oldV = target.val().replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
		                if (oldV != _v) {
		                    target.val(_v);
		                    target.trigger("change");// target.trigger("change.MobileMaskText");
		                    target.blur();
		                }
		            }
		            else if (target.is("div,span")) {
		                var oldV = target.html().replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
		                if (oldV != _v) {
		                    target.html(_v);
		                    target.trigger("change"); //target.trigger("change.MobileMaskText");
		                    target.blur();
		                }
		            }
		        }
        	}
        }
    },
    toFixed: function (val, round) {
        if (val == 0 || !val) return val;
        var v;
        if (val < 0) {
            v = parseInt(val * Math.pow(10, round) - 0.5) / Math.pow(10, round);
        } else {
            v = parseInt(val * Math.pow(10, round) + 0.5) / Math.pow(10, round);
        }

        var index = v.toString().indexOf(".");
        if (index < 0 && round > 0) {
            v = v + ".";
            for (var i = 0; i < round; i++) {
                v = v + "0";
            }
        } else {
            index = v.toString().length - index;
            for (var i = 0; i < (round - index) + 1; i++) {
                v = v + "0";
            }
        }
        return v;
    },
    CheckIsDateAndGetDays: function (val) {
        if (String(val).match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/) == null)
            return val;
        return (new Date(val).getTime()) / (1000 * 60 * 60 * 24);
    }

}