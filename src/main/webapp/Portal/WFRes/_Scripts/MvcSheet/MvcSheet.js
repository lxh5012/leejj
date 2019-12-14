//JS框架,JS框架加载所有JS部件，提供与后台通讯方法

//属性定义
//定义MvcSheet命名控件
jQuery.extend({
    MvcSheet: {
        Version: "V1.0",
        AjaxUrl: "MvcDefaultSheet/OnLoad",
        LOADKEY: "load", // 加载表单
        Actions: [], // 执行事件:保存、提交...
        InitFunctions: [], // 初始化之前的函数集合
        ReadyFunctions: [], // 加载完成需要执行事件集合
        //ActionKey
        Action_Save: "Save",
        Action_WorkflowComment: "WorkflowComment", // 评论
        Action_ViewInstance: "ViewInstance",
        Action_PreviewParticipant: "PreviewParticipant",
        Action_Print: "Print",
        Action_CancelInstance: "CancelInstance",
        Action_Reject: "Reject",
        Action_Submit: "Submit",
        Action_FinishInstance: "FinishInstance",
        Action_Forward: "Forward",
        Action_Assist: "Assist",
        Action_Consult: "Consult",
        Action_Circulate: "Circulate",
        Action_AdjustParticipant: "AdjustParticipant",
        Action_LockInstance: "LockInstance",
        Action_UnLockInstance: "UnLockInstance",
        Action_Close: "Close",
        Action_RetrieveInstance: "RetrieveInstance",
        Action_Viewed: "Viewed", //已阅

        //默认Actions
        SaveAction: {
            Action: "Save",
            Icon: "fa-save",
            Text: "保存",
            en_us: "Save",
            OnActionPreDo: null,
            OnActionDone: null
        },
        WorkflowCommentAction: {
            Action: "WorkflowComment",
            Icon: "fa-urgent",
            Text: "评论",
            en_us: "WorkflowComment",
            OnActionPreDo: null,
            OnActionDone: null
        },
        PrintAction: {
            Action: "Print",
            Icon: "fa-print",
            Text: "打印",
            en_us: "Print",
            OnActionDone: function () {
            }
        },
        ViewedAction: {
            Action: "Viewed",
            Icon: "fa-check",
            Text: "已阅",
            en_us: "View",
            OnActionDone: function () {
            }
        },
        CancelInstanceAction: {
            Action: "CancelInstance",
            Icon: "fa-square-o",
            en_us: "Cancel",
            Text: "取消流程"
        },
        SubmitAction: {
            Action: "Submit",
            Icon: "fa-check",
            Text: "提交",
            en_us: "Submit",
            OnActionDone: function () {
            }
        },
        RejectAction: {
            Action: "Reject",
            Icon: "fa-mail-reply",
            Text: "驳回",
            en_us: "Reject",
            OnActionDone: function () {
            }
        },
        RetrieveInstanceAction: {
            Action: "RetrieveInstance",
            Icon: "fa-sign-in",
            en_us: "Retrieve",
            Text: "取回"
        },
        ViewInstanceAction: {
            Action: "ViewInstance",
            Icon: "fa-ellipsis-v",
            Text: "流程状态",
            en_us: "State"
        },
        PreviewParticipantAction: {
            Action: "PreviewParticipant",
            Icon: "fa-coumns",
            Text: "预览",
            en_us: "Preview"
        },
        FinishInstanceAction: {
            Action: "FinishInstance",
            Icon: "fa-square",
            Text: "结束流程",
            en_us: "Finish Instance"
        },
        // UrgentAction: {
        //     Action: "Urgent",
        //     Icon: "fa-urgent",
        //     Text: "评论",
        //     en_us: "Urgent",
        //     OnActionPreDo: null,
        //     OnActionDone: function () {
        //     }
        // },
        ForwardAction: {
            Action: "Forward",
            Icon: "fa-mail-forward",
            Text: "转办",
            en_us: "Forward"
        },
        AssistAction: {
            Action: "Assist",
            Icon: "fa-qrcode",
            Text: "协办", // zaf
            en_us: "Assist"
        },
        ConsultAction: {
            Action: "Consult",
            Icon: "fa-phone",
            Text: "征询意见",
            en_us: "Consult"
        },
        CirculateAction: {
            Action: "Circulate",
            Icon: "fa-share-square-o",
            Text: "传阅",  // zaf
            en_us: "Circulate"
        },
        AdjustParticipantAction: {
            Action: "AdjustParticipant",
            Icon: "fa-random",
            Text: "加签",
            en_us: "Plus"
        },
        LockInstanceAction: {
            Action: "LockInstance",
            Icon: "fa-unlock-alt",
            Text: "锁定",
            en_us: "Lock"
        },
        UnLockInstanceAction: {
            Action: "UnLockInstance",
            Icon: "fa-unlock-alt",
            Text: "解锁",
            en_us: "UnLock"
        },
        CloseAction: {
            Action: "Close",
            Icon: "fa-times",
            Text: "关闭",
            en_us: "Close"
        }
    }
});

// 装载JSON文件
var loadJSON = function (key, url) {
    if (window.sessionStorage.getItem(key)) {
        return JSON.parse(window.sessionStorage.getItem(key));
    }
    else {
        $.ajax({
            url: url,
            dataType: "JSON",
            type: "GET",
            async: false,//同步执行
            success: function (data) {
                window.sessionStorage.setItem(key, JSON.stringify(data));
            }
        });
        return JSON.parse(window.sessionStorage.getItem(key));
    }
};

if (!$.uuid) {
    $.uuid = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };
}

//函数定义
jQuery.extend(
    $.MvcSheet, {
        //初始化
        Init: function (_AfterMvcInit) {
            var params = "";
            if (window.location.href.indexOf("?") > -1) {
                params = window.location.href.substring(window.location.href.indexOf("?"));
            }
            // console.time('testForEach');
            this.AjaxUrl += params + "&T=" + (Math.random() * 1000000).toString().substring(0, 6);
            this.LoadData(_AfterMvcInit);
            // console.timeEnd('testForEach');
        },
        //初始化工具栏
        InitToolBar: function () {
            //工具栏
            if ($.MvcSheet.Actions.length == 0) {
                $.MvcSheet.AddDefaultActions();
            }

            //新版移动端移从toolbar移除流程状态
            if ($.MvcSheetUI.SheetInfo.IsMobile) {
                $.MvcSheet.Actions.forEach(function (v, i) {
                    if (v.Action == 'ViewInstance') {
                        $.MvcSheet.Actions.splice(i, 1);
                        return;
                    }
                })
            }

            var manager = $(".SheetToolBar").SheetToolBar($.MvcSheet.Actions);

            if ($.MvcSheetUI.SheetInfo.IsMobile) {
                var _Actions = [];
                var _GetProxy = function (_thatAction, _actionKey) {
                    return {
                        text: _thatAction.Text,
                        handler: function () {
                            _thatAction.ActionClick();
                        },
                        actionKey: _actionKey
                    }
                }

                //FIXME luwei bug here manager maybe undefined
                for (_Action in manager.ControlManagers) {
                    var that = manager.ControlManagers[_Action];
                    if (that.MobileVisible) {
                        _Actions.push(_GetProxy(that, _Action));
                    }
                };

                //修改成IONIC
                var _ActionButton = $("#dvmButtons"); //$("#btnShowActions");
                //无按钮
                if (_Actions.length == 0) {
                    _ActionButton.hide();
                    _ActionButton.parents('ion-footer-bar').siblings('ion-content').removeClass('has-footer').end().remove();
                }

                //update by zyj  .net 版本
                else if (_Actions.length < 4) {
                    _Actions.forEach(function (e) {
                        var strClass = "icon-left";
                        if (e.actionKey == "Reject") {
                            e.Text = SheetLanguages.Current.Reject;
                        }
                        if (e.actionKey == "Submit") {
                        }
                        var button = $("<button class=\"button foot-button " + strClass + " button-clear \"></button>")
                        button.text(e.text);
                        button.unbind("click." + e.actionKey).bind("click." + e.actionKey, function () {
                            //移动端流程表单关闭功能 zcw
                            var reg = new RegExp("(^|&)" + "go" + "=([^&]*)(&|$)", "i");
                            var r = window.location.search.substr(1).match(reg);
                            var go;
                            try {
                                go = unescape(r[2]);
                            } catch (error) {
                            }

                            if (go == -2 && e.actionKey == "Close") {
                                //update by ouyangsk 采用钉钉提供的关闭方法
                                //window.history.back();
                                if ($.MvcSheetUI.IonicFramework.$rootScope && $.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk") {
                                    dd.biz.navigation.close({});
                                } else if ($.MvcSheetUI.IonicFramework.$rootScope && $.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "wechat") {
                                    WeixinJSBridge.call("closeWindow");
                                } else {
                                    manager.ControlManagers[e.actionKey].ActionClick();
                                }
                            } else {
                                manager.ControlManagers[e.actionKey].ActionClick();
                            }
                        })
                        _ActionButton.append(button);
                    })
                }
                //多个按钮
                else {
                    var moreActions = [];
                    _Actions.forEach(function (e) {
                        if (e.actionKey == "Reject" || e.actionKey == "Submit") {
                            var strClass = "icon-left";
                            if (e.actionKey == "Reject") {
                                e.text = SheetLanguages.Current.Reject;
                            } else {
                                e.text = SheetLanguages.Current.Approve;
                                manager.ControlManagers[e.actionKey].Text = SheetLanguages.Current.Approve;
                            }
                            var button = $("<button class=\"button foot-button " + strClass + " button-clear \"></button>")
                            button.text(e.text);
                            button.unbind("click." + e.actionKey).bind("click." + e.actionKey, function () {

                                manager.ControlManagers[e.actionKey].ActionClick();
                            })
                            _ActionButton.append(button);
                        } else {
                            moreActions.push(e);
                        }
                    })

                    if (moreActions.length > 0) {
                        var btnMore = $("<button class=\"button foot-button icon-left button-clear\">" + SheetLanguages.Current.More + "</button>")
                        var buttonsA = [];
                        moreActions.forEach(function (action) {
                            buttonsA.push({
                                text: action.text
                            });
                        });

                        btnMore.unbind("click.moreaction").bind("click.moreaction", function () {
                            console.log('oye!');
                            var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                                buttons: buttonsA,
                                cancelText: SheetLanguages.Current.Cancel,
                                cancel: function () {
                                    return false;
                                },
                                buttonClicked: function (index) {
                                    // console.log(index, 'index')
                                    // debugger
                                    moreActions[index].handler();
                                    return true;
                                }
                            });
                            //$timeout(function () {
                            //    hideSheet();
                            //}, 10000);
                        });
                        _ActionButton.append(btnMore);
                    }
                }
            }
            var _PORTALROOT_GLOBAL = window.localStorage.getItem("H3.PortalRoot") || "";
            //公共地址
            $.PublicAddress = loadJSON("PublicAddressData", "lang/PublicAddressData.json");
        },
        //初始化HiddenFields
        InitHiddenFields: function () {
            $("input:hidden").each(function () {
                if ($(this).data("type") == "SheetHiddenField") {
                    $(this).SheetHiddenField();
                }
            });
        },
        // 加载数据-表单onLoad事件
        LoadData: function (_AfterMvcInit) {
            var that = this;
            this.GetSheet(
                {
                    "Command": this.LOADKEY,
                    "Lang": window.localStorage.getItem("H3.Language")
                },
                function (data) {
                    $.MvcSheetUI.SheetInfo = data;
                    $.MvcSheetUI.SheetInfo.Language = window.localStorage.getItem("H3.Language");
                    //处理表单锁
                    if (data.Message) {
                        if (data.Close) {
                            if ($.MvcSheetUI.IonicFramework.$rootScope && $.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk") {
                                dd.device.notification.alert({
                                    message: data.Message,
                                    title: "提示", //可传空
                                    buttonName: "确定",
                                    onSuccess: function () {
                                        dd.biz.navigation.close({
                                            onSuccess: function (result) {
                                            },
                                            onFail: function (err) {
                                            }
                                        });
                                    },
                                    onFail: function (err) {
                                    }
                                });
                            } else if ($.MvcSheetUI.IonicFramework.$rootScope && $.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "wechat") {
                                alert(data.Message)
                                setTimeout(function () {
                                    WeixinJSBridge.call("closeWindow");
                                }, 1000)
                            } else {
                                alert(data.Message)
                                setTimeout(function () {
                                    $.MvcSheet.ClosePage();
                                }, 1000)
                            }
                            return;
                        }
                    }

                    //添加自定义javascript扩展的输出
                    if ($.MvcSheetUI.SheetInfo.PageScript) {
                        var pagescript = $('<script type="text/javascript">' + $.MvcSheetUI.SheetInfo.PageScript + '</script>');
                        $('body').append(pagescript);
                    }

                    // 初始化语言
                    $.MvcSheet.PreInitLanguage();

                    // 添加征询意见DOM元素，与数据项Sheet__ConsultComment关联
                    if ($.MvcSheetUI.SheetInfo.IsMobile) {
                        $(".divContent:last").append('<div class="list"><div class="item item-input"><span data-type="SheetLabel" class="input-label" data-datafield="Sheet__ConsultComment">'+SheetLanguages.Current.ConsultComment+'<</span><div class="detail"><div data-datafield="Sheet__ConsultComment" data-type="SheetComment"></div></div></div></div>');
                        $(".divContent:last").append('<div class="list"><div class="item item-input"><span data-type="SheetLabel" class="input-label" data-datafield="Sheet__AssistComment">'+SheetLanguages.Current.AssistComment+'</span><div class="detail"><div data-datafield="Sheet__AssistComment" data-type="SheetComment"></div></div></div></div>');
                        $(".divContent:last").append('<div class="list"><div class="item item-input"><span data-type="SheetLabel" class="input-label" data-datafield="Sheet__ForwardComment">'+SheetLanguages.Current.ForwardComment+'</span><div class="detail"><div data-datafield="Sheet__ForwardComment" data-type="SheetComment"></div></div></div></div>');
                    }
                    else {
                        $(".divContent:last").append('<div class="row tableContent"><div class="col-md-2"><span data-type="SheetLabel" data-datafield="Sheet__ConsultComment">'+SheetLanguages.Current.ConsultComment+'</span></div><div class="col-md-10"><div data-datafield="Sheet__ConsultComment" data-type="SheetComment"></div></div></div>');
                        $(".divContent:last").append('<div class="row tableContent"><div class="col-md-2"><span data-type="SheetLabel" data-datafield="Sheet__AssistComment">'+SheetLanguages.Current.AssistComment+'</span></div><div class="col-md-10"><div data-datafield="Sheet__AssistComment" data-type="SheetComment"></div></div></div>');
                        $(".divContent:last").append('<div class="row tableContent"><div class="col-md-2"><span data-type="SheetLabel" data-datafield="Sheet__ForwardComment">'+SheetLanguages.Current.ForwardComment+'</span></div><div class="col-md-10"><div data-datafield="Sheet__ForwardComment" data-type="SheetComment"></div></div></div>');
                    }
                    $.MvcSheet.PreInit.apply(this, [$.MvcSheetUI.SheetInfo]);

                    // 初始化事件
                    if ($.MvcSheet.InitFunctions.length > 0) {
                        for (var i = 0; i < $.MvcSheet.InitFunctions.length; i++) {
                            $.MvcSheet.InitFunctions[i].call(this, $.MvcSheetUI.SheetInfo);
                        }
                    }

                    //顶部操作工具栏
                    $.MvcSheet.InitToolBar();

                    //判断元素类型，渲染成MvcControl
                    var datafields = $("[" + $.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase() + "]");
                    // 子表中的控件会在子表中进行初始化，故过滤掉子表模板行中的控件
                    var filterDataFields = []; // 正常顺序加载的控件
                    var delayDataFields = []; // 需要延迟加载的控件
                    for (var i = 0, len = datafields.length; i < len; i++) {
                        var datafield = datafields[i];
                        if (datafield.tagName.toLowerCase() == "table") {
                            delayDataFields.push(datafield);
                        } else if ($(datafield).parents("tr.template").length == 0) {
                            filterDataFields.push(datafield);
                        }
                    }
                    for (i = 0, len = filterDataFields.length; i < len; i++) {
                        $(filterDataFields[i]).SheetUIManager();
                    }
                    for (i = 0, len = delayDataFields.length; i < len; i++) {

                        $(delayDataFields[i]).SheetUIManager();
                    }
                    //HiddenFields
                    $.MvcSheet.InitHiddenFields();

                    //移动端布局
                    if ($.MvcSheetUI.SheetInfo.IsMobile) {
                        $("ion-content").removeClass("ng-cloak");
                    }
                    else {
                        //处理不可见布局
                        $("div[class^='col-md-']").each(function () {
                            var needHide = true;
                            if ($(this).text()) {
                                needHide = false;
                            } else {
                                var DataFieldElements = $(this).find("[" + $.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase() + "]");
                                for (var i = 0; i < DataFieldElements.length; i++) {
                                    var manager = $(DataFieldElements).SheetUIManager();
                                    if (!manager) {
                                        var datafield = $(DataFieldElements).attr($.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase());
                                        alert("数据项:{" + datafield + "}不存在");
                                        return;
                                    }
                                    if (manager.Visiable) {
                                        needHide = false;
                                        break;
                                    }
                                }
                            }
                            if (needHide) {
                                $(this).hide();
                            }
                        });

                        //处理不可见布局
                        $("div[class='row']").each(function () {
                            if ($(this).find("div:visible[class^='col-md-']").length == 0) {
                                $(this).hide();
                            }
                        });
                    }
                    if (typeof(_AfterMvcInit) == "function") {
                        _AfterMvcInit();
                    }
                    $.MvcSheet.RenderLanguage(); // 多语言初始化
                    $.MvcSheet.Rendered.apply(this, [$.MvcSheetUI.SheetInfo]);
                    // $.MvcSheetUI.Loading = false;
                    // $.LoadingMask.Hide();
                    $.MvcSheet.Loaded.apply(this, [$.MvcSheetUI.SheetInfo]);

                    if ($.MvcSheet.ReadyFunctions.length > 0) {
                        for (var i = 0; i < $.MvcSheet.ReadyFunctions.length; i++) {
                            $.MvcSheet.ReadyFunctions[i].call(this, $.MvcSheetUI.SheetInfo);
                        }
                    }
                },
                function (e) {
                    // $.MvcSheetUI.Loading = false;
                    // $.LoadingMask.Hide();
                    alert("表单数据加载失败，请稍候再试!");
                },
                false, //false-同步-true异步  加载数据
                function () {
                    var loadText = "正在努力加载...";
                    $.MvcSheetUI.Loading = true;
                    if (that.AjaxUrl.toLowerCase().indexOf("ismobile") > -1) {
                        loadText = "";
                        $.LoadingMask.Show(loadText, false);
                    }
                },
                function () {
                    $.MvcSheetUI.Loading = false;
                    $.LoadingMask.Hide();
            })
        },
        //MvcSheet完成事件
        Ready: function (fn) {
            $.MvcSheet.ReadyFunctions.push(fn);
        },
        PreInitLanguage: function () {
            var language = $.MvcSheetUI.SheetInfo.Language;
            if (typeof(SheetLanguages[language]) == "undefined" || SheetLanguages[language] == null) {
                language = "zh_cn";
            }
            //update by ouyangsk 处理移动端有时获取不到SheetLanguages语言文件的问题
            if (!language || language == "null") {
                language = "zh_cn";
            }
            $.extend(SheetLanguages.Current, SheetLanguages[language]);
        },
        RenderLanguage: function () {
            // 多语言初始化
            var language = $.MvcSheetUI.SheetInfo.Language;
            if (language) {
                language = $.MvcSheetUI.PreDataKey + language.replace("-", "_");
                $("span[" + language + "],label[" + language + "]").each(function () {
                    $(this).html($(this).attr(language));
                });
            }
            //手机端基本信息特殊处理
            if ($.MvcSheetUI.SheetInfo.IsMobile == true) {
                //发起人
                $("#divFullName .input-label").text(SheetLanguages.Current.BasicInfo.divFullName);
                //发起时间
                $("#divOriginateDate .input-label").text(SheetLanguages.Current.BasicInfo.divOriginateDate);
                //所属组织
                $($("#divOriginateOUName .input-label")[0]).text(SheetLanguages.Current.BasicInfo.divOriginateOUName);
                //流水号
                $("#divSequenceNo .input-label").text(SheetLanguages.Current.BasicInfo.divSequenceNo);
            }
        },
        PreInit: function () {
        },
        PreLoad: function (fn) {
            $.MvcSheet.InitFunctions.push(fn);
        },
        Loaded: function () {
        },
        Rendered: function () {
            // 注册输入框鼠标样式
            $("input,textarea,select").addClass($.MvcSheetUI.Css.inputMouseOut).unbind("mouseover.style").bind("mouseover.style",
                function () {
                    var target = $(this);
                    if (target.parent().is("li") && target.parent().parent().parent().is("div")) {
                        target = target.parent().parent().parent();
                    }
                    target.removeClass($.MvcSheetUI.Css.inputMouseOut).addClass($.MvcSheetUI.Css.inputMouseMove);
                })
                .unbind("mouseenter.style").bind("mouseenter.style",
                function () {
                    var target = $(this);
                    if (target.parent().is("li") && target.parent().parent().parent().is("div")) {
                        target = target.parent().parent().parent();
                    }
                    target.removeClass($.MvcSheetUI.Css.inputMouseMove).addClass($.MvcSheetUI.Css.inputMouseEnter);
                })
                .unbind("mouseout.style").bind("mouseout.style",
                function () {
                    var target = $(this);
                    if (target.parent().is("li") && target.parent().parent().parent().is("div")) {
                        target = target.parent().parent().parent();
                    }
                    target.removeClass($.MvcSheetUI.Css.inputMouseEnter).removeClass($.MvcSheetUI.Css.inputMouseMove).addClass($.MvcSheetUI.Css.inputMouseOut);
                });

            if ($.MvcSheetUI.SheetInfo.IsMobile) {
                var selects = $("select[data-datafield]");
                if (selects && selects.length > 0) {
                    for (var i = 0; i < selects.length; i++) {
                        var manager = $(selects[i]).SheetUIManager();
                        if ($(selects[i]).attr("data-datafield").indexOf('.') > -1) {
                            manager = $(selects[i]).SheetUIManager($(selects[i]).parent().parent().attr("data-row"));
                        }
                        if (manager && !manager.Editable) {
                            if ($.MvcSheetUI.SheetInfo.IsOriginateMode && $(selects[i]).attr("data-datafield") == "Originator.OUName" && $(selects[i]).find("option").length > 1)
                                break;
                            $(selects[i]).siblings(".afFakeSelect").hide();
                        }
                    }
                }
            }
            // 原表单运行对象-待合并之后完全删除
            $.MvcSheetUI.MvcRuntime = new Sheet();
        },
        //执行动作: {Action:"方法名称",Datas:[{数据项1},{数据项2}]}
        Action: function (actionControl) {
            if (typeof(actionControl.Mask) == "undefined" || actionControl.Mask) {
                $.LoadingMask.Show((actionControl.Text || SheetLanguages.Current.Doing) + "...");
            }

            //执行动作标示
            var actionName = actionControl.Action;
            //参数：[{数据项1},{数据项2},...]或["#ID1"，"#ID2",...]或["数据1","数据2"]或混合
            var datas = actionControl.Datas;
            //构造数据项的值
            var CommandParams = {
                Command: actionName
            };
            var params = [];
            if (typeof(actionControl.LoadControlValue) == "undefined" || actionControl.LoadControlValue) {
                if (datas) {
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i].toString().indexOf("{") == 0) {
                            var key = datas[i].replace("{", "").replace("}", "");
                            params.push($.MvcSheetUI.GetControlValue(key));
                        } else if (datas[i].toString().indexOf("#") == 0) {
                            var key = datas[i].replace("#");
                            params.push($.MvcSheetUI.GetControlValue(datas[i]));
                        } else {
                            params.push(datas[i]);
                        }
                    }
                }
            } else {
                params = datas;
            }

            CommandParams["Param"] = JSON.stringify(params);
            if (actionControl.PostSheetInfo) {
                CommandParams["MvcPostValue"] = JSON.stringify(this.GetMvcPostValue(this.actionName));
            }
            var that = this;
            //提交到后台执行
            this.PostSheet(
                CommandParams,
                function (data) {
                    if (actionControl.OnActionDone) {
                        actionControl.OnActionDone.apply(actionControl, [data]);
                    }
                    that.ResultHandler.apply(that, [actionControl, data]);
                    if (actionControl.CloseAfterAction) {
                        $.MvcSheet.ClosePage();
                    }
                    $.LoadingMask.Hide();
                },
                undefined,
                actionControl.Async);
        },
        // 弹出消息确认框
        AlertAction: function (message, doneCallback) {
            if ($.MvcSheetUI.IonicFramework.$ionicPopup) {
                var myPopup = $.MvcSheetUI.IonicFramework.$ionicPopup.show({
                    cssClass: 'bpm-sheet-AlertAction',
                    template: '<span>' + message + '<span>',
                    buttons: [{
                        text: SheetLanguages.Current.Confirm,
                        type: 'button-clear',
                        onTap: function (e) {
                            doneCallback();
                        }
                    }
                    ]
                });
            } else if (alert(message)) {
                doneCallback();
            }
        },
        // 弹出消息确认/取消框
        ConfirmAction: function (message, doneCallback) {
            if ($.MvcSheetUI.IonicFramework.$ionicPopup) {
                var myPopup = $.MvcSheetUI.IonicFramework.$ionicPopup.show({
                    cssClass: 'bpm-sheet-ConfirmAction',
                    template: '<span>' + message + '<span>',
                    buttons: [{
                        text: SheetLanguages.Current.Cancel,
                        type: 'button-clear'
                    }, {
                        text: SheetLanguages.Current.Confirm,
                        type: 'button-clear',
                        onTap: function (e) {
                        //    debugger
                            console.log(e)
                            doneCallback();
                        }
                    }
                    ]
                });
            } else if (confirm(message)) {
                doneCallback();
            }
        },
        //校验
        ActionValidata: function (actionControl, effective) {
            var result = true;
            if (this.Validate) {
                result = this.Validate.apply(actionControl);
            }

            if (result || result == undefined) {
                return $.MvcSheetUI.Validate(actionControl, effective);
            } else
                return false;
        },
        // 评论
        WorkflowComment: function(actionControl) {
            if (actionControl.IsMobile) {
                // 传值
                $.MvcSheetUI.actionCommentParam = {
                    title: actionControl.text,//标题
                    Action: actionControl.Action,
                    DisplayName: actionControl.SheetInfo.DisplayName,
                    UserName: actionControl.SheetInfo.UserName,
                    OriginatorOU: actionControl.SheetInfo.OriginatorOU,
                    Text: actionControl.text,
                    UserId: actionControl.SheetInfo.UserID,
                    workItemId: $.MvcSheetUI.SheetInfo.WorkItemId
                };
                $.MvcSheetUI.IonicFramework.$state.go("form.commentDetail");
            }
        },
        //保存
        Save: function (actionControl) {
            if (!$.MvcSheet.ActionValidata(actionControl, true))
                return false;
            $.LoadingMask.Show(SheetLanguages.Current.Saving);
            var SheetPostValue = this.GetMvcPostValue(this.Action_Save);
            var that = this;
            this.PostSheet({
                    Command: this.Action_Save,
                    MvcPostValue: JSON.stringify(SheetPostValue)
                },
                function (data) {
                    that.ResultHandler.apply(that, [actionControl, data]);
                });
        },
        //提交
        Submit: function (actionControl, text, destActivity, postValue) {
            if ($.MvcSheetUI.SheetInfo.IsMobile) {
                var controls = $("#divSheet input[data-type='SheetTextBox']");
                controls.each(function () {
                    $(this).trigger("change");
                });
            }
            if (!$.MvcSheet.ActionValidata(actionControl))
                return false;
            var that = this;
            // debugger
            // console.log(text)
            $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfirmDo + "【" + text + "】" + SheetLanguages.Current.Operation + "?", function () {
                //创建离职专兼职流程专用
                // var InstanceId = "cf7b346c-3120-429f-bfdb-fb32ca5bc10e;5315d3be-b657-4f14-b1d9-928d6811634e;1a6c673d-be56-4480-ad5c-4a966bbcca56;93f73a16-fac4-4ac7-87fb-0a6970a1200c;";
                // if (InstanceId.indexOf($.MvcSheetUI.SheetInfo.InstanceId) == -1) {
                //     if ($.MvcSheetUI.SheetInfo.WorkflowCode == "DimissionFullTime" &&
                //         $.MvcSheetUI.SheetInfo.WorkItemType != "WorkItemAssist") {
                //         var text22;
                //         if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity24") {
                //             var request_id = $.MvcSheetUI.SheetInfo.InstanceId;
                //             var workcode = $.MvcSheetUI.SheetInfo.BizObject.DataItems.EmployeeID.V;
                //             var SQRSJ = $.MvcSheetUI.SheetInfo.BizObject.DataItems.Phone.V;
                //             var personal_email = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GEEmail.V;
                //             var data = $.MvcSheetUI.SheetInfo.BizObject.DataItems.OriginateTime.V;
                //             var submitted_at = data;
                //             var empl_rcd = "0";
                //             var company_code = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GSBH.V;
                //             var data3 = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZRQ.V;
                //             var data4 = data3.substring(0, 10);
                //             var expect_leaving_on = data4;
                //             if ($("div[data-datafield='SPQXJJMan']").text() == "") {
                //                 var ss2 = "";
                //             } else {
                //                 var ss2 = $.MvcSheetUI.SheetInfo.BizObject.DataItems.SPQXJJMan.V[0].Code;
                //             }
                //
                //             var work_to = ss2.substring(30, 36); //"038148";
                //             var leader_role_to = ss2.substring(30, 36); //"038148";
                //             var hrbp_restraint_of_trade;
                //             if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "解除") {
                //                 hrbp_restraint_of_trade = "1"
                //             }
                //             if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "不解除") {
                //                 hrbp_restraint_of_trade = "2"
                //             }
                //             if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "无竞业限制") {
                //                 hrbp_restraint_of_trade = "0"
                //             }
                //
                //             var hrbp_reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HR_LZYY.V == "" ? $.MvcSheetUI.GetElement("HR_LZYY").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.HR_LZYY.V;
                //             //var hrbp_reason_of_leaving = "A01";
                //             var reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V == "" ? $.MvcSheetUI.GetElement("LZYY").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V;
                //             //var reason_of_leaving = "A02";
                //             //var lzlx = $.MvcSheetUI.GetControlValue('LZType');
                //             //modify by kinson.guo临时改为这个
                //             var lzlx = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZType.V == "" ? $.MvcSheetUI.GetControlValue('LZType') : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZType.V;
                //             var hrbp_type_of_leaving;
                //             if (lzlx == "主动离职") {
                //                 hrbp_type_of_leaving = "1";
                //             }
                //
                //             if (lzlx == "被动离职") {
                //                 hrbp_type_of_leaving = "2";
                //             }
                //             var hrbp_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HR_BPFK.V;
                //             var hrd_feedback = "";
                //             var direct_leader_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.YWJXorZJSJFK.V;
                //             var indirect_leader_feedback = "";
                //
                //             var nonce = Math.floor((new Date()).valueOf() / 1000);
                //             var key = "375fccaaf3f6372aa60904188c87f3e739101765";
                //             var allin =
                //                 "company_code=" + company_code +
                //                 "&direct_leader_feedback=" + direct_leader_feedback +
                //                 "&empl_rcd=" + empl_rcd +
                //                 "&expect_leaving_on=" + expect_leaving_on +
                //                 "&hrbp_feedback=" + hrbp_feedback +
                //                 "&hrbp_reason_of_leaving=" + hrbp_reason_of_leaving +
                //                 "&hrbp_restraint_of_trade=" + hrbp_restraint_of_trade +
                //                 "&hrbp_type_of_leaving=" + hrbp_type_of_leaving +
                //                 "&hrd_feedback=" + hrd_feedback +
                //                 "&indirect_leader_feedback=" + indirect_leader_feedback +
                //                 "&leader_role_to=" + leader_role_to +
                //                 "&mobile=" + SQRSJ +
                //                 "&nonce=" + nonce +
                //                 "&personal_email=" + personal_email +
                //                 "&reason_of_leaving=" + reason_of_leaving +
                //                 "&request_id=" + request_id +
                //                 "&submitted_at=" + submitted_at +
                //                 "&work_to=" + work_to +
                //                 "&workcode=" + workcode +
                //                 key;
                //             var gn2 = $.md5(allin);
                //             $.ajax({
                //                 async: false,
                //                 data: {
                //                     "request_id": request_id,
                //                     "workcode": workcode,
                //                     "submitted_at": submitted_at,
                //                     "empl_rcd": empl_rcd,
                //                     "company_code": company_code,
                //                     "expect_leaving_on": expect_leaving_on,
                //                     "mobile": SQRSJ,
                //                     "personal_email": personal_email,
                //                     "reason_of_leaving": reason_of_leaving,
                //                     "work_to": work_to,
                //                     "leader_role_to": leader_role_to,
                //                     "hrbp_restraint_of_trade": hrbp_restraint_of_trade,
                //                     "hrbp_type_of_leaving": hrbp_type_of_leaving,
                //                     "hrbp_reason_of_leaving": hrbp_reason_of_leaving,
                //                     "hrbp_feedback": hrbp_feedback,
                //                     "hrd_feedback": hrd_feedback,
                //                     "direct_leader_feedback": direct_leader_feedback,
                //                     "indirect_leader_feedback": indirect_leader_feedback,
                //                     "nonce": nonce,
                //                     "sign": gn2
                //                 },
                //                 //url: "https://hr-api.info.100tal.com/api/oa/v2/resignations/teacher",
                //                 url: "http://magpie-t1.info.runmystage.com/api/oa/v2/resignations/teacher",
                //                 //url: $.PublicAddress.MvcSheet.teacher,
                //                 type: "POST",
                //                 success: function (msg) {
                //                     var text7 = msg;
                //                     //alert("创建离职接口成功");
                //                 },
                //                 error: function (ww) {
                //                     text22 = ww;
                //                     alertMessage2(text22);
                //                 }
                //
                //             })
                //         }
                //         if (text22) {
                //             return;
                //         }
                //     }
                //     //离职申请(专用)
                //     if ($.MvcSheetUI.SheetInfo.WorkflowCode == "Dimission" &&
                //         $.MvcSheetUI.SheetInfo.WorkItemType != "WorkItemAssist") {
                //         //modify by kinson.guo for  对于协办第一次不调用
                //         var ygzj = $.MvcSheetUI.GetControlValue("YGZJ")
                //         var test11;
                //         if (ygzj > 30) {
                //             if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity11") {
                //                 var request_id = $.MvcSheetUI.SheetInfo.InstanceId;
                //                 var workcode = $.MvcSheetUI.SheetInfo.BizObject.DataItems.YGBH.V;
                //                 var SQRSJ = $.MvcSheetUI.SheetInfo.BizObject.DataItems.SQRSJ.V;
                //                 var personal_email = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GRYX.V;
                //                 var data = $.MvcSheetUI.SheetInfo.BizObject.DataItems.OriginateTime.V;
                //                 var submitted_at = data;
                //                 var empl_rcd = "0";
                //                 var company_code = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GSBH.V;
                //                 var data3 = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZRQ.V;
                //                 var data4 = data3.substring(0, 10);
                //                 var expect_leaving_on = data4;
                //                 var ss = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GZJJR.V.Code;
                //                 var work_to = ss.substring(30, 36);
                //                 var leader_role_to = work_to;
                //                 var hrbp_restraint_of_trade;
                //                 if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity11") {
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "解除") {
                //                         hrbp_restraint_of_trade = "1"
                //                     }
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "不解除") {
                //                         hrbp_restraint_of_trade = "2"
                //                     }
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "无竞业限制") {
                //                         hrbp_restraint_of_trade = "0"
                //                     }
                //                 } else {
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "解除") {
                //                         hrbp_restraint_of_trade = "1"
                //                     }
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "不解除") {
                //                         hrbp_restraint_of_trade = "2"
                //                     }
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "无竞业限制") {
                //                         hrbp_restraint_of_trade = "0"
                //                     }
                //                 }
                //
                //                 var hrbp_reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYYT.V == "" ? $.MvcSheetUI.GetElement("LZYYT").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYYT.V;
                //                 var reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V;
                //                 var reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V == "" ? $.MvcSheetUI.GetElement("LZYY").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V;
                //                 var lzlx = $.MvcSheetUI.GetControlValue('LZLX');
                //                 var hrbp_type_of_leaving;
                //                 if (lzlx == "主动离职") {
                //                     hrbp_type_of_leaving = "1";
                //                 }
                //                 if (lzlx == "被动离职") {
                //                     hrbp_type_of_leaving = "2";
                //                 }
                //                 var hrbp_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HRBPFK.V;
                //                 if (hrbp_feedback == "") {
                //                     hrbp_feedback = $.MvcSheetUI.GetControlValue('HRBPFK');
                //                 }
                //                 var hrd_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HRDFK.V;
                //                 if (hrd_feedback == "") {
                //                     hrd_feedback = $.MvcSheetUI.GetControlValue('HRDFK');
                //                 }
                //                 var direct_leader_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.ZJSJFK.V;
                //                 var indirect_leader_feedback = "";
                //                 var nonce = Math.floor((new Date()).valueOf() / 1000);
                //                 var key = "375fccaaf3f6372aa60904188c87f3e739101765";
                //                 var allin = "company_code=" + company_code + "&direct_leader_feedback=" + direct_leader_feedback + "&empl_rcd=" + empl_rcd + "&expect_leaving_on=" + expect_leaving_on + "&hrbp_feedback=" + hrbp_feedback + "&hrbp_reason_of_leaving=" + hrbp_reason_of_leaving + "&hrbp_restraint_of_trade=" + hrbp_restraint_of_trade + "&hrbp_type_of_leaving=" + hrbp_type_of_leaving + "&hrd_feedback=" + hrd_feedback + "&indirect_leader_feedback=" + indirect_leader_feedback + "&leader_role_to=" + leader_role_to + "&mobile=" + SQRSJ + "&nonce=" + nonce + "&personal_email=" + personal_email + "&reason_of_leaving=" + reason_of_leaving + "&request_id=" + request_id + "&submitted_at=" + submitted_at + "&work_to=" + work_to + "&workcode=" + workcode + key;
                //                 var gn2 = $.md5(allin);
                //                 console.log(nonce);
                //                 console.log(allin);
                //                 console.log(gn2);
                //                 $.ajax({
                //                     async: false,
                //                     data: {
                //                         "request_id": request_id,
                //                         "workcode": workcode,
                //                         "submitted_at": submitted_at,
                //                         "empl_rcd": empl_rcd,
                //                         "company_code": company_code,
                //                         "expect_leaving_on": expect_leaving_on,
                //                         "mobile": SQRSJ,
                //                         "personal_email": personal_email,
                //                         "reason_of_leaving": reason_of_leaving,
                //                         "work_to": work_to,
                //                         "leader_role_to": leader_role_to,
                //                         "hrbp_restraint_of_trade": hrbp_restraint_of_trade,
                //                         "hrbp_type_of_leaving": hrbp_type_of_leaving,
                //                         "hrbp_reason_of_leaving": hrbp_reason_of_leaving,
                //                         "hrbp_feedback": hrbp_feedback,
                //                         "hrd_feedback": hrd_feedback,
                //                         "direct_leader_feedback": direct_leader_feedback,
                //                         "indirect_leader_feedback": indirect_leader_feedback,
                //                         "nonce": nonce,
                //                         "sign": gn2
                //                     },
                //                     //url: "https://hr-api.info.100tal.com/api/oa/v2/resignations",
                //                     url: "http://magpie-t1.info.runmystage.com/api/oa/v2/resignations",
                //                     //url: $.PublicAddress.MvcSheet.resignations,
                //                     type: "POST",
                //                     success: function (msg) {
                //                         //alert("成功创建离职流程1");
                //                     },
                //                     error: function (ww) {
                //                         test11 = ww;
                //                         alertMessage2(test11);
                //
                //
                //                     }
                //                 })
                //
                //             }
                //         } else {
                //             if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity10" || $.MvcSheetUI.SheetInfo.ActivityCode == "Activity44") {
                //
                //                 var request_id = $.MvcSheetUI.SheetInfo.InstanceId;
                //                 var workcode = $.MvcSheetUI.SheetInfo.BizObject.DataItems.YGBH.V;
                //                 var SQRSJ = $.MvcSheetUI.SheetInfo.BizObject.DataItems.SQRSJ.V;
                //                 var personal_email = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GRYX.V;
                //                 var data = $.MvcSheetUI.SheetInfo.BizObject.DataItems.OriginateTime.V;
                //                 var submitted_at = data;
                //                 var empl_rcd = "0";
                //                 var company_code = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GSBH.V;
                //                 var data3 = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZRQ.V;
                //                 var data4 = data3.substring(0, 10);
                //                 var expect_leaving_on = data4;
                //                 var ss = $.MvcSheetUI.SheetInfo.BizObject.DataItems.GZJJR.V.Code;
                //                 var work_to = ss.substring(30, 36);
                //                 var leader_role_to = work_to;
                //                 var hrbp_restraint_of_trade;
                //                 if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity11") {
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "解除") {
                //                         hrbp_restraint_of_trade = "1"
                //                     }
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "不解除") {
                //                         hrbp_restraint_of_trade = "2"
                //                     }
                //                     if ($.MvcSheetUI.SheetInfo.BizObject.DataItems.JCQK.V == "无竞业限制") {
                //                         hrbp_restraint_of_trade = "0"
                //                     }
                //                 } else {
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "解除") {
                //                         hrbp_restraint_of_trade = "1"
                //                     }
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "不解除") {
                //                         hrbp_restraint_of_trade = "2"
                //                     }
                //                     if ($.MvcSheetUI.GetControlValue('JCQK') == "无竞业限制") {
                //                         hrbp_restraint_of_trade = "0"
                //                     }
                //                 }
                //
                //                 var hrbp_reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYYT.V == "" ? $.MvcSheetUI.GetElement("LZYYT").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYYT.V;
                //                 var reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V;
                //                 var reason_of_leaving = $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V == "" ? $.MvcSheetUI.GetElement("LZYY").val() : $.MvcSheetUI.SheetInfo.BizObject.DataItems.LZYY.V;
                //                 var lzlx = $.MvcSheetUI.GetControlValue('LZLX');
                //                 var hrbp_type_of_leaving;
                //                 if (lzlx == "主动离职") {
                //                     hrbp_type_of_leaving = "1";
                //                 }
                //                 if (lzlx == "被动离职") {
                //                     hrbp_type_of_leaving = "2";
                //                 }
                //                 var hrbp_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HRBPFK.V;
                //                 if (hrbp_feedback == "") {
                //                     hrbp_feedback = $.MvcSheetUI.GetControlValue('HRBPFK');
                //                 }
                //                 var hrd_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.HRDFK.V;
                //                 if (hrd_feedback == "") {
                //                     hrd_feedback = $.MvcSheetUI.GetControlValue('HRDFK');
                //                 }
                //                 var direct_leader_feedback = $.MvcSheetUI.SheetInfo.BizObject.DataItems.ZJSJFK.V;
                //                 var indirect_leader_feedback = "";
                //                 var nonce = Math.floor((new Date()).valueOf() / 1000);
                //                 var key = "375fccaaf3f6372aa60904188c87f3e739101765";
                //                 var allin = "company_code=" + company_code + "&direct_leader_feedback=" + direct_leader_feedback + "&empl_rcd=" + empl_rcd + "&expect_leaving_on=" + expect_leaving_on + "&hrbp_feedback=" + hrbp_feedback + "&hrbp_reason_of_leaving=" + hrbp_reason_of_leaving + "&hrbp_restraint_of_trade=" + hrbp_restraint_of_trade + "&hrbp_type_of_leaving=" + hrbp_type_of_leaving + "&hrd_feedback=" + hrd_feedback + "&indirect_leader_feedback=" + indirect_leader_feedback + "&leader_role_to=" + leader_role_to + "&mobile=" + SQRSJ + "&nonce=" + nonce + "&personal_email=" + personal_email + "&reason_of_leaving=" + reason_of_leaving + "&request_id=" + request_id + "&submitted_at=" + submitted_at + "&work_to=" + work_to + "&workcode=" + workcode + key;
                //                 var gn2 = $.md5(allin);
                //                 console.log(nonce);
                //                 console.log(allin);
                //                 console.log(gn2);
                //                 $.ajax({
                //                     async: false,
                //                     data: {
                //                         "request_id": request_id,
                //                         "workcode": workcode,
                //                         "submitted_at": submitted_at,
                //                         "empl_rcd": empl_rcd,
                //                         "company_code": company_code,
                //                         "expect_leaving_on": expect_leaving_on,
                //                         "mobile": SQRSJ,
                //                         "personal_email": personal_email,
                //                         "reason_of_leaving": reason_of_leaving,
                //                         "work_to": work_to,
                //                         "leader_role_to": leader_role_to,
                //                         "hrbp_restraint_of_trade": hrbp_restraint_of_trade,
                //                         "hrbp_type_of_leaving": hrbp_type_of_leaving,
                //                         "hrbp_reason_of_leaving": hrbp_reason_of_leaving,
                //                         "hrbp_feedback": hrbp_feedback,
                //                         "hrd_feedback": hrd_feedback,
                //                         "direct_leader_feedback": direct_leader_feedback,
                //                         "indirect_leader_feedback": indirect_leader_feedback,
                //                         "nonce": nonce,
                //                         "sign": gn2
                //                     },
                //                     //url: "https://hr-api.info.100tal.com/api/oa/v2/resignations",
                //                     url: "http://magpie-t1.info.runmystage.com/api/oa/v2/resignations",
                //                     //url: $.PublicAddress.MvcSheet.resignations,
                //                     type: "POST",
                //                     success: function (msg) {
                //                         //alert("成功创建离职流程1");
                //                     },
                //                     error: function (ww) {
                //                         test11 = ww;
                //                         alertMessage2(test11);
                //                     }
                //                 })
                //
                //
                //             }
                //         }
                //         if (test11) {
                //             return;
                //         }
                //     }
                    //$.LoadingMask.Show(SheetLanguages.Current.Sumiting);
                    if ($.MvcSheetUI.SheetInfo.WorkflowCode == "JSLYApprove") {
                        ////////////////申请人审批节点传参函数/////////////////
                        if ($.MvcSheetUI.SheetInfo.ActivityCode == "Activity8") {
                            siolon_test();
                        }
                        ////////////////申请人审批节点结束/////////////////////
                    }
                    var SheetPostValue = that.GetMvcPostValue(that.Action_Submit, destActivity, postValue);
                    that.PostSheet({
                            Command: that.Action_Submit,
                            MvcPostValue: JSON.stringify(SheetPostValue)
                        },
                    function (data) {
                        that.ResultHandler.apply(that, [actionControl, data]);
                    });
                }
            )
        },
        // 控件初始化事件
        ControlInit: function () {
        },
        // 控件初始化之前函数
        ControlPreRender: function () {
        },
        // 控件加载完成事件
        ControlRendered: function () {
        },
        //驳回
        Reject: function (actionControl, destActivity) {
            actionControl.IsReject = true;
            if (!$.MvcSheet.ActionValidata(actionControl))
                return false;
            var that = this;
            $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfirmDo + "【" + SheetLanguages.Current.Reject + "】" + SheetLanguages.Current.Operation + "?", function () {
                $.LoadingMask.Show(SheetLanguages.Current.Rejecting);
                var SheetPostValue = that.GetMvcPostValue(that.Action_Reject, destActivity);
                that.PostSheet(
                    {
                        Command: that.Action_Reject,
                        MvcPostValue: JSON.stringify(SheetPostValue)
                    },
                    function (data) {
                        that.ResultHandler.apply(that, [actionControl, data]);
                    });
            })
        },
        //结束流程
        FinishInstance: function (actionControl) {
            $.LoadingMask.Show(SheetLanguages.Current.Finishing);
            var SheetPostValue = this.GetMvcPostValue(this.Action_FinishInstance);
            var that = this;
            this.PostSheet({
                    Command: this.Action_FinishInstance,
                    MvcPostValue: JSON.stringify(SheetPostValue)
                },
                function (data) {
                    that.ResultHandler.apply(that, [actionControl, data]);
                });
        },
        //取回流程
        RetrieveInstance: function (actionControl) {

            var that = this;

            this.GetSheet({
                    Command: this.Action_RetrieveInstance
                },
                function (data) {
                    that.ResultHandler.apply(that, [actionControl, data]);
                },
                function () {
                },
                true,
                function () {
                    $.LoadingMask.Show(SheetLanguages.Current.Retrieving);
                },
                function () {},
                );
        },
        //获取Mvc表单传给后台的数据
        GetMvcPostValue: function (actionName, destActivity, postValue) {
            var SheetPostValue = {
                Command: actionName,
                DestActivityCode: destActivity,
                PostValue: postValue,
                BizObjectId: $.MvcSheetUI.SheetInfo.BizObjectID,
                InstanceId: $.MvcSheetUI.SheetInfo.InstanceId,
                BizObject: {}
                //当前表单的数据项集合值
            };

            SheetPostValue.BizObject.DataItems = $.MvcSheetUI.SaveSheetData(actionName);
            SheetPostValue.Priority = $.MvcSheetUI.Priority;
            SheetPostValue.HiddenFields = $.MvcSheetUI.HiddenFields;
            // TODO:需要获取当前提交人所选择的发起组织
            SheetPostValue.ParentUnitID = $.MvcSheetUI.ParentUnitID;
            return SheetPostValue;
        },
        //回调函数处理
        ResultHandler: function (actionControl, data) {
            if (data.UserIsNull || data.UserIsNull == "true") {
                alert("用户信息已失效，请重新登录！");
                $.LoadingMask.Hide();
                return;
            }

            if ($.MvcSheet.ActionDone) {
                $.MvcSheet.ActionDone.apply(actionControl, [data])
            }
            if (data == "undefined" || data == null)
                return;

            //提示消息设置
            if (data.EvalStr) {
                var message = eval(data.EvalStr);
                if (data.Message) {
                    data.Message = data.Message + message;
                } else {
                    data.Message = message;
                }
            }

            if (data.Successful) {
                console.log(data,'data');
                //执行操作后获取任务数量
                top.postMessage("TotalCount", "*");
                if ($.MvcSheetUI.SheetInfo.IsMobile) {
                    if (actionControl.Action == "Save" && !$.MvcSheetUI.SheetInfo.IsOriginateMode) {
                        $.LoadingMask.Hide();
                        console.log('Save');
                        return;
                    }
                    //update by luxm发起流程先保存后提交bug
                    if (actionControl.Action == "Save" && $.MvcSheetUI.SheetInfo.IsOriginateMode) {
                        $.LoadingMask.Hide();
                        if ($.MvcSheetUI.IonicFramework.$rootScope.dingMobile.isDingMobile) {
                            if($.MvcSheetUI.QueryString("dingTalkClose")) {
                                window.location.href = data.Url + "&dingTalkClose=true";
                                // console.log(data.Url,'data.Url');
                            } else {
                                window.location.href = data.Url;
                            }
                        } else {
                            window.location.replace(data.Url);
                        }
                        return;
                    }
                    //update by ouyangsk 同意，驳回，取消流程，或转发时才关闭表单
                    if (actionControl.Action != 'Assist' && actionControl.Action != 'Consult' && actionControl.Action != 'Circulate') {
                        //钉钉关闭表单
                        if ($.MvcSheetUI.IonicFramework.$rootScope.dingMobile.isDingMobile && $.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk") {
                            // 如果是数据项
                            if($.MvcSheetUI.QueryString("dingTalkClose")) {
                                dd.biz.navigation.close({
                                    onSuccess: function (result) {
                                    },
                                    onFail: function (err) {
                                    }
                                });
                            } else {
                                // 返回上一级
                                dd.biz.navigation.goBack({
                                    onSuccess : function(result) {
                                    },
                                    onFail : function(err) {}
                                });
                            }
                            // window.history.back();
                        }
                        else {
                            if (typeof(WeixinJSBridge) != "undefined" && $.MvcSheetUI.IonicFramework.$rootScope.source == "message") {
                                //微信打开消息关闭表单
                                WeixinJSBridge.call("closeWindow");
                            } else if ($.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "wechat") {
                                //微信关闭表单
                                var goIndex = $.MvcSheetUI.IonicFramework.$rootScope.orgIndex - window.history.length - 1;
                                window.history.go(goIndex);
                            } else {
                                //app关闭表单
                                //window.location.href = data.MobileReturnUrl;
                                window.history.go(-1);
                            }
                        }
                    }
                    else {
                        //update by ouyangsk 协办，征询意见，传阅时不关闭当前表单
                        $.LoadingMask.Hide();
                        if (data.Message) {
                            alert(data.Message);
                            return;
                        }
                    }
                } else {
                    if (data.ClosePage || actionControl.Action === "Assist") {
                        //update by luwei : 异步处理可能导致拿不到数据,sleep 500ms FIXME
                        var t = Date.now();

                        function sleep(d) {
                            while (Date.now() - t <= d) ;
                        }
                        sleep(500);
                        if (!data.IsSaveAction) {
                            $.MvcSheet.ClosePage();
                        } else {
                            if (data.Refresh) {
                                var href = window.location.href;
                                href = href.replace("&T=", "&T=" + Math.round(Math.random() * 100, 0));
                                window.location.href = href;
                            }
                        }
                        // $.MvcSheet.ClosePage();
                        if (actionControl.Action === "Forward") {
                            alert(eval(data.EvalStr));
                        }
                    }
                    else if (data.Url) {
                        window.location.href = data.Url;
                    } else if (data.Message) {
                        if (data.Refresh) {
                            var href = window.location.href;
                            href = href.replace("&T=", "&T=" + Math.round(Math.random() * 100, 0));
                            window.location.href = href;
                        }
                        alert(data.Message);
                    }
                }
            } else {
                //Error:错误提示方式需要修改
                if (data.Errors) {
                    for (var i = 0; i < data.Errors.length; i++) {
                        alert(data.Errors[i]);
                    }
                }
                if (data.Message) {
                    alert(data.Message);
                }
            }
            $.LoadingMask.Hide();
        },

        //关闭页面
        ClosePage: function () {
            try {
                if (window.opener != null
                    && window.opener.location != null
                    && window.opener.location.href != window.location.href
                    && $.MvcSheetUI.QueryString("Mode").toLowerCase() != "originate") {
                    window.opener.location.reload();
                    window.close();
                }
                else {
                    window.close();
                    //钉钉pc表单
                    window.open("about:blank", "_self");
                }
                //iframe 关闭当前表单页面
                top.window.postMessage("ClosePage", "*");
                if (!this.IsPC()) {
                    if ($.MvcSheetUI.IonicFramework.$rootScope.dingMobile.isDingMobile) {
                        dd.biz.navigation.close({});
                    } else{
                        //window.open('/Portal/Mobile/index.html', '_self');
                        window.history.go(-1);
                    }
                }
            } catch (e) {
                window.close();
            }
        },

        IsPC: function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        },
        //添加默认的事件
        AddDefaultActions: function () {
            if ($.MvcSheetUI.SheetInfo && $.MvcSheetUI.SheetInfo.IsMobile) {
                this.Actions.splice(0, this.Actions.length,
                    this.RetrieveInstanceAction,
                    this.SaveAction,
                    this.ViewInstanceAction,
                    this.PreviewParticipantAction,
                    this.PrintAction,
                    this.ViewedAction,
                    this.CancelInstanceAction,
                    this.RejectAction,
                    this.SubmitAction,
                    this.FinishInstanceAction,
                    this.ForwardAction,
                    this.AssistAction,
                    this.ConsultAction,
                    this.CirculateAction,
                    this.AdjustParticipantAction,
                    this.LockInstanceAction,
                    this.UnLockInstanceAction,
                    this.CloseAction,
                    this.WorkflowCommentAction// 评论
                );
            } else {
                this.Actions.splice(0, this.Actions.length,
                    this.RetrieveInstanceAction,
                    this.SaveAction,
                    this.ViewInstanceAction,
                    this.PreviewParticipantAction,
                    this.PrintAction,
                    this.ViewedAction,
                    this.CancelInstanceAction,
                    this.SubmitAction,
                    this.RejectAction,
                    this.FinishInstanceAction,
                    this.ForwardAction,
                    this.AssistAction,
                    this.ConsultAction,
                    this.CirculateAction,
                    this.AdjustParticipantAction,
                    this.LockInstanceAction,
                    this.UnLockInstanceAction,
                    this.CloseAction
                );
            }
        },

        //添加自定义事件
        AddAction: function (option) {
            // Actions.length为0时，说明Load的异步返回数据还没返回，添加到Actions里面就可以了，系统Load回来会执行
            if ($.MvcSheetToolbar.AddButton) {
                $.MvcSheetToolbar.AddButton(option);
            } else {
                if (this.Actions.length == 0) {
                    this.AddDefaultActions();
                }
            }
            if (option.PreAction) {
                for (var i in this.Actions) {
                    if (this.Actions[i].Action == option.PreAction) {
                        if (i < this.Actions.length - 1)
                            i++;
                        this.Actions.splice(i, 0, option);
                        break;
                    }
                }
            } else {
                this.Actions.push(option);
            }
        },

        //用get方式可传送简单数据，但大小一般限制在1KB下，数据追加到url中发送（http的header传送），
        //也就是说，浏览器将各个表单字段元素及其数据按照URL参数的格式附加在请求行中的资源路径后面。
        //另外最重要的一点是，它会被客户端的浏览器缓存起来，那么，别人就可以从浏览器的历史记录中，读取到此客户的数据，比如帐号和密码等。
        //因此，在某些情况下，get方法会带来严重的安全性问题;GET方式传送数据量小，处理效率高，安全性低，会被缓存，而POST反之
        GetSheet: function (data, callback, errorhandler, async, beforeSend, complete) {
            $.ajax({
                type: "GET",
                url: this.AjaxUrl,
                dataType: "json",
                async: async,
                data: data,
                beforeSend:beforeSend,
                success: callback,
                complete:complete,
                error: errorhandler
            });
        },
        //当使用POST方式时，浏览器把各表单字段元素及其数据作为HTTP消息的实体内容发送给Web服务器，
        //而不是作为URL地址的参数进行传递，使用POST方式传递的数据量要比使用GET方式传送的数据量大的多
        PostSheet: function (data, callback, errorhandler, async) {
            var ajaxUrl = this.AjaxUrl;
            //update by zhengyj 。地址拼接
            if (ajaxUrl.indexOf("http://") == -1) {
                ajaxUrl = window.location.href.substr(0, window.location.href.indexOf("MvcDefaultSheet")) + this.AjaxUrl;
            }
            if (ajaxUrl.toLowerCase().indexOf("&bizobjectid=") == -1) {
                ajaxUrl = ajaxUrl + "&BizObjectID=" + $.MvcSheetUI.SheetInfo.BizObjectID;
            }
            if (typeof(async) == "undefined")
                async = true;
            if (typeof(errorhandler) == "undefined") {
                errorhandler = function (e) {
                    alert("系统出现异常!");
                    $.LoadingMask.Hide();
                };
            }
            $.ajax({
                type: "POST",
                url: ajaxUrl,
                data: data,
                dataType: "json",
                async: async,
                success: callback,
                error: errorhandler
            });
        }
    });