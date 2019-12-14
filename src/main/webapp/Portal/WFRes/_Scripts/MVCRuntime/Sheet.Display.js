/*
表单联动规则，由 SheetBizDropDownList 控件进行实现
Authine 2013-9
*/
var _v = "";
var _Sheet_Display_GlobalString = { "Sheet_Display_Msg0": "显示规则设置错误：" };
////获取本地化字符串
//$.get(_PORTALROOT_GLOBAL + "/Ajax/GlobalHandler.ashx", { "Code": "Sheet_Display_Msg0" }, function (data) {
//    if (data.IsSuccess) {
//        _Sheet_Display_GlobalString = data.TextObj;
//    }
//}, "json");

Sheet.Display = function (sheet) {
    this.AttrName = "data-displayrule";
    this.sheet = sheet;
    this.controls = [];
    this.init();
}

Sheet.Display.prototype = {
    init: function () {
        this.controls.length = 0;
        if (!this.sheet.container) {
            this.sheet.container = $("input[" + this.AttrName + "],span[" + this.AttrName + "],textarea[" + this.AttrName + "],select[" + this.AttrName + "],div[" + this.AttrName + "],label[" + this.AttrName + "]");
        }
        else {
            this.sheet.container = $(this.sheet.container.context).find("input[" + this.AttrName + "],span[" + this.AttrName + "],textarea[" + this.AttrName + "],select[" + this.AttrName + "],div[" + this.AttrName + "],label[" + this.AttrName + "]");
        }

        this.sheet.container.each(function (o) {
            if ($(this).parent().parent().hasClass("template")) {
                return;
            }

            var displayrule = $(this).attr(o.AttrName);
            if (displayrule) {
                o.registerEvent(this.id, displayrule);
            }
        }, [this]);

        $.each(this.controls, function (index, obj) {
            $(obj).change();
        });
    },
    // 注册计算事件主方法
    registerEvent: function (id, eventExpress) {
        var fieldArray = eventExpress.split("{");
        var dataField;
        var isCount = false;
        for (var i = 1; i < fieldArray.length; i++) {
            var index = fieldArray[i].indexOf("}");
            if (index == -1) {
                alert(_Sheet_Display_GlobalString.Sheet_Display_Msg0 + eventExpress); return;
            }

            dataField = fieldArray[i].substring(0, index);

            // 获取控件
            var filterCtrl = this.sheet.findControlByDataField($("#" + id), dataField);
            if (!filterCtrl) return;

            filterCtrl.unbind("change." + id).bind("change." + id, [this], function (e, val) {
                if ($("#" + id).length == 0) {
                    return;
                }
                _v = val;
                e.data[0].selectChanged($("#" + id), eventExpress);
            });
            
            //update by luwei : 子表有多行的时候由于dataField一样会导致只有第一行绑定了change事件
//            if (!this.contains(dataField)) {
//                this.controls.push(filterCtrl);
//            }
            this.controls.push(filterCtrl);
            //filterCtrl.change();
        }
    },
    contains: function (datafield) {
        var result = false;
        $.each(this.controls, function (index, obj) {
            if ($(obj).attr("data-datafield") == datafield) result = true;
        });
        return result;
    },
    setDisplay: function (control, display) {
        if (display) {
            control.removeClass("hidden");
            if (control.next().length > 0 &&
                control.next().attr("for") && control.next().attr("for") == control.attr("id")) {
                control.next().removeClass("hidden");
            }
        }
        else {
            control.addClass("hidden");
            if (control.next().length > 0 &&
                control.next().attr("for") && control.next().attr("for") == control.attr("id")) {
                control.next().addClass("hidden");
            }
        }
    },
    selectChanged: function (obj, eventExpress) {
        var fieldArray = eventExpress.split("{");
        var dataField;
        var isCount = false;
        var rule = fieldArray[0];

        for (var i = 1; i < fieldArray.length; i++) {
            var index = fieldArray[i].indexOf("}");
            if (index == -1) {
                alert(_Sheet_Display_GlobalString.Sheet_Display_Msg0 + eventExpress); return;
            }

            dataField = fieldArray[i].substring(0, index);
            if (_v)
                rule = "'" + _v + "'";
            else
                rule += "'" + this.sheet.getDataFieldValue(obj, dataField) + "'";
            rule += fieldArray[i].substring(index + 1);
        }

        var v = this.sheet.getResultValue(rule);// eval(rule); 
        var IsMobile = "";
        var g = new RegExp("(^|&)IsMobile=([^&]*)(&|$)");
        var r = top.window.location.search.substr(1).match(g);
        if (r != null) IsMobile = unescape(r[2]);
        if (IsMobile) {
            if (v) {
                var row = obj.parent().parent();
                if (row.is("tr")) this.setDisplay(row, true);//.show();
                var selectShow = false;
                if (obj.attr("data-type") == "SheetDropDownList") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示下拉框
                        if (obj.next().is("label")) {
                            selectShow = true;
                        }
                    }
                    else {
                        this.setDisplay(obj.parent().find(".select2-container"), true);//.show();
                    }
                }
                //文本框
                if (obj.attr("data-type") == "SheetTextBox") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示下拉框
                        if (obj.next().is("label")) {
                            selectShow = true;
                        }
                    }
                }
                //富文本框
                if (obj.attr("data-type") == "SheetRichTextBox") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示文本框
                        if (obj.parent().find("div.SheetRichTextBox").length > 0) {
                            selectShow = true;
                        }
                    }
                }
                if (!selectShow) {
                    this.setDisplay(obj.parent(), true);//.show();
                }
            }
            else {
                if (obj.attr("data-type") == "SheetDropDownList") {
                    this.setDisplay(obj.parent().find(".select2-container"), false);//.hide();
                }
                this.setDisplay(obj.parent(), false);//.hide();
                var row = obj.parent().parent();
                var hasControl = false;
                row.find("label,span,input,select,textarea").each(function () {
                    if (this.style.display != "none") hasControl = true;
                });
                if (!hasControl) {
                    if (obj.attr("data-type") == "SheetDropDownList") {
                        this.setDisplay(obj.parent().find(".select2-container"), false);//.hide();
                    }
                    this.setDisplay(row.parent(), false);//.hide();
                }
            }
        } else {
            if (v) {
                var row = obj.parent().parent();
                if (row.is("tr")) this.setDisplay(row, true);//.show();
                var selectShow = false;
                if (obj.attr("data-type") == "SheetDropDownList") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示下拉框
                        if (obj.next().is("label")) {
                            selectShow = true;
                        }
                    }
                    else {
                        this.setDisplay(obj.parent().find(".select2-container"), true);//.show();
                    }
                }
                //文本框
                if (obj.attr("data-type") == "SheetTextBox") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示下拉框
                        if (obj.next().is("label")) {
                            selectShow = true;
                        }
                    }
                }
                //富文本框
                if (obj.attr("data-type") == "SheetRichTextBox") {
                    if ($.MvcSheetUI.QueryString("Mode") == "View") {
                        selectShow = true;
                    }
                    else if ($.MvcSheetUI.QueryString("Mode") == "Work") {
                        //如果是不可编辑，不需要显示文本框
                        if (obj.parent().find("div.SheetRichTextBox").length > 0) {
                            selectShow = true;
                        }
                    }
                }
                if (!selectShow)
                    this.setDisplay(obj, true);//.show();
            }
            else {
                if (obj.attr("data-type") == "SheetDropDownList") {
                    this.setDisplay(obj.parent().find(".select2-container"), false);//.hide();
                }
                this.setDisplay(obj, false);//.hide();
                var row = obj.parent().parent();
                var hasControl = false;
                row.find("label,span,input,select,textarea").each(function () {
                    if (this.style.display != "none") hasControl = true;
                });
                if (!hasControl) {
                    if (obj.attr("data-type") == "SheetDropDownList") {
                        this.setDisplay(obj.parent().find(".select2-container"), false);//.hide();
                    }
                    this.setDisplay(row, false);//.hide();
                }
            }
        }
    }
}