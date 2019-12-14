﻿//工具栏
//构造SheetToolBar，需要根据表单数据，构造需要的按钮
_PORTALROOT_GLOBAL = $.MvcSheetUI.PortalRoot;
(function () {
    $.fn.SheetToolBar = function () {
        return $.MvcSheetUI.Run.call(this, "SheetToolBar", arguments);
    };

    $.MvcSheetUI.Controls.SheetToolBar = function (element, args, sheetInfo) {
        this.Element = element;
        this.SheetInfo = sheetInfo;
        this.ControlManagers = {};

        for (var i in args) {
            this.AddButton(args[i]);
        }
        return this;
    };

    $.MvcSheetUI.Controls.SheetToolBar.prototype = {
        AddButton: function (option) {
        	
            if (option) {
                var key = option.Action || option.Text;
                if (key == undefined) return;
                if (this.ControlManagers[key]) return this.ControlManagers[key];
                if ($.MvcSheetToolbar[option.Action]) {
                    this.ControlManagers[option.Action] = new $.MvcSheetToolbar[option.Action](this.Element, option, this.SheetInfo);
                } else {
                    this.ControlManagers[key] = new $.MvcSheetToolbar.IButton(this.Element, option, this.SheetInfo);
                }
            }
        }
    };
})(jQuery);

//#region 按钮基类
$.MvcSheetToolbar = {};
$.MvcSheetToolbar.IButton = function (element, args, sheetInfo) {
    //this.Action = args.Action;
    //this.Icon = args.Icon;
    //this.Text = args.Text;
    for (var key in args) {
        this[key] = args[key];
    }
    this.ColumnCss = "> .col-md-1,> .col-md-2,> .col-md-3,> .col-md-4,> .col-md-5,> .col-md-6,> .col-md-7,> .col-md-8,> .col-md-9,> .col-md-10,> .col-md-11,> .col-md-12";
    this.CloseAfterAction = args.CloseAfterAction || false;//关闭
    this.PostSheetInfo = args.PostSheetInfo || false;
    //是否移动端
    this.IsMobile = sheetInfo.IsMobile || ($.MvcSheetUI.QueryString("ismobile") == "true");
    //执行后台通讯之前的事件
    this.OnActionPreDo = args.OnActionPreDo;
    this.OnAction = args.OnAction;
    //执行后台通讯之后的事件
    this.OnActionDone = args.OnActionDone;
    //设置文本样式
    this.CssClass = args.CssClass || "";

    this.Container = element;//按钮容器ul
    this.SheetInfo = sheetInfo;
    this.Element = null;//当前按钮元素 li
    //参数：[{数据项1},{数据项2},...]或["#ID1"，"#ID2",...]或["数据1","数据2"]或混合
    this.Datas = args.Datas;

    //绑定的参数
    this.Options = args.Options;
    sheetInfo.PermittedActions.WorkflowComment = true  //测试评论按钮
    this.PermittedActions = sheetInfo.PermittedActions;
    this.Visible = this.PermittedActions[this.Action] == undefined ? true : this.PermittedActions[this.Action];
    this.MobileVisible = args.MobileVisible === undefined ? this.Visible : args.MobileVisible;
    //执行事件
    this.PreRender();
    this.Render();
};
$.MvcSheetToolbar.IButton.prototype = {
    PreRender: function () {
        var txt = this.Text;
        if ($.MvcSheetUI.SheetInfo.Language) {
            txt = this[$.MvcSheetUI.SheetInfo.Language] || this.Text;
        }
        this.Text = txt;
    },
    Render: function () {
        var actionKey = this.Action || this.Text;
        if (!this.Visible) {
            $(this.Container).children("li[data-action='" + actionKey + "']").hide();
            return;
        }
        this.Element = $(this.Container).children("li[data-action='" + actionKey + "']");
        if (this.Element.length == 0) {
            this.Element = this._CreateButtonElement(this.Action, this.Icon, this.Text);
            if (!this.IsMobile) {
                $(this.Container).append(this.Element);
            }
        }
        this.BindClick();
    },
    BindClick: function () {
        var actionKey = this.Action || this.Text;
        this.Element.unbind("click." + actionKey).bind("click." + actionKey, this, function (e) {
            e.data.ActionClick.apply(e.data);
        });
    },
    _CreateButtonElement: function (action, icon, text) {
    	// 每10个汉字注意添加换行符，优化用户体验
    	/*var btnJson = {
    			Submit:"即同意，流程将继续流转",
    			Forward:"允许当前用户将任务转&#10;办给其他人，转办后自&#10;己的任务消失，由转办&#10;人进行继续处理；",
    			Retrieve:"提交任务后，并且下一活动&#10;环节未处理时，取回后任务&#10;重新回到当前用户的待办中；",
    			Reject:"即拒绝，将流程驳回到某&#10;一节点，被驳回人需在待&#10;办中重新处理",
    			Circulate:"将当前活动环节传阅给其他用户",
    			Assist:"A协办给B，流程从A消失&#10;并流转到B，B拥有和A一&#10;样的表单权限，B提交后会&#10;直接回到A继续审批"
    			};  */
    	var btnClass = 'btn-action'
    	if(this.Action == 'Save') {
            btnClass = 'btn-action-pri'
        }
    	var btnTitle = SheetLanguages.Current[this.Action+"Prompt"] == undefined ? text:SheetLanguages.Current[this.Action+"Prompt"];
        var liElement = $("<li title='"+btnTitle+"' data-action='" + this.Action + "'></li>");
        var linkElement = $("<a title='"+btnTitle+"' href='javascript:void(0);' class='"+btnClass+"'></a>");
        var imgElement = $("<i  title='"+btnTitle+"' class='panel-title-icon fa " + this.Icon + " toolImage'></i>");
        var spanElement = $("<span title='"+btnTitle+"' class='toolText'>" + (text.length > 17 ? text.substring(0, 16) + "..." : text) + "</span>");
        if (this.CssClass) {
            spanElement.addClass(this.CssClass);
        }
        // return liElement.append(linkElement.append(imgElement).append(spanElement));
        return liElement.append(linkElement.append(spanElement));
        //return $("<li data-action='" + this.Action + "'><a href='javascript:void(0);'><i class='panel-title-icon fa " + this.Icon + " toolImage'></i><span class='toolText'>" + this.Text + "</span></a></li>");
    },
    ActionClick: function () {
        // console.log(11111)
        //doAction之前的事件
        var callResult = true;
        // debugger
        if ($.isFunction(this.OnActionPreDo)) {//javascript函数
            callResult = this.OnActionPreDo.apply(this);
        }
        else if (this.OnActionPreDo) {//javascript语句
            callResult = new Function(this.OnActionPreDo).apply(this);
        }
        //结果成功
        if (callResult == null || callResult == true) {
            //执行后台Action
            this.DoAction.apply(this);
        }

        if (this.OnActionDone) {
            this.OnActionDone.apply(this);
        }
    },
    //执行
    DoAction: function () {
        //继承的按钮，如果需要掉基类的DoAction，用 this.constructor.Base.DoAction.apply(this);
        if (this.OnAction) {
            this.OnAction.apply(this);
        } else {
            if (this.Action) {
                $.MvcSheet.Action(this);
            }
        }
    },
    //回调函数
    OnActionDone: function () { },

    FetchUser: function (_Title, _IsMulti, _UserOptions, _CheckText, _Checked) {
        var that = this;
        if (!this.SheetUserInited && !this.SheetInfo.IsMobile) {
            this.SheetUserInited = true;
            //选人控件
            var DefaultOptions = {
                O: "VE",
                L: _IsMulti ? $.MvcSheetUI.LogicType.MultiParticipant : $.MvcSheetUI.LogicType.SingleParticipant
            };
            if (_UserOptions) {
                $.extend(DefaultOptions, _UserOptions)
            }

            var _SheetUser = $("<div>").SheetUser(DefaultOptions);
            //复选框
            var chkListenConstancy = null;

            if (_CheckText && !this.SheetInfo.IsMobile) { // 只有PC端显示，移动端会遮住选人
                var ckid = $.MvcSheetUI.NewGuid();
                chkListenConstancy = $("<input type='checkbox' id='" + ckid + "' />");
                //默认选中
                chkListenConstancy.prop("checked", !!_Checked);
                var labelForCheckbox = $("<label for='" + ckid + "'>" + _CheckText + "</label>")
                this.CheckText = chkListenConstancy;
            }

            if (!this.SheetInfo.IsMobile) {
                var body = $("<div><div style='padding-bottom:6px'>" + _Title + "<span style='color:red;'>*</span></div></div>");
                //update by luwei : 增大高度
                var userEle = $(_SheetUser.Element);
                if (that.Action && that.Action === "Circulate") {
                	var _css1 = {"min-height" : "201px", "max-height" : "201px"};
                	userEle.css(_css1);
                	userEle.find("ul").css("overflow-y", "auto").css(_css1);
                	userEle.find("ul").find("li");
                }
                body.css({ "min-height": 365, "padding": "10px 20px" }).append(_SheetUser.Element);

                if (that.Action) {
                	if (that.Action === "Forward") {
                		body.append("<div style='padding-bottom:6px'>" + SheetLanguages.Current.ForwardComment + "</div>");
                		body.append("<textarea style='width:100%;height:150px' rows='10' id='forwardComment' placeholder='" + SheetLanguages.Current.ForwardCommentTip + "'></textarea>")
                	} else if (that.Action === "Assist") {
                		body.append("<div style='padding-bottom:6px'>" + SheetLanguages.Current.AssistComment + "</div>");
                		body.append("<textarea style='width:100%;height:150px' rows='10' id='assistComment' placeholder='" + SheetLanguages.Current.AssistCommentTip + "'></textarea>")
                	} else if (that.Action === "Consult") {
                		body.append("<div style='padding-bottom:6px'>" + SheetLanguages.Current.ConsultComment + "</div>");
                		body.append("<textarea style='width:100%;height:150px' rows='10' id='consultComment' maxlength='1000' placeholder='" + SheetLanguages.Current.ConsultCommentTip + "'></textarea>")
                	}
                }
                
                //if (chkListenConstancy) {
                //    $(_SheetUser.Element).after($("<div style='padding-top:6px'></div>").append(chkListenConstancy);.append(labelForCheckbox));
                //}

                this.ModalManager = new $.SheetModal(
                    _Title,
                    body,
                    [{
                        Text: SheetLanguages.Current.OK,
                        DoAction: function () {
                            var userid = this.SheetUser.GetValue();
                            this.SheetAction.Datas = [];
                            if (userid) {
                                this.SheetAction.Datas.push(userid.toString());

                                if (this.ChecBoxOjb) {
                                    this.SheetAction.Datas.push(this.ChecBoxOjb.prop("checked"));
                                }
                                
                                //add by luwei : 转发意见
                                if(this.SheetAction.Action === "Forward") {
                                	this.SheetAction.Datas.push($("#forwardComment").val());
                                } else if(this.SheetAction.Action === "Assist") {
                                	this.SheetAction.Datas.push($("#assistComment").val());
                                } else if(this.SheetAction.Action === "Consult") {
                                	this.SheetAction.Datas.push($("#consultComment").val());
                                }

                                $.MvcSheet.Action(this.SheetAction);
                                this.ModalManager.Hide();
                                
                                _SheetUser.ClearChoices();//清除选人控件值
                                if(this.SheetAction.Action === "Forward") {
                                	$("#forwardComment").val("");
                                } else if(this.SheetAction.Action === "Assist") {
                                	$("#assistComment").val("");
                                } else if(this.SheetAction.Action === "Consult") {
                                	$("#consultComment").val("");
                                }
                                
                                //open(location, '_self').close();
                            }
                            else {
                                // console.log(SheetLanguages.Current.SelectUser)
                                alert(SheetLanguages.Current.SelectUser);
                            }
                        },
                        SheetUser: _SheetUser,
                        ChecBoxOjb: chkListenConstancy,
                        SheetAction: that
                    },
                    {
                        Text: SheetLanguages.Current.Close,
                        DoAction: function () {
                            this.ModalManager.Hide();
                        }
                    }]
                    );
            }
        }

        if (this.SheetInfo.IsMobile) {
        	
            var DefaultOptions = {
                O: "VE",
                L: _IsMulti ? $.MvcSheetUI.LogicType.MultiParticipant : $.MvcSheetUI.LogicType.SingleParticipant
            };
            if (_UserOptions) {
                $.extend(DefaultOptions, _UserOptions)
            }
            var _commentTitle = "";
            var _commentVaule = "";
            if (this.Action == "Forward") { _commentTitle = SheetLanguages.Current.ForwardComment; _commentVaule = SheetLanguages.Current.InputYourForwardComment; }
            if (this.Action == "Assist") { _commentTitle = SheetLanguages.Current.AssistComment; _commentVaule = SheetLanguages.Current.InputYourAssistComment; }
            if (this.Action == "Consult") { _commentTitle = SheetLanguages.Current.ConsultComment; _commentVaule = SheetLanguages.Current.InputYourConsultComment; }
            $.MvcSheetUI.actionSheetParam = {
                ueroptions: DefaultOptions,
                title: this.Text,//标题
                Action: that.Action,
                DisplayName: this.SheetInfo.DisplayName,
                UserName: this.SheetInfo.UserName,
                Text: _Title,//请选择**
                commentVaule: _commentVaule//**意见
            };
            $.MvcSheetUI.IonicFramework.$state.go("form.fetchuser");
        }
        else {
            this.ModalManager.Show();
        }
    },
    GetMobileProxy: function (_thatAction) {
        return {
            text: _thatAction.Text,
            handler: function () {
                _thatAction.ActionClick();
            }
        }
    },
    // 评论
    // UrgentUser: function (_Title, _IsMulti, _UserOptions, _CheckText, _Checked) {
    //     // console.log(_Title, _IsMulti, _UserOptions, _CheckText, _Checked, '评论');
    //     console.log(this.SheetInfo, 'this.SheetInfo')
    //     var that = this;
    //     if (this.SheetInfo.IsMobile) {
    //         // 传值
    //         $.MvcSheetUI.actionCommentParam = {
    //             title: that.Text,//标题
    //             Action: that.Action,
    //             DisplayName: that.SheetInfo.DisplayName,
    //             UserName: that.SheetInfo.UserName,
    //             OriginatorOU: that.SheetInfo.OriginatorOU,
    //             Text: _Title,
    //             UserId: this.SheetInfo.UserID,
    //         };
    //         $.MvcSheetUI.IonicFramework.$state.go("form.commentDetail");
    //         // $.MvcSheetUI.IonicFramework.$state.go("form.commentDetail");
    //     }
    //     else {
    //         // this.ModalManager.Show();
    //     }
    // }
};
//#endregion

//设置提交和驳回下拉框
var dropMenu1 = null;
var dropMenu2 = null;
//#region 保存
$.MvcSheetToolbar.Save = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Save.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Save.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
        $.MvcSheet.Save(this);
        top.postMessage("IsSave", "*")
    }
});
//#endregion

//#region 评论
$.MvcSheetToolbar.WorkflowComment = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Save.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.WorkflowComment.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
        $.MvcSheet.WorkflowComment(this);
        top.postMessage("IsWorkflowComment", "*")
    }
});
//#endregion

//#region 评论
// $.MvcSheetToolbar.Urgent = function (element, option, sheetInfo) {
//     return $.MvcSheetToolbar.Urgent.Base.constructor.call(this, element, option, sheetInfo);
// };
// $.MvcSheetToolbar.Urgent.Inherit($.MvcSheetToolbar.IButton, {
//     DoAction: function () {
//         if(dropMenu1){dropMenu1.hide();}
//         if(dropMenu2){dropMenu2.hide();}
//         if (this.SheetInfo.WorkItemType == -1) {
//             return;
//         } else {
//             var option = undefined;
//             if (this.SheetInfo.OptionalRecipients) {
//                 option = this.SheetInfo.OptionalRecipients[this.Action];
//             } else {
//                 option = {
//                     OrgUnitVisible: false
//                 }
//             }
//             this.UrgentUser.apply(this, [SheetLanguages.Current.SelectForwardUser, false, option]);
//         }
//     }
// });
//#endregion

//#region 流程状态
$.MvcSheetToolbar.ViewInstance = function (element, option, sheetInfo) {
	// add by shipeng 2019-12-4  流程未发起时，流程状态按钮不渲染
	if(!sheetInfo.IsOriginateMode){
    return $.MvcSheetToolbar.ViewInstance.Base.constructor.call(this, element, option, sheetInfo);
	}
};
$.MvcSheetToolbar.ViewInstance.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
        if (this.SheetInfo.IsMobile) {
            $.MvcSheetUI.IonicFramework.$state.go("form.instancestate", { Mode: this.SheetInfo.SheetMode, InstanceID: this.SheetInfo.InstanceId, WorkflowCode: this.SheetInfo.WorkflowCode, WorkflowVersion: this.SheetInfo.WorkflowVersion });
        }
        else {
        	if(dropMenu1){dropMenu1.hide();}
        	if(dropMenu2){dropMenu2.hide();}
            //打开新的页面，_PORTALROOT_GLOBAL是模板页定义
            if (!this.SheetInfo.IsOriginateMode) {
            	var isSpecialWorkflow=false;
            	var childrenWorkflowInstanceId;
            	// add by shipeng 2019-12-4 判断是否是特殊主流程
            	$.ajax({
                    url: "/Portal/SpecialWorkflowJump/JumpInstanceDetail",// 后台方法名称
                    type: "GET",
                    cache: false,
                    async: false,//同步执行
                    data: {instanceId: this.SheetInfo.InstanceId},
                    dataType: "JSON",
                    success: function (data) {
                    	if(data.isSpecialWorkflow){
                          childrenWorkflowInstanceId=data.childrenWorkflowInstanceId;
                    		
                    	}
                    }
                });
            	if(isSpecialWorkflow){
            		  // 如果是特殊的子流程，则跳向其对应的子流程流程状态界面
            		 window.open(_PORTALROOT_GLOBAL + "/index.html#/InstanceDetail/" + childrenWorkflowInstanceId + "///?WorkItemType=" + this.SheetInfo.WorkItemType, "_blank");
            	}
            	else{
            		 window.open(_PORTALROOT_GLOBAL + "/index.html#/InstanceDetail/" + this.SheetInfo.InstanceId + "/" + (this.SheetInfo.WorkItemId == null ? "" : this.SheetInfo.WorkItemId) + "//?WorkItemType=" + this.SheetInfo.WorkItemType, "_blank");
            		
            	}
               
            } else {
                window.open(_PORTALROOT_GLOBAL + "/index.html#/WorkflowInfo///" + this.SheetInfo.WorkflowCode + "/" + this.SheetInfo.WorkflowVersion, "_blank");
            }
        }
    }
});
//#endregion

//#region 预览
$.MvcSheetToolbar.PreviewParticipant = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.PreviewParticipant.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.PreviewParticipant.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        this.constructor.Base.DoAction(this);
    }
});
//#endregion

//#region 取消
$.MvcSheetToolbar.CancelInstance = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.CancelInstance.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.CancelInstance.Inherit($.MvcSheetToolbar.IButton, {
    //PreRender: function () {
    //    this.constructor.Base.PreRender();

    //    //this.OnActionPreDo = function () {
    //    //    return confirm("确定执行取消流程操作?");
    //    //};
    //},
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        var that = this;
        $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfirmCancelInstance, function () {
            $.MvcSheet.Action(that);
        });
    }
});
//#endregion

//#region 驳回
$.MvcSheetToolbar.Reject = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Reject.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Reject.Inherit($.MvcSheetToolbar.IButton, {
    Render: function () {
        if (!this.Visible) {
            var actionKey = this.Action || this.Text;
            $(this.Container).children("li[data-action='" + actionKey + "']").hide();
            return;
        }

        if (this.SheetInfo.ApprovalListVisible) {
            this.Text = SheetLanguages.Current.Disagree;
        }

        var RejectActivities = [];
        if (this.SheetInfo.RejectActivities) {
            for (var i = 0; i < this.SheetInfo.RejectActivities.length; ++i) {
                RejectActivities.push(
                    {
                        Action: this.SheetInfo.RejectActivities[i].Code,
                        Icon: this.Icon,
                        Text: this.SheetInfo.RejectActivities[i].Name,
                        OnAction: function () {
                            $.MvcSheet.Reject(this, this.Action);
                        },
                        MobileVisible: false
                    });
            }
        }
        if (RejectActivities.length > 0) {
            if (RejectActivities.length == 1) {
                //只有一个的时候
                this.Text = RejectActivities[0].Text;
                this.DestActivity = RejectActivities[0].Action;
                this.constructor.Base.Render.apply(this);
            } else {
                this.constructor.Base.Render.apply(this);
                this.DropdownMenu = $("<ul class='dropdown-menu'></ul>");
                var Menus = this.DropdownMenu.SheetToolBar(RejectActivities);
                if (this.IsMobile) {
                    this.MobileActions = [];
                    for (_Action in Menus.ControlManagers) {
                        var that = Menus.ControlManagers[_Action];
                        this.MobileActions.push(this.GetMobileProxy(that));
                    };
                }

                this.Element.append(this.DropdownMenu);
                this.OnActionPreDo = null;
                dropMenu1 = this.DropdownMenu;
            }
        }
        else {
            this.constructor.Base.Render.apply(this);
        }
    },
    DoAction: function () {
        if (this.DropdownMenu) {
            if (this.IsMobile) {
                var buttons = this.MobileActions;
                var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                    buttons: buttons,
                    buttonClicked: function (index) {
                        buttons[index].handler();
                        return true;
                    }
                });
            }
            else {
                if (this.DropdownMenu.is(":hidden")){
                	if(dropMenu2){
                		dropMenu2.hide();
                	}
                    this.DropdownMenu.show();
                    $("#divTopBars").css({"height":"inherit","overflow":"inherit"});
                    $("i#dropTopBars").addClass("glyphicon-chevron-up").removeClass("glyphicon-chevron-down");
                    }
                else{
                    this.DropdownMenu.hide();
                    }
            }
        }
        else if (this.DestActivity) {
            $.MvcSheet.Reject(this, this.DestActivity);
        }
        else {
            $.MvcSheet.Reject(this);
        }
    }
});
//#endregion

//#region 提交
$.MvcSheetToolbar.Submit = function (element, option, sheetInfo) {
    // console.log(element, option, sheetInfo, '提交')
    return $.MvcSheetToolbar.Submit.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Submit.Inherit($.MvcSheetToolbar.IButton, {
    Render: function () {
        var displayPost = false,
            displayGroup = false;

        if (!this.Visible) {
            var actionKey = this.Action || this.Text;
            $(this.Container).children("li[data-action='" + actionKey + "']").hide();
            return;
        }

        if (this.SheetInfo.ApprovalListVisible) {
            this.Text = SheetLanguages.Current.Agree;
        }

        this.SubmitActivities = [];
        if (this.SheetInfo.SubmitActivities == null
            || this.SheetInfo.SubmitActivities == undefined
            || this.SheetInfo.SubmitActivities.length == 0) {

            //根据岗位提交
            if (this.SheetInfo.Posts) {
                displayPost = this.SheetInfo.Posts.length > 1;
                for (var j = 0; j < this.SheetInfo.Posts.length; j++) {
                    this.SubmitActivities.push(
                    {
                        Action: this.Action + "&" + this.SheetInfo.Posts[j].Code,
                        Icon: this.Icon,
                        Text: this.Text + (displayPost ? ("-" + this.SheetInfo.Posts[j].Name) : ""),
                        OnAction: function () {
                            $.MvcSheet.Submit(this, this.Text, "", this.Action.split("&")[1]);
                        },
                        MobileVisible: false
                    });
                }
            }
        }
        else {
            for (var i = 0; i < this.SheetInfo.SubmitActivities.length; ++i) {
                //直接提交
                this.SubmitActivities.push(
                   {
                       Action: this.SheetInfo.SubmitActivities[i].Code,
                       Text: this.Text + "-" + this.SheetInfo.SubmitActivities[i].Name,
                       OnAction: function () {
                           $.MvcSheet.Submit(this, this.Text, this.Action);
                       },
                       MobileVisible: false
                   });
                //根据岗位提交
                if (this.SheetInfo.Posts) {
                    displayPost = this.SheetInfo.Posts.length > 1;
                    for (var j = 0; j < this.SheetInfo.Posts.length; j++) {
                        this.SubmitActivities.push(
                        {
                            Action: this.SheetInfo.SubmitActivities[i].Code + "&" + this.SheetInfo.Posts[j].Code,
                            Icon: this.Icon,
                            Text: this.Text + "-" + this.SheetInfo.SubmitActivities[i].Name +
                                (displayPost ? ("-" + this.SheetInfo.Posts[j].Name) : ""),
                            OnAction: function () {
                                $.MvcSheet.Submit(this, this.Text, this.Action.split("&")[0], this.Action.split("&")[1]);
                            },
                            MobileVisible: false
                        });
                    }
                }
                //根据组提交
                if (this.SheetInfo.Groups) {
                    displayGroup = this.SheetInfo.Groups.length > 1;
                    for (var j = 0; j < this.SheetInfo.Groups.length; j++) {
                        this.SubmitActivities.push(
                        {
                            Action: this.SheetInfo.SubmitActivities[i].Code + "&" + this.SheetInfo.Groups[j].Code,
                            Icon: this.Icon,
                            Text: this.Text + "-" + this.SheetInfo.SubmitActivities[i].Name +
                                (displayGroup ? ("-" + this.SheetInfo.Groups[j].Name) : ""),
                            OnAction: function () {
                                $.MvcSheet.Submit(this, this.Text, this.Action.split("&")[0], null, this.Action.split("&")[1]);
                            },
                            MobileVisible: false
                        });
                    }
                }
            }
        }

        if (this.SubmitActivities.length > 1) {
            this.constructor.Base.Render.apply(this);
            this.DropdownMenu = $("<ul class='dropdown-menu'></ul>");
            var Menus = this.DropdownMenu.SheetToolBar(this.SubmitActivities);

            if (this.IsMobile) {
                this.MobileActions = [];
                for (_Action in Menus.ControlManagers) {
                    var that = Menus.ControlManagers[_Action];
                    this.MobileActions.push(this.GetMobileProxy(that));
                };
            }

            $(this.Element).append(this.DropdownMenu);
            this.OnActionPreDo = null;
            dropMenu2 = this.DropdownMenu;
        }
        else if (this.SubmitActivities.length == 1) {
            this.Text = this.SubmitActivities[0].Text;
            this.constructor.Base.Render.apply(this);
        }
        else {
            this.constructor.Base.Render.apply(this);
        }
    },
    DoAction: function () {
        if (this.SubmitActivities.length == 1) {
            this.SubmitActivities[0].OnAction.apply(this.SubmitActivities[0]);
            return;
        }

        if (this.DropdownMenu) {
            if (this.IsMobile) {
                var buttons = this.MobileActions;
                var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                    buttons: buttons,
                    buttonClicked: function (index) {
                        buttons[index].handler();
                        return true;
                    }
                });
            }
            else {
                if (this.DropdownMenu.is(":hidden")){
                	if(dropMenu1){
                		dropMenu1.hide();
                	}
                	 this.DropdownMenu.show();
                	 $("#divTopBars").css({"height":"inherit","overflow":"inherit"});
                	 $("i#dropTopBars").addClass("glyphicon-chevron-up").removeClass("glyphicon-chevron-down");
                }  
                else{
                    this.DropdownMenu.hide();
                }
            }
        }
        else {
            $.MvcSheet.Submit(this, this.Text);
        }
    }
});
//#endregion

//#region 结束流程
$.MvcSheetToolbar.FinishInstance = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.FinishInstance.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.FinishInstance.Inherit($.MvcSheetToolbar.IButton, {
    //PreRender: function () {
    //    this.constructor.Base.PreRender();
    //    //this.OnActionPreDo = function () {
    //    //    return confirm("确定执行结束流程操作?");
    //    //}
    //},
    DoAction: function () {
        $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfirmFinishInstance, function () {
            $.MvcSheet.FinishInstance(this);
        });
    }
});
//#endregion

//#region 转发
$.MvcSheetToolbar.Forward = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Forward.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Forward.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        if (this.SheetInfo.WorkItemType == -1) {
            return;
        } else {
            var option = undefined;
            if (this.SheetInfo.OptionalRecipients) {
                option = this.SheetInfo.OptionalRecipients[this.Action];
            } else {
                option = {
                    OrgUnitVisible: false
                }
            }
            this.FetchUser.apply(this, [SheetLanguages.Current.SelectForwardUser, false, option]);
        }
    }
});
//#endregion

//#region 协办
$.MvcSheetToolbar.Assist = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Assist.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Assist.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        //打开新的页面，_PORTALROOT_GLOBAL是模板页定义
        if (this.SheetInfo.WorkItemType == -1) {
            return;
        }
        else {
            var option = { GroupVisible: true, PostVisible: true };
            if (this.SheetInfo.OptionalRecipients && this.SheetInfo.OptionalRecipients[this.Action]) {
                option = this.SheetInfo.OptionalRecipients[this.Action];
            }
            this.FetchUser.apply(this, [SheetLanguages.Current.SelectAssistUser, true, option, SheetLanguages.Current.AssistRemind]);
        }
    }
});
//#endregion

//#region 征询意见
$.MvcSheetToolbar.Consult = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Consult.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Consult.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        //打开新的页面，_PORTALROOT_GLOBAL是模板页定义
        if (this.SheetInfo.WorkItemType == -1) {
            return;
        } else {
            var option = { GroupVisible: true, PostVisible: true };
            if (this.SheetInfo.OptionalRecipients && this.SheetInfo.OptionalRecipients[this.Action]) {
                option = this.SheetInfo.OptionalRecipients[this.Action];
            }
            this.FetchUser.apply(this, [SheetLanguages.Current.SelectConsultUser, true, option, SheetLanguages.Current.ConsultRemind]);
        }
    }
});
//#endregion

//#region 传阅
$.MvcSheetToolbar.Circulate = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Circulate.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Circulate.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        //打开新的页面，_PORTALROOT_GLOBAL是模板页定义
        if (this.SheetInfo.WorkItemType == -1) {
            return;
        } else {
            var option = { SegmentVisible: true, OrgUnitVisible: true, GroupVisible: true, PostVisible: true, UserVisible: true };
            if (this.SheetInfo.OptionalRecipients && this.SheetInfo.OptionalRecipients[this.Action]) {
                option = this.SheetInfo.OptionalRecipients[this.Action];
            }
            //this.FetchUser.apply(this, [SheetLanguages.Current.SelectCirculateUser, true, option]);
            this.FetchUser.apply(this, [SheetLanguages.Current.SelectCirculateUser, true, option, SheetLanguages.Current.AllowCirculate, false]);
        }
    }
});
//#endregion

//#region 加签
$.MvcSheetToolbar.AdjustParticipant = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.AdjustParticipant.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.AdjustParticipant.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        //打开新的页面，_PORTALROOT_GLOBAL是模板页定义
        if (this.SheetInfo.WorkItemType == -1) {
            return;
        } else {
            //var option = { V: this.SheetInfo.Participants };
            this.FetchUser.apply(this, [SheetLanguages.Current.SelectSignUser, true]);
        }
    }
});
//#endregion

//#region 关闭
$.MvcSheetToolbar.Close = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Close.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Close.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        if (top.window.location.href.indexOf("/app/") > -1 || top.window.location.href.indexOf("/home") > -1) {
            //V10.0 关闭当前表单页面
            top.$(".app-aside-right").find("iframe").attr("src", "");
            top.$(".app-aside-right").removeClass("show");
        } else {
            $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfrimClose, function () {
                $.MvcSheet.ClosePage(this);
            });
        }

    }
});
//#endregion

//#region 打印
$.MvcSheetToolbar.Print = function (element, option, sheetInfo) {
    this.Printed = false;
    return $.MvcSheetToolbar.Print.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Print.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){
    	    dropMenu1.hide();
    	}
    	if(
    	    dropMenu2){dropMenu2.hide();
    	}
        // 如果有自定义打印表单URL，则转向自定义打印表单
        // 否则直接页面打印
        if (this.SheetInfo.PrintUrl) {
            window.open(this.SheetInfo.PrintUrl);
        }
        else {
            // 打印当前页面
            // window.print();
            $("#content-wrapper").print({
                addGlobalStyles : true,
                stylesheet : null,
                rejectWindow : true,
                noPrintSelector : ".no-print",
                iframe : true,
                append : null,
                prepend : null
            });
        }
    }
});
//#endregion

//#region 取回流程 RetrieveInstance
$.MvcSheetToolbar.RetrieveInstance = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.RetrieveInstance.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.RetrieveInstance.Inherit($.MvcSheetToolbar.IButton, {
    //PreRender: function () {
    //    this.constructor.Base.PreRender();
    //    //this.OnActionPreDo = function () {
    //    //    return confirm("确定执行取回流程操作?");
    //    //}
    //},
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        $.MvcSheet.ConfirmAction(SheetLanguages.Current.ConfirmReterive, function () {
            $.MvcSheet.RetrieveInstance(this);
        });
    }
});
//#endregion

//#region 已阅
$.MvcSheetToolbar.Viewed = function (element, option, sheetInfo) {
    return $.MvcSheetToolbar.Viewed.Base.constructor.call(this, element, option, sheetInfo);
};
$.MvcSheetToolbar.Viewed.Inherit($.MvcSheetToolbar.IButton, {
    DoAction: function () {
    	if(dropMenu1){dropMenu1.hide();}
    	if(dropMenu2){dropMenu2.hide();}
        $.MvcSheet.Submit(this, this.Text);
    }
});
//#endregion