//当前打开的TabID
var CurrenteTabID = top.workTab == null ? null : top.workTab.getSelectedTabItemID();
//表格管理器，列表
var H3GridManager;
//对话框管理器，弹出窗口
var H3DialogManger;
//默认工具栏ID标示
var ToolBarKey_Add = "AddTool";
var ToolBarKey_Modify = "ModifyTool";
var ToolBarKey_Delete = "DeleteTool";

//全局执行默认方法：点击界面隐藏树型工具栏,屏蔽退格事件,ESC关闭弹出窗口事件
$(function () {
    document.onclick = function (e) {
        top.$("#treeToolbar").hide()
    }
    //退格事件
    $(document).bind("keydown", function () {
        if (event.keyCode == 8) {
            var target = event.srcElement;
            if (target.nodeName.toUpperCase() != "INPUT"
                && target.nodeName.toUpperCase() != "TEXTAREA")
                event.returnValue = false;
        }
    });
    //ESC事件
    $(document).bind("keydown", function (event) {
        if (event.keyCode == 27) {
            if (H3DialogManger != null)
                H3DialogManger.Cancel();
            if (top.H3DialogManger != null)
                top.H3DialogManger.Cancel();
            if (parent.H3DialogManger != null)
                parent.H3DialogManger.Cancel();
        }
    });
});


Guid = function () {
    var getStr = function (len) {
        if (len > 12) len = 12;
        return Math.floor(Math.random() * 100000000000000).toString("16").substring(0, len);
    };
    return getStr(8) + "-" + getStr(4) + "-4" + getStr(3) + "-" + getStr(4) + "-" + getStr(12);
}

//创建bool 列，勾选，反勾选
var BuildBoolCoum = function (rowdata, index, value) {
    if (value) {
        return "<img src='../Portal/WFRes/Images/checked.gif' />";
    }
    else {
        return "<img src='../Portal/WFRes/Images/unChecked.gif' />";
    }
}

//表格列
var GridColumn = function GridColumn(displayName, nameKey, isHide, renderFun) {
    this.display = displayName;
    this.name = nameKey;
    //this.isSort = true;
    this.hide = isHide;
    this.render = renderFun;
}

//创建表格
var CreateLigerGrid = function (divObj, gridColums, dataUrl, showCheckbox, height, width, tree) {
    divObj.ligerGrid({
        columns: gridColums,
        enabledSort: true,
        width: width == null ? '100%' : width,
        pageSizeOptions: [5, 10, 15, 20, 50, 100],
        height: height == null ? '99%' : height,
        //rowHeight: "40",
        tree: tree,
        headerRowHeight: "30",
        url: dataUrl,
        dataAction: 'server', //服务器排序
        usePager: true,       //服务器分页
        pageSize: 20,
        //toolbar: GridToolBar,//这个不在表格里加工具栏，在页面的地方直接加工具栏，这样不仅在表格可以用，新增编辑界面都可以用
        checkbox: showCheckbox,
        rownumbers: true,
        columnWidth: "auto",
        pageParmName:'PageIndex',
        onSuccess:onSuccess,
        onError:onError,
        onBeforeShowData:onBeforeShowData
    });
    H3GridManager = divObj.ligerGetGridManager();
}

//add by luwei
var onBeforeShowData = function(data) {
	
}
//add by luwei : 错误处理
var onError = function(xhr, status, error) {
	$.H3Dialog.Error({ content: "系统错误" });
}
//add by luwei : 登录失效处理
var onSuccess = function(data, grid) {
	if(data && data.Success == false) {
		if(data.Message == "needLogin") {
			top.location.href = "Login.html";
		}
	}
}

//对话框管理器
var ShowDialog = function (title, url, height, width) {
    height = (height == null ? 600 : height);
    width = (width == null ? 800 : width);
    var bodyscroll = $("body").scrollTop();
    $("body").scrollTop(0);
    $("body").css("overflow-y", "hidden");

    H3DialogManger = $.ligerDialog.open(
               {
                   title: title,
                   url: url,
                   height: height,
                   width: width,
                   showMax: true,
                   //isResize: true
                   isHidden: false,
                   onClose: function () {
                       $("body").css("overflow-y", "auto");
                       $("body").scrollTop(bodyscroll);
                   }
               });
    H3DialogManger.Close = function () {
        // top.workTab.reload(CurrenteTabID);
        // H3DialogManger.frame.location.href = H3DialogManger.frame.location.href;
        window.location.reload();
        H3DialogManger.close();
    };

    H3DialogManger.Cancel = function () {
        H3DialogManger.close();
    };


}

//删除确认方法
var ConfirmDel = function (obj) {
    if ($(obj).attr("ignoreFirm") == "true") {
        $(obj).removeAttr("ignoreFirm");
        return true;
    }
    $.ligerDialog.confirm('确定删除？', function (result) {
        if (result) {
            $(obj).attr("ignoreFirm", true);
            if ($(obj).attr("href").indexOf("__doPostBack") > -1
                || $(obj).attr("href").indexOf("WebForm_DoPostBackWithOptions") > -1) {
                eval($(obj).attr("href"));
            }
            else {
                $(obj).click();
            }
        }
    });
    return false;
}

function ShowAssistDialog(title, url) {
    H3DialogManger = $.ligerDialog.open(
               {
                   title: title,
                   url: url,
                   height: 300,
                   width: 500,
                   showMax: true
                   //isResize: true
               });
    H3DialogManger.Close = function () {
        top.workTab.reload(CurrenteTabID);
        H3DialogManger.close();
    }
}

//列表页面工具栏插件,默认带新增编辑删除
/*
 * 参数说明：
 * items：[{id:"主键",text:"名称"，icon:"图标",click:函数}]
 * tableId：表格标示
 * addBtnOpions：{linkUrl: "CategoryDetail.aspx", params: [{ key: "Action", val: "DoAdd" }]}
 * modifyBtnOpions: { linkUrl: "CategoryDetail.aspx", modifyValKey: "Id",modifyVal: "ObjectID", params: [{ key: "Action", val: "DoModify" }] }
 * delBtnOpions: { linkUrl: "EditCategory.aspx", delValKey: "Ids",delVal: "ObjectID", params: [{ key: "Action", val: "DeleteData" }] }
 * HiddenBtns:ToolBarKey_Add;ToolBarKey_Modify;ToolBarKey_Delete
 */
(function ($) {
    $.fn.H3GridToolBar = function (options) {
        var defaultItems = new Array();

        if (options != null) {
            if (options.HiddenBtns == null) {
                defaultItems.push({ id: ToolBarKey_Add, text: "增加", icon: "add", click: AddBtnClickFun });
                defaultItems.push({ line: true });
                defaultItems.push({ id: ToolBarKey_Modify, text: "修改", icon: "modify", click: ModifyBtnClickFun });
                defaultItems.push({ line: true });
                defaultItems.push({ id: ToolBarKey_Delete, text: "删除", icon: "delete", click: DelBtnClickFun });
                defaultItems.push({ line: true });
            }
            else {
                if (options.HiddenBtns.indexOf(ToolBarKey_Add) == -1) {
                    defaultItems.push({ id: ToolBarKey_Add, text: "增加", icon: "add", click: AddBtnClickFun });
                    defaultItems.push({ line: true });
                }
                if (options.HiddenBtns.indexOf(ToolBarKey_Modify) == -1) {
                    defaultItems.push({ id: ToolBarKey_Modify, text: "修改", icon: "modify", click: ModifyBtnClickFun });
                    defaultItems.push({ line: true });
                }
                if (options.HiddenBtns.indexOf(ToolBarKey_Delete) == -1) {
                    defaultItems.push({ id: ToolBarKey_Delete, text: "删除", icon: "delete", click: DelBtnClickFun });
                    defaultItems.push({ line: true });
                }
            }

            if (options.items != null) {
                for (var i = 0; i < options.items.length; i++)
                    defaultItems.push(options.items[i]);
                if (i < options.items.length - 1)
                    defaultItems.push({ line: true });
            }

            for (var i = 0; i < defaultItems.length; i++) {
                var item = defaultItems[i];
                item.tableId = options.tableId;
                item.addBtnOpions = options.addBtnOpions;
                item.modifyBtnOpions = options.modifyBtnOpions;
                item.delBtnOpions = options.delBtnOpions;
                item.paramKey = options.paramKey;
            }
        }

        defaultItems.pop();
        return $(this).each(function () {
            var listToolBar = $(this);
            listToolBar.ligerToolBar({ items: defaultItems });
        });

        function GetUrlPage(btnOptions, newParams) {
            var params = btnOptions.params;
            var urlParams = "";
            for (var i = 0; i < params.length; i++) {
                urlParams += params[i].key + "=" + params[i].val + "&";
            }

            for (var i = 0; i < newParams.length; i++) {
                urlParams += newParams[i].key + "=" + newParams[i].val + "&";
            }

            return btnOptions.linkUrl + "?" + urlParams;
        }

        function AddBtnClickFun() {
            var addBtnOpions = this.addBtnOpions;
            ShowDialog(addBtnOpions.title, GetUrlPage(addBtnOpions, new Array()));
        };
        function ModifyBtnClickFun() {
            var gridManager = $("#" + this.tableId).ligerGetGridManager();
            var row = gridManager.getSelectedRow();
            if (row == null) {
                $.H3Dialog.Warn({ content: "请选中内容" });
                return;
            }
            var newParams = new Array();
            newParams.push({ key: this.modifyBtnOpions.modifyValKey, val: row[this.modifyBtnOpions.modifyVal] });
            ShowDialog("编辑类型", GetUrlPage(this.modifyBtnOpions, newParams));
        }
        function DelBtnClickFun() {
            var gridManager = $("#" + this.tableId).ligerGetGridManager();
            var rows = gridManager.getSelectedRows();
            if (rows == null || rows.length == 0) {
                $.H3Dialog.Warn({ content: "请选中内容" });
                return;
            }
            var ids = "";
            for (var i = 0; i < rows.length; i++) {
                ids = ids + rows[i][this.delBtnOpions.delVal] + ";";
            }
            var newParams = new Array();
            newParams.push({ key: this.delBtnOpions.delValKey, val: ids });
            var ajaxUrl = GetUrlPage(this.delBtnOpions, newParams);
            var firmText = this.delBtnOpions.FirmText == null ? "确定删除？" : this.delBtnOpions.FirmText;
            $.ligerDialog.confirm(firmText, function (result) {
                if (result) {
                    $.ajax({
                        url: ajaxUrl,//这里访问不了this.delBtnOpions
                        success: function () {
                            top.workTab.reload(top.workTab.getSelectedTabItemID());
                        }
                    });
                }
            });
        };
    }
})(jQuery);

/* 表格删除方法 */
jQuery.extend({
    GridDeleteRow: function (option) {
        var tableId = option.tableId;
        var ajaxUrl = option.ajaxUrl;
        var valKey = option.valKey;
        var gridManager = $("#" + tableId).ligerGetGridManager();
        var rows = gridManager.getSelectedRows();
        if (rows == null || rows.length == 0) {
            $.H3Dialog.Warn({ content: "请选中内容" });
            return;
        }
        var ids = "";
        for (var i = 0; i < rows.length; i++) {
            ids = ids + rows[i][valKey] + ";";
        }
        ajaxUrl += "?Action=DeleteData&id=" + encodeURI(ids);;
        $.ligerDialog.confirm('确定删除？', function (result) {
            if (result) {
                $.ajax({
                    url: ajaxUrl,
                    success: function () {
                        top.workTab.reload(top.workTab.getSelectedTabItemID());
                    }
                });
            }
        });
    }
});

/*H3 公共提示方法 by CHC*/
jQuery.extend({ H3Dialog: {} });//定义H3Dialog命名控件
jQuery.extend(
    $.H3Dialog,
    {
        Success: function (option) {//添加提示成功！默认显示2s后自动关闭
            option = $.extend(false, { title: "H3 温馨提示!", content: "欢迎使用H3 BPM软件！" }, option);
            var H3DialogId = "H3DialogId_" + Guid();// new Date().toISOString().replace(/:|-|\./g, "");
            var H3DialogObj = $("<div id='" + H3DialogId + "' class='h3-dialog h3-dialog-success'></div>");
            var IconObj = $("<div class='h3-dialog-t-icon h3-dialog-t-success'></div>");
            var maxWidth = 400;
            var maxHeight = 300;
            //计算文本宽度
            var preObject = $("<pre>").addClass("h3-dialog-success").hide().html(option.content).appendTo(document.body);
            var contentLength = preObject.width();
            var contentHeight = preObject.height();
            preObject.remove();

            var objWidth = (contentLength < maxWidth ? contentLength : maxWidth) + 30;
            var objHeight = (contentHeight > maxHeight ? maxHeight : contentHeight) + 10;
            H3DialogObj.css("width", objWidth);
            H3DialogObj.css("height", objHeight);
            H3DialogObj.css("line-height", objHeight + "px");
            H3DialogObj.css("top", $(window).height() - objHeight);
            H3DialogObj.css("left", ($("body").width() - objWidth) / 2);
            IconObj.css("margin-top", (H3DialogObj.height() - IconObj.height()) / 2 - 10);

            H3DialogObj.append(IconObj);
            H3DialogObj.append('<span>' + option.content + '</span>');
            $("body").append(H3DialogObj.append(H3DialogObj));

            H3DialogObj.animate({ "top": ($(window).height() - objHeight) / 2 - 100 }, function () {
                $("body").bind("click", function (e) {
                    var e = e ? e : window.event;
                    var tar = e.srcElement || e.target;
                    if (tar != null
                        && tar.id != H3DialogId
                        && tar.offsetParent != null
                        && tar.offsetParent.id != H3DialogId)
                        H3DialogObj.remove();
                });;
            });
        },
        Warn: function (option) {//提示警告!标示可修复错误
            option = $.extend(false, { title: "H3 温馨提示!", content: "欢迎使用H3 BPM软件！" }, option);
            var H3DialogId = "H3DialogId_" + Guid();//new Date().toISOString().replace(/:|-|\./g, "");
            var H3DialogObj = $("<div id='" + H3DialogId + "' class='h3-dialog h3-dialog-warn'></div>");
            var IconObj = $("<div class='h3-dialog-t-icon h3-dialog-t-warn'></div>");
            var maxWidth = 400;
            var maxHeight = 300;
            //计算文本宽度
            var preObject = $("<pre>").addClass("h3-dialog-warn").hide().html(option.content).appendTo(document.body);
            var contentLength = preObject.width();
            var contentHeight = preObject.height();
            preObject.remove();

            var objWidth = (contentLength < maxWidth ? contentLength : maxWidth) + 30;
            var objHeight = (contentHeight > maxHeight ? maxHeight : contentHeight) + 10;
            H3DialogObj.css("width", objWidth);
            H3DialogObj.css("height", objHeight);
            H3DialogObj.css("line-height", objHeight + "px");
            H3DialogObj.css("top", $(window).height() - objHeight);
            H3DialogObj.css("left", ($("body").width() - objWidth) / 2);
            IconObj.css("margin-top", (H3DialogObj.height() - IconObj.height()) / 2 - 10);

            H3DialogObj.append(IconObj);
            H3DialogObj.append('<span>' + option.content + '</span>');
            $("body").append(H3DialogObj);

            H3DialogObj.animate({ "top": ($(window).height() - objHeight) / 2 - 100 }, function () {
                $("body").bind("click", function (e) {
                    var e = e ? e : window.event;
                    var tar = e.srcElement || e.target;
                    if (tar != null
                        && tar.id != H3DialogId
                        && tar.offsetParent != null
                        && tar.offsetParent.id != H3DialogId)
                        H3DialogObj.remove();
                });
            });
        },
        Error: function (option) {//提示错误！标示不可修复的错误
            option = $.extend(false, { title: "H3 温馨提示!", content: "欢迎使用H3 BPM软件！" }, option);
            var H3DialogId = "H3DialogId_" + Guid();// new Date().toISOString().replace(/:|-|\./g, "");
            var H3DialogObj = $("<div id='" + H3DialogId + "' class='h3-dialog h3-dialog-error'></div>");
            var IconObj = $("<div class='h3-dialog-t-icon h3-dialog-t-error'></div>");
            var maxWidth = 400;
            var maxHeight = 300;
            //计算文本宽度
            var preObject = $("<pre>").addClass("h3-dialog-error").hide().html(option.content).appendTo(document.body);
            var contentLength = preObject.width();
            var contentHeight = preObject.height();
            preObject.remove();

            var objWidth = (contentLength < maxWidth ? contentLength : maxWidth) + 30;
            var objHeight = (contentHeight > maxHeight ? maxHeight : contentHeight) + 10;
            H3DialogObj.css("width", objWidth);
            H3DialogObj.css("height", objHeight);
            H3DialogObj.css("line-height", objHeight + "px");
            H3DialogObj.css("top", $(window).height() - objHeight);
            H3DialogObj.css("left", ($("body").width() - objWidth) / 2);
            IconObj.css("margin-top", (H3DialogObj.height() - IconObj.height()) / 2 - 10);

            H3DialogObj.append(IconObj);
            H3DialogObj.append('<span>' + option.content + '</span>');
            $("body").append(H3DialogObj);

            H3DialogObj.animate({ "top": ($(window).height() - objHeight) / 2 - 100 }, function () {
                $("body").bind("click", function (e) {
                    var e = e ? e : window.event;
                    var tar = e.srcElement || e.target;
                    if (tar != null
                        && tar.id != H3DialogId
                        && tar.offsetParent != null
                        && tar.offsetParent.id != H3DialogId)
                        H3DialogObj.remove();
                });;
            });
        },
        AlertMultiMsg: function (option) {
            /*参数：{title:"",content:[{status:"success", text:"成功"},{status:"warn", text:"警告"},{status:"error", text:"错误"}]}*/
            option = $.extend(false, { title: "H3 温馨提示!", content: [{ status: "success", text: "成功" }, { status: "warn", text: "警告" }, { status: "error", text: "错误" }] }, option);
            var H3DialogId = "H3DialogId_" + Guid();// new Date().toISOString().replace(/:|-|\./g, "");
            var H3DialogObj = $("<div id='" + H3DialogId + "' class='h3-dialog h3-dialog-MutilMsg'></div>");
            var maxWidth = 800;
            var minWidth = 300;
            var contentLength = 0;

            for (var i = 0, j = option.content.length; i < j; i++) {
                var rowObj = $("<div class='h3-dialog-" + option.content[i].status + "' style='width:100%;clear: both;float: none;border: none;'></div>");
                var IconObj = $("<div class='h3-dialog-t-icon h3-dialog-t-" + option.content[i].status + "'></div>");
                //计算文本宽度
                var preObject = $("<pre>").addClass("h3-dialog-" + option.content[i].status).hide().html(option.content[i].text).appendTo(document.body);
                contentLength = contentLength < preObject.width() ? preObject.width() : contentLength;
                rowObj.css("height", preObject.height() + 10);
                rowObj.css("line-height", (preObject.height() + 10) + "px");
                preObject.remove();
                IconObj.css("margin-top", (rowObj.height() - IconObj.height()) / 2 - 10);
                rowObj.append(IconObj);
                rowObj.append('<span>' + option.content[i].text + '</span>');
                H3DialogObj.append(rowObj);
            }
            contentLength = (contentLength < maxWidth ? (contentLength < minWidth ? minWidth : contentLength) : maxWidth) + 30;
            H3DialogObj.css("width", contentLength);
            H3DialogObj.css("top", $(window).height() - H3DialogObj.height());
            H3DialogObj.css("left", ($("body").width() - H3DialogObj.width()) / 2);
            $("body").append(H3DialogObj);
            H3DialogObj.animate({ "top": ($(window).height() - H3DialogObj.height()) / 2 - 100 }, function () {
                $("body").bind("click", function (e) {
                    var e = e ? e : window.event;
                    var tar = e.srcElement || e.target;
                    if (tar != null
                        && tar.id != H3DialogId
                        && tar.offsetParent != null
                        && tar.offsetParent.id != H3DialogId)
                        H3DialogObj.remove();
                });;
            });
        }
    }
    );

/* 自定义服务端的toolbar
 * 默认是固定浮动的，如果不需要浮动，传{IsFixed:false}
 */
(function ($) {
    $.fn.AspLinkToolBar = function (options) {
        return this.each(function () {
            var aspToolBar = $(this);
            if ($(".l-toolbar", aspToolBar).length > 0)
                return;

            var lnkList = aspToolBar.find("a");
            var ditems = $("<div></div>");

            ditems.addClass("l-toolbar");
            //重新添加内容
            for (var i = 0; i < lnkList.length; ++i) {
                var item = lnkList[i];
                var itemHtml = item.innerHTML;
                var ditem = $('<div class="l-toolbar-item l-panel-btn"><span></span><div class="l-panel-btn-l"></div><div class="l-panel-btn-r"></div></div>');
                var separatoritem = $('<div class="l-bar-separator"></div>');

                //计算文本宽度
                var preObject = $("<pre>").hide().html(itemHtml).appendTo(document.body);
                var spanWidth = preObject.width() + 16;
                preObject.remove();
                $(ditem).css("width", spanWidth);

                if ($(item).attr("disabled")) {
                    ditem.addClass("l-toolbar-item-disable");
                    $(item).removeAttr("onclick");
                }
                if (item.title) {
                    ditem.append("<div class='l-icon l-icon-" + item.title + "'></div>");
                    ditem.addClass("l-toolbar-item-hasicon");
                }
                $("span:first", ditem).html(itemHtml);
                $("a:first", ditem).css("text-decoration", "none");
                ditem.hover(function () {
                    if ($(this).hasClass("l-toolbar-item-disable")) return;
                    $(this).addClass("l-panel-btn-over");
                }, function () {
                    if ($(this).hasClass("l-toolbar-item-disable")) return;
                    $(this).removeClass("l-panel-btn-over");
                });
                $(item).html("");
                $(item).attr("title", itemHtml);
                $(item).append(ditem);
                ditems.append($(item));
                if (i < lnkList.length - 1)
                    ditems.append(separatoritem);
            }
            aspToolBar.html("");
            aspToolBar.append(ditems);

            if (options == null || options.IsFixed == null || options.IsFixed) {
                //当前工具栏固定浮动功能
                ditems.css("position", "fixed");
                ditems.css("width", "100%");
                ditems.css("z-index", "100");
                ditems.css("margin", "0px");
                aspToolBar.css("height", ditems.css("height"));
            }
        });
    }
})(jQuery);

//统一设置asp:button 按钮样式为toolbar按钮样式
function SetControlStyle() {
    var buttons = $("a[flag]");
    buttons.each(function (index, obj) {
        //判断是否有兄弟节点存在
        //var siblings = $(obj).siblings("a[flag]");
        //if (siblings.length <= 0) {
        //获取父节点
        var parent = $(obj).parents()[0];
        var ditems = $("<div></div>");
        //ditems.addClass("l-toolbar");

        var itemHtml = obj.innerHTML;
        var ditem = $('<div class="l-toolbar-item l-panel-btn"><span></span><div class="l-panel-btn-l"></div><div class="l-panel-btn-r"></div></div>');
        var separatoritem = $('<div class="l-bar-separator"></div>');
        if (obj.disabled) {
            ditem.addClass("l-toolbar-item-disable");
        }
        if (obj.title) {
            ditem.append("<div class='l-icon l-icon-" + obj.title + "'></div>");
            ditem.addClass("l-toolbar-item-hasicon");
        }
        $("span:first", ditem).html(itemHtml);
        $(obj).html("");
        $(obj).attr("title", itemHtml);
        $(obj).append(ditem);
        ditems.append($(obj));
        $(parent).append(ditems);

    })
}

function BuildLigerUITab(index) {
    //获取panel
    var pnls = $("div[id*='tabPnl']");
    var div = $("div .l-tab-links");
    var ul = $("<ul style='left:0px;'></ul>");
    //获取隐藏控件的值，指代当前活动标签序号
    //var index = $("input[id *= 'tabSel']").val();
    //判断传入参数个数
    if (arguments.length == 1) {
        var index = index;
        var items = div.find("a");

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var li = $("<li style='cursor:pointer;'></li>");

            if (i == index) {
                $(li).addClass("l-selected");
                //设置pnl的display属性
                $(pnls[i]).show();
            }
            else {
                $(li).removeClass("l-selected");
                $(pnls[i]).hide();
            }

            if (i <= index) {
                //tab标签的enabled属性
                $(item).removeAttr("disabled");
                $(item).attr("href", "#");
            }
            else {
                $(item).attr("href", "javascript:void(0);")
                $(item).attr("disabled", "disabled");
            }
            var subDiv = "<div class='l-tab-links-item-right'></div><div class='l-tab-links-item-left'></div>";
            li.append(item);
            li.append(subDiv);
            ul.append(li);
        }
    }
    else {
        var index = arguments[0];
        var items = div.find("a");

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var li = $("<li style='cursor:pointer;'></li>");

            if (i == index) {
                $(li).addClass("l-selected");
                //设置pnl的display属性
                $(pnls[i]).show();
            }
            else {
                $(li).removeClass("l-selected");
                $(pnls[i]).hide();
            }

            var subDiv = "<div class='l-tab-links-item-right'></div><div class='l-tab-links-item-left'></div>";
            li.append(item);
            li.append(subDiv);
            ul.append(li);
        }
    }
    //$(item).attr("disabled", "disabled");
    div.append(ul);
    SetControlStyle();
}

function changeFunction(obj) {
    if (typeof ($(obj).attr("disabled")) == "undefined") {
        var index = $(obj).attr("id").substr(($(obj).attr("id").length - 1), 1);
        BuildLigerUITab(index);
    }
    else {
        return false;
    }
}

//table 加 标题的 样式构造，有隐藏功能,需要排除构造的用excludeIDs排除{excludeIDs:["id"]}
(function ($) {
    $.fn.BuildPanel = function (option) {
        var count = 0;
        return $(this).each(function () {
            var id = Guid();// new Date().toISOString().replace(/:|-|\./g, "") + (count++);
            var h3Pannel = $(this);
            var spanObj = $("span:first", h3Pannel);
            var tableObj = $("table:first", h3Pannel);
            var formObj = $('<div class="l-form"></div>');
            var groupOjb = $("<div class='l-group' style='cursor:pointer;'></div>");
            var btnObj = $("<div class='togglebtn'></div>");

            var excludeObj;
            if (option != null && option.excludeIDs != null) {
                for (var i = 0; i < option.excludeIDs.length; i++) {
                    excludeObj = h3Pannel.children("#" + option.excludeIDs[i]);
                    if (excludeObj.length > 0) {
                        break;
                    }
                }
            }

            //var excludeObj = option == null ? null : option.excludeID == null ? null : $("div[id=" + option.excludeID + "]", h3Pannel);

            var controlDiv = $("<div H3PanelId='Control_" + id + "'></div>");
            groupOjb.attr("H3PanelId", id);
            btnObj.attr("H3PanelId", "togglebtn_" + id);

            if (excludeObj != null && excludeObj.length > 0) {
                controlDiv.append(excludeObj);
            }
            else {
                controlDiv.append(tableObj);
                //如果是控件过来的table，那么就设置样式,例如添加群组功能的组织关系
                if (!tableObj.hasClass("tableList")) {
                    tableObj.addClass("tableList");
                }
                var trList = tableObj.children().children();//tableObj.find("tr");
                for (var i = 0; i < trList.length; i++) {
                    var tr = $(trList[i]);
                    var td = $("td:first", tr);
                    if (td.attr("spacetd") != null)
                        continue;
                    tr.prepend($("<td spacetd='spacetd'></td>").width("20"));
                    td.removeAttr("width");
                    td.removeAttr("align");
                    if (!td.hasClass("tableLeft"))
                        td.addClass("tableLeft");//没有的添加
                }
            }
            groupOjb.bind("click", function () {
                var pannelId = $(this).attr("H3PanelId");
                var controlDiv = $("div[H3PanelId='Control_" + pannelId + "']");// $("#table_" + $(this).attr("id"));
                var togglebtn = $("div[H3PanelId='togglebtn_" + pannelId + "']");// $("#togglebtn_" + $(this).attr("id"));
                if (controlDiv.is(":hidden")) {
                    togglebtn.removeClass("togglebtn-down");
                    controlDiv.show();
                }
                else {
                    togglebtn.addClass("togglebtn-down");
                    controlDiv.hide();
                }
            });

            if (spanObj != null && spanObj.length > 0) {
                //spanObj.css("background", 'url("/Portal/WFRes/_Content/themes/ligerUI/icons/communication.gif") no-repeat 10px 50%');
                spanObj.css("padding-left", "30px");
                spanObj.css("width", "100%");
                groupOjb.append(spanObj);
                groupOjb.append(btnObj);
                formObj.append(groupOjb);
            }
            formObj.append(controlDiv);
            h3Pannel.html("");
            return h3Pannel.append(formObj);
        });
    };

    $.fn.CloseAllPanel = function (option) {
        $(this).find(".l-group").each(function () {
            var pannelId = $(this).attr("H3PanelId");
            var controlTb = $("div[H3PanelId='Control_" + pannelId + "']");
            var togglebtn = $("div[H3PanelId='togglebtn_" + pannelId + "']");
            if (controlTb.is(":hidden")) {
            }
            else {
                togglebtn.addClass("togglebtn-down");
                controlTb.hide();
            }
        });

        if (option) {
            if (option.excludeIDs) {
                for (var i = 0, j = option.excludeIDs.length; i < j; i++) {
                    $("#" + option.excludeIDs[i]).parent().parent().find(".l-group").each(function () {
                        var pannelId = $(this).attr("H3PanelId");
                        var controlTb = $("div[H3PanelId='Control_" + pannelId + "']");
                        var togglebtn = $("div[H3PanelId='togglebtn_" + pannelId + "']");
                        togglebtn.removeClass("togglebtn-down");
                        controlTb.show();
                    });
                }
            }
        }
    };
})(jQuery);
