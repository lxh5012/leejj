/*
 * 添加树形菜单工具按钮的方法：
 * 1.定义按钮
 * 2.在TreeToolBar里添加按钮；TreeToolBar的标示与树形菜单有ToolBarCode对应
 * 3.DoBtnActon里添加按钮执行方法
 * 根据上面3点就可以添加按钮，其他代码可以不理
 */

//多个节点会用到的按钮
var RefreshTree = { id: "RefreshTree", icon: "refresh", text: "刷新" };
var BizFolder = { id: "BizFolder", icon: "BizFolder", text: "新增目录" };
var BizWFFolder = { id: "BizWFFolder", icon: "BizWFFolder", text: "流程目录" };
var BizService = { id: "BizService", icon: "BizService", text: "添加业务服务" };
var BizObject = { id: "BizObject", icon: "BizObject", text: "数据模型" };
var BizMasterData = { id: "BizObject", icon: "BizObject", text: "主数据" };
var BizWorkflowPackage = { id: "BizWorkflowPackage", icon: "BizWorkflowPackage", text: "新建流程包" };
var BizSheet = { id: "BizSheet", icon: "BizSheet", text: "新增表单" };
var BizWorkflow = { id: "BizWorkflow", icon: "BizWorkflow", text: "新增流程" };
var BizWFFolderAcl = { id: "BizWFFolderAcl", icon: "SetAcl1", text: "权限设置" };
var BizDelete = { id: "BizDelete", icon: "delete", text: "删除" };
//业务服务菜单
var BizServiceMethod = { id: "BizServiceMethod", icon: "BizServiceMethod", text: "添加服务方法" };
//添加业务方法
var AddSchemaMethod = { id: "AddSchemaMethod", icon: "BizServiceMethod", text: "添加业务方法" };
//数据模型菜单
var BizSchemaView = { id: "BizSchemaView", icon: "BizSchemaView", text: "添加视图" };
var BizQuery = { id: "BizQuery", icon: "BizQuery", text: "添加查询" };
var BizListener = { id: "BizListener", icon: "BizListener", text: "添加监听" };
var BizScheduleInvoker = { id: "BizScheduleInvoker", icon: "BizScheduleInvoker", text: "添加定时作业" };
var BizSchemaAssociation = { id: "BizSchemaAssociation", icon: "BizSchemaAssociation", text: "添加关联关系" };
var CreateBizRuleTable = { id: "CreateBizRuleTable", icon: "add", text: "添加业务规则" };
var AddDecisionMatrix = { id: "AddDecisionMatrix", icon: "add", text: "添加规则决策" };
var ExportPackage = { id: "ExportPackage", icon: "down", text: "导出流程包" };
var ImportPackage = { id: "ImportPackage", icon: "up", text: "导入流程包" };

//节点添加按钮
var TreeToolBar = {
    //组织机构
    "TB_Company": [RefreshTree],
    //业务规则
    "TB_BizRule": [CreateBizRuleTable, RefreshTree],
    //规则实例的工具，添加决策表
    "BizRule": [AddDecisionMatrix, RefreshTree],
    //流程模型
    "TB_ProcessModel": [BizWFFolder, RefreshTree],
    //普通目录
    "BizFolder": [BizFolder, BizService, BizObject, BizDelete, RefreshTree],
    //流程目录
    "BizWFFolder": [BizWFFolder, BizWorkflowPackage, ImportPackage, BizWFFolderAcl, BizDelete, RefreshTree],
    //流程包
    "BizWorkflowPackage": [BizSheet, BizWorkflow, BizDelete, ExportPackage, RefreshTree],
    "BizService": [BizServiceMethod],
    //数据模型
    "BizObject": [AddSchemaMethod, BizSchemaView, BizQuery, BizScheduleInvoker, BizSchemaAssociation, RefreshTree],
    "BizSheet": [$.extend(false, { NodeType: "BizSheet" }, BizDelete)],
    "BizWorkflow": [$.extend(false, { NodeType: "BizWorkflow" }, BizDelete)],
    "TB_BizService": [BizService, RefreshTree],
    "TB_BizMasterData": [BizMasterData, RefreshTree],
    "TB_BizMethod": [AddSchemaMethod, RefreshTree]
};

//按钮操作
function DoBtnActon(btnObj, treeData) {
    switch (btnObj.id) {
        case RefreshTree.id:
            var nodeData = menuTree.getDataByID(treeData.Code) == null ? menuTree.getDataByID(treeData.ObjectID) : menuTree.getDataByID(treeData.Code);
            var nodeTarget = menuTree.getNodeDom(nodeData);
            $(nodeTarget).find(".l-children").remove();
            $(nodeTarget).find(".l-expandable-close").addClass("l-expandable-open").removeClass("l-expandable-close");
            nodeData.LoadDataUrl += "&Refresh=1";
            top.menuTree.loadData(nodeTarget, nodeData.LoadDataUrl);
            break;
        case BizFolder.id:
        case BizWFFolder.id:
            ShowDialog(btnObj.title, "ProcessModel/AddProcessFolder.aspx?ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code) + "&ObjectType=" + encodeURI(btnObj.id));
            break;
        case BizDelete.id:
            $.ligerDialog.confirm('确定删除？', function (result) {
                if (result) {
                    var nodeType = $(btnObj).attr("NodeType") == null ? "" : $(btnObj).attr("NodeType");
                    $.ajax({
                        url: "ProcessModel/AddProcessFolder.aspx?ID=" + encodeURI(treeData.ObjectID) + "&Code=" + encodeURI(treeData.Code) + "&DoDelete=True&NodeType=" + nodeType,
                        dataType: "json",
                        success: function (data) {
                            if (data.ResultCode == 1) {
                                top.workTab.removeTabItem(treeData.ObjectID);
                                top.ReloadNode(treeData.ParentID);
                            }
                            else {
                                top.$.H3Dialog.Error({ content: data.ResultMsg });
                            }
                        }
                    });
                }
            });
            break;
        case BizServiceMethod.id:
            ShowDialog(btnObj.title, "ProcessModel/EditBizServiceMethod.aspx?ServiceCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break;
        case BizObject.id://数据模型
            ShowDialog(btnObj.title, "ProcessModel/CreateBizObjectSchema.aspx?ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code) + "&ObjectType=" + encodeURI(btnObj.id));
            break;
        case BizSchemaView.id:
            ShowDialog(btnObj.title, "ProcessModel/EditBizObjectSchemaView.aspx?SchemaCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break
        case BizQuery.id:
            ShowDialog(btnObj.title, "ProcessModel/EditBizQuery.aspx?SchemaCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break
        case BizListener.id:
            ShowDialog(btnObj.title, "ProcessModel/EditListenerPolicy.aspx?SchemaCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break;
        case BizScheduleInvoker.id:
            ShowDialog(btnObj.title, "ProcessModel/EditScheduleInvoker.aspx?SchemaCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break;
        case BizSchemaAssociation.id:
            ShowDialog(btnObj.title, "ProcessModel/EditBizObjectSchemaAssociation.aspx?SchemaCode=" + encodeURI(treeData.Code) + "&ParentID=" + encodeURI(treeData.ObjectID));
            break;
        case BizService.id:
            top.f_addTab(
                {
                    tabid: new Date().getTime(),
                    text: BizService.text,
                    url: "ProcessModel/EditBizService.aspx?ParentID=" + encodeURI(treeData.ObjectID)
                });
            break;
        case BizWorkflowPackage.id:
            ShowDialog(BizWorkflowPackage.text, "ProcessModel/EditBizWorkflowPackage.aspx?ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code));
            break;
        case BizSheet.id:
            ShowDialog(BizSheet.text, "ProcessModel/WorkSheetEdit.aspx?ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code));
            break;
        case BizWFFolderAcl.id:
            top.f_addTab(
                {
                    tabid: treeData.ObjectID + "_" + BizWFFolderAcl.id,
                    text: treeData.Text + "_" + BizWFFolderAcl.text,
                    url: "ProcessModel/WorkflowFolderAcl.aspx?WorkflowFolderCode=" + encodeURI(treeData.Code)
                });
            break;
        case BizWorkflow.id:
            ShowDialog(BizWorkflow.text, "ProcessModel/EditBizWorkflowPackage.aspx?ObjectType=" + BizWorkflow.id + "&ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code));
            break;
        case AddSchemaMethod.id:
            var schemaCode = encodeURI(treeData.Code.replace("_MDMethod", ""));
            var parentID = encodeURI(treeData.ObjectID);
            ShowDialog(AddSchemaMethod.text, "ProcessModel/EditBizObjectSchemaMethod.aspx?SchemaCode=" + schemaCode + "&ParentID=" + parentID);
            break;
        case CreateBizRuleTable.id:
            var parentID = encodeURI(treeData.ObjectID);
            //ShowDialog(CreateBizRuleTable.text, "BizRule/EditBizRuleTable.aspx?ParentID=" + parentID);
            top.f_addTab(
                {
                    tabid: parentID,
                    text: CreateBizRuleTable.text,
                    url: "BizRule/EditBizRuleTable.aspx?ParentID=" + parentID
                });
            break;
        case AddDecisionMatrix.id:
            var parentID = encodeURI(treeData.ObjectID);
            var parentCode = encodeURI(treeData.Code);
            top.f_addTab(
                {
                    tabid: new Date().getTime(),
                    text: AddDecisionMatrix.text,
                    url: "BizRule/EditBizRuleDecisionMatrix.aspx?ParentID=" + parentID + "&RuleCode=" + parentCode
                });
            break;
        case ExportPackage.id://导出流程包
            var iframeObj = $("ExportPackageiframe").length == 0 ? $("<iframe id='ExportPackageiframe'></iframe>") : $("ExportPackageiframe");
            iframeObj.hide();
            iframeObj.appendTo($("body"));
            iframeObj.attr("src", "ProcessModel/PackageExportHandler.aspx?PackageCode=" + encodeURI(treeData.Code));
            break;
        case ImportPackage.id://导入流程包
            ShowDialog
                (
                    ImportPackage.text,
                    "ProcessModel/PackageImportHandler.aspx?ParentID=" + encodeURI(treeData.ObjectID) + "&ParentCode=" + encodeURI(treeData.Code)
                );
            break;
        default:
            alert("[" + btnObj.title + "],该功能还未实现");
            break;
    }
}

$(function () {
    $("#treeToolbar").hover(function () { $(this).show(); }, function () { CreanTreeBar(); });

    document.onclick = function (e) {
        var e = e ? e : window.event;
        var tar = e.srcElement || e.target;
        if (tar != null
            && tar.id != "treeToolbar"
            && tar.offsetParent != null
            && tar.offsetParent.id != "menuTree") {
            $("#treeToolbar").hide()
        }
    }
});

function CreanTreeBar() {
    $("#treeToolbar").attr("ToolBarCode", null)
    $("#treeToolbar").html("");
    $("#treeToolbar").hide();
}

//添加工具栏
function ItemOver(node, e) {
    if ($("#treeToolbar").attr("ToolBarCode") == node.data.ObjectID)
        return;
    CreanTreeBar();

    if (node.data.ToolBarCode == null)
        return;
    var btns = TreeToolBar[node.data.ToolBarCode];
    if (btns == null) {
        return;
    }
    if (btns.length == 0) {
        return;
    }
    var l_body = $(node.targetItem);
    var span = l_body.children("span");
    var fontsize = 12;
    var iocn = l_body.children("div.l-tree-icon");
    var btnDiv = $("#treeToolbar").css("position", "absolute");
    btnDiv.attr("ToolBarCode", node.data.ObjectID);

    for (var i = 0; i < btns.length; i++) {
        btns[i].render = function () {
            CreanTreeBar();
            DoBtnActon(this, node.data);
        };
    }
    btnDiv.TreeToolBar({ items: btns });

    //计算文本宽度
    var preObject = $("<pre>").hide().html(span.text()).appendTo(document.body);
    var spanWidth = preObject.width();
    preObject.remove();

    btnDiv.css("top", iocn.offset().top);
    btnDiv.css("left", iocn.offset().left + spanWidth + 30);
    btnDiv.css("z-index", 100);
    btnDiv.show();
}

function ItemOut(node) {
    //CreanTreeBar();
}

//树型菜单的工具栏
(function ($) {
    $.fn.TreeToolBar = function (options) {
        _buildBatItem = function (item) {
            var barItem = $('<div class="l-toolbar-item l-panel-btn l-toolbar-item-hasicon" style="width:22px;padding:0px;"><div class="l-panel-btn-l"></div><div class="l-panel-btn-r"></div></div>');
            barItem.append("<div class='l-icon l-icon-" + item.icon + "' style='left:0px'></div>");
            barItem.attr("title", item.text);
            barItem.attr("id", item.id);

            if (item.NodeType != null) {
                barItem.attr("NodeType", item.NodeType);
            }

            if (item.render) {
                barItem.bind("click", item.render);
            }

            barItem.hover(function () {
                if ($(this).hasClass("l-toolbar-item-disable")) return;
                $(this).addClass("l-panel-btn-over");
            }, function () {
                if ($(this).hasClass("l-toolbar-item-disable")) return;
                $(this).removeClass("l-panel-btn-over");
            });
            return barItem;
        }

        return $(this).each(function () {
            var treeBar = $(this);
            //按钮数量
            var items = options.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                treeBar.append(new _buildBatItem(item));
            }
            treeBar.css("background", "#ffe3ff");
            return treeBar;
        });
    }
})(jQuery);

