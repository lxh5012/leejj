/// <reference path="../MvcSheetUI.js" />

//文本框(SheetAssociation)
(function ($) {
    // 控件执行
    // 参数{AutoTrim:true,DefaultValue:datavalue,OnChange:""}
    //可以通过  $("#id").SheetAssociation(参数)  来渲染控件和获取控件对象
    $.fn.SheetAssociation = function () {
        return $.MvcSheetUI.Run.call(this, "SheetAssociation", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetAssociation = function (element, options, sheetInfo) {
        this.TextRightAlign = false; // 全局是否右对齐
        this.NumberRightAlign = false; // 数值是否右对齐
        $.MvcSheetUI.Controls.SheetAssociation.Base.constructor.call(this, element, options, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetAssociation.Inherit($.MvcSheetUI.IControl, {
        //控件渲染函数
        Render: function () {
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }
            // 移动端设置PlaceHolder
            if (this.IsMobile) {
                this.PlaceHolder = this.PlaceHolder || this.N;
            }
            if (this.OutputMappings != "") {
                this.OutputMappings += ',' + this.DataField + ':ObjectID;Name;RunningInstanceId';
            } else {
                this.OutputMappings += this.DataField + ':ObjectID;Name;RunningInstanceId';
            }

            $(this.Element).attr("OutputMappings", this.OutputMappings);
            $(this.Element).attr("PlaceHolder", this.PlaceHolder);
            if (!this.Editable) { // 不可编辑
                this.SetReadonly(true);
                return;
            }
            if (this.TextRightAlign) $(this.Element).addClass("txtAlignRight");
            else if (this.NumberRightAlign && this.IsNubmer()) { $(this.Element).addClass("txtAlignRight"); }
            if (this.ToolTip) $(this.Element).attr("title", this.ToolTip);

            // 注册KeyDown事件
            $(this.Element).unbind("change.SheetAssociation").bind("change.SheetAssociation", [this], function (e) {
                e.data[0]._OnChange();
            });


            // 绑定焦点事件
            $(this.Element).unbind("focus.SheetAssociation").bind("focus.SheetAssociation", [this],
                function (e) {
                    if (e.data[0].FormatRule) {
                        this.value = this.value.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                    }
                    if (e.data[0].OnFocus) {
                        e.data[0].RunScript(this, e.data[0].OnFocus);
                    }
                });
            // 注册KeyUp事件
            if (this.OnKeyUp) {
                $(this.Element).unbind("keyup.SheetAssociation").bind("keyup.SheetAssociation", [this], function (e) {
                    e.data[0].RunScript(this, e.data[0].OnKeyUp);
                });
            }
            // 注册KeyDown事件

            $(this.Element).unbind("keydown.SheetAssociation").bind("keydown.SheetAssociation", [this], function (e) {
                if (e.key == "Enter") return false;
                if (this.OnKeyDown) {
                    e.data[0].RunScript(this, e.data[0].OnKeyDown);
                }
            });
            // 失去焦点事件
            $(this.Element).unbind("blur.SheetAssociation").bind("blur.SheetAssociation", [this], function (e) {
                if (e.data[0].FormatRule) {
                    e.data[0].GetFromatValue($(e.data[0].Element), e.data[0].GetValue());
                }
            });

            if (this.IsMobile) {
                //移动端的开窗查询
                this._mobilePopup();
            } else {
                var linkUrl = this.GetLinkUrl();
                $(this.Element).wrap("<a href='" + linkUrl.url + "' target='" + linkUrl.target+ "'></a>");
                this._createPopup();
            }
            this.SetValue(this.V);
        },
        RenderMobile: function () {
            this.Render();
        },
        GetLinkUrl: function () {
            var instanceId = $(this.Element).attr("data-instanceid");
            var bizobjectId= $(this.Element).attr("data-objectid");
            var linkUrl = "javascript:void(0);";
            var target = "";
            if (this.LinkMode != "None" && bizobjectId) {
                linkUrl = "MvcDefaultSheet.aspx?Mode=View&SchemaCode=" + $(this.Element).attr("data-schemacode") + "&BizObjectID=" + bizobjectId;
                target = "_blank";
            }
            if (this.LinkMode == "Workflow" && instanceId) {
                linkUrl = "InstanceSheets.html?InstanceId=" + instanceId;
                target = "_blank";
            }
            if (this.IsMobile && target) {
                linkUrl += "&IsMobile=true";
            }
            var linkInfo = {
                url: linkUrl,
                target:target
            };
            return linkInfo;
        },
        IsNubmer: function () {
            return (this.LogicType == 7 || this.LogicType == 9 || this.LogicType == 35);
        },
        SetValue: function (v) {
            var objId = '';
            var instanceid = '';
            if (v && v.length > 1) {
                objId = v[0];
                instanceid = v[2];
                v = v[1];
            }
            $(this.Element).attr("data-objectid", objId);
            $(this.Element).attr("data-instanceid", instanceid);
            if (this.LinkMode != "None" && !this.IsMobile) {
                var linkUrl = this.GetLinkUrl();
                $(this.Element).parent().attr("href", linkUrl.url);
                $(this.Element).parent().attr("target", linkUrl.target);
            }
            $(this.Element).val(v);
            $(this.Element).change();
            if (this.FormatRule) {
                this.GetFromatValue($(this.Element), v);
            }
            //移动
            if (this.IsMobile) {
                this.Mask.html(this.GetText());
                if (this.Editable) {
                    if (this.Mask.text() === "") {
                        this.Mask.text(this.PlaceHolder);
                        this.Mask.css({ "color": "#aaa" });
                    } else {
                        this.Mask.css({ "color": "#2c3038" });
                    }
                } else {
                    this.Mask.css({ "color": "#aaa" });
                }
            }
        },
        //移动端开窗
        _mobilePopup: function () {
            if (this.PopupWindow == "None") return;
            //1.隐藏当前输入框
            //2.增加显示返回值 a
            //3.增加图标提示点击事件
            //4.item 添加样式 item-icon-right
            //this.ViewInNewContainer = $(this.Element).parent();
            this.ID = $(this.Element).attr("Id");
            $(this.Element).hide();
            $(this.Element).parent().find("[id*=mask]").remove();
            $(this.Element).parent().find("i.icon").remove();
            this.Mask = $("<span></span>").insertAfter(this.Element).attr("id", "mask_" + this.ID);
            this.Mask.insertAfter(this.Element).attr("id", "mask_" + this.ID);
            var _that = this;
            if (_that.Editable) {
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).parent().parent().unbind("click.query").bind("click.query", function () {
                     //objectid用来显示已选择的项
                    $.MvcSheetUI.IonicFramework.$state.go("form.sheetquery", { datafield: _that.DataField, rownum: $(this).find("[data-datafield='" + _that.DataField + "']").attr("data-row"), objectid: _that.Element.dataset.objectid });
                })
            }

        },
        AfterMobileEditShow: function () {
            if (this.PopupElement)
                this.PopupElement.SheetQuery().AfterMobileEditShow();
        },
        _createPopup: function () {
            var that = this;
            //开窗查询(DisplayText SchemaCode QueryCode InputMappings OutputMappings)
            //弹窗模式
            console.log(this.DisplayText, 'this.DisplayText')
            var displayText = this.DisplayText === "" ? "&nbsp;" : this.DisplayText;
            var popupDivId = "popupLink" + (new Date()).getTime();
            var outputParams = "";
            outputParams = "&OutputParams=" + encodeURI(this.OutputMappings.replace(/,/g, "|").replace(/:/g, ","));
            var w = that.PopupWidth ? that.PopupWidth : "600px";
            var h = that.PopupHeight ? that.PopupHeight : "400px";
            //弹窗div
            var popupDiv = "<div id='" + popupDivId + "' class='modal fade' tabindex='-1' role='dialog' aria-hidden='true'>"
            popupDiv += "<div class='modal-dialog'>";
            popupDiv += "<div class='modal-content' style='width:" + w + ";'>";
            popupDiv += "<div class='modal-header'>";
            popupDiv += "<button type='button' class='close' data-dismiss='modal'>";
            popupDiv += "<span aria-hidden='true'>&times;</span></button>";
            popupDiv += "<h4 class='modal-title'>" + displayText  + "</h4>";
            popupDiv += "</div><div class='modal-body'>";
            popupDiv += "<iframe scrolling='no' frameborder='0' width='100%' height='" + h + "'></iframe>";
            popupDiv += "</div></div></div></div>";
            popupDiv = $(popupDiv);
            //弹窗按钮
            var popupLink = $("<a href='javascript:;'>" + displayText + "</a>");
            popupLink.click(function () {
                var src = that.PortalRoot + "/admin/TabMaster.html?url=ListMasterData.html&OpenType=1&IsPopup=1&SchemaCode=" + that.SchemaCode +
                    "&QueryCode=" + that.QueryCode + "&CtrlID=" + popupDivId + outputParams + that._getInputParam();
                popupDiv.find("iframe").attr("src", src);
                popupDiv.modal("show");
            });
            //在Element后添加弹窗元素
            $(this.Element).after(popupLink).after(popupDiv);
            //弹窗页面双击回调函数(\Portal\WFRes\_Scripts\bizquery.js)
            window[popupDivId] = {};
            window[popupDivId].ListMasterCallBack = function (data) {
                //将选择的记录值，赋值到界面元素
                if (data) {
                    for (var field in data) {
                        $.MvcSheetUI.SetControlValue(field, data[field], that.GetRowNumber());
                    }
                }
                //关闭弹窗
                popupDiv.modal("hide");
            };
        },
        _getInputParam: function () {
            var inputParam = "";
            if (this.InputMappings) {
                var items = this.InputMappings.split(",");
                for (var i = 0; i < items.length; i++) {
                    var fields = items[i].split(":");
                    if (fields && fields.length == 2) {
                        if (fields[0] && $.MvcSheetUI.GetSheetDataItem(fields[0], this.GetRowNumber())) {
                            inputParam += fields[1] + "," + $.MvcSheetUI.GetControlValue(fields[0], this.GetRowNumber()) + "|";
                        }
                    }
                }
                if (inputParam) {
                    inputParam = "&InputParam=" + encodeURI(inputParam.substring(0, inputParam.length - 1));
                }
            }
            return inputParam;
        },
        SetReadonly: function (v) {
            if (v) {
                var objId = '';
                if (this.V && this.V.length > 1) {
                    objId = this.V[0];
                    this.V = this.V[1];
                }
                $(this.Element).hide();
                var that = this;
                var lbl = $("<label for='" + $(that.Element).attr("id") + "'></label>");
                if (this.TextRightAlign) lbl.addClass("txtAlignRight").css("width", $(this.Element).width());
                else if (this.NumberRightAlign && this.IsNubmer()) { lbl.addClass("txtAlignRight"); }
                var val = $.trim(this.V);
                var linkUrl = this.GetLinkUrl();
                if (val != "") {
                    var strs = val.split("\n");
                    $(strs).each(function (i) {
                        if (i > 0) {
                            lbl.append("<br />");
                        }
                        lbl.append($("<a href='" + linkUrl.url+ "' target='" + linkUrl.target+ "'><span></span></a>").text(this.toString()));
                    });
                }
                lbl.insertAfter($(this.Element));
                this.GetFromatValue(lbl, this.Element.value);
            } else {
                $(this.Element).show();
                $(this.Element).next().remove();
            }
        },
        //值改变事件
        _OnChange: function (e) {
            // 执行验证
            this.Validate();

            if (this.OnChange) {
                //执行绑定事件
                this.RunScript(this.Element, this.OnChange);
            }

            //是否自动去除前后空格
            if (this.AutoTrim) {
                this.Value = that.Value.trim();
            }
        },
        // 数据验证
        Validate: function (effective, initValid) {
            if (!this.Editable) return true;
            if (initValid) {
                if (this.Required && !this.GetValue()) {
                    this.AddInvalidText(this.Element, "*", false);
                    return false;
                }
            }
            var val = this.GetValue();
            if (!effective) {
                if ($(this.Element).attr("data-required") || this.O.indexOf("R") > -1) this.Required = true;
                else this.Required = false;
                // 必填验证
                if (this.Required && !this.DoValidate(this.Valid.Required, [val], "*")) {
                    this.ValidateResult = false;
                    return false;
                }
                if (this.RegularExpression && val) {
                    if (!this.DoValidate(this.Valid.RegularExpression, [val, this.RegularExpression], this.RegularInvalidText)) {
                        this.ValidateResult = false;
                        return false;
                    }
                }
            }

            // 处理数据逻辑型验证
            switch (this.LogicType) {
                case $.MvcSheetUI.LogicType.Int:
                case $.MvcSheetUI.LogicType.Long:
                    if (!this.DoValidate(this.Valid.Integer, [val], SheetLanguages.Current.EnterInteger)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    break;
                case $.MvcSheetUI.LogicType.Double:
                    if (!this.DoValidate(this.Valid.Number, [val], SheetLanguages.Current.EnterNumber)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    break;
                default:
                    break;
            }
            this.ValidateResult = true;
            return true;
        },
        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = $.MvcSheetUI.GetSheetDataItem(this.DataField); // this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }

            if (("" + result[this.DataField].V) != this.GetValue()) {
                this.RefreshDataTrackLink();
                result[this.DataField].V = this.GetValue().trim();
                return result;
            }

            return {};
        },
        GetValue: function () {
            return $(this.Element).attr("data-objectid");
        }
    });
})(jQuery);
     // 附件控件
(function ($) {
    $.fn.SheetAttachment = function () {
        return $.MvcSheetUI.Run.call(this, "SheetAttachment", arguments);
    };
    // 构造函数
    $.MvcSheetUI.Controls.SheetAttachment = function (element, ptions, sheetInfo) {
        _PORTALROOT_GLOBAL ? _PORTALROOT_GLOBAL : '/Portal';
        this.SheetAttachmentHandler = _PORTALROOT_GLOBAL + "/FileUpload/UploadFile";
        this.FileUpload = $("<input type='file' id='myUpfile' />").attr("data-attachment", true);
        //文件数
        this.Files = 0;
        //新添加的
        this.AddAttachments = {};
        this.UploadAttachmentsIds = [];
        //删除数据库的
        this.RomveAttachments = [];
        //异步数据
        this.XHRJson = {};
        //数据模型编码
        this.SchemaCode = "";

        //隐藏了可配置属性，设置固定多选
        this.Multiple = true;
        //update by luxm
        //设置最大文件值
        this.MaxUploadSizefloat = element.getAttribute("data-maxuploadsize");
        // window.console.log(parseFloat(this.MaxUploadSizefloat));

        $.MvcSheetUI.Controls.SheetAttachment.Base.constructor.call(this, element, ptions, sheetInfo);
        // window.console.log($.MvcSheetUI.Controls.SheetAttachment);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetAttachment.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            if (!this.Visiable) {
                $(this.Element).hide();
                return;
            }

            this.HtmlRender();
            //初始化数据
            this.InitValue();

            //是否支持Html5
            if ((this.IsHtml5)) {
                this.Html5Render();
            } else {
                this.NotHtml5Render();
            }
        },
        RenderMobile: function () {
            this.Render();
            //this.MoveToMobileContainer(this.Element);
            //移动端附件需要另外创建一个div存放内容
            var oldDivContainer = $(this.Element).closest("div.item");
            oldDivContainer.css("padding", "1px").removeClass("item-input");
            var spantitle = $(this.Element).parent().prev().remove();
            var newDivTitle = $("<div class='item item-input attachment'></div>");
            newDivTitle.append(spantitle);
            if (this.Visiable)
                newDivTitle.insertBefore(oldDivContainer);
            $(this.Element).parent().width("100%");
            if (this.Editable) {
                this.btnUpload = $('<div class="detail item-icon-right file-up"><span>' + SheetLanguages.Current.PleaseSelect + '</span><div class="paperclip"></div></div>').appendTo(newDivTitle);
                this.FileUpload.appendTo(newDivTitle)
                var _that = this;
                newDivTitle.bind("click.uploadAttachment", function () {
                    _that.MobileSelectFileAction()
                })
            }



            //截取文件名
            $(this.Element).find('.file').next(".input-label").each(function (index, ele) {
                var fileName = $(this).text();
                if (fileName && fileName.length >= 15) {
                    fileName = fileName.substr(0, 12) + '...';
                }
                $(this).text(fileName);

            })

        },
        // 选择附件
        MobileSelectFileAction: function () {
            var _that = this;
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            var isDingTalk = $.MvcSheetUI.IonicFramework.$rootScope.dingMobile.isDingMobile;
            // ios或者钉钉
            if (isiOS || isDingTalk) {
                // alert('isiOS-isDingTalk')
                // _that.FileUpload.click();
                document.getElementById("myUpfile").addEventListener("click", function(){
                    // alert(11111)
                })
            }
            else {
                var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                    buttons: [
                        {text: SheetLanguages.Current.TakePhotos},
                        {text: SheetLanguages.Current.FileSelect}
                    ],
                    cancelText: SheetLanguages.Current.Cancel,
                    cancel: function () {
                        return false;
                    },
                    buttonClicked: function (index) {
                        if (index == 0) {
                            hideSheet();
                            //限定只能上传图片和相机
                            _that.FileUpload.removeAttr("multiple").attr("accept", "image/*").attr("capture", "camera");
                            if ($(_that.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase()) != _that.DataField)
                                return;
                            _that.FileUpload.click();
                        } else {
                            hideSheet();
                            _that.FileUpload.removeAttr("capture").removeAttr("accept");
                            //if (_that.FileExtensions) {
                            //    _that.FileUpload.attr("accept", _that.FileExtensions)
                            //}
                            if ($(_that.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase()) != _that.DataField)
                                return;
                            _that.FileUpload.click();
                        }
                    }
                });
                $.MvcSheetUI.IonicFramework.$timeout(function () {
                    hideSheet();
                }, 10000);
            }
        },

        MobileDownLoad: function (url) {

        },

        MobileItemClick: function (fileId, fileUrl, IsImg) {
            var _that = this;
            var buttons = [
                {text: SheetLanguages.Current.Preview, code: 'Preview'},
                {text: SheetLanguages.Current.Delete, code: 'delete'}
            ];
            if (!fileUrl && this.Editable) {
                buttons = [{text: SheetLanguages.Current.Delete, code: 'delete'}];
            }
            if (fileUrl && !this.Editable) {
                buttons = [{text: SheetLanguages.Current.Preview, code: 'Preview'}];
            }
            // 预览
            var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                buttons: buttons,
                titleText: SheetLanguages.Current.AtatchmentAcction,
                cancelText: SheetLanguages.Current.Cancel,
                buttonClicked: function (index, button) {
                    // console.log(button)
                    if (button.code == "Preview") {
                        var url = window.location.href;
                        url = url.split(_PORTALROOT_GLOBAL)[0];
                        // 钉钉
                        if ($.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "dingtalk" && dd) {
                            var u = navigator.userAgent;
                            var ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                            if (ios) {
                                dd.biz.util.openLink({
                                    url: url + fileUrl + "?" + Math.random(),
                                    onSuccess: function (data) {},
                                    onFail: function (err) {
                                        $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("响应错误");
                                    }
                                });
                            }
                            else {
                                $.ajax({
                                    type: "POST",
                                    url: url + fileUrl + "&AppLogin=true" + "?" + Math.random(),
                                    cache: false,
                                    success: function (data) {
                                        if (data && data.success && data.url) {
                                            var downloadUrl = data.url;
                                            //支持的格式
                                            var SupportFileExtension = ".jpg,.gif,.jpeg,.png,.txt,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.xml";
                                            var Browse_Extension = ["jpg", "gif", "jpeg", "png", "txt", "doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "xml"];
                                            if (Browse_Extension.indexOf(data.extension) > -1) {
                                                $.MvcSheetUI.IonicFramework.$rootScope.AttachmentUrl = downloadUrl;
                                                $.MvcSheetUI.IonicFramework.$state.go("form.downLoadFile", {extension: data.extension})
                                            } else {
                                                dd.biz.util.openLink({
                                                    url: url + downloadUrl + "?" + Math.random(),
                                                    onSuccess: function (data) {},
                                                    onFail: function (err) {
                                                        $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("响应错误");
                                                    }
                                                });
                                                // $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("不支持" + data.extension + "格式文件的预览");
                                            }
                                        } else {
                                            $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("预览错误");
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            //liming  20180914 修改附件预览方式
                            //wechat,mobile,app
                            $.ajax({
                                type: "POST",
                                url: url + fileUrl + "&AppLogin=true" + "?" + Math.random(),
                                cache: false,
                                success: function (data) {
                                    // $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow(data.extension, '2')
                                    if (data && data.success && data.url) {
                                        // window.location.href = data.url
                                        // var options = {};
                                        // if (window.cordova && window.cordova.InAppBrowser) {
                                        //     cordova.InAppBrowser.open(data.url, '_blank', options);
                                        // }
                                        var downloadUrl = data.url;
                                        // //支持的格式
                                        // var SupportFileExtension = ".jpg,.gif,.jpeg,.png,.txt,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.xml";
                                        var Browse_Extension = ["jpg", "gif", "jpeg", "png", "txt", "doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "xml"];
                                        if (Browse_Extension.indexOf(data.extension) > -1) {
                                            $.MvcSheetUI.IonicFramework.$rootScope.AttachmentUrl = downloadUrl;
                                            var u = navigator.userAgent;
                                            var ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                                            if (ios) {
                                                window.location.href = downloadUrl;
                                            } else {
                                                $.MvcSheetUI.IonicFramework.$state.go("form.downLoadFile", {extension: data.extension})
                                            }
                                        }
                                        else {
                                            // $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("不支持" + data.extension + "格式文件的预览");
                                            var link = document.createElement("a");
                                            link.download = data.filename;
                                            link.href = data.url;
                                            link.click();
                                        }
                                    }
                                    else {
                                        $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("预览失败");
                                    }
                                },
                                error: function () {
                                    $.MvcSheetUI.IonicFramework.fcommonJS.loadingShow("响应错误");
                                }
                            })
                        }
                    }
                    else if (button.code == "delete") {
                        _that.RemoveFile.apply(_that, [fileId]);
                    }
                    return true;
                }
            });
        },

        //初始化已上传文件
        InitValue: function () {
            if (this.V) {
                //子表编辑时
                if (this.BizObjectID == undefined) {
                    this.BizObjectID = this.SheetInfo.BizObjectID;
                }

                for (var i = 0; i < this.V.length; ++i) {
                    this.CreateFileElement($.trim(this.V[i].Code), this.V[i].Name, this.V[i].Size, this.V[i].Url, this.V[i].ContentType);
                }

                /*批量下载
                 *只有一个文件的时候不需要批量下载
                 */
                if (!this.IsMobile && this.AllowBatchDownload && this.V.length > 1) {
                    var BatchDownload = $("<a href=\"" + _PORTALROOT_GLOBAL + "/ReadAttachment/ReadBatch?BizObjectID=" + this.BizObjectID + "&SchemaCode=" + this.SchemaCode + "&DataField=" + this.DataField + "&DisplayName=" + this.DataField + "\" class=\"printHidden\">批量下载</a>");
                    $(this.Element).append(BatchDownload);
                    if (this.IsMobile) {
                        BatchDownload.css("margin-left", "10px").css("margin-right", "10px").addClass("button").addClass("block");
                    } else {
                        BatchDownload.width("100%")
                                .addClass("btn btn-lg")
                                // .css("border", "1px dashed #ddd");
                    }
                }
            }
        },
        // 数据验证
        Validate: function (effective, initValid) {
            if (!this.Editable)
                return true;
            if (initValid) {
                if (this.Required && this.Files < 1) {
                    if (this.IsMobile) {
                        this.AddMobileInvalidText(this.Element, "*", false);
                    } else {
                        this.AddInvalidText(this.Element, "*", false);
                    }
                    return false;
                }
            }
            if (!effective) {
                if (this.Required) {//必填的
                    if (this.Files < 1) {
                        if (this.IsMobile) {
                            this.AddMobileInvalidText(this.Element, "*", false);
                        } else {
                            this.AddInvalidText(this.Element, "*");
                        }
                        return false;
                    }
                    // IE8  产品不支持IE8
                    if (false && this.Files[0] == null && $(this.Element).find("a").length < 2) {
                        this.AddInvalidText(this.Element, "*");
                        return false;
                    }
                }

              //提交时增加对不合法附件的校验
                if (this.FileExtensions || this.MaxUploadSizefloat) {
                    var fileLength = 0;
                    if(this.IsMobile) {
                        fileLength = $(this.Element).children('.list').children('a').length;
                    } else {
                        fileLength = $(this.Element).find('table tr').length;
                    }
                    if(fileLength > this.Files) {
                        $(this.Element).addClass('inputError');
                        return false;
                    } else if ($(this.Element).hasClass('inputError')) {
                        $(this.Element).removeClass('inputError');
                    }
                }
            }

            if (this.IsHtml5) {
                //如果是支持Html5的话，得判断是否已经上传完整，需要等待
                for (var key in this.AddAttachments) {
                    if (this.AddAttachments[key].state == 0) {
                        this.AddInvalidText(this.Element, SheetLanguages.Current.Uploading);
                        return false;
                    }
                }
            } else {
                this.Form.submit();
            }
            if (this.IsMobile) {
                this.RemoveMobileInvalidText();
            } else {
                this.RemoveInvalidText(this.Element);
            }
            return true;
        },

        AddMobileInvalidText: function (element, invalidText, cssChange) {
            if ($.MvcSheetUI.SheetInfo.IsMobile == false) {
                if (!$(this.btnUpload).prev().hasClass(this.Css.InvalidText)) {
                    $("<label class=\"" + this.Css.InvalidText + "\">" + invalidText + "</label>").insertBefore($(this.btnUpload));
                }
            } else {
                if ($(this.btnUpload).closest('.item.item-input').find(".input-label").find('.' + this.Css.InvalidText).length == 0) {
                    var input_label = $(this.btnUpload).closest('.item.item-input').find(".input-label")[0];
                    var input_label_text = $(input_label).text();
                    $(input_label).empty();
                    $("<span>" + input_label_text + "</span>").appendTo($(input_label));
                    var InvalidTextLabel = $("<label class=\"" + this.Css.InvalidText + "\">" + invalidText + "</label>");
                    InvalidTextLabel.appendTo($(this.btnUpload).closest('.item.item-input').find(".input-label"));
                }
            }
        },
        RemoveMobileInvalidText: function () {
            if ($.MvcSheetUI.SheetInfo.IsMobile == false) {
                $(this.btnUpload).removeClass(this.Css.inputError);
                if ($(this.btnUpload).prev().hasClass(this.Css.InvalidText))
                    $(this.btnUpload).prev().remove();
            } else {
                $(this.btnUpload).closest('.item.item-input').find("." + this.Css.InvalidText).remove();
            }
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable)
                return result;

            //result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
            result[this.DataField] = this.DataItem;

            result[this.DataField].V = this.GetValue();
            return result;
        },

        GetValue: function () {
            var AttachmentIds = "";
            if ((this.IsHtml5)) {
                //如果是支持Html5的话，得判断是否已经上传完整，需要等待
                for (var key in this.AddAttachments) {
                    if (this.AddAttachments[key].state == 1 && this.AddAttachments[key].AttachmentId) {
                        AttachmentIds += this.AddAttachments[key].AttachmentId + ";";
                    }
                }
                if (key == undefined && this.DataItem.V.length > 0) {
                    AttachmentIds += this.DataItem.V[0].Code + ";";
                }
            } else {
                for (var i = 0; i < this.UploadAttachmentsIds.length; i++) {
                    AttachmentIds += this.UploadAttachmentsIds[i] + ";"
                }
            }

            var DelAttachmentIds = "";
            for (var i = 0; i < this.RomveAttachments.length; ++i) {
                DelAttachmentIds += this.RomveAttachments[i] + ";";
            }
            var result = {
                AttachmentIds: AttachmentIds,
                DelAttachmentIds: DelAttachmentIds
            };
            return result;
        },

        GetText: function () {
            return this.Files;
        },

        ClearFiles: function () {
            $(this.Element).html("");
            this.Files = 0;
            this.Validate();
        },

        HtmlRender: function () {
            //设置宽度
            $(this.Element).addClass("SheetAttachment");

            if (this.IsMobile) {
                this.UploadList = $("<div class='list'></div>")
            } else {
                //添加附件展示列表和按钮
                this.UploadList = $("<table class='table table-striped'></table>").css("margin", 0).css("min-height", "0px");
            }

            $(this.Element).append(this.UploadList);
        },

        NotHtml5Render: function () {
            if (!this.Editable)
                return;
            $(this.Element).width(this.Width);
            var id = $.MvcSheetUI.NewGuid();

            var param = "DataField=" + encodeURI(this.DataField) + "&PostForm=true&BizObjectID=" + this.SheetInfo.BizObjectID + "&SchemaCode=" + encodeURI(this.SchemaCode);
            param += "&MaxSize=" + (this.MaxUploadSize * 1024);
            //设置form属性，关键是target要指向iframe
            this.Form = $("<form id=\"" + id + "\" method=\"post\" enctype=\"multipart/form-data\" action=\"" + this.SheetAttachmentHandler + "?" + param + "\"></form>");
            $(this.Element).append(this.Form);
            ///创建iframe
            this.CreateFrame();

            //是否多选
            if (this.Multiple) {
                this.BtnAdd = $("<div>" + SheetLanguages.Current.Add + "</div>").addClass("SheetAttachmentAdd");
                $(this.Form).append(this.BtnAdd);
                $(this.BtnAdd).unbind("click.AddAttachment").bind("click.AddAttachment", this, function (e) {
                    e.data.AddAttachment.apply(e.data);
                });
            } else {
                $(this.FileUpload).attr("name", $.MvcSheetUI.NewGuid());
                $(this.Form).append(this.FileUpload);
            }
            this.BtnUpload = $("<div>" + SheetLanguages.Current.Upload + "</div>").addClass("SheetAttachmentUpload");
            $(this.BtnUpload).unbind("click.UploadAttachment").bind("click.UploadAttachment", this, function (e) {
                e.data.Form.submit();
                var ids = "";
                $(e.data.Form).find("input").each(function () {
                    if (this.value)
                        ids += "," + this.name;
                    if (e.data.UploadAttachmentsIds.indexOf(this.name) == -1) {
                        e.data.UploadAttachmentsIds.push(this.name);
                    }
                });
                var that = e.data;
                if (ids) {
                    setTimeout(function () {
                        that.CheckUpload(ids)
                    }, 500);
                }
            });
            $(this.Form).append(this.BtnUpload);
            this.AddAttachment();
        },
        CheckUpload: function (ids) {
            // console.log(ids, 'ids')
            var that = this;
            $.MvcSheet.GetSheet(
                    {
                        "Command": "GetAttachmentHeader",
                        "Param": JSON.stringify([this.SheetInfo.SchemaCode, this.SheetInfo.BizObjectID, ids])
                    },
                    function (data) {
                        if (data && data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                that.CreateFileElement(data[i].AttachmentID, data[i].FileName, data[i].ContentLength, that.PortalRoot + "/ReadAttachment/Read?AttachmentID=" + data[i].AttachmentID, data[i].ContentType)
                                ids = ids.replace("," + $.trim(data[i].AttachmentID), "");
                                $("div[id='" + $.trim(data[i].AttachmentID) + "']").remove();
                            }
                        }

                        if (ids) {
                            setTimeout(function () {
                                that.CheckUpload(ids)
                            }, 500);
                        }
                    }
            );
        },
        // 创建iframe
        CreateFrame: function () {
            var FrameName = "uploadFrame_" + $.MvcSheetUI.NewGuid();
            var oframe = $('<iframe name=' + FrameName + '>');
            //修改样式是css，修改属性是attr
            oframe.css("display", "none");
            //在内部的前面加节点
            $('body').prepend(oframe);
            //设置form属性，关键是target要指向iframe
            this.Form.attr("target", FrameName);
            this.Form.attr("method", "post");
            //注意ie的form没有enctype属性，要用encoding
            this.Form.attr("encoding", "multipart/form-data");
        },
        // 非Html5添加附件
        AddAttachment: function () {
            var contentid = $.MvcSheetUI.NewGuid();
            var newContent = $("<div>").attr("id", contentid).addClass("upload").css("clear", "both");//.css("padding-bottom", "6px");
            var fileinput = $("<input type=\"file\" style=\"width:60%;\"  />").attr("name", contentid);
            var btnDel = $("<a href='#' style=\"padding-left:10px;\">" + SheetLanguages.Current.Remove + "</a>").attr("data-content", contentid);

            $(btnDel).unbind("click.DeleteAttachment").bind("click.DeleteAttachment", this, function (e) {
                e.data.Files--;
                $("#" + $(this).attr("data-content")).remove();
            });

            newContent.append(fileinput).append(btnDel);
            $(this.BtnAdd).before(newContent);
            this.Files++;
            this.Validate();
        },
        // Html5渲染
        Html5Render: function () {
            if (!this.Editable)
                return;
            // 是否多选
            if (this.Multiple) {
                this.FileUpload.attr("multiple", "multiple");
            }

            //上传地址
            this.SheetAttachmentHandler += "?IsMobile=" + this.IsMobile + "&" + "SchemaCode=" + encodeURI(this.SchemaCode) + "&fileid=";
            // console.log(this.SheetAttachmentHandler, 'this.SheetAttachmentHandler')
            this.ActionPanel = $("<div>" + SheetLanguages.Current.DragUpload + "</div>");
            if (this.IsMobile) {
                this.ActionPanel.css("margin-left", "10px").css("margin-right", "10px").addClass("button").addClass("block");
            } else {
                this.ActionPanel.width("100%")
                        .addClass("btn btn-lg btn-outline")
                        // .css("border", "1px dashed #ddd");
                this.ActionPanel.append("<i class=\"fa fa-upload\" aria-hidden=\"true\" style='padding-left: 10px;color: rbga(0,0,0,0.85)'></i>")
            }
            $(this.Element).append(this.ActionPanel);

            if (this.FileExtensions) {
                this.FileUpload.attr("accept", this.FileExtensions);
            }

            //添加上传控件
            $(this.Element).append(this.FileUpload);
            if (this.IsMobile) {
                this.ActionPanel.hide();
                // this.FileUpload.hide();
                this.FileUpload.css({'opacity': '0', 'z-index': '99'});
            } else {
                this.FileUpload.hide();
            }
            $(this.ActionPanel).unbind("click.SheetAttachment").bind("click.SheetAttachment", this, function (e) {
                $.extend(this, e.data);
                if ($(this.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase()) != this.DataField)
                    return;
                this.FileUpload.click();
            });

            this.FileUpload.unbind("change.FileUpload").bind("change.FileUpload", this, function (e) {
                e.data.AddFiles.apply(e.data, [e.data.getFiles(this.files)]);
                $(this).val("")
            });

            this.BindDrag();
        },
        //绑定拖拽上传事件
        BindDrag: function () {
            //移动端不支持拖拽
            if (this.IsMobile)
                return;
            $(this.ActionPanel).on({
                dragenter: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                },
                dragleave: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                },
                dragover: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            var that = this;
            this.ActionPanel[0].addEventListener("drop", function (e) {
                e.stopPropagation();
                e.preventDefault();//取消默认浏览器拖拽效果

                var files = that.getFiles(e.dataTransfer.files);
                that.AddFiles.apply(that, [files]);
            }, false);
        },
        getFiles: function (files) {
            var filesArr = [];
            for (var i = 0; i < files.length; i++) {
                filesArr.push(files[i]);
            }
            return filesArr;
        },
        //链接点击时打开图片
        _OpenImage: function (e) {
            var thisAnchor = $(e.target);
            if (!thisAnchor.is("[data-img-url]")) {
                thisAnchor = $(thisAnchor).closest("[data-img-url]");
            }
            var panelId = $(thisAnchor).attr("img-panel-id");

            if (!panelId) {
                panelId = $.uuid();
                $(thisAnchor).attr("img-panel-id", panelId);

                var _panel = $("<div>").addClass("panel").attr("id", panelId).attr("js-scrolling", "false").attr("data-footer", "none");
                var _imgWrapper = $("<div>").addClass("img-wrapper");
                var img = document.createElement("img");
                _imgWrapper.append(img);
                _panel.append(_imgWrapper);
                _panel.appendTo("#content");
                $.ui.loadContent(panelId);

                img.onload = function () {
                    var thisImg = $(arguments[0].target);
                    var imgWidth = thisImg.width();
                    //var imgheight = thisImg.height();
                    var panelWidth = $(thisImg).closest(".panel").width();
                    //var panelHeight = $("#content").height();

                    //默认缩放
                    var zoomMin = 1;
                    //如果图片过宽，将图片默认显示为适应屏幕宽度
                    if (imgWidth > panelWidth) {
                        zoomMin = panelWidth / imgWidth;
                    }

                    setTimeout(function () {
                        imgScroll = new IScroll(_imgWrapper.get(0), {
                            zoom: true,
                            zoomMin: zoomMin,
                            zoomMax: 4,
                            scrollX: true,
                            scrollY: true,
                            wheelAction: "zoom"
                        });
                        imgScroll.zoom(zoomMin);
                    }, 600)
                }
                //img.src = $(thisAnchor).attr("data-img-url");
                var url = $(thisAnchor).attr("data-img-url");
                $.ajax({
                    type: "POST",
                    url: url,
                    success: function (data) {
                        img.src = data;
                    }
                });
            } else {
                $.ui.loadContent(panelId);
            }
        },
        //渲染图片链接
        RenderImageAnchor: function (anchor, url) {
            anchor.unbind("click").bind("click", this._OpenImage);
        },

        //创建上传元素
        //有url就是已经上传的控件，不需要判断size 大小
        CreateFileElement: function (fileid, name, size, url, contentType) {
            var fileSizeStr = 0;
            if (size > 1024 * 1024)
                fileSizeStr = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            else
                fileSizeStr = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
            var fileSize = $("<td data-filesize='" + fileid + "'><span data-filerate='" + fileid + "'>" + SheetLanguages.Current.Loading + "</span> (" + fileSizeStr + ")</td>").addClass("text-info");
            var actionTd = $("<td data-action='" + fileid + "' class=\"printHidden\"></td>");

            //移动端使用span
            if (this.IsMobile) {
                fileSize = $("<span class='item-note' data-filesize='" + fileid + "'>（" + fileSizeStr + "）</span><span class='item-note' data-filerate='" + fileid + "'>" + SheetLanguages.Current.Loading + "</span>")
                actionTd = $("<span data-action='" + fileid + "' class=\"printHidden\"></span>");
            }
            //移动端不需要actionStr
            //var actionStr = $("<a href='javascript:void(0);' class='fa fa-minus'>" + SheetLanguages.Current.Remove + "</a>");
            var actionStr = $("<a href='#' class='fa fa-minus'>" + SheetLanguages.Current.Remove + "</a>");
            if (this.Editable) {
                actionStr.unbind("click.fileDeleteBtn").bind("click.fileDeleteBtn", this, function (e) {
                    if (confirm(SheetLanguages.Current.ConfirmRemove)) {
                        e.data.RemoveFile.apply(e.data, [$(this).closest("tr").attr("id")]);
                    }
                });
            } else {
                actionStr.hide();
            }

            //标志是否能上传
            var flag = true;
            var fileName = name;
            var fileType = "";
            if (fileName.lastIndexOf(".") > 0) {
                //fileName = name.substring(0, name.lastIndexOf("."));
                fileType = name.substring(name.lastIndexOf("."), name.length);
                fileType = fileType.toLowerCase();
            }
            if (this.IsMobile) {
                //限制文件名长度
                if (fileName.length >= 15) {
                    fileName = fileName.substr(0, 12) + '...';
                }
                // console.log(fileName);
            }


            if (url == undefined) {
                if (this.FileExtensions) {
                    //文件格式校验
                    if (fileType != "") {
                        if (this.FileExtensions.indexOf(fileType) < 0) {
                            flag = false;
                        }
                    } else {
                        flag = false;
                    }
                }
                if (!flag) {

                    if (this.IsMobile) {
                        fileSize = $("<span data-filesize='" + fileid + "'data-filerate='" + fileid + "' style='color:red;'>" + SheetLanguages.Current.FileExtError + "</span>" + "<span>(" + fileSizeStr + ")</span>")
                    } else {
                        fileSize = $("<td data-filesize='" + fileid + "'><span data-filerate='" + fileid + "' style='color:red;'>" + SheetLanguages.Current.FileExtError + "</span> (" + fileSizeStr + ")</td>").addClass("text-info");
                    }
                } else {
                    //判断文件大小
                    var kbSize = Math.round(size * 100 / 1024) / 100;
                    // window.console.log(this.MaxUploadSize);
                    //update by luxm
                    //文件限制大小可为小数,默认10M
                    if (0 == parseFloat(this.MaxUploadSizefloat) || !this.MaxUploadSizefloat) {
                        // window.console.log("是否为0" + true);
                        this.MaxUploadSizefloat = "10";
                    }
                    if (kbSize > Math.round(parseFloat(this.MaxUploadSizefloat) * 1024)) {
                        flag = false;
                        window.console.log("最大设置上传大小" + Math.round(parseFloat(this.MaxUploadSizefloat) * 1024) + 'kb')
                        if (this.IsMobile) {
                            fileSize = $("<span data-filesize='" + fileid + "'data-filerate='" + fileid + "' style='color:red;'>" + SheetLanguages.Current.OverMaxLength + "</span>" + "<span>(" + fileSizeStr + ")</span>")
                        } else {
                            fileSize = $("<td data-filesize='" + fileid + "'><span data-filerate='" + fileid + "'  style='color:red;'>" + SheetLanguages.Current.OverMaxLength + "</span> (" + fileSizeStr + ")</td>").addClass("text-info");
                        }
                    }


                    //Ionic 1+版本使用UIWEBVIEW，此ISO控件在INPUT为多选时，无法上传视频
                    if (this.IsMobile) {
                        var u = navigator.userAgent;
                        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                        if (isIOS && (contentType.indexOf("video") > -1)) {
                            fileSize = $("<span style='color:red;'>" + SheetLanguages.Current.ISOVideoUploadWarn + "</span>").addClass("text-info");
                            //update by luxm
                            //ios不能上传视频，flag与文件File有关，验证的时候会以此为依据
                            flag = false;
                        }
                    }

                }
            } else {
                if (!this.IsMobile) {
                    actionTd.append($("<a href='" + url + "' class='fa fa-download' target='_blank' UC=true>" + SheetLanguages.Current.Download + "</a>"));
                    actionTd.append("&nbsp;&nbsp;");
                }
                if (this.IsMobile) {
                    fileSize = $("<span class='item-note' data-filesize='" + fileid + "'>" + fileSizeStr + "</span>")
                } else {
                    fileSize = $("<td data-filesize='" + fileid + "'>" + fileSizeStr + "</td>").addClass("text-info");
                }
            }

            var trRow = $("<tr></tr>").attr("id", fileid);
            if (this.IsMobile) {
                trRow = $("<a class='item item-input item-icon-right' style='white-space:nowrap;flex-wrap:wrap;' href='javascript:void(0)'></a>").attr("id", fileid);
            }


            if (!this.IsMobile || url == undefined) {
                if (url == undefined && this.IsMobile) {
                    trRow.append("<label class='input-label' title='" + name + "'>" + fileName + "<label>")
                    trRow.bind("click.mobilerow", this, function (e) {
                        e.data.MobileItemClick.apply(e.data, [trRow.attr("id"), url]);
                    });
                } else {
                    trRow.append("<td ><div class='LongWord'>" + name + "</div></td>");
                }

            } else {
                //移动端显示图片在Div里
                if (this.IsMobile && contentType && contentType.toLowerCase().indexOf("image/") == 0) {
                    trRow.attr("data-img-url", url);
                    trRow.append("<label  class='input-label'>" + name + "<label>");
                    // console.log(name);
                    trRow.attr("data-url", url);
                    // trRow.attr('download', '');// download属性
                    // trRow.attr('href',url);// href链接
                    trRow.unbind("click.mobilerow").bind("click.mobilerow", this, function (e) {
                        e.data.MobileItemClick.apply(e.data, [trRow.attr("id"), url]);
                    });
                } else {
                    //$.ajax({
                    //    type: "POST",
                    //    url: url,
                    //    async: false,
                    //    success: function (data) {
                    //        url = data;
                    //    }
                    //});

                    if (this.IsMobile) {
                        trRow.append("<label  class='input-label'>" + name + "<label>")
                        trRow.attr("data-url", url);
                        // trRow.attr("href", url);
                        // trRow.attr("download");
                        // trRow.attr("target", "_blank");
                        trRow.unbind("click.mobilerow").bind("click.mobilerow", this, function (e) {
                            e.data.MobileItemClick.apply(e.data, [trRow.attr("id"), url]);
                        });
                    } else {
                        trRow.append("<td ><a href='" + url + "' class='fa fa-download' target='_blank' UC=true><div class='LongWord'>" + name + "</div></a></td>");
                    }
                }
            }
            trRow.append(fileSize.css("text-align", "right"));
            if (this.IsMobile) {
                //移动端添加文件类型图标
                var fileTypeIcon = $("<span></span>");
                var suffix = name.match(/\.\w+$/);
                var fileTypeObj = {
                    'img': ['.bmp', '.jpg', '.jpeg', '.gif', '.png'],
                    'ppt': ['.ppt', '.pptx'],
                    'word': ['.doc', '.docx'],
                    'pdf': ['.pdf'],
                    'excel': ['.xls', '.xlsx']
                };
                suffix = String(suffix).toLowerCase();
                for (key in fileTypeObj) {
                    if (fileTypeObj[key].indexOf(suffix) != -1) {
                        fileTypeIcon.removeClass('file').addClass(key);
                        break;
                    } else {
                        fileTypeIcon.removeClass('file').addClass('file');
                    }
                }
                trRow.prepend(fileTypeIcon);
            }
            if (!this.IsMobile) {
                trRow.append(actionTd.append(actionStr).css("text-align", "center"));
            }
            this.UploadList.append(trRow);
            if (flag) {
                this.Files++;
            }

            var divWidth = 150;
            if ($(this.Element).width() > 100)
                divWidth = $(this.Element).width() / 2;

            trRow.find(".LongWord").width(divWidth + "px");
            //计算文字的长度
            var temID = $.MvcSheetUI.NewGuid();
            var wordWidth = $("<span>").attr("id", temID).text(name).appendTo("body").width();
            $("#" + temID).remove();
            if (divWidth < wordWidth) {
                trRow.find(".LongWord").attr("title", name).css("float", "left").after(fileType);
            }

            return flag;
        },
        //添加文件
        AddFiles: function (files) {
            if (!this.Multiple) {
                this.ClearFiles();
            }
            var getUrlParam = function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]); return null;
            };
            // debugger
            // 改成列队上传模式
            if (files && files.length > 0) {
                var fileid = $.MvcSheetUI.NewGuid(); // 文件id
                var SheetCode = getUrlParam("SheetCode"); // SheetCode
                // console.log(getUrlParam("SheetCode"))
                // var fileid = $.MvcSheetUI; // 文件id
                if (this.CreateFileElement(fileid, files[0].name, files[0].size, null, files[0].type)) {
                    //需要添加的附件
                    this.AddAttachments[fileid] = {
                        fileid: fileid,
                        file: files[0],
                        ContentType: files[0].type,
                        xhr: new XMLHttpRequest(),
                        state: 0//0:未上传完，1:已上传完,100:失败
                    };
                    files.splice(0, 1);
                    this.UploadFile(fileid, files, SheetCode);
                }
            }

        },
        //上传
        UploadFile: function (fileid, files, SheetCode) {
            if (this.AddAttachments[fileid] == null && this.AddAttachments[fileid].state != 0)
                return;

            var fd = new FormData();
            fd.append('fileToUpload', this.AddAttachments[fileid].file);
            fd.append('MaxSize', this.MaxUploadSize * 1024);

            var xhr = this.AddAttachments[fileid].xhr;
            xhr.context = this;
            xhr.files = files;
            xhr.upload.fileid = fileid;
            xhr.abort.fileid = fileid;

            xhr.upload.addEventListener('progress', this.UploadProgress, false);
            xhr.addEventListener('load', this.UploadComplete, false);
            xhr.addEventListener('error', this.UploadFailed, false);
            xhr.addEventListener('abort', this.UploadCanceled, false);

            xhr.open('POST', this.SheetAttachmentHandler + fileid + "&SheetCode=" + SheetCode);
            xhr.send(fd);
        },
        UploadProgress: function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                /*
                 * 在上传大文件的时候，在后台处理的时间会比较久
                 * 先只将上传进度显示为99%，在UploadComplete里改为100%
                 */
                if (percentComplete >= 100)
                    percentComplete = 99;
                $("span[data-filerate='" + evt.currentTarget.fileid + "']").html(percentComplete + "%");
            } else {
                this.context.AddAttachments[evt.currentTarget.fileid].state = 100;
                $("span[data-filerate='" + evt.currentTarget.fileid + "']").css("color", "red").html(SheetLanguages.Current.UploadError);
            }
        },
        UploadComplete: function (evt) {
            if (evt.target.status == 200) {
                var resultObj = eval('(' + evt.target.responseText + ')');
                var fileid = resultObj.FileId;
                this.context.AddAttachments[fileid].state = 1;
                this.context.AddAttachments[fileid].AttachmentId = resultObj.AttachmentId;
                $("td[data-action='" + fileid + "']").prepend("&nbsp;&nbsp;");
                if (this.context.IsMobile) {
                    //显示图片
                    if (this.context.AddAttachments[fileid].ContentType && this.context.AddAttachments[fileid].ContentType.toLowerCase().indexOf("image/") == 0) {
                        $("#" + fileid).attr("data-img-url", resultObj.Url)
                                .attr("data-url", resultObj.Url)
                                .unbind("click.mobilerow")
                                .bind("click.mobilerow", this.context, function (e) {
                                    e.data.MobileItemClick.apply(e.data, [fileid, resultObj.Url, true]);
                                });
                    } else {
                        $("#" + fileid)
                                .attr("data-url", resultObj.Url)
                                .unbind("click.mobilerow")
                                .bind("click.mobilerow", this.context, function (e) {
                                    e.data.MobileItemClick.apply(e.data, [fileid, resultObj.Url]);
                                });
                    }
                } else {
                    $("td[data-action='" + fileid + "']").prepend($("<a href='" + resultObj.Url + "' class='fa fa-download' target='_blank' UC=true>" + SheetLanguages.Current.Download + "</a>"));
                }

                /*
                 *android对upload的progress事件支持不完善
                 *在Complete事件里将上传进度赋值为100%
                 */
                $("span[data-filerate='" + fileid + "']").html("100%");
                this.context.Validate();
            } else {
                this.context.UploadFailed(evt);
            }
            // 单个附件上传完成，继续下一个
            this.context.AddFiles(this.files);
        },

        UploadFailed: function (evt) {
            this.context.AddAttachments[evt.currentTarget.fileid].state = 100;
            $("span[data-filerate='" + evt.currentTarget.fileid + "']").html(SheetLanguages.Current.UploadError);
        },

        UploadCanceled: function () {
        },

        RemoveFile: function (fileID) {
            fileID = $.trim(fileID);
            $("#" + fileID).remove();
            this.Files--;
            this.Files = this.Files < 0 ? 0 : this.Files;
            if (this.AddAttachments[fileID]) {
                this.AddAttachments[fileID].xhr.abort();
                delete this.AddAttachments[fileID];
            } else {
                this.RomveAttachments.push(fileID);
            }
            this.Validate();
        }
    });
})(jQuery);
﻿//复选框

(function ($) {
    $.fn.SheetCheckbox = function () {
        return $.MvcSheetUI.Run.call(this, "SheetCheckbox", arguments);

    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetCheckbox = function (element, ptions, sheetInfo) {
        $.MvcSheetUI.Controls.SheetCheckbox.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetCheckbox.Inherit($.MvcSheetUI.IControl, {
        Checked: false,
        Render: function () {
            //设置默认值
        	if(this.DefaultValue == "" || this.DefaultValue == "false"){
        		this.DefaultValue = false;
        	}else if(this.DefaultValue == "true"){
        		this.DefaultValue = true;
        	}
        	
        	var thisV = false;
        	
        	if(this.V == "false" || this.V == false){
        		this.Checked = false;
        		thisV = false;
        	}else{
        		this.Checked  = true;
        		thisV = true;
        	}
            if (this.Originate) {
                this.Checked = this.DefaultValue || thisV;
                this.Element.checked = this.DefaultValue || thisV;
            }
            else {
                this.Checked = thisV;
                this.Element.checked = this.Checked;
            }
			if(this.DefaultValue){
				//如果默认值为true，则添加时选中
        		this.Element.checked=true;
        	}
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }

            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            //渲染前端
            $(this.Element).unbind("mouseenter").unbind("mouseover").unbind("mouseup").unbind("mouseout");
            $(this.Element).css("cursor", "pointer");
            var divElement = $("<div class='checkbox checkbox-primary'></div>");// $("<div class='checkbox'><label>" + this.DataField + "</label></div>");
            $(this.Element).before(divElement);
            $(this.Element).appendTo(divElement);
            $("<label>" + this.Text + "</label>").appendTo(divElement);

            if (!this.Editable) {// 不可编辑
                $(this.Element).prop("disabled", true);
                return;
            }
            //绑定事件
            if (this.OnChange) {
                $(this.Element).unbind("click.SheetCheckbox").bind("click.SheetCheckbox", this, function (e) {
                    e.data.RunScript(e.data.Element, e.data.OnChange);
                });
            }
        },
        GetValue: function () {
            return this.Element.checked;
        },
        SetValue: function (value) {
            //$(this.Element).prop("checked", !!value);

            // true/false  子表导入时是字符串
            if (typeof (value) == "string" && value.toLowerCase() == "true") {
                this.Checked = true;
            } else if (typeof (value) == "boolean" && value == true) {
                this.Checked = true;
            } else {
                this.Checked = false;
            }

            this.Element.checked = this.Checked;
            if (this.IsMobile) {
                //this.Switchery.setPosition();
            }
        },
        RenderMobile: function () {
        	
        	var thisV = !(this.V == "false" || this.V == false);
        	
            //设置默认值
            if (this.Originate) {
                this.Checked = this.DefaultValue||thisV;
                this.Element.checked = this.DefaultValue||thisV;
            }
            else {
                this.Checked = thisV;
                this.Element.checked = this.Checked;
            }

            //不可见返回
            if (!this.Visiable) return;

            var _ID = $(this.Element).attr("id");
            if (!_ID) {
                _ID = $.uuid();
                $(this.Element).attr("id", _ID);
            }
            
            var title = $("<span class='checkboxtitle'></span>");
            title.text(this.Text);

            $(this.Element).parent().before(title);
            //显示为开关按钮
            $(this.Element).addClass("toggle");
            //var span = $("<span style='width: 120px!important;'></span>");
            //$(this.Element).after(span);
            //$(this.Element).appendTo(span);
            //$(span).append('<label for="' + _ID + '" data-on="" data-off=""><span></span></label>');

            if (!this.Editable) {// 不可编辑
                $(this.Element).prop("disabled", true);
            }

            if (this.Editable) {
                //this.Switchery = new Switchery(this.Element);
                // 绑定修改事件
                $(this.Element).unbind("click.SheetCheckbox").bind("click.SheetCheckbox", this, function (e) {
                   
                    e.data.RunScript(e.data.Element, e.data.OnChange);
                  
                });
            }
            else {
                // 不可编辑 
                //为不破坏控件相应功能以及避免影响其他地方的调用，此处不对控件做删除只做隐藏然后插入文本显示
                var parentLabel = $(this.Element).parent('label');
                parentLabel.children().hide(); 
                parentLabel.append(this.Checked ? "<span style='font-size:16px;'>是</span>" : "<span style='font-size:16px;'>否</span>");
            }
        },
        Validate: function () {
            return true;
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = $.MvcSheetUI.GetSheetDataItem(this.DataField);// this.SheetInfo.BizObject.DataItems[this.DataField];

            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }
           // if (result[this.DataField].V != this.GetValue())
            {
                result[this.DataField].V = this.GetValue();
                return result;
            }
            if (this.Originate) {
                return result;
            }
            return {};
        }
    });
})(jQuery);
﻿//复选框

(function ($) {
	//update by luxm
	//记录id值获取displayrole，因为移动端复选框和pc端不一样，目前在该js中处理
	var ids = [];
	var thats = [];
    $.fn.SheetCheckboxList = function () {
        return $.MvcSheetUI.Run.call(this, "SheetCheckboxList", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetCheckboxList = function (element, ptions, sheetInfo) {
        this.CheckListDisplay = [];
        $.MvcSheetUI.Controls.SheetCheckboxList.Base.constructor.call(this, element, ptions, sheetInfo);

    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetCheckboxList.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            if (!this.Visiable) {
                $(this.Element).hide();
                return;
            }
			// 查看痕迹
			if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            // 渲染前端
            this.HtmlRender();

            // 初始化默认值
            this.InitValue();

            // 校验操作
            this.Validate();
        },

        //获取值
        GetValue: function () {
            var value = "";
            $(this.Element).find("input").each(function () {
                if (this.checked)
                    value += $(this).val() + ";";
            });
            if (this.IsMobile && !value)
                value = this.DataItem.V;
            return value;
        },

        //移动内容
        MobileAddItem: function (value, text, isDefault) {
            this.CheckListDisplay.push({ text: text, value: value, checked: isDefault });
        },
        //设置控件的值
        SetValue: function (value) {
            if (value) {
                var items = value.split(';');
            }
            //value为""或undefined
            if (this.IsMobile && value !== undefined) {
            	//指向this的指针,用完立马置为空值 update by ousihang
            	var pointerToThis = this;
                $(this.Element).find("input").each(function () {
                	$(pointerToThis.CheckListDisplay).each(function (i, checkItem) { 
                		$(items).each(function (j, item){
                			if (checkItem.value == item) {
                				checkItem.checked = true;
                			}
                		});
                	}); 

                    $(this).prop("checked", false);
                });
                pointerToThis = null;
            }

            if (items != undefined) {
                for (var i = 0; i < items.length; i++) {
                    $(this.Element).find("input").each(function () {
                        if (this.value == items[i] || this.value == items[i].replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;"))
                            $(this).prop("checked", true);
                    });
                }
            }
            if (this.IsMobile) {
                if (this.OnChange) {
                    this.RunScript(this, this.OnChange);
                }

                this.Mask.text(this.GetText());
                if (this.Editable) {
                    if (this.Mask.text() == '' || this.Mask.text() == SheetLanguages.Current.PleaseSelect) {
                        ;
                        this.Mask.text(SheetLanguages.Current.PleaseSelect);
                        this.Mask.css({ 'color': '#797f89' });
                    }else{
                        this.Mask.css({ 'color': '#2c3038' });
                    }
                }
            }
        },
        GetText: function () {
            var text = "";
            $(this.Element).find("input").each(function () {
                if (this.checked) {
                    if (text) text += ",";
                    text += $(this).next().text();
                }
            });

            //if (this.OnChange) {
            //    this.RunScript(this, this.OnChange);
            //}
            return text;
        },

        SetReadonly: function (flag) {
        	
            if (flag) {
                $(this.Element).find("input").prop("disabled", true);
            }
            else {
                $(this.Element).find("input").prop("disabled", false);
            }
        },
        //设置一行显示数目
        SetColumns: function () {
            if (this.RepeatColumns && /^([1-9]\d*)$/.test(this.RepeatColumns)) {
                var width = (100 / this.RepeatColumns) + "%";
                var divs = $(this.Element).find("div"),
                    i;
                for (i = 0; i < divs.length; i++) {
                    $(divs[i]).css({ "width": width });
                }
            }
        },

        InitValue: function () {
            //设置默认值
            var _that = this;
            var items = undefined;
            var texts = "";
            if (this.V == undefined || this.V == "") {
                if (this.SelectedValue == undefined || this.SelectedValue == "") return;
                items = this.SelectedValue.split(';');
            }
            else {
                items = this.V.split(';');
            }
            if (items != undefined) {
                $(this.Element).find("input").each(function () {
                    $(this).prop("checked", false);
                });
                for (var i = 0; i < items.length; i++) {
                    $(this.Element).find("input").each(function () {
                        if (this.value == items[i]) {
                            if (texts) texts += "、";
                            texts += $(this).next().text();
                            $(this).prop("checked", true);
                        }
                    });

                    if (_that.IsMobile) {
                        var isChecked = false;
                        for (var x in this.CheckListDisplay) {
                            if (this.CheckListDisplay[x].value == items[i]) {
                                this.CheckListDisplay[x].checked = true;
                            }
                        }
                    }
                }
            }

            if (this.IsMobile) {

                if (this.Editable) {
                    this.Mask.html(texts);
                }
                else {
                    //移动端不可编辑
                    $(this.Element).html(texts);
                }
            }
        },

        MobileInit: function () {
             
            //跳转到查询页面
            var that = this;
            var ionic = $.MvcSheetUI.IonicFramework;
            //update by ouyangsk 记录上次item的checkBox值
            var lastItems = [];
            //复选框控件使用
        	if (that.DisplayRule) {
        		ids.push(that.DataField);
        	}
        	if (that.VaildationRule) {
        		thats.push(that);
        	}
            if (this.Editable) {
                //只往上一级，只能通过控件绑定click事件，防止DisplayRule属性存在时出现异常
                $(this.Element).parent().unbind('click.MobileCheckListBox').bind("click.MobileCheckListBox", function () {
                    ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/checkbox_popover.html?v=20171222', {
                        scope: ionic.$scope
                    }).then(function (popover) {
                        popover.scope.header = that.N;
                        popover.scope.CheckListDisplay = that.CheckListDisplay;
                        //update by luxm
                        popover.scope.DataField = that.DataField;
                        popover.show();
                        popover.scope.hide = function () {
                            popover.hide();
                            that.Validate();
                            popover.scope.rememberCheck();
                        };
                        //update by ouyangsk 关闭按钮则取消选择
                        popover.scope.closePopover = function () {
                        	popover.hide();
	                        for (var i = 0; i < popover.scope.CheckListDisplay.length; i++) {
	                        	popover.scope.CheckListDisplay[i].checked = lastItems[i];
	                        }
                        	var val = that.MobileGetCheckListValue(popover.scope.CheckListDisplay);
                            that.SetValue(val);
                        };
                        popover.scope.rememberCheck = function () {
                        	for (var i = 0; i < popover.scope.CheckListDisplay.length; i++) {
                        		 if (popover.scope.CheckListDisplay[i].checked == false) {
                        			 lastItems[i] = false;
                                 } else {
                                	 lastItems[i] = true;
                                 }
                        	} 
                        };
                        
                        popover.scope.checkAllSelected = function () {
                        	
                            popover.scope.allSelected = true;
                            for (item in popover.scope.CheckListDisplay) {
                                if (popover.scope.CheckListDisplay[item].checked == false) {
                                    popover.scope.allSelected = false;
                                }
                            }
                        };

                        popover.scope.checkAllSelected();

                        popover.scope.clickCheckList = function () {
                            var val = that.MobileGetCheckListValue(popover.scope.CheckListDisplay);
                            that.SetValue(val);
                        	//update by luxm
                            //移动端处理displayRole属性
                            popover.scope.displayRole(val,that);
                            popover.scope.checkAllSelected();
                        };
                        popover.scope.selectAll = function () {
                        	//create update by luxm
                        	//多选框全选bug
                        	var a = $(".active .popover .list").find('label').find('span');
                        	window.console.log($(".active .popover .list").find('label').find('span').eq(0).text());
                            	for(i in a){
                            		for (item in popover.scope.CheckListDisplay) {
                            			if(a.eq(i).text().replace(/^\s+|\s+$/g,"") == popover.scope.CheckListDisplay[item].text){
                            				popover.scope.CheckListDisplay[item].checked = true;
                            				//update by luxm
                            				//display属性
                            				if (ids.length != 0) {
                            				for (var i = 0; i < ids.length; i++) {
                            					var displayrule = $("div[data-datafield='"+ids[i]+"']").attr('data-displayrule');
                            					if (popover.scope.DataField == displayrule.substring(displayrule.indexOf("{")+1,displayrule.indexOf("}")) && popover.scope.CheckListDisplay[item].text == displayrule.split('==')[1].split("'")[1]) {
                            						$("div[data-datafield='"+ids[i]+"']").parent().removeClass("hidden");
                            					}
                            				}
                            				}
                            			}			
                                }
                            	}
                            var val = that.MobileGetCheckListValue(popover.scope.CheckListDisplay);
                            that.SetValue(val);
                            popover.scope.allSelected = true;
                        };
                        //create update by luxm
                        //移动端处理displayRole属性
                        popover.scope.displayRole = function (val,that) {
                        	if (ids.length != 0) {
                        		var midArray = val.split(";");
                                for (var i = 0; i < ids.length;i++) {
                                	var a = $("div[data-datafield='"+ids[i]+"']").attr('data-displayrule').split('==')[1].split("'");
                                	var displayrule = $("div[data-datafield='"+ids[i]+"']").attr('data-displayrule');
                                	var VaildationRule = $("div[data-datafield='"+ids[i]+"']").attr('data-vaildationrule');
                                	if (displayrule.indexOf(""+that.DataField) > 0 && (displayrule.substring(displayrule.indexOf("{")+1,displayrule.indexOf("}")) == that.DataField) && ($("div[data-datafield='"+ids[i]+"']").attr('data-datafield') != that.DataField)) {

                                    	if (midArray && ($.inArray(""+a[1],midArray) != -1)) {
                                    		$("div[data-datafield='"+ids[i]+"']").parent().removeClass("hidden");
                                    	} else {
                                    		$("div[data-datafield='"+ids[i]+"']").parent().addClass("hidden");
                                    	}	
                                	}
                                	//验证 $.inArray(VaildationRule.split('==')[1].split("'")[1],midArray) !=-1
                                	if (VaildationRule && VaildationRule.indexOf(""+that.DataField) > 0) {
                                		if (thats.length > 0) {
                                			for (var i = 0; i < thats.length; i++) {
                                				if (!($.inArray(""+a[1],midArray) != -1) && thats[i].DataField == $("div[data-datafield='"+ids[i]+"']").attr('data-datafield') && $.inArray(VaildationRule.split('==')[1].split("'")[1],midArray) !=-1 || (thats[i].DataField == $("div[data-datafield='"+ids[i]+"']").attr('data-datafield') && displayrule == VaildationRule && $.inArray(VaildationRule.split('==')[1].split("'")[1],midArray) !=-1)) {
                                					thats[i].Required = true;
                                				} else {
                                					thats[i].Required = false;
                                				}
                                			}
                                		}
                                	}
                                }
                        	}
                        };
                        popover.scope.unSelectAll = function () {
                        	
                            for (item in popover.scope.CheckListDisplay) {
                                popover.scope.CheckListDisplay[item].checked = false;
                            	if (ids.length != 0) {
                            		for (var i = 0; i < ids.length; i++) {
                            			var displayrule = $("div[data-datafield='"+ids[i]+"']").attr('data-displayrule');
                    					if (popover.scope.DataField == displayrule.substring(displayrule.indexOf("{")+1,displayrule.indexOf("}")) && popover.scope.CheckListDisplay[item].text == displayrule.split('==')[1].split("'")[1]) {
                    						$("div[data-datafield='"+ids[i]+"']").parent().addClass("hidden");
                    					}
                            		}
                            	}
                            }
                            var val = that.MobileGetCheckListValue(popover.scope.CheckListDisplay);
                            that.SetValue(val);
                            popover.scope.allSelected = false;
                        };
                        popover.scope.searchFocus = false;
                        popover.scope.searchAnimate = function () {
                            popover.scope.searchFocus = !popover.scope.searchFocus;
                        };
                        popover.scope.searChange = function () {
                        	//update by ouyangsk 搜索前清空所有已选择的项
                        	popover.scope.unSelectAll();
                            popover.scope.searchNum = $(".active .popover .list").children('label').length;
                        };
                    });
                    return;
                })
            }
        },

        MobileGetCheckListValue: function (display) {
        	
            var v = [];
            if (display && display.length > 0) {
                for (var d in display) {
                    var od = display[d];
                    if (od.checked) { v.push(od.value) };
                }
            }
            if (v.length == 0) { return ''; }
            return v.join(';');
        },

        HtmlRender: function () {
            var that = this;
            //组标示
            if (!this.Visiable) { $(this.Element).hide(); return; }
            $(this.Element).addClass("SheetCheckBoxList");
            this.SheetGropName = this.DataField + "_" + Math.floor(Math.random() * 1000);//设置统一的name

            // 显示红色*号提示
            if (this.Editable && this.Required && !$(this.Element).val() && !this.IsMobile) {
                this.AddInvalidText(this.Element, "*", false);
            }
            var existedHtml = $(this.Element).html();

            $(this.Element).html("");

            if (this.MasterDataCategory) {
                var that = this;
                var cmdParam = JSON.stringify([this.MasterDataCategory]);
                if ($.MvcSheetUI.CacheData && $.MvcSheetUI.CacheData[cmdParam]) {
                    var cacheData = $.MvcSheetUI.CacheData[cmdParam];
                    for (var key in cacheData) {
                        that.AddCheckboxItem.apply(that, [cacheData[key].Code, cacheData[key].EnumValue, cacheData[key].IsDefault]);
                    }
                    that.InitValue.apply(that);

                    that.DoRepeatDirection.apply(that);
                    if (that.IsMobile) {
                        that.MobileInit.apply(that);
                    }
                }
                else {
                    $.MvcSheet.GetSheet({
                        "Command": "GetMetadataByCategory",
                        "Param": cmdParam
                    },
                        function (data) {
                            if (data) {
                                //将数据缓存
                                if (!$.MvcSheetUI.CacheData) { $.MvcSheetUI.CacheData = {}; }
                                $.MvcSheetUI.CacheData[cmdParam] = data;

                                for (var i = 0, len = data.length; i < len; i++) {
                                    that.AddCheckboxItem.apply(that, [data[i].Code, data[i].EnumValue, data[i].IsDefault]);
                                }
                            }
                            //初始化默认值
                            that.InitValue.apply(that);
                            that.DoRepeatDirection.apply(that);
                            if (that.IsMobile) {
                                that.MobileInit.apply(that);
                            }
                        }, null, this.DataField.indexOf(".") == -1);
                }
            }
            else if (this.DefaultItems) {
                var items = this.DefaultItems.split(';');
                for (var i = 0; i < items.length; i++) {
                    that.AddCheckboxItem.apply(that, [items[i], items[i], false]);
                }
                this.InitValue();
                if (that.IsMobile) {
                    that.MobileInit.apply(that);
                }
                this.DoRepeatDirection();
            }
            else {
                $(this.Element).html(existedHtml);
                this.InitValue();
                if (that.IsMobile) {
                    that.MobileInit.apply(that);
                }
            }

            //绑定选择事件
            $(that.Element).unbind("click").bind("click", [that], function (e) {
                that.SetInvalidText();
            });
            $(that.Element).unbind("change").bind("change", [that], function (e) {
                e.data[0].RunScript(this, e.data[0].OnChange);
            });
        },

        RenderMobile: function () {
            this.HtmlRender();
            //不可用
            if (!this.Editable) {
                $(this.Element).addClass(this.Css.Readonly);
                if (!this.GetValue())
                    $(this.Element).hide();
            }
            else {
                this.SetValue();
                //var _Mask = this.Mask.text(this.GetText());
                this.Mask.insertAfter($(this.Element));
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).hide();
            }
        },

        DoRepeatDirection: function () {
        	
            //横向展示
            if (this.RepeatDirection == "Horizontal") {
                //$("div[SheetGropName='" + this.SheetGropName + "']").css("float", "left");
                $(this.Element).find("[SheetGropName='" + this.SheetGropName + "']").css("float", "left");
                $(this.Element).find("[SheetGropName='" + this.SheetGropName + "']").addClass("checkbox checkbox-primary");
            }

            //设置行数量
            this.SetColumns();

            //this.SetInvalidText();
        },

        Validate: function (effective, initValid) {
        	if (this.IsMobile) {
        		if (!this.Editable) return true;
        		// create update by luxm
        		//规则验证
        		for (var i = 0; i < thats.length; i++) {
        			if (thats[i].Required) {
        				thats[i].SetInvalidText();
        			} else {
        				thats[i].RemoveInvalidText(thats[i].Element, "*", false);
        			}
        		}
                if (initValid || !effective) {
                    return this.SetInvalidText();
                }
                return true;
        	} else {
                if (!this.Editable) return true;
                if (initValid || !effective) {
                    return this.SetInvalidText();
                }
                return true;
        	}
        },
        //处理必填红色*号
        SetInvalidText: function () {
            var check = true;
            if (this.Editable && this.Required) {
                check = false;
                var inputs = $(this.Element).find("input");
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs[i]).is(":checked")) {
                        check = true;
                        break;
                    }
                }
                if (check) {
                    this.RemoveInvalidText(this.Element, "*", false);
                }
                else {
                    this.AddInvalidText(this.Element, "*", false);
                }
            }

            return check;
        },

        AddCheckboxItem: function (value, text, isDefault) {
        	
            if (text || value) {
            	if (this.IsMobile) {
                    this.MobileAddItem(value, text, isDefault);
                }
            	//update by xl@Future
                text = $('<div/>').text(text).html();
                value = $('<div/>').text(value).html();
                var option = $("<div SheetGropName='" + this.SheetGropName + "'></div>");
                var id = $.MvcSheetUI.NewGuid();
                var checkbox = $("<input type='checkbox' />").attr("name", this.SheetGropName).attr("id", id).val(value);//.text(text || value)
                checkbox.prop("checked", isDefault);
                if (!this.Editable) {//不可用
                    checkbox.prop("disabled", "disabled")
                }
                var label = $("<label for='" + id + "' style=\"padding-left:3px;padding-right:5px;\">" + (text || value) + "</label>");
                $(this.Element).append(option);
                option.append(checkbox);
                option.append(label);
                
            }


        },

        SaveDataField: function () {
        	
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = $.MvcSheetUI.GetSheetDataItem(this.DataField);// this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }
            // if (result[this.DataField].V != this.GetValue())
            {
                result[this.DataField].V = this.GetValue();
                return result;
            }
            return {};
        }
    });
})(jQuery);
// SheetComment控件
        (function ($) {
            //控件执行
            $.fn.SheetComment = function () {
                return $.MvcSheetUI.Run.call(this, "SheetComment", arguments);
            };

            $.MvcSheetUI.Controls.SheetComment = function (element, options, sheetInfo) {
                // 获取签章的显示位置，是放置在文本之前还是文本之后
                this.SignPosition = "BeforeComment"; // BeforeComment,AfterComment
                this.SignAlign = "Center";           // Left,Center,Right
                this.SignHeight = 0;                 // 签章高度,0表示自然高度
                this.SignWidth = 0;                  // 签章宽度,0表示自然宽度
                this.CommentFolded = false;          // 审批意见是否折叠，只针对移动端
                $.MvcSheetUI.Controls.SheetComment.Base.constructor.call(this, element, options, sheetInfo);
            };

            $.MvcSheetUI.Controls.SheetComment.Inherit($.MvcSheetUI.IControl, {
                Render: function () {
                    //不可见返回 发起模式也不可见
                    if (!this.Visiable) { //  || this.Originate
                        this.Element.style.display = "none";
                        return;
                    }
                    $(this.Element).addClass("SheetComment");

                    //历史评论
                    this.InitHistoryComment();

                    // 不可编辑
                    if (!this.Editable) {
                        if (!this.NullCommentTitleVisible && (!this.V || !this.V.Comments || this.V.Comments.length === 0)) {
                            $("span[" + $.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase() + "='" + this.DataField + "']").parent().hide();
                        }
                        return;
                    }
                    //评论输入
                    this.InitCommentInput();
                    // 常用意见和签章
                    this.InitFrequentlyUsedCommentsAndSignature();
                },
                //移动端
                RenderMobile: function () {
                    if (!this.Editable) {
                        $(this.Element).closest(".item.item-input").hide();
                        return;
                    }//无编辑权限则隐
                    var that = this;
                    this.Render();
                    this.Validate();

                    $(this.Element).find(".widget-comments").hide();

                    var bannerTitle = $('<div class="nav-icon fa fa-chevron-right bannerTitle"></div>');
                    //update by luxm
                    //审批意见必填*距离问题
                    var bannerTitleLabel = $('<span id="commentTileLabel" style = " float: none !important; padding-right: 8px !important; padding-left: 4px !important;"></span>')
                    bannerTitleLabel.text(SheetLanguages.Current.Comments);
                    bannerTitleLabel.appendTo(bannerTitle);
                    bannerTitle.insertBefore(this.Element);

                    //将审批意见移动到最底部
                    // $(this.Element).closest('.list').appendTo($('#mobile-content div.scroll'));
                    $(this.Element).closest('.list').appendTo($('#mobile-content div .flow-comment'));
                    var oldDivContainer = $(this.Element).closest("div.item");
                    oldDivContainer.css("padding", "0").removeClass("item-input");
                    var spantitle = $(this.Element).parent().prev().remove();

                    this.newDivTitle = $("<div class='item item-input item-icon-right'></div>");
                    this.newDivTitle.append(spantitle);
                    this.newDivTitle.insertBefore(oldDivContainer);
                    if ($(this.Element).is(':hidden')) {
                        this.newDivTitle.hide();
                    }

                    ////展开审批意见
                    //if (this.V && this.V.Comments) {
                    //    if (this.V.Comments.length >= 1
                    //        && this.V.Comments[0].Approval != -1) {
                    //        this.expandTitle = "  折叠审批意见";
                    //        this.expandComment = $("<i class='icon' style='font-size:100%;'><a class='aExpand' style='min-width:100px;' href='javascript:void(0)'><i class='ion-ios-arrow-down'></i>  " + this.expandTitle + "</a> </i>")
                    //        this.newDivTitle.append(this.expandComment);
                    //        $(this.Element).parent().width("100%");
                    //        this.expandComment.unbind("click.Expand").bind("click.Expand", function () {
                    //            var commentDiv = $(this).closest("div.item-input").next().find("div.widget-comments");
                    //            if (commentDiv) {
                    //                if (that.CommentFolded) {
                    //                    var html = "<a class='aExpand' style='min-width:100px;' href='javascript:void(0)'><i class='ion-ios-arrow-up'></i>  收起审批意见</a>";
                    //                    $(this).html(html)
                    //                    that.CommentFolded = false;
                    //                    commentDiv.show(1000);
                    //                    if (!$(that.Element).hasClass("topBannerTitle")) {
                    //                        setTimeout(function () {
                    //                            $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.scrollBy(0, 150, true);
                    //                        }, 1000)
                    //                    }
                    //                } else {
                    //                    var html = "<a class='aExpand' style='min-width:100px;' href='javascript:void(0)'><i class='ion-ios-arrow-down'></i>  展开审批意见</a>";
                    //                    $(this).html(html)
                    //                    that.CommentFolded = true;
                    //                    commentDiv.hide(1000);
                    //                    if (!$(that.Element).hasClass("topBannerTitle")) {
                    //                        setTimeout(function () {
                    //                            $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.scrollBy(0, -150, true);
                    //                        }, 1000)
                    //                    }
                    //                }
                    //                $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.resize();
                    //            }
                    //        })
                    //    }
                    //}
                },

                // 数据验证
                Validate: function (effective, initValid) {
                    if (!this.Editable)
                        return true;
                    if (initValid) {
                        if (this.Required && !this.GetValue()) {
                            this.AddInvalidText(this.Element, "*", false);
                            return false;
                        }
                    }
                    if (!effective) {
                        if (this.Required) {//必填的
                            if (!this.GetValue()) {
                                this.AddInvalidText(this.Element, "*");
                                return false;
                            } else {
                                this.RemoveInvalidText(this.Element);
                            }
                        }
                    }
                    return true;
                },

                GetValue: function () {
                    return $(this.CommentInput).val();
                },
                _changeSignaturePic: function (panel, picName) {
                    // console.log(panel, picName);
                    if (picName) {
                        panel.html("<img alt='' border='0' class='pic-img' src='" + $.MvcSheetUI.PortalRoot + "/TempImages/" + picName + ".jpg' />");
                        var img = panel.find("img");
                        if (this.SignWidth) {
                            img.width(this.SignWidth);
                        }
                        if (this.SignHeight) {
                            img.height(this.SignHeight);
                        }
                        // 签章过宽时，调整签章的宽度 用setTimeout是为了获取到宽度
                        setTimeout(function () {
                            if (img.width() > panel.width()) {
                                img.width(panel.width());
                            }
                        }, 100);
                    } else {
                        panel.html("");
                    }
                },
                SetReadonly: function (flag) {
                    if (flag) {
                        $(this.Element).find("textarea").hide();
                        $(this.Element).find("select").hide();
                        $(this.Element).find(":checkbox").hide();
                        $(this.Element).find("label").hide();
                    } else {
                        $(this.Element).find("textarea").show();
                        $(this.Element).find("select").show();
                        $(this.Element).find(":checkbox").show();
                        $(this.Element).find("label").show();
                    }
                },
                //返回数据值
                SaveDataField: function () {
                    var result = {};
                    if (!this.Visiable || !this.Editable)
                        return result;
                    result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
                    // console.log(result[this.DataField], 'result[this.DataField]')
                    if (!result[this.DataField]) {
                        alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                        return {};
                    }

                    var IsNewComment = false;

                    // 签章
                    var signatureId = "";
                    if (this.SignatureSel) {
                        signatureId = this.SignatureSel.val();
                    }

                    if (this.MyComment === undefined) {
                        //update by ouyangsk 允许不填审批意见
                        //if (!this.GetValue()) return {};
                        this.MyComment = {
                            CommentID: $.MvcSheetUI.NewGuid(),
                            UserName: SheetLanguages.Current.MyComment,
                            DateStr: new Date().toString(),
                            Text: this.GetValue(),
                            Avatar: $.MvcSheetUI.SheetInfo.UserImage, //$.MvcSheetUI.PortalRoot + "/assets/images/pixel-admin/user.jpg",
                            SignatureId: signatureId
                        };
                        IsNewComment = true;
                        this.AddCommentItem(this.MyComment);
                    }
                    //else if (this.MyComment.Text == this.GetValue() && (this.MyComment.SignatureId || "") == signatureId) { //添加校验，如果值没变，就不会需要提交
                    //    return {};
                    //}
                    else {
                        var comment = $("#" + this.MyComment.CommentID);
                        comment.find("div.comment-text").html(this.GetValue());
                        //修改签章
                        var signature = comment.find("div.comment-signature");
                        this._changeSignaturePic(signature, signatureId);
                    }

                    result[this.DataField].V = {
                        CommentID: this.MyComment.CommentID,
                        Text: this.GetValue(),
                        IsNewComment: IsNewComment,
                        SetFrequent: this.IsMobile ? false : $(this.SaveFrequentCk).is(":checked"),
                        SignatureId: signatureId
                    };

                    return result;
                },

                //历史评论
                InitHistoryComment: function () {
                    var that = this;
                    // console.log(this.V)
                    if (this.V && this.V.Comments) {
                        var commentLine = false;
                        for (var i = 0; i < this.V.Comments.length; i++) {
                            if (this.LastestCommentOnly && i < this.V.Comments.length - 1)
                                continue;
                            var commentObject = this.V.Comments[i];
                            if (commentObject.IsMyComment && commentObject.Approval == -1) {
                                this.MyComment = commentObject;
                                if (commentObject.DelegantName == "" && !this.IsMobile) {
                                    //this.MyComment.UserName = SheetLanguages.Current.MyComment;
                                }
                            }
                            commentLine = (this.V.Comments.length > 0 && i < this.V.Comments.length - 1);
                            if (commentObject.Approval != undefined && commentObject.Approval != -1) {
                                if (this.IsMobile) {
                                    this.AddMobileCommentItem(commentObject, i == this.V.Comments.length - 1 ? true : false);
                                } else {
                                    this.AddCommentItem(commentObject, commentLine);
                                }
                            }
                        }

                        //添加收起审批意见DIV
                        //if (this.IsMobile) {
                        //    var foldCommentDiv = $("<div class='bottom-afold'><i class='icon'><a class='afold' href='javascript:void(0)' ng-click='HideHistoryComments()'><i class='ion-ios-arrow-up'></i>收起审批意见</a> </i> </div>")
                        //    foldCommentDiv.find("a.afold").click("click.foldComment", function () {
                        //        var html = "<a class='aExpand' style='min-width:100px;' href='javascript:void(0)'><i class='ion-ios-arrow-down'></i>  展开审批意见</a>";
                        //        $(that.expandComment).html(html);
                        //        that.CommentFolded = true;
                        //        $(this).closest("div.widget-comments").hide(1000);
                        //        $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.resize();
                        //        setTimeout(function () {
                        //            $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.scrollBy(0, -150, true);
                        //        }, 1000)
                        //    });
                        //    $(this.Element).find("div.widget-comments").append(foldCommentDiv);
                        //}
                    }
                },
                //添加评论
                AddCommentItem: function (commentObject, commentLine) {
                    // console.log(commentObject, commentLine)
                    if (this.PanelBody == undefined) {
                        var CommentsPanel = $("<div class=\"widget-comments\"></div>");
                        if (this.IsMobile) {
                            CommentsPanel.hide();
                        }
                        if (this.DisplayBorder) {
                            CommentsPanel.addClass("bordered");
                        }
                        this.PanelBody = $("<div></div>");
                        CommentsPanel.append(this.PanelBody);//历史审批容器
                        $(this.Element).prepend(CommentsPanel);
                    }

                    var commentItem = $("<div class='comment'></div>").attr("id", commentObject.CommentID);
                    var commentBody = $("<div class='comment-body'></div>");
                    if (!this.DisplayHead)
                        commentBody.css("margin-left:3px");
                    if (commentLine)
                        commentBody.addClass("comment-line");

                    // 是否显示头像
                    if (this.DisplayHead) {
                        //console.log(commentObject.Avatar, 'commentObject.Avatar')
                        var avatar = $("<img alt='' src='" + commentObject.Avatar + "' class='comment-avatar' />");
                        commentItem.append(avatar);
                    } else {
                        commentBody.css({"padding-left": 0}); // pc端
                        commentBody.css({"margin-left": 0}); // 移动端
                    }

                    var userName = commentObject.UserName;
                    if (this.OUNameVisible && commentObject.OUName != undefined) {
                        userName = commentObject.OUName + " " + userName;
                    }

                    //审批时间
                    var dateStr = "";
                    var modifyData = new Date(commentObject.DateStr);
                    var today = new Date();
                    if (modifyData.getYear() == today.getYear()
                            && modifyData.getMonth() == today.getMonth()
                            && modifyData.getDate() == today.getDate()) {
                        var hour = modifyData.getHours().toString();
                        if (hour.length < 2)
                            hour = "0" + hour;
                        var minute = modifyData.getMinutes().toString();
                        if (minute.length < 2)
                            minute = "0" + minute;
                        dateStr = SheetLanguages.Current.Today + hour + ":" + minute;
                    } else {
                        dateStr = commentObject.DateStr;
                    }

                    if (commentObject.DelegantName) {
                        userName = commentObject.DelegantName + "(" + userName + SheetLanguages.Current.Delegant + ")";
                    }

                    var commenby;
                    var toUsers = "";

                    if (commentObject.toUsers) {
                        for (var _i in commentObject.toUsers) {
                            toUsers = toUsers + "," + commentObject.toUsers[_i];
                        }
                    }
                    if (toUsers.length > 0) {
                        toUsers = toUsers.substring(1);
                    }

                    //TODO luwei 国际化
                    var commentType = "";
                    var isApprove = true;
                    if (commentObject.commentType) {
                        if (commentObject.commentType === "Sheet__ConsultComment") {
                            commentType = $.Lang("SheetComment.Consult");
                            isApprove = false;
                        } else if (commentObject.commentType === "Sheet__AssistComment") {
                            commentType = $.Lang("SheetComment.Assist");
                            isApprove = false;
                        } else if (commentObject.commentType === "Sheet__ForwardComment") {
                            commentType = $.Lang("SheetComment.Forward");
                            isApprove = false;
                        }
                    }

                    if (toUsers.length != 0 && commentType != "") {
                        if (commentObject.isReply) {
                            commenby = $("<div class='comment-by'><a href='javascript:void(0)'>" + userName + "</a> "+$.Lang("SheetComment.Feedback")+"  <a href='javascript:void(0)'>" + toUsers + "</a> "+$.Lang("SheetComment.Of")+" [<a href='javascript:void(0)'>" + commentType + "</a>] </div>")
                        } else {
                            commenby = $("<div class='comment-by'><a href='javascript:void(0)'>" + userName + "</a> "+$.Lang("SheetComment.Originate")+"  [<a href='javascript:void(0)'>" + commentType + "</a>], "+$.Lang("SheetComment.Wait")+" <a href='javascript:void(0)'>" + toUsers + "</a> "+$.Lang("SheetComment.Feedback")+" </div>")
                        }
                    } else {
                        commenby = $("<div class='comment-by'><a href='javascript:void(0)'>" + userName + "</a> </div>")
                    }


                    if (commentObject.Activity && this.ActivityNameVisible && commentType === "") {
                    	var ActivityText = commentObject.Activity;
                    	ActivityText = ActivityText.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                        commenby.append("[<a href='javascript:void(0)'>" + ActivityText + "</a>]");
                    }
                    //update by xl@Future
                    commentObject.Text = $('<div/>').text(commentObject.Text).html();
                    

                    var commenttext = $("<div class='comment-text'>" + commentObject.Text.replace(/\n/g, "<br>") + "</div>");
                    if (isApprove) {
                        var text = commentObject.Text;
                        if (!text || text.trim() === "") {
                            if(commentObject.Approval === 1){
                                commenttext = $("<div class='comment-text'>"+$.Lang("SheetComment.Approve")+"</div>");
                            } else if(commentObject.Approval === 0){
                                commenttext = $("<div class='comment-text'>"+$.Lang("SheetComment.Reject")+"</div>");
                            }
                        }
                    }

                    if (this.IsMobile || this.DateNewLine) {
                        commenby.append("<div style=\"padding-left:5px;\">" + dateStr + "</div>");
                    } else {
                        commenby.append("<span style=\"padding-left:5px;\">" + dateStr + "</span>");
                    }
                    if (this.SignPosition && this.SignPosition == "BeforeComment") {
                        commentBody.append(commenby);
                        commentBody.append(commenttext);
                    } else {
                        commentBody.append(commenttext);
                        commenby.css("text-align", "right"); // 签名靠右对齐
                        commentBody.append(commenby);
                    }
                    commentItem.append(commentBody);

                    if (isApprove) {
                        //操作：通过 or 驳回
                        var approval = "";
                        if (commentObject.Approval === 1) {
                            approval = $.Lang("SheetComment.OperateApprove");
                        } else if (commentObject.Approval === 0) {
                            approval = $.Lang("SheetComment.OperateReject");
                        }
                        var commentApproval = $("<br><div class='comment-approval' style='float:right;margin-right:30px;'>" + approval + "</div><br>")
                        commenttext.append(commentApproval)
                    }

                    //签章
                    var commentSignature = $("<div class='comment-signature' style='text-align:" + this.SignAlign + ";'></div>");
                    commentBody.append(commentSignature);
                    if (this.DisplaySign && commentObject.SignatureId) {
                        this._changeSignaturePic(commentSignature, commentObject.SignatureId);
                    }

                    this.PanelBody.append(commentItem);
                },

                //添加评论
                AddMobileCommentItem: function (commentObject, last) {
                    var Icon = "";
                    var approvaltext = "";
                    if (commentObject.Approval == 1) {  //通过
                        Icon = "icon-comment-approval";
                        approvaltext = $.Lang("SheetComment.Approved");

                    } else if (commentObject.Approval == 0) { //驳回
                        Icon = "icon-comment-reject";
                        approvaltext = $.Lang("SheetComment.Reject");
                    }
                    if (this.PanelBody == undefined) {
                        var CommentsPanel = $("<div class=\"widget-comments\"></div>");
                        if (this.DisplayBorder) {
                            CommentsPanel.addClass("bordered");
                        }
                        this.PanelBody = $("<div class='list border-only-bottom'></div>");
                        CommentsPanel.append(this.PanelBody); //历史审批容器
                        $(this.Element).prepend(CommentsPanel);
                    }
                    //审批意见div
                    var commentItem = $("<div class='comment-tab lefttriangle'></div>").attr("id", commentObject.CommentID);
                    //时间轴
                    var TimeAxis = last ? "" : "comment-time-axis";
                    var commentTimeAxis = $("<i class='" + TimeAxis + "'></i><i class='" + Icon + "'></i>");
                    //审批节点
                    var commentActivity = $('<div class="comment-activity"><span >' + commentObject.Activity + '</span></div>');
                    commentItem.append(commentTimeAxis);
                    var commentDetails = $("<div class='comment-details'></div>");
                    commentDetails.append(commentActivity);
                    commentItem.append(commentDetails);
                    //主体摘要
                    var commentTitle = $("<div class='comment-title'></div>");
                    var text = "";
                    if (commentObject.Text) {
                        text = commentObject.Text.replace(/\n/g, "<br>");
                    }
                    //审批时间
                    var dateStr = "";
                    var modifyData = new Date(commentObject.DateStr);
                    var today = new Date();
                    if (modifyData.getYear() == today.getYear()
                            && modifyData.getMonth() == today.getMonth()
                            && modifyData.getDate() == today.getDate()) {
                        var hour = modifyData.getHours().toString();
                        if (hour.length < 2)
                            hour = "0" + hour;
                        var minute = modifyData.getMinutes().toString();
                        if (minute.length < 2)
                            minute = "0" + minute;
                        dateStr = SheetLanguages.Current.Today + hour + ":" + minute;
                    } else {
                        dateStr = commentObject.DateStr;
                    }

                    var userName = commentObject.UserName;
                    var Circlename = userName.substr(-2);
                    if (this.OUNameVisible && commentObject.OUName != undefined) {
                        userName = userName + " " + "<span class='comment-userOU'>" + commentObject.OUName + "</span>";
                    }
                    var commentCirclename = $("<i class='circle-name user-a'><span>" + Circlename + "</span></i>");
                    var commentUsername = $("<span class='comment-user'>" + userName + "</span>");
                    var commentDate = $("<span class='comment-date'>" + dateStr + "</span>");
                    var commentApprovaltext = $("<div class='comment-approvaltext'>" + approvaltext + "</div>");
                    commentTitle.append(commentCirclename).append(commentUsername).append(commentDate).append(commentApprovaltext);
                    commentDetails.append(commentTitle);
                    //审批内容
                    var commentBody = $("<div class='comment-body'></div>");
                    text = text.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                    var commentText = $("<div class='comment-text'>" + text + "</div>");
                    commentBody.append(commentText);
                    commentDetails.append(commentBody);
                    this.PanelBody.append(commentItem);
                },
                //评论输入
                InitCommentInput: function () {

                    var InputPanel = $("<div></div>");
                    this.CommentInput = $("<textarea></textarea>").width(this.Width);

                    if (this.IsMobile) {
                        InputPanel.addClass('InputPanel item');
                        //update by luxm
                        //审批意见重复
                        $("span[data-datafield = " + this.DataField + "]").remove();
                        var IPtitle = $("<div class='IPtitle'></div>");
                        //IPtitle.text(this.N);
                        InputPanel.append(IPtitle);
                        this.CommentInput = $("<textarea class='CommentInput mobile-input' rows='4' placeholder='" + SheetLanguages.Current.InputYourComment + "'></textarea>");
                    }

                    //已经有保存的评论
                    if (this.MyComment && this.MyComment.Approval === -1) {
                        //不加载已保存的审批意见 黎明 20180919
                        this.CommentInput.val(this.MyComment.Text);
                    } else {//默认评论
                        this.CommentInput.val(this.DefaultComment);
                    }
                    InputPanel.append(this.CommentInput);
                    $(this.Element).append(InputPanel);

                    //值改变事件
                    $(this.CommentInput).unbind("change.CommentInput").bind("change.CommentInput", this, function (e) {
                        e.data.Validate.apply(e.data);
                    });

                    // 自动上移动
                    // var element = $(this.CommentInput);
                    // var ionic = $.MvcSheetUI.IonicFramework;
                    if (this.IsMobile) {
                        $(this.CommentInput).focus(function () {
                            var target = this;
                            window.scrollIntoView(target);
                            // var isIOS = ionic.$ionicPlatform.is('ios'); //ios终端
                            // var top = ionic.$ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top;
                            // var eleTop = (ionic.$ionicPosition.offset(element).top) / 2;
                            // var realTop = eleTop + top;
                            // var aim = $('.view-container').find('.scroll');
                            // if (isIOS && (screen.height == 812 && screen.width == 375)) { // iphone x
                            //     ionic.$timeout(function () {
                            //         target.scrollIntoView(true);
                            //         aim.css('transform', 'translate3d(0px,' + '-' + realTop + 'px, 0px) scale(1)');
                            //         ionic.$ionicLoading.show({
                            //             template: "loading"
                            //         });
                            //         ionic.$timeout(function () {
                            //             ionic.$ionicLoading.hide();
                            //         }, 100)
                            //     }, 400)
                            // }
                        });
                    }
                },

                //常用意见
                InitFrequentlyUsedCommentsAndSignature: function () {
                    var that = this;
                    var ionic = $.MvcSheetUI.IonicFramework;
                    var LatestCommentPanel = $("<div></div>").width(this.Width).css({"text-align": "right"}),
                            LatestCommentSel,
                            SettingPanel,
                            SignaturePanel,
                            SignatureSel,
                            SignaturePicPanel = $("<div></div>").width(this.Width).css({"text-align": "right", "margin-top": "3px"});
                    if (that.IsMobile) {
                        LatestCommentPanel = $("<div></div>");
                        LatestCommentPanel.addClass("item item-input LatestCommentPanel");
                        SignaturePanel = $("<div></div>");
                        SignaturePanel.addClass("item item-input SignaturePanel");
                        $(this.Element).append(SignaturePanel);
                        if (!this.Element.dataset['displaysign']) {
                            SignaturePanel.hide();
                        }
                    }

                    $(this.Element).append(LatestCommentPanel);
                    $(this.Element).append(SignaturePicPanel);

                    // 常用意见下拉框
                    if (this.FrequentCommentVisible) {
                        if (!this.IsMobile) {
                            //pc端
                            LatestCommentSel = $("<select></select>");
                            LatestCommentSel.css({width: "100%", "float": "left"});
                            LatestCommentSel.append("<option value=''>--" + SheetLanguages.Current.SelectComment + "--</option>");
                            if (this.V && this.V.FrequentlyUsedComments) {
                                for (var i = 0; i < this.V.FrequentlyUsedComments.length; i++) {
                                    var text = this.V.FrequentlyUsedComments[i];
                                    if (text != null && text.length > 18) {
                                        text = text.substring(0, 18) + "...";
                                    }
                                    //update by xl@Future
                                    text = $('<div/>').text(text).html();
                                    
                                    var option = $("<option value='" + this.V.FrequentlyUsedComments[i] + "'>" + text + "</option>");
                                    LatestCommentSel.append(option);
                                }
                            }
                            $(LatestCommentSel).unbind("change.LatestCommentSel").bind("change.LatestCommentSel", this, function (e) {
                                if ($(this).val().length > 0) {
                                    e.data.CommentInput.val($(this).val());
                                    e.data.Validate();
                                }
                            });
                            LatestCommentPanel.append(LatestCommentSel);
                        } else {
                            //移动端
                            $("<span class='input-label'>" + SheetLanguages.Current.FreComments + "</span>").appendTo(LatestCommentPanel);
                            var mobileFreCommentValue = $("<div class='detail item-icon-right'><span class='input-label'>" + SheetLanguages.Current.PleaseSelectComment + "</span><i class='icon ion-ios-arrow-right'></i></div>").appendTo(LatestCommentPanel);
                            ionic.$scope.frequentCommentIndex = -1;
                            LatestCommentPanel.unbind('click.chooseComments').bind('click.chooseComments', function (e) {
                                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover2.html?v=201803121505', {
                                    scope: ionic.$scope
                                }).then(function (popover) {
                                    popover.scope.header = SheetLanguages.Current.FreComments;
                                    popover.scope.data = {};
                                    var findex = ionic.$scope.frequentCommentIndex;
                                    popover.scope.data.RadioListValue = findex;
                                    popover.scope.RadioListDisplay = that.V.FrequentlyUsedComments;
                                    popover.show();
                                    popover.scope.hide = function () {
                                        popover.hide();
                                    }
                                    //常用意见重置事件绑定 add by ousihang
                                    popover.scope.reset = function () {
                                        popoverScope = this.$parent;
                                        var RadioListDisplay = popoverScope.RadioListDisplay;
                                        if (RadioListDisplay.length > 0) {
                                            popoverScope.data.RadioListValue = -1;
                                            that.CommentInput.val("");
                                            mobileFreCommentValue.find("span").text(SheetLanguages.Current.PleaseSelect);
                                        } else {
                                            var value = RadioListDisplay[0].id;
                                            var img = RadioListDisplay[0].SignatureImg;
                                            popoverScope.radioValue = value;
                                            SignatureSel.val(value);
                                            SignatureSel.parents(".SignaturePanel").find('.detail.item-icon-right').html("<img src=" + img + " />");
                                        }
                                    }
                                    popover.scope.clickRadio = function (value, index) {
                                        that.CommentInput.val(value);
                                        //update by ousihang 选中常用意见提示已经选中
                                        popover.scope.data.textValue = value;
                                        var selectedStatus = popover.scope.data.textValue || SheetLanguages.Current.hasBeenSelected;
                                        mobileFreCommentValue.find("span").text(selectedStatus);
                                        that.Validate();
                                        ionic.$scope.frequentCommentIndex = index;
                                    };
                                    popover.scope.searchFocus = false;
                                    popover.scope.searchAnimate = function () {
                                        //update by ousihang 如果搜索框中没有你内容才变换样式
                                        if (popover.$el.find("ion-header-bar").eq(1).find("input").val() == "") {
                                            popover.scope.searchFocus = !popover.scope.searchFocus;
                                        }
                                    };
                                    popover.scope.searChange = function () {
                                        popover.scope.searchNum = $(".active .popover .list").children('label').length;
                                    };
                                });
                                return;
                            });
                        }
                    }

                    // 设为常用checkbox 移动端不显示
                    if (this.FrequentSettingVisible && !this.IsMobile) {
                        var checkboxid = $.MvcSheetUI.NewGuid();
                        // SettingPanel = $("<span></span>").css({"margin-left": "10px"});
                        // this.SaveFrequentCk = $("<input type='checkbox'/>").attr("id", checkboxid);
                        // var Spantxt = $("<label type='checkbox' for='" + checkboxid + "'>" + SheetLanguages.Current.FrequentlyUsedComment + "</label>")
                        // Spantxt.css("cursor", "pointer");

                        SettingPanel = $("<span class='checkbox checkbox-primary'></span>").css('float','right');
                        this.SaveFrequentCk = $("<input type='checkbox'/>").attr("id", checkboxid);
                        var Spantxt = $("<label type='checkbox' for='" + checkboxid + "'>" + SheetLanguages.Current.FrequentlyUsedComment + "</label>")
                        Spantxt.css("cursor", "pointer");
                        SettingPanel.append(this.SaveFrequentCk);
                        SettingPanel.append(Spantxt);

                        LatestCommentPanel.append(SettingPanel);

                        if (LatestCommentSel) {
                            LatestCommentSel.width("80%");
                        }
                    }

                    // 签章下拉框
                    if (this.DisplaySign) {
                        var mySignatures = $.MvcSheetUI.SheetInfo.MySignatures;
                        var defaultSignatures;
                        if (mySignatures) {
                            for (var i = 0; i < mySignatures.length; i++) {
                                if (mySignatures[i].IsDefault) {
                                    defaultSignatures = mySignatures[i];
                                    break;
                                }
                            }
                        }
                        if (!this.IsMobile) {
                            //pc
                            SignatureSel = $("<select></select>").css({"margin-left": "20px"});
                            SignatureSel.append("<option value=''>--" + SheetLanguages.Current.SelectSign + "--</option>");
                            if (mySignatures) {
                                for (var i = 0, len = mySignatures.length; i < len; i++) {
                                    var signature = mySignatures[i];
                                    //update by xl@Future
                                    signature.Name = $('<div/>').text(signature.Name).html();

                                    var option = $("<option title='" + signature.Name + "' value='" + signature._ObjectID + "'>"
                                            + (signature.Name.length > 18 ? signature.Name.substring(0, 18) + "..." : signature.Name)
                                            + "</option>");
                                    SignatureSel.append(option);
                                    if (signature.IsDefault)
                                        SignatureSel.val(signature._ObjectID);
                                }
                                if (mySignatures.length == 1)
                                    SignatureSel.val(mySignatures[0]._ObjectID);
                                that._changeSignaturePic(SignaturePicPanel, SignatureSel.val());
                            }

                            $(SignatureSel).unbind("change.signatureSel").bind("change.signatureSel", function () {
                                that._changeSignaturePic(SignaturePicPanel, $(this).val());
                            });

                            LatestCommentPanel.append(SignatureSel);


                            if (this.MyComment) {
                                SignatureSel.val(this.MyComment.SignatureId);
                                SignatureSel.trigger("change");
                            }

                            SignatureSel.width("20%");
                            if (LatestCommentSel) {
                                LatestCommentSel.width("55%");
                            }

                        } else {
                            //移动端
                            // $('<span class="input-label">' + SheetLanguages.Current.Signature + '</span>').appendTo(SignaturePanel);
                            //update by ousihang 添加"请输入"提示
                            $("<div class='detail item-icon-right'><span>" + SheetLanguages.Current.PleaseSelect + "</span><i class='icon ion-ios-arrow-right'></i></div>").appendTo(SignaturePanel);

                            //val存储id
                            var SignatureSel = $('<input type="text" style="display:none;"></input>');
                            SignatureSel.appendTo(SignaturePanel);



                            //渲染默认的签章
                            if (defaultSignatures && defaultSignatures.SignatureID) {
                                SignatureSel.val(defaultSignatures.SignatureID);
                                var detail = SignaturePanel.find('.detail');
                                //update by ousihang
                                detail.html("<img src=" + $.MvcSheetUI.PortalRoot + "/TempImages/" + defaultSignatures.SignatureID + ".jpg" + " />");
                            }

                            //如果有保存的评论
                            if (this.MyComment) {
                                SignatureSel.parents(".SignaturePanel").find('.detail .input-label').html("<img src=" + $.MvcSheetUI.PortalRoot + "/TempImages/" + this.MyComment.SignatureId + ".jpg" + " />");
                            }

                            SignaturePanel.unbind('click.chooseSignitrue').bind('click.chooseSignitrue', function (e) {
                                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover3.html?v=201803121537', {
                                    scope: ionic.$scope
                                }).then(function (popover) {
                                    popover.scope.header = SheetLanguages.Current.Signature;
                                    popover.scope.popover = popover;
                                    popover.scope.RadioListDisplay = [];
                                    popover.scope.selectedValue = {signatrueId: ""}
                                    console.log(mySignatures, 'mySignatures')
                                    for (var i = 0; i < mySignatures.length; i++) {
                                        popover.scope.RadioListDisplay[i] = {};
                                        popover.scope.RadioListDisplay[i].SortKey = mySignatures[i].SortKey;
                                        popover.scope.RadioListDisplay[i].id = mySignatures[i].SignatureID;
                                        popover.scope.RadioListDisplay[i].name = mySignatures[i].Name;
                                        popover.scope.RadioListDisplay[i].SignatureImg = $.MvcSheetUI.PortalRoot + "/TempImages/" + mySignatures[i].SignatureID + ".jpg";
                                    }

                                    //签章重置事件绑定 add by ousihang
                                    popover.scope.reset = function () {
                                        popoverScope = this.$parent;
                                        var RadioListDisplay = popoverScope.RadioListDisplay;
                                        if (RadioListDisplay.length >= 1) {
//                            		//遍历angular scope重设radioValue   ----------------------------------
//                            		//更新DOM结构必须要更新这里的逻辑
//                            		var $radioScope = angular.element(jQuery.find("ion-list")).scope().$$childHead;
//                            		while ($radioScope != null) {
//                            			console.log($radioScope.$id);
//                            			console.log($radioScope.radioValue);
//                            			$radioScope.radioValue = "";
//                            			$radioScope = $radioScope.$$nextSibling;
//                            		}

                                            popover.scope.selectedValue.signatrueId = "";
                                            SignatureSel.val("");
                                            SignatureSel.parents(".SignaturePanel").find('.detail.item-icon-right').html(SheetLanguages.Current.PleaseSelect);
                                        } else {
                                            var value = RadioListDisplay[0].id;
                                            var img = RadioListDisplay[0].SignatureImg;
                                            popover.scope.selectedValue.signatrueId = value;
                                            SignatureSel.val(value);
                                            SignatureSel.parents(".SignaturePanel").find('.detail.item-icon-right').html("<img src=" + img + " />");
                                        }

                                    }

                                    popover.scope.selectedValue.signatrueId = SignatureSel.val();

                                    popover.show();
                                    popover.scope.hide = function () {
                                        popover.hide();
                                    };
                                    popover.scope.clickRadio = function (value) {
                                        SignatureSel.val(value);
                                        //update by ousihang 解决签章选择效果不展示的bug
                                        SignatureSel.parents(".SignaturePanel").find('.detail.item-icon-right').html("<img src=" + $.MvcSheetUI.PortalRoot + "/TempImages/" + value + ".jpg" + " />");
                                    };
                                    popover.scope.searchFocus = false;
                                    popover.scope.searchAnimate = function () {
                                        //update by ousihang
                                        if (popover.$el.find("ion-header-bar").eq(1).find("input").val() == "") {
                                            popover.scope.searchFocus = !popover.scope.searchFocus;
                                        }
                                    };
                                    popover.scope.searChange = function () {
                                        popover.scope.searchNum = $(".active .popover .list").children('label').length;

                                    };
                                });
                                return;
                            });

                        }
                    }


                    //保存表单时以SignatureSel.val()
                    if (SignatureSel) {
                        this.SignatureSel = SignatureSel;
                    }
                }
            });
        })(jQuery);
// Label控件
(function ($) {
    //控件执行
    $.fn.SheetCountLabel = function () {
        return $.MvcSheetUI.Run.call(this, "SheetCountLabel", arguments);
    };

    $.MvcSheetUI.Controls.SheetCountLabel = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetCountLabel.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetCountLabel.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            if (arguments) {
                var value = arguments[0];
                if(value == undefined) return;
                //$(this.Element).text(value);
                if (this.FormatRule) {
                    // value = this.ForMat(value);
                    this.GetFromatValue($(this.Element), value);
                }else{
                	//update by luwei ; toFixed 是Number类型的方法
                	$(this.Element).text(Number(value).toFixed(2));
                }
                // $(this.Element).text(value);
            }
        }
    });
})(jQuery);
// SheetDropDownList控件
(function ($) {
    //控件执行
    $.fn.SheetDropDownList = function () {
        return $.MvcSheetUI.Run.call(this, "SheetDropDownList", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetDropDownList = function (element, options, sheetInfo) {
        this.FilterValue = "";
        this.FilterDataFields = [];
        this.ParentFilterDataFields = [];
        $.MvcSheetUI.Controls.SheetDropDownList.Base.constructor.call(this, element, options, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetDropDownList.Inherit($.MvcSheetUI.IControl, {
        //控件渲染函数
        Render: function () {
            var $element = $(this.Element);
            var dataFieldValue = this.V;
            var that = this;
            //是否可见
            if (!this.Visiable) {
                $element.hide();
                if ($element.find("option").length <= 0) {
                    $element.append("<option value=\"\"></option>");
                }
                return;
            }

            //不可编辑
            if (!this.Editable) {
                //先将select隐藏，改善界面加载体验
                $element.hide();
            } else {
                // 设置为搜索框的效果
                if (this.Queryable && !this.IsMobile) {
                    $element.select2({placeholder: this.EmptyItemText});
                }
            }

            // 查看痕迹
            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) {
                this.RenderDataTrackLink();
            }

            // 控件中已有的option
            var $existedOptions = $element.children("option");

            if (this.SchemaCode.trim() != "") { //业务对象数据源（主数据）
                var filter = this._createFilter();
                if (this.ParentFilterDataFields.length > 0 && $.MvcSheetUI.Loading) {
                    // return;
                }
                //console.log(this.DataField);
                var cmdParam = JSON.stringify([this.SchemaCode, this.QueryCode, filter,
                    this.DataTextField, this.DataValueField]);
                if (this.FilterValue == cmdParam)
                    return;
                this.SetEmpty();
                // 是否默认显示空项
                this.SetEmptyItem();
                //如果缓存中有对应参数的数据，直接用缓存数据构造option
                if ($.MvcSheetUI.CacheData && $.MvcSheetUI.CacheData[cmdParam]) {
                    var cacheData = $.MvcSheetUI.CacheData[cmdParam];
                    for (var key in cacheData) {
                        //update by xl@Future
                        key = key + "";
                        if (this.IsMobile) {
                            this.AddMobileItem(key, cacheData[key + ""], false);
                        }
                        cacheData[key + ""] = (cacheData[key + ""]).replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;");
                       

                        $element.append("<option value=\"" + $('<div/>').text(key).html() + "\">" + cacheData[key + ""] + "</option>");
                        
                    }
                    this._selectItem($element, dataFieldValue);
                    if (this.IsMobile && that.Editable)
                        this.ionicInit($.MvcSheetUI.IonicFramework);
                } else {
                    //filter中有值不为空的项
                    var hasValueItem = false;
                    for (var k in filter) {
                        if (filter[k]) {
                            hasValueItem = true;
                            break;
                        }
                    }
                    //异步获取option数据
                    //条件:1.未设置Filter   2.filter中有值不为空的项 
                    //当设置了Filter，filter中的所有项的值都是空时，不用异步获取option来显示
                    //即：触发联动的元素没有值时，被触发的元素不显示option
                    if (!this.Filter || hasValueItem) {
                        $.MvcSheet.GetSheet(
                                {
                                    "Command": "GetBizServiceData",
                                    "Param": cmdParam
                                },
                                function (data) {
                                    //将数据缓存
                                    if (!$.MvcSheetUI.CacheData) {
                                        $.MvcSheetUI.CacheData = {};
                                    }
                                    if (data.Successful != null && !data.Successful) {
                                        // 执行报错则输出日志
                                        console.log(data.Message);
                                    } else {
                                        $.MvcSheetUI.CacheData[cmdParam] = data;

                                        for (var key in data) {
                                            //update by xl@Future
                                            key = key + "";
                                            
                                            

                                            if (!$element.find("option[value='" + key.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;") + "']") || $element.find("option[value='" + key.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;") + "']").length == 0) {
                                            	if (that.IsMobile) {
                                                    that.AddMobileItem(key, data[key], false);
                                                }
                                            	data[key] = (data[key]).replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                                            	$element.append("<option value=\"" + key.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;") + "\">" + data[key] + "</option>");
                                                
                                            }
                                        }
                                        that._selectItem($element, dataFieldValue);
                                        if (that.IsMobile && that.Editable)
                                            that.ionicInit($.MvcSheetUI.IonicFramework);
                                    }
                                }, null, this.DataField.indexOf(".") == -1);
                    }
                }
                this.FilterValue = cmdParam;
            } else if (this.MasterDataCategory.trim() != "") { //数据字典数据源
                this.SetEmpty();
                // 是否默认显示空项
                this.SetEmptyItem();
                var cmdParam = JSON.stringify([this.MasterDataCategory]);
                if ($.MvcSheetUI.CacheData && $.MvcSheetUI.CacheData[cmdParam]) {
                    var cacheData = $.MvcSheetUI.CacheData[cmdParam];
                    for (var key in cacheData) {
                    	if (this.IsMobile) {
                            this.AddMobileItem(cacheData[key].Code, cacheData[key].EnumValue, false);
                        }
                        //update by xl@Future
                        cacheData[key].Code = $('<div/>').text(cacheData[key].Code).html();
                    
                        cacheData[key].EnumValue = $('<div/>').text(cacheData[key].EnumValue).html();                    

                        $element.append("<option value=\"" + cacheData[key].Code + "\"" +
                                (cacheData[key].IsDefault ? " selected=\"selected\"" : "") + ">" + cacheData[key].EnumValue + "</option>");
                        
                    }
                    this._selectItem($element, dataFieldValue);
                    if (this.IsMobile && this.Editable)
                        this.ionicInit($.MvcSheetUI.IonicFramework);
                } else {
                    $.MvcSheet.PostSheet({
                        "Command": "GetMetadataByCategory",
                        "Param": cmdParam
                    },
                     function (data) {
                                if (data) {
                                    //将数据缓存
                                    if (!$.MvcSheetUI.CacheData) {
                                        $.MvcSheetUI.CacheData = {};
                                    }
                                    $.MvcSheetUI.CacheData[cmdParam] = data;

                                    for (var i = 0, len = data.length; i < len; i++) {
                                    	if (that.IsMobile) {
                                            that.AddMobileItem(data[i].Code, data[i].EnumValue, false);
                                        }
                                        //update by xl@Future
                                        data[i].Code = (data[i].Code).replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                                        
                                        data[i].EnumValue = (data[i].EnumValue).replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");                             

                                        $element.append("<option value=\"" + data[i].Code + "\"" +
                                                ((data[i].IsDefault && !that.DisplayEmptyItem) ? " selected=\"selected\"" : "") + ">" + data[i].EnumValue + "</option>");
                                        
                                    }
                                }
                                that._selectItem($element, dataFieldValue);
                                if (that.IsMobile && that.Editable)
                                    that.ionicInit($.MvcSheetUI.IonicFramework);
                            }, null, this.DataField.indexOf(".") == -1);
                }
            } else if (this.DefaultItems.trim() != "") { // DefaultItems
                // 是否默认显示空项
                this.SetEmptyItem();
                var values = this.DefaultItems.split(";");

                for (var i = 0; i < values.length; i++) {
                	if (this.IsMobile) {
                        this.AddMobileItem(values[i], values[i], false);
                    }
                    //update by xl@Future
                    values[i] = $('<div/>').text(values[i]).html();
                    $element.append("<option value=\"" + values[i] + "\">" + values[i] + "</option>");             
                }
                this._selectItem($element, dataFieldValue);

                if (this.IsMobile && this.Editable)
                    this.ionicInit($.MvcSheetUI.IonicFramework);
            } else {
                // 是否默认显示空项
                this.SetEmptyItem();

                if ($existedOptions && $existedOptions.length > 0) {
                    $element.append($existedOptions);
                    $element.val($element.children(":eq(0)").val());

                    this._selectItem($element, dataFieldValue);
                }
            }

            //绑定change事件
            $element.unbind("change.SheetDropDownList").bind("change.SheetDropDownList", function () {
                if (that.TextDataField) {
                    $.MvcSheetUI.SetControlValue(that.TextDataField, that.GetText(), that.RowNum);
                }
                that.Validate();
                if (that.OnChange) {
                    that.RunScript(this, that.OnChange);
                }
            });
        },
        AddMobileItem: function (value, text, isDefault) {
            var MobileOption = {
                DataField: this.DataField,
                Value: value,
                Text: text
            };
            this.MobileOptions.push(MobileOption);
        },

        ionicInit: function (ionic) {
            var that = this;
            //只往上一级，只能通过控件绑定chick事件，防止DisplayRule属性存在时出现异常
            $(this.Element.parentElement).unbind('click.showChoice').bind('click.showChoice', function (e) {
                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover.html?v=20180108', {
                    scope: ionic.$scope
                }).then(function (popover) {
                    popover.scope.header = that.N;
                    popover.scope.RadioListDisplay = [];
                    //update by luxm
                    popover.scope.Queryable = that.Queryable;
                    if (that.DisplayEmptyItem && that.EmptyItemText) {
                        var emptyOption = {
                            DataField: that.DataField,
                            Value: "",
                            Text: that.EmptyItemText
                        };
                        popover.scope.RadioListDisplay.push(emptyOption);
                    }
                    popover.scope.RadioListDisplay = popover.scope.RadioListDisplay.concat(that.MobileOptions);
                    popover.scope.RadioListValue = that.GetValue();
                    popover.show();
                    //update by luxm
                    if (that.Queryable == false) {
                        $("#content").css("top", "40px");
                    }

                    popover.scope.hide = function () {
                        popover.hide();
                    }
                    popover.scope.clickRadio = function (value, text) {
                        that.SetValue(value);
                        text = text.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                        $(that.Mask).html(text);
                    }
                    popover.scope.searchFocus = false;
                    popover.scope.searchAnimate = function () {
                        popover.scope.searchFocus = !popover.scope.searchFocus;
                    };
                });
                return;
            });

            if (that.IsMobile) {
                var text = that.GetText();
                if (that.Editable) {
                    that.Mask.html(text);
                    $(that.Mask).css({'color': '#2c3038'});
                } else {
                    //移动端不可编辑
                    $(that.Element).html(text);
                }
            }
        },

        SetEmptyItem: function () {
            if (this.DisplayEmptyItem) {
                if (this.EmptyItemText == "") {
                    this.EmptyItemText = " ";
                }
                var emptyText = this.EmptyItemText.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                $(this.Element).append("<option value=\"\">" + emptyText + "</option>");
            }
        },
        SetEmpty: function () {// 清空所有选项
            //清空options
            $(this.Element).empty();
            if ($("#s2id_" + $(this.Element).attr("id")).length > 0) {
                $("#s2id_" + $(this.Element).attr("id")).find(".select2-chosen").html("");
            }
            if ($(this.element).find("div[class='afFakeSelect']").length == 1) {
                $element.parent().find("div[class='afFakeSelect']").html("")
            }
        },
        SetValue: function (v) {
            $(this.Element).val(v);
            if (this.Queryable) {
                var txt = $(this.Element).find("option:selected").text();
                $("#s2id_" + this.Element.id).find(".select2-chosen").html(txt);
                if ($(this.Element).parent().find("div[class='afFakeSelect']").length == 1) {
                    $(this.Element).parent().find("div[class='afFakeSelect']").html(txt)
                }
            }
            //手动触发change事件,以触发联动
            $(this.Element).trigger("change");
        },
        GetValue: function () {
            var v = $(this.Element).val() || $(this.Element).find("option:selected").val();
            if (this.IsMobile && !v) {
                v = this.DataItem.V;
            }
            return v;
        },
        //绑定的数据源为业务对象（主数据），将设置的Filter转换成键值对象，并为联动触发控件绑定联动change事件
        _createFilter: function () {
            var that = this;
            var filter = {};
            //Filter 查询字段1:数据项1;查询字段2:控件ID;查询字段3:固定值
            if (this.Filter) {
                var filterItems = this.Filter.split(",");
                var filterElements = {};
                if (filterItems) {
                    for (var i = 0; i < filterItems.length; i++) {
                        if (filterItems[i] && filterItems[i].split(":").length == 2) {
                            var dataField = filterItems[i].split(":")[0]; //数据项 or 控件ID or 固定值
                            var searchField = filterItems[i].split(":")[1]; //查询字段编码
                            //var element = $.MvcSheetUI.GetElement(dataField, this.RowNum);
                            var element = $.MvcSheetUI.GetElement(dataField, that.GetRowNumber());

                            if (element) { //数据项
                                element.unbind("change." + this.DataField + that.GetRowNumber()).bind("change." + this.DataField + that.GetRowNumber(), function () {
                                    if (!$.MvcSheetUI.Loading) {
                                        //update by zhengyj 加上移动端的判断执行的语句
                                        if (that.IsMobile) {
                                            that.RenderMobile();
                                        } else {
                                            that.Render();
                                        }
                                    }
                                });
                                filterElements[dataField] = element;
                                var sheetUI = element.SheetUIManager();
                                if (sheetUI && sheetUI instanceof $.MvcSheetUI.Controls.SheetDropDownList) {
                                    for (var m in sheetUI.FilterDataFields) {
                                        this.ParentFilterDataFields.push(sheetUI.FilterDataFields[m]);
                                    }
                                    for (var m in sheetUI.ParentFilterDataFields) {
                                        this.ParentFilterDataFields.push(sheetUI.FilterDataFields[m]);
                                    }
                                }
                                filter[searchField] = $.MvcSheetUI.GetControlValue(dataField, that.GetRowNumber());
                            } else if (document.getElementById(dataField)) { //控件ID
                                $("#" + dataField).unbind("change." + this.DataField + that.GetRowNumber()).bind("change." + this.DataField + that.GetRowNumber(), function () {
                                    if (!$.MvcSheetUI.Loading) {
                                        that.Render();
                                    }
                                });
                                filter[searchField] = $("#" + dataField).val();
                            } else { //固定值
                                filter[searchField] = dataField;
                            }
                            // 记录过滤的字段
                            this.FilterDataFields.push(dataField);
                        }
                    }
                }
                // 移除不是直接元素的绑定事件
                for (var k in filterElements) {
                    if (this.ParentFilterDataFields.indexOf(k) > -1) {
                        filterElements[k].unbind("change." + this.DataField + that.GetRowNumber());
                    }
                }
            }
            return filter;
        },
        //设置选中项
        _selectItem: function ($element, selectedValue) {
            //选中的值 dataFieldValue/SelectedValue
            if (!selectedValue) {
                selectedValue = this.SelectedValue;
            }
            if (selectedValue != "") {
                $element.val(selectedValue);
            }
            if ($element.find("option:selected").length == 0 && $element.find("option").length > 0) {
                $element.find("option")[0].selected = true;
            }
            if ($element.parent().find("div[class='afFakeSelect']").length == 1) {
                var select = $element.find("option:selected").text();
                $element.parent().find("div[class='afFakeSelect']").html(select)
            }

            //手动触发change事件,以触发联动
            $element.trigger("change");

            //不可编辑
            if (!this.Editable) {
                var textLable = $element.parent().find("#myselecttext");
                if (textLable.length > 0) {
                    textLable.text(this.GetText());
                } else {
                	var valueText = this.GetText();
                	valueText = valueText.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                    $element.after("<label id='myselecttext' for='" + $element.attr("id") + "' style='width:100%;'>" + valueText + "</label>");
                }
            }
        },
        RenderMobile: function () {
            //this.MobileOptions = [];
            ////可编辑
            //if (this.Editable) {
            //    this.constructor.Base.RenderMobile.apply(this);
            //}
            //else {
            //    this.Render();
            //}
            this.MobileOptions = [];
            this.Render();
            //不可用
            if (!this.Editable) {
                $(this.Element).addClass(this.Css.Readonly);
            } else {
                this.MoveToMobileContainer();
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).hide();
            }
        },
        GetText: function () {
            return $(this.Element).children("option:selected").text();
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable)
                return result;

            if (this.DataField) {
                //var dataFieldItem = $.MvcSheetUI.GetSheetDataItem(this.DataField, this.RowNum);
                var dataFieldItem = $.MvcSheetUI.GetSheetDataItem(this.DataField, this.GetRowNumber());
                if (dataFieldItem) {
                    var value = $(this.Element).val();
                    // if (dataFieldItem.V != value)
                    {
                        result[this.DataField] = dataFieldItem;
                        result[this.DataField].V = value;
                    }
                } else {
                    alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                }
            }
            return result;
        }
    });
})(jQuery);
// Label控件
(function ($) {
    var resetValue = [];
    //控件执行
    $.fn.SheetGridView = function () {
        $(this).find(".template>*[data-datafield]").children().each(function () {
            var datafiled = $(this).attr("data-datafield");
            $(this).removeAttr("data-datafield").attr("data-field", datafiled);
        });

        $(this).find("td[data-datafield]").each(function () {
            $(this).attr("data-field", $(this).attr("data-datafield"));
            $(this).removeAttr("data-datafield");
        });

        return $.MvcSheetUI.Run.call(this, "SheetGridView", arguments);
    };

    $.MvcSheetUI.Controls.SheetGridView = function (element, options, sheetInfo) {
        this.pageIndex = 0;
        this.loadNum = 10;//每次分页加载数据量
        this.dataContainerDivHeight = 0;
        this.originateValue = null;
        this.parentDatafield = '';
        $.MvcSheetUI.Controls.SheetGridView.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetGridView.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            this.loadNum = this.VirtualPageNum;
            //不可见返回
            if (!this.Visiable) {
                if (this.VirtualPaging) {
                    $(this.Element).parent().hide();
                } else {
                    $(this.Element).hide();
                }
                return;
            };
            // 渲染前端
            this.HtmlRender();
            // 绑定事件
            this._BindEvents();
            // 初始化数据源
            this.SetValue();
            // 设置按钮可见
            this.SetVisible();
            // 子表展现完成后事件
            if (this.OnRendered) {
                this.RunScript(this, this.OnRendered, arguments);
            }
        },
        _BindEvents: function () {
            //绑定增加事件
            $(this.addbtn).unbind("click").bind("click", [this], function (e) {
                // console.log(e.data[0], "add");
                // if (e.data[0]._AddRow() != undefined) {
                //     e.data[0]._AddRow().apply(this, true);
                // }
                if (e.data[0]._AddNewRow() != undefined) {
                    e.data[0]._AddNewRow().apply(this, true);
                }
            });
            //绑定清除事件
            $(this.clearbtn).unbind("click").bind("click", [this], function (e) {
                if (e.data[0]._Clear() != undefined) {
                    e.data[0]._Clear().apply(this, arguments);
                }
            });
            //绑定导出事件
            $(this.exportbtn).unbind("click").bind("click", [this], function (e) {
                //if (e.data[0]._Export() != undefined) {
                e.data[0]._Export.apply(e.data[0], arguments);
                //}
            });
            //绑定导入事件
            $(this.importbtn).find("a").unbind("click").bind("click", [this], function (e) {
                //if (e.data[0]._Import() != undefined) {
                e.data[0]._Import.apply(e.data[0], arguments);
                //}
            });
        },
        // 设置相关按钮是否可见
        SetVisible: function () {
            if (this.VirtualPaging) {
                var dataTableHeight = $(this.Element).height();
                var divDataTable = $(this.Element).parent().parent().height();
                if (dataTableHeight < divDataTable) {
                    $(this.Element).parent().css("height", dataTableHeight + 60 + "px");
                    $(this.Element).parent().parent().css("height", dataTableHeight + 150 + "px");
                }
            }
            if (this.V.R) {
                if (this.V.R.length == 1 && (this.IsEmptyRow($(this.Element).find("tr.rows:first")) || this.Originate))
                    if (this.DefaultRowCount > 0) {                           //添加默认行
                        for (var i = 0; i < this.DefaultRowCount - 1; i++) {
                            this._AddRow();
                        }
                    }
            }
            if (!this.DisplayAdd || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) {    //添加按钮
                $(this.addbtn).css("display", "none");
            }
            if (!this.DisplayExport || this.L == $.MvcSheetUI.LogicType.BizObject) { //导出按钮
                $(this.exportbtn).css("display", "none");
            }
            if (!this.DisplayImport || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) { //导入按钮
                $(this.importbtn).css("display", "none");
            }
            if (!this.DisplayClear || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) {  //清除按钮
                $(this.clearbtn).css("display", "none");
            }
            if (!this.DisplayInsertRow || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable || this.VirtualPaging) { //插入行按钮
                $(this.Element).find("a.insert").css("display", "none");
            }
            if (!this.DisplayDelete || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) {    //删除按钮
                $(this.Element).find("a.delete").css("display", "none");
            }
            if (((!this.DisplayInsertRow && !this.DisplayDelete) || !this.Editable) && this.L != $.MvcSheetUI.LogicType.BizObject) {
                if ($(this.template).length > 1) {
                    var tdsnum = $($(this.template)[0]).find("td").length;
                    $(this.Element).find("tr").each(function (e) {
                        if ($(this).find("td").length == tdsnum) {
                            if ($(this).find("td:last").find("a.delete").length > 0)
                                $(this).find("td:last").css("display", "none");
                        }
                    });
                }
                else {
                    $(this.Element).find("tr[data-row]").each(function (e) {
                        $(this).find("td:last").css("display", "none");
                    });
                }
                $(this.Element).find("tr:first").find("td:last").css("display", "none");
                $(this.Element).find("tr.footer").find("td:last").css("display", "none");

                if (this.VirtualPaging)
                    $($(this.Element).parent().parent().find("tr.header")).find("td.rowOption").hide();
            }
            if (!this.DisplaySequenceNo) {                 //序号列
                if ($(this.template).length > 1) {
                    var tdsnum = $($(this.template)[0]).find("td").length;
                    $(this.Element).find("tr").each(function (e) {
                        if ($(this).find("td").length == tdsnum)
                            $(this).find("td:first").css("display", "none");
                    });
                }
                else {
                    $(this.Element).find("tr").each(function (e) {
                        $(this).find("td:first").css("display", "none");
                    });
                }

                if (this.VirtualPaging)
                    $($(this.Element).parent().parent().find("tr.header")).find("td:first").hide()
            }
            if (!this.DisplaySummary || this.L == $.MvcSheetUI.LogicType.BizObject) {       //汇总行
                $(this.Summary).css("display", "none");
            }
            else {
                var tds = $(this.template).find("td");
                var doSummary = false;
                for (var i = 0; i < tds.length; i++) {
                    if (this.GetSummaryTd(tds[i])) {
                        this._Summary($(tds[i]).children());
                        doSummary = true;
                    }
                }
                if (!doSummary) {
                    $(this.Summary).css("display", "none");
                }
            }

            var tds = $(this.Element).find("td");
            if (this.VirtualPaging) {
                tds = $(this.Element).parent().parent().find("td");
            }
            for (var i = 0; i < tds.length; i++) {
                var datafield = $(tds[i]).attr("data-field");
                if (datafield) {
                    var dataitem = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
                    if (dataitem && dataitem.O.indexOf("V") < 0) {
                        $(tds[i]).css("display", "none");

                    }
                }
            }
            if (this.VirtualPaging)
                this._SetVirtualPagingContainerHeight();
        },
        GetSummaryTd: function (td) {           //判断单元格中是否包含数值类型
            var datafield = $(td).attr("data-field");
            if (datafield) {
                var dataitem = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
                if (dataitem && (dataitem.L == $.MvcSheetUI.LogicType.Int || dataitem.L == $.MvcSheetUI.LogicType.Double || dataitem.L == $.MvcSheetUI.LogicType.Long)) {
                    return true;
                }
            }
            return false;
        },
        _Summary: function (input) {            //汇总计算
            var datafield = $(input).closest("td").attr("data-field");
            // console.log(input, 'input---')
            var countControl;
            var countLabels = $(this.Summary).find("label");
            for (var i = 0; i < countLabels.length; i++) {
                if ($(countLabels[i]).attr("data-datafield") == datafield) {
                    countControl = $(countLabels[i]);
                }
            }

            var count = 0;
            var sum = 0;
            var valueArray = new Array();
            var tds = $(this.Element).find("tr.rows").find("td");
            for (var i = 0; i < tds.length; i++) {
                if ($(tds[i]).attr("data-field") == datafield) {
                    // var v =  $(tds[i]).children().text() || $(tds[i]).children().val() || "0";
                    var v = $(tds[i]).find("input:checked").val() || $(tds[i]).children().find('.select2-chosen').text() || $(tds[i]).children().val() || "0";
                    var value;
                    value = v.replace(/\s*/g,"")?v.replace(/\s*/g,""):0;
                    if (isNaN(v)) {
                        value = parseFloat(v.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, ""));
                    }
                    // console.log(value, 'value')
                    sum += parseFloat(value);
                    count++;
                    valueArray.push(value)
                }
            }
            var max = Math.max.apply(Math, valueArray)
            var min = Math.min.apply(Math, valueArray)

            if (isNaN(sum)) {
                return;
            }

            var manager = $(countControl).SheetCountLabel();
            if (manager && manager.StatType) {
                switch (manager.StatType) {
                    case "SUM":
                        manager.Render(sum);
                        break;
                    case "AVG":
                        manager.Render((sum / count).toFixed(2));
                        break;
                    case "MAX":
                        manager.Render(max);
                        break;
                    case "MIN":
                        manager.Render(min);
                        break;
                    default:
                        break;
                }
            }
            // this._SummaryOTher(input);
        },
        _SummaryOTher: function (input) { // 计算汇总字段
            var datafield = $(input).attr($.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey);
            if (!datafield) return;
            var parent = $(input).parent();
            var i = 0;
            while (!parent.is("tr")) {
                parent = parent.parent();
                i++;
                if (i > 10) break;
            }
            var ctl = parent.find("input[data-computationrule*='{" + datafield + "}'],label[data-computationrule*='{" + datafield + "}'],span[data-computationrule*='{" + datafield + "}']");
            if (ctl.length > 0) {
                for (var i = 0; i < ctl.length; i++) {
                    this._Summary(ctl[i]);
                }
            }
        },
        GetText: function () {
            var num = 0;
            if (this.IsMobile)
                num = $(this.Element).find("ul.list").length - 1;
            else
                num = $(this.Element).find("tr.rows").length
            return num + SheetLanguages.Current.Records;
        },
        GetValue: function () {
            var value = new Array();
            var trvalue = {};

            if (this.IsMobile) {
                var gridview = this.MobileRows;
                if (gridview) {
                    for (var i = 0; i < gridview.length; i++) {
                        var row = gridview[i];
                        row.id = row.RowControl.attr('id');
                        if (row) {
                            var controls = row.Editors;
                            for (var j = 0; j < controls.length; j++) {
                                var control = controls[j];
                                if (control) {
                                    var datafield = control.DataField;
                                    if (datafield) {
                                        if (control.Type == "SheetTimeSpan") {
                                            var tmpStr = control.GetValue();
                                            tmpStr = tmpStr.replace("$", ".");
                                            trvalue[datafield.split(".")[1]] = tmpStr;
                                        } else {
                                            trvalue[datafield.split(".")[1]] = control.GetValue();
                                        }
                                    }

                                }
                            }
                            if (row.id) {
                                trvalue["ObjectID"] = row.id;
                            }

                            value.push(trvalue);
                            trvalue = {};
                        }
                    }
                }
            }
            else {
                var trs = $(this.Element).find("tr.rows");
                var tableid = $(this.Element).attr("id");
                var parentDatafield = $(this.Element).attr("data-datafield");
                if (this.template.length > 1) {
                    for (var i = 0; i < trs.length; i = i + this.template.length) {
                        var row = trs[i];
                        var datarow = $(row).attr("data-row");
                        var rows = $("#" + tableid + " tr[data-row='" + datarow + "']");
                        for (var k = 0; k < rows.length; k++) {
                            if (arguments && arguments[0])
                                trvalue = this.GetRowValue(rows[k], trvalue, arguments[0]);
                            else
                                trvalue = this.GetRowValue(rows[k], trvalue);
                        }
                        // 调用外部委托事件
                        if (this.OnEditorSaving != null) {
                            // trvalue = this.EditorSaving.apply(this, [rows, trvalue]);
                            this.RunScript(this, this.OnEditorSaving, [rows, trvalue]);
                        }
                        value.push(trvalue);
                        trvalue = {};
                    }
                }
                else {
                    for (var i = 0; i < trs.length; i++) {
                        var row = trs[i];
                        if (arguments && arguments[0])
                            trvalue = this.GetRowValue(row, trvalue, arguments[0]);
                        else
                            trvalue = this.GetRowValue(row, trvalue);
                        // 调用外部委托事件
                        if (this.OnEditorSaving != null) {
                            // trvalue = this.EditorSaving.apply(this, [$(row), trvalue]);
                            this.RunScript(this, this.OnEditorSaving, [$(row), trvalue]);
                        }
                        value.push(trvalue);
                        trvalue = {};
                    }
                }
            }
            return value;
        },
        //// 子表行保存委托事件
        //EditorSaving: function (row, trValue) {
        //    return trValue;
        //},
        GetRowValue: function (row, trvalue, isexport) {
            if (!this.IsEmptyRow(row) || (this.V && this.V.R && this.V.R.length > 0) || this.L == $.MvcSheetUI.LogicType.BizObject) {
                var tds = $(row).find("td");
                for (var j = 0; j < tds.length; j++) {
                    var td = tds[j];
                    var datafiledElement = $(td).find("[data-datafield]");
                    var datafield = datafiledElement.attr("data-datafield");
                    if (datafield != undefined) {
                        if (isexport) {
                            var dataitem = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
                            if (dataitem && dataitem.L == $.MvcSheetUI.LogicType.Attachment) {
                                var fjtrs = datafiledElement.find("table").find("tr");
                                var fjvalue = "";
                                for (var k = 0; k < fjtrs.length; k++) {
                                    fjvalue += $(fjtrs[k]).find("td:first").find("div").html() + ";";
                                }
                                trvalue[datafield.split(".")[1]] = fjvalue;
                            } else {
                                //trvalue[datafield.split(".")[1]] = datafiledElement.SheetUIManager($(row).attr("data-row")).GetValue();
                                //trvalue[datafield.split(".")[1]] = datafiledElement.SheetUIManager().GetValue()==""?datafiledElement.SheetUIManager().V:datafiledElement.SheetUIManager().GetValue();//修改子表导出无值的问题
                                trvalue[datafield.split(".")[1]] = datafiledElement.SheetUIManager() != undefined ? (datafiledElement.SheetUIManager().GetValue() == "" ? datafiledElement.SheetUIManager().V : datafiledElement.SheetUIManager().GetValue()) : dataitem.V;//修改子表导出无值的问题
                            }
                        }
                        else {
                            if (datafiledElement.SheetUIManager($(row).attr("data-row")))
                                trvalue[datafield.split(".")[1]] = datafiledElement.SheetUIManager($(row).attr("data-row")).GetValue();
                        }
                    }
                }
                if ($(row).attr("id") != undefined) {
                    trvalue["ObjectID"] = $(row).attr("id");
                }
            }
            return trvalue;
        },
        IsEmptyRow: function (tr) {
            var value = "";
            var num = $(tr).attr("data-row");
            $(tr).find("td").each(function () {
                if ($(this).children().SheetUIManager(num)) {
                    if ($(this).children().attr("class") == "SheetAttachment") {
                        var attachment = $(this).children().SheetUIManager(num).GetValue();
                        if (attachment.AttachmentIds != "" || attachment.DelAttachmentIds != "") {
                            value += "1";
                        }
                    }
                    else
                        value += $(this).children().SheetUIManager(num).GetValue();
                }
            })
            if (value == "" || value.replace("0", "") == "") {
                return true;
            }
            return false;
        },

        //分页加载数据
        //endIndex==-1:非分页加载；
        //dataGridview: 加载数据
        SetValue: function (dataSource) {
            // 初始化默认值 是否分页加载数据

            //移动端暂未支持VirtualPaging属性
            if (this.VirtualPaging && !this.IsMobile) {
                this._SetValueByPage(0, this.loadNum, null);//分页加载

                $(this.Element.parentElement).unbind("scroll.horizontal").bind("scroll.horizontal", [this], function (e) {
                    var left = $(this).scrollLeft();
                    $(this.parentElement).find(".SheetGridViewTitle").scrollLeft(left);
                });

                $(this.Element.parentElement).unbind("scroll.PageShow").bind("scroll.PageShow", [this], function (e) {
                    //判断是否加载
                    var IsLoad = false;
                    var divHeight = $(this).height();//显示子表table 的div高度
                    var tableHeight = $(this).find("table[data-type='SheetGridView']").height();//子表table高度
                    var ShowHeight = $(this).scrollTop();

                    var pageNum = Math.ceil(tableHeight / divHeight);//页数
                    var precent = ShowHeight / Number(tableHeight);
                    var relative = (pageNum - 2) / pageNum;
                    if (precent > relative) {
                        IsLoad = true;
                        var pageIndex = e.data[0].pageIndex;
                        var loadNum = e.data[0].loadNum;
                        var startIndex = pageIndex * loadNum;
                        var endIndex = (pageIndex + 1) * loadNum;
                        // e.data[0].SetValueByPage(startIndex, endIndex, e);// HuangJie，对应到后面也有注释，这里不能传递e过去，只能传指定的数据源
                        e.data[0]._SetValueByPage(startIndex, endIndex, dataSource);
                    }
                });
            }
            else {
                this._SetValueByPage(0, -1, dataSource);
            }
        },

        _SetValueByPage: function (startIndex, endIndex, dataSource) {
            // 初始化,若不传参数,则使用this.V,否则用设置的数据源,格式为MvcBizObjectList
            if (this.V.T) this.DefaultRow = this.V.T;
            var value = dataSource;
            if (this.L == $.MvcSheetUI.LogicType.BizObjectArray) {
                value = value || this.V.R;   // 如果指定的数据源为空，那么使用系统默认的数据源
            } else if (this.L == $.MvcSheetUI.LogicType.BizObject) {
                value = value || this.V;
            }
            if (!value) return;  // 数据源为空，不做处理

            // 加载方式：一次、分页
            if (endIndex == -1) {
                endIndex = value.length;
            }

            if (this.Originate && this.DefaultRowCount < 1) {
                return;
            }

            if (this.L == $.MvcSheetUI.LogicType.BizObjectArray) {
                if (startIndex < value.length) {
                    for (var i = startIndex; i < endIndex; i++) {
                        var row = value[i];
                        if (row != undefined) {
                            var objectid = $(this.Element).attr("data-datafield") + ".ObjectID";
                            if (this.IsMobile) {
                                this._AddMobileRow(row.DataItems[objectid].V);   //移动端
                            }
                            else {
                                this._AddRow(row.DataItems[objectid].V);
                            }
                        }
                    }
                    this.pageIndex += 1;
                }
                if (endIndex >= value.length) {
                    if (this.IsMobile) {
                        return true;
                    } else {
                        this.Element.parentElement.removeAttribute("scroll");
                        $(this.Element.parentElement).unbind("scroll.PageShow");
                    }

                }
            }
            else if (this.L == $.MvcSheetUI.LogicType.BizObject) {
                if (this.IsMobile) {
                    this._AddMobileRow();
                }
                else {
                    //this._AddRow();
                    this.newRow = $(this.Element).find("tr.template").removeClass("template").addClass("rows").attr("data-row", "1");
                    var objectid = this.V.DataItems[$(this.Element).attr("data-datafield") + ".ObjectID"].V;
                    $(this.newRow).attr("id", objectid);
                    $(this.newRow).find("td").each(function () {
                        var control = $(this).find("[data-field]");
                        var datafield = $(control).attr("data-field");
                        $(control).removeAttr("data-field").attr("data-datafield", datafield)
                            .attr("data-row", "1"); // 业务对象也给control加上data-row，方便通过datafield查找
                        $(control).SheetUIManager(1);
                    })
                }
                //this.EditorLoading.apply(this, [this.V]);
            }
        },
        HtmlRender: function () {
            if (this.VirtualPaging) {
                this._RenderVirtualPagingContainer();
            }
            // console.log(this.DataField,'this.DataField')
            this.ButtonId = this.DataField + "_" + Math.floor(Math.random() * 1000);//设置按钮ID
            this.RowCount = 0;
            this.RowNum = 0;
            this.template = $(this.Element).find("tr.template");
            // $(this.Element).css("width", "100%");
            $(this.Element).parent().css("overflow", "auto");//超出边界增加滑动
            var tds = this.template.find("td");
            this.Summary = $(this.Element).find("tr.footer");
            var tooldiv = $("<div></div>").css("width", "100%");
            this.addbtn = $("<div><a id='Add_" + this.ButtonId + "'>" + SheetLanguages.Current.Add + "</a></div>").css("width", "8%").css("float", "left").css("padding-top", "3px");
            this.clearbtn = $("<div><a id='Clear_" + this.ButtonId + "'>" + SheetLanguages.Current.Clear + "</a></div>").css("width", "8%").css("float", "left").css("padding-top", "3px");
            this.importbtn = $("<div><input id='importExcel_" + this.ButtonId + "' name='importExcel' type='file' style='width:60%;display: inline-block' /><a id='Import_" + this.ButtonId + "'>" + SheetLanguages.Current.Import + "</a></div>").css("float", "left");
            this.exportbtn = $("<div><a id='Export_" + this.ButtonId + "'>" + SheetLanguages.Current.Export + "</a></div>").css("width", "8%").css("float", "left").css("padding-top", "3px");
            tooldiv.append(this.addbtn).append(this.clearbtn).append(this.exportbtn).append(this.importbtn);
            if (this.VirtualPaging) {
                $(this.Element).parent().after(tooldiv);
            } else {
                $(this.Element).after(tooldiv);
            }

        },
        _RenderVirtualPagingContainer: function () {
            this.dataContainerDivHeight = $(this.Element).parent().height() - 70;  // 去掉表头的高度
            this.dataContainerDivHeight = this.dataContainerDivHeight < 80 ? 80 : this.dataContainerDivHeight;

            $("table").css("max-width", "none");
            // 表头div
            var divTitleTableContainer = $("<div class='SheetGridView SheetGridViewTitle' data-datafield='" + this.DataField + "' style='overflow:hidden;width:100%;'></div>");
            // 主体div
            var divDataTableContainer = $("<div class='SheetGridView SheetGridViewData' data-datafield='" + this.DataField + "' data-type='SheetGridView' style='overflow:auto;width:100%;height:" + this.dataContainerDivHeight + "px;' scroll='scroll'></div>");
            $(this.Element).parent().append(divTitleTableContainer);
            $(this.Element).parent().append(divDataTableContainer);

            //填充主体
            divDataTableContainer.append($(this.Element));//针对当前div.SheetGridViewData 对象

            // 填充表头 
            var dataTableWidth = $(this.Element).width();
            var tableTitleDom = $("<table class='SheetGridView'></table>").css("max-width", "none").css({
                "width": dataTableWidth,
                "table-layout": "fixed"
            });
            $(this.Element).css("width", $(this.Element).width());

            var tbody = $("<tbody class=''></tbody>");
            var header = $(this.Element).find("tr.header");
            tbody.append(header);
            tableTitleDom.append(tbody);
            divTitleTableContainer.append(tableTitleDom);//同上
            //divDataTableContainer.css("overflow", "inherit");
        },


        RenderMobile: function () {
            //不可见返回
            if (!this.Visiable) {
                $(this.Element).hide();
                return;
            }
            //移到表单最下方
            $(this.Element).closest("div[class=tableContent list]").hide();
            resetValue = $(this.Element).find("tr")[0].innerText.replace(/\s+/g, ",").split(",");
            // window.console.log("值"+resetValue);
            //关联关系
            $(this.Element).closest("div[class=list]").hide();

            var parentDatafield = $(this.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase());//数据项编码
            var sheetid = $(this.Element).data($.MvcSheetUI.SheetIDKey);
            this.template = $(this.Element).find(".template");
            $(this.Element).find("table").remove();
            $(this.Element).data($.MvcSheetUI.SheetIDKey, sheetid);

            //主容器 
            var panelContainer = $(this.Element).closest("div[class=tableContent list]");
            if ($(this.Element.parentElement).hasClass("hidden")) {
                this.Element = $("<div>").attr("data-datafield", parentDatafield).addClass("SheetGridView hidden");
            }
            else {
                this.Element = $("<div>").attr("data-datafield", parentDatafield).addClass("SheetGridView");
            }
            panelContainer.after(this.Element);

            //var titleText = $(this.Element).parent().attr("data-title") || this.DataItem.N;
            var titleText = SheetLanguages.Current.ChildSchemaInfo1;
            //区分关联关系
            var length = 0;
            if (this.V.DataItems != undefined) {
                this.IsAssociation = true;
                length = 1;
            } else {
                this.IsAssociation = false;
                length = this.V.R.length;
            }
            if (this.DataItem.N && this.DataItem.N.length > 7) {
                this.DataItem.N = this.DataItem.N.substr(0, 7) + '...';
            }
            txt = this.DataItem.N + SheetLanguages.Current.ChildSchemaInfo2 + length + SheetLanguages.Current.ChildSchemaInfo3;
            this.title = $("<div>").addClass("item item-title").append("<span>" + txt + "</span>");
            this.title.appendTo(this.Element);
            var content = $("<div>").addClass("item-content").addClass("tab-mode");//子表默认显示模式tab-mode
            content.appendTo(this.Element);
            var tabWidth = length * 40 + 100;
            this.modal =
                '<div class="item-index">' +
                '<div class="buttons-left">' +
                '<ion-scroll class="scroll" direction="x" scrollbar-x="false" delegate-handle="' + this.DataField + '_1" style="display:none;">' +
                '<button class="button button-small" type="button" ng-click="test()">1</button>' +
                '</ion-scroll>' +
                '<ion-scroll class="scroll tab-scroll" direction="x" scrollbar-x="false" delegate-handle="' + this.DataField + '" style="display:block;">' +
                '</ion-scroll>' +
                '</div>' +
                '<div class="buttons-right">' +
                '<span style="font-size:35px;" class="addrow">+</span>' +
                '</div>' +
                '</div>' +
                '<div class="item-content" style="height:100%;border-top:1px solid rgb(221, 221, 221);border-bottom:1px solid rgb(221, 221, 221);">' +
                '<div class="slider-slides">' +
                '</div>' +
                '</div>';
            $(this.modal).appendTo(content);
            if (this.IsAssociation) {
                $(this.Element).find("div[class='buttons-right']").addClass("hide");
            }
            //初始化索引
            this.InitMobileIndex();
            $.MvcSheetUI.IonicFramework.$compile($($(this.Element).find("ion-scroll")))($.MvcSheetUI.IonicFramework.$scope);

            //this.copybtn = $('<div></div>').addClass("button-fun").attr("align", "center").append($('<a>').addClass("button button-small button-blue").text("复制"));
            //this.addbtn = $('<div></div>').addClass("button-fun").attr("align", "center").append($('<a>').addClass("button button-small  button-blue").text("添加"));
            //this.delebtn = $('<div></div>').addClass("button-fun").attr("align", "center").append($('<a>').addClass("button button-small button-red").text("删除"));
            this.changeSchemeShowMode = $('<div></div>').addClass("button-fun").attr("align", "center").append($('<a>').addClass("button button-small button-red").text(SheetLanguages.Current.ChangeMode));
            this.title.append(this.changeSchemeShowMode);

            content.find('.tab-scroll').children('.scroll').css('width',tabWidth+ 'px');
            //不可编辑时，子表数目为零，隐藏切换模式按钮
            if (!this.Editable) {
                if (length == 0) {
                    content.addClass('list-mode');
                    $(this.changeSchemeShowMode).hide();
                }
            }

            this.addbtnBottom = $('<div class="addbtn"><span>+</span>' + SheetLanguages.Current.AddChildSchema + '</div>');
            if (this.V.R) {
                content.append(this.addbtnBottom);
                //content.append(this.copybtn).append(this.addbtn).append(this.delebtn);
            }

            this.RowCount = 0;
            this.RowNum = 0;
            this.MobileRow = $("<div>").addClass("slider-slide").attr("style", "display:none;");
            var tt = $('<div></div>').addClass('list-title');
            var ttl = $('<div></div>').addClass('list-title-left');
            ttl.text(titleText);
            var ttr = $('<div></div>').addClass('list-title-right');
            ttr.append($("<div></div>").addClass('copy').text(SheetLanguages.Current.Copy)).append($("<div></div>").addClass('delete').text(SheetLanguages.Current.Delete));
            tt.append(ttl).append(ttr);
            this.MobileRow.append(tt);
            var tds = $(this.template).find("td");
            if (this.L == $.MvcSheetUI.LogicType.BizObjectArray) {
                for (var i = 1; i < tds.length - 1; i++) {
                    //update by luxm 移动端设置子表的名称不生效
                    var control = $(tds[i]).find("[data-field]");
                    var datafield = $(control).attr("data-field");
                    var dataField = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
                    if (dataField.N != resetValue[i + 1]) {
                        dataField.N = resetValue[i + 1];
                    };
                    this.GetChildrenTd(tds[i]);
                }
            }
            else {
                for (var i = 0; i < tds.length; i++) {
                    this.GetChildrenTd(tds[i]);
                }
            }
            this.SetValue();
            this.currentIndex = 0;
            this.ShowMobileData(0);
            this.childSchemaShowMode = 'tabMode';
            var that = this;
            //绑定添加事件——add模式 添加到末尾
            this.bindAddLast = function (ele) {
                ele.unbind('click.add').bind('click.add', [this], function (e) {
                    console.log(that.currentIndex, 'add------');
                    e.data[0]._AddMobileRow();
                    MobileIndexChange(that.currentIndex, 'add');
                    RebindChildSchemaEvents();
                    $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.resize();
                });
            };
            //绑定添加事件——insert模式 添加到项的后面
            this.bindAddAfter = function (ele) {
                ele.unbind('click.add').bind('click.add', [this], function (e) {
                    e.data[0]._InsertMobileRow.apply(e.data[0], [$(this), false]);
                    MobileIndexChange(that.currentIndex, 'insert');
                    RebindChildSchemaEvents();
                });
            }
            //绑定切换子表模式事件list-mode、tab-mode
            $(this.changeSchemeShowMode.find("a")).unbind('click.changeMode').bind('click.changeMode', [this], function (e) {
                // console.log("change mode");
                if (that.childSchemaShowMode == 'listMode') {
                    content.removeClass("list-mode").addClass("tab-mode");
                    that.childSchemaShowMode = 'tabMode';
                    var items = that.Element.find('.slider-slide').hide();
                    that.Element.find(".item-index").find('button').each(function (i, v) {
                        if (v.getAttribute('index') == that.currentIndex) {
                            that.MobileIndexButtonClick(v);
                        }
                    });
                } else {
                    content.removeClass("tab-mode").addClass("list-mode");
                    that.childSchemaShowMode = 'listMode';
                }
                $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.resize();

            });
            //绑定复制事件——insert模式
            this.bindCopy = function (ele) {
                ele.unbind('click.copy').bind('click.copy', [this], function (e) {
                    var index = $(e.target).parents(".slider-slide")[0].getAttribute('data-row') - 1;
                    that.currentIndex = index;
                    var ele = $(e.data[0].Element).find("div[class='slider-slide']");
                    if (ele.length == 0) return;
                    e.data[0]._InsertMobileRow.apply(e.data[0], [$(this), true]);
                    MobileIndexChange(that.currentIndex, 'insert');
                    RebindChildSchemaEvents();
                });
            }
            //绑定删除事件
            this.bindDelete = function (ele) {
                ele.unbind('click.delete').bind('click.delete', [this], function (e) {
                    that.currentIndex = $(e.target).parents(".slider-slide")[0].getAttribute('data-row') - 1;
                    var index = that.currentIndex;
                    //删除表单元素
                    var Rows = $(this).closest('div[data-datafield="' + that.DataField + '"]').find('div[class="slider-slide"]');
                    if (Rows.length == 0) return;
                    if (that.OnPreRemove) {
                        that.RunScript($(Rows[index]), that.OnPreRemove);
                    }
                    if (that.OnRemoved) {
                        that.RunScript($(Rows[index]), that.OnRemoved);
                    }
                    for (var i = 0; i < that.V.R.length; i++) {
                        var id = that.V.R[i].DataItems[that.DataField + ".ObjectID"].V;
                        if (id == $(Rows[index]).attr("id")) {
                            that.V.R.splice(i, 1);
                            break;
                        }
                    }

                    var thisMobileRow = that.MobileRows[index];
                    for (var k in thisMobileRow.Editors) {
                        var id = $(thisMobileRow.Editors[k].Element).data($.MvcSheetUI.SheetIDKey);
                        if (id && $.MvcSheetUI.ControlManagers[id]) {
                            delete $.MvcSheetUI.ControlManagers[id];
                        }
                    }
                    ;
                    $(Rows[index]).remove();
                    that.MobileRows.splice(index, 1);
                    //重新排序
                    if (index == that.MobileRows.length && index != 0) {
                        index--;
                    }
                    --that.RowCount;
                    that.ShowMobileData(index);
                    MobileIndexChange(that.currentIndex, 'delete');
                    if (this.OnRemoved) {
                        this.RunScript($(deleterow), this.OnRemoved);
                    }
                    $.MvcSheetUI.MvcRuntime.init($("body"));//计算属性
                    RebindChildSchemaEvents();
                });
            }
            //绑定事件
            this.bindAddLast(this.Element.find('.addrow'));
            this.bindAddLast(this.addbtnBottom);
            var RebindChildSchemaEvents = function () {
                var copys = that.Element.find('.copy');
                var deletes = that.Element.find('.delete');
                copys.each(function (i, v) {
                    that.bindCopy($(v));
                });
                deletes.each(function (i, v) {
                    that.bindDelete($(v));
                });
                //显示子表序号
                that.Element.find(".list-title").each(function (i, v) {
                    var ltl = $(v).find('.list-title-left')[0];
                    var index = $(ltl).parents('.slider-slide')[0].getAttribute('data-row');
                    $(ltl).text(SheetLanguages.Current.ChildSchema + "(" + index + ")");
                });
            };
            RebindChildSchemaEvents();

            var MobileIndexChange = function (index, type) {
                var indexEle = $(that.Element).find("ion-scroll");
                if (type == "delete") {
                    var button = $(indexEle[1]).find("button");
                    button[index].remove();
                    button = $(indexEle[1]).find("button");
                    for (var i = 0; i < button.length; i++) {
                        $(button[i]).attr("id", that.DataField + (i + 1)).attr("index", i).text(i + 1);
                    }
                    var rows = $(that.Element).find("div.slider-slide");
                    for (var i = 0; i < rows.length; i++) {
                        $(rows[i]).attr("data-row", i + 1);
                    }
                    $(button[index]).addClass("button-blue");
                }
                else {
                    var button = $(indexEle[0]).find("button").clone(true);
                    if ($(indexEle[1]).find("button").length == 0) {
                        $($(indexEle[1]).find("div.scroll")).append(button);
                        $(button).addClass("button-blue");
                        that.ShowMobileData(0)
                    } else {
                        $($(indexEle[1]).find("button:last")).after(button);
                        if (type == "add") {
                            that.ShowMobileData(that.RowCount - 1);
                        } else {
                            that.ShowMobileData(index + 1);
                        }
                    }
                    $(button).attr('index', that.RowCount - 1).attr('id', that.DataField).text(that.RowCount);
                    $(button).unbind("click.switch").bind("click.switch", [that], function (e) {
                        e.data[0].MobileIndexButtonClick(this);
                    })
                }

                //var txt = $(that.Element).parent().attr("data-title") || that.DataItem.N;
                //txt = txt + "(共 " + $(indexEle[1]).find("button").length + " 条纪录)";
                var txt = that.DataItem.N + SheetLanguages.Current.ChildSchemaInfo2 + $(indexEle[1]).find("button").length + SheetLanguages.Current.ChildSchemaInfo3;
                that.title.find('span').text(txt);
                $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.$getByHandle(that.DataField).resize();
            }
            if (!this.DisplayAdd || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) {    //添加按钮
                $(this.Element).find("div[class='buttons-right']").css("display", "none");
                //$(this.copybtn).css("display", "none");
                //$(this.addbtn).css("display", "none");
                $(this.Element).find('.copy').css('display', "none");
                $(this.Element).find('.addbtn').css('display', 'none');
                //删除复制按钮被子表的复制删除按钮代替
                console.log(this.Element);
            }
            if (!this.DisplayDelete || this.L == $.MvcSheetUI.LogicType.BizObject || !this.Editable) {    //删除按钮
                //$(this.delebtn).css("display", "none");
                $(this.Element).find('.delete').css('display', "none");
            }
            // 子表展现完成后事件
            if (this.OnRendered) {
                this.RunScript(this, this.OnRendered, arguments);
            }

            //添加默认行
            if ($.MvcSheetUI.SheetInfo.IsOriginateMode) {
                for (var i = 1; i < this.DefaultRowCount; i++) {
                    this._AddMobileRow();
                    MobileIndexChange(this.currentIndex, "add");
                }
                //初始化导航
                this.ShowMobileData(0);
            }
            //$(".input-label").attr("style",{"color":""});
        },
        //初始化索引
        InitMobileIndex: function (currentIndex) {
            var that = this;
            this.currentIndex = currentIndex || 0;
            var indexEle = $(this.Element).find("ion-scroll");
            var value = this.V.R;
            //区分关联关系
            var length = 0;
            if (this.IsAssociation) {
                length = 1;
            } else {
                length = this.V.R.length;
            }
            if (this.Originate && this.DefaultRowCount < 1) {
                return;
            }
            for (var i = 1; i < length + 1; i++) {
                var button = $("<button>").addClass("button button-small").attr("id", (this.DataField + "-" + i)).attr("type", "button").attr('index', (i - 1)).text(i);
                $(indexEle[1]).append(button);
                $(button).unbind("click.switch").bind("click.switch", [this], function (e) {
                    e.data[0].MobileIndexButtonClick(this);
                })
            }
            $($(indexEle[1]).find("button")[this.currentIndex]).addClass("button-blue");
        },
        //绑定导航点击事件
        MobileIndexButtonClick: function (element) {
            var index = Number($(element).attr('index'));
            var indexEle = $(element).closest("ion-scroll");
            //$($(indexEle[1]).find("button")[this.currentIndex]).removeClass("button-blue");
            $($(indexEle[0]).find("button")).removeClass("button-blue");
            $($(indexEle[0]).find("button")[index]).addClass("button-blue");
            this.ShowMobileData(index);
        },
        ShowMobileData: function (showIndex) {
            var dataEle = $(this.Element).find("div[class='slider-slide']");
            if (dataEle.length == 0) return;
            var indexEle = $(this.Element).find("ion-scroll");
            var delegate = $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.$getByHandle(this.DataField);
            $($(indexEle[1]).find("button")[this.currentIndex]).removeClass("button-blue");
            $($(indexEle[1]).find("button")[showIndex]).addClass("button-blue");
            //数据显示
            $(dataEle[this.currentIndex]).hide();
            $(dataEle[showIndex]).show();
            this.currentIndex = showIndex;
            //导航栏偏移量
            var ele = $(indexEle[1]).find("button")[showIndex];
            this.SetNavPosition(ele)
        },
        //设置导航位置
        SetNavPosition: function (ele) {
            var delegate = $.MvcSheetUI.IonicFramework.$ionicScrollDelegate.$getByHandle(this.DataField);
            var delegateLeft = delegate.getScrollPosition().left;
            var left = $(ele).offset().left;
            delegate.scrollTo(delegateLeft - 120 + left, 0, true);
        },
        _AddMobileRow: function (e) {
            //移动端添加行：三种情况
            /*   参数：无参/1个（id）/2个（插入行，是否复制）
            1、直接添加：添加在最后一行
            2、复制插入：插入有数据的行
            2、直接插入：插入空白行
            */
            if (!this.MobileRows) {
                this.MobileRows = [];
            }

            var thisGridView = this;
            if (this.OnPreAdd) {
                this.RunScript($(this.Element), this.OnPreAdd, arguments);
            }

            getTrValue = function (rowIndex) {
                var trvalue = {};
                var row = thisGridView.MobileRows[rowIndex];
                var controls = row.Editors;
                for (var j = 0; j < controls.length; j++) {
                    var control = controls[j];
                    if (control) {
                        var datafield = control.DataField;
                        if (datafield)
                            trvalue[datafield.split(".")[1]] = control.GetValue();
                    }
                }
                if (row.id) {
                    trvalue["ObjectID"] = row.id;
                }
                return trvalue;
            }

            //移动端添加行事件
            MobileRowCtor = function (_RowTemplate, _RowIndex, _RowNum, _Element, _id, _copy) {

                this.RowControl = $(_RowTemplate).clone().attr("data-row", _RowIndex).attr("id", _id);
                this.RowControl.find("[data-datafield]").attr("data-row", _RowIndex);
                if (_RowIndex != _RowNum && $(_Element).find("div[class='slider-slide']").length > 0) {
                    //插入
                    $($(_Element).find("div[class='slider-slide']")[_RowIndex - 2]).after(this.RowControl);
                } else {
                    $(_Element).find("div[class='slider-slides']").append(this.RowControl);
                }
                $.MvcSheetUI.IonicFramework.$compile($(this.RowControl))($.MvcSheetUI.IonicFramework.$scope);
                var _Editors = [];
                this.RowControl.find("div.list").each(function () {
                    var control = $(this).children(":last").children();
                    if ($(control).attr("id")) {
                        var id = $(control).attr("id");
                        id = id + "_Row" + _RowIndex;
                        $(control).attr("id", id);
                    }
                    if (_copy) {
                        var trValue = getTrValue(_RowIndex - 2);
                        var c = $(control).SheetUIManager(_RowNum);
                        var value = trValue[c.DataField.split(".")[1]];
                        c.SetValue(value);
                    }
                    _Editors.push($(control).SheetUIManager(_RowNum));
                });
                this.Editors = _Editors;
                return this;
            }

            var id;
            var newRow;
            var RowIndex;
            if (arguments && arguments.length == 1) {
                var guid = arguments[0];
                id = guid;
                RowIndex = this.RowCount + 1;
                newRow = new MobileRowCtor(this.MobileRow, RowIndex, ++this.RowNum, this.Element, id, false);
            } else if (arguments && arguments.length == 2) {
                //插入（复制/添加）
                id = $.uuid();
                RowIndex = this.currentIndex + 2;
                newRow = new MobileRowCtor(this.MobileRow, RowIndex, ++this.RowNum, this.Element, id, arguments[1]);
            }
            else {
                //末尾添加新行
                id = $.uuid();
                RowIndex = this.RowCount + 1;
                newRow = new MobileRowCtor(this.MobileRow, RowIndex, ++this.RowNum, this.Element, id, false);
            }

            if (this.OnAdded) {
                this.RunScript($(this.Element), this.OnAdded, [this, this.V.R[this.RowCount]]);
            }

            ++this.RowCount;
            var num = this.RowCount;
            /*
               // 添加行的时候，重新初始化Rule
            if ($.MvcSheetUI.MvcRuntime && !$.MvcSheetUI.Loading) {
                $.MvcSheetUI.MvcRuntime.init($("body"));// $(this.newRow[0]));
            }
            */
            this.MobileRows.splice(RowIndex - 1, 0, newRow);
            //添加行的时候，重新初始化Rule
            if ($.MvcSheetUI.MvcRuntime && !$.MvcSheetUI.Loading) {
                $.MvcSheetUI.MvcRuntime.init($("body"));
            }
        },
        _InsertMobileRow: function (e) {
            var insertIndex = this.currentIndex + 1;
            var rows = $(this.Element).find("div.slider-slide");
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rownum = parseInt($(row).attr("data-row"));
                if (rownum > insertIndex) {
                    rownum = rownum - 1 + 2;
                    $(row).attr("data-row", rownum);
                    $(row).find("[data-row]").attr("data-row", rownum);
                    if ($(row).find("td:first").html() == rownum - 1)
                        $(row).find("td:first").html(rownum);
                }
            }
            this._AddMobileRow(arguments[0], arguments[1]);
        },
        GetChildrenTd: function (tds) {
            window.console.log("" + resetValue);
            var control = $(tds).find("[data-field]");
            //qiancheng 修改移动端能够显示PC端已经隐藏的字段
            var td;
            if ($(tds).attr("class")) {
                if ($(tds).attr("class").indexOf("hidden") != -1) {
                    td = $("<div></div>").addClass("list hidden").attr("type", "item-text-wrap");
                } else {
                    td = $("<div></div>").addClass("list").attr("type", "item-text-wrap");
                }

            } else {
                td = $("<div></div>").addClass("list").attr("type", "item-text-wrap");
            }


            var datafield = $(control).attr("data-field");
            $(control).removeAttr("data-field").attr("data-datafield", datafield);
            $(td).attr("data-field", datafield);
            var dataitem = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
            if (dataitem)
                $(td).append($("<div></div>").addClass("col-md-2").append($("<label>" + dataitem.N + "</label>")));
            $(td).append($("<div></div>").addClass("col-md-4").append($(control)));
            $(this.MobileRow).append(td);
        },

        // 设置行只读
        SetRowReadOnly: function (rowIndex) {
            if (rowIndex < this.V.R.length) {
                for (var k in this.V.R[rowIndex].DataItems) {
                    this.V.R[rowIndex].DataItems[k].O = this.V.R[rowIndex].DataItems[k].O.replace("E", "");
                }
            }
        },
        // 添加一行解决 新增后数据无法清除的Bug
        _AddNewRow: function (e) {
            // debugger
            var that = this;
            if (!this.SheetInfo.BizObject.DataItems[this.DataField].V.R) {
                this.TransferValue();
            }

            var rowIndex = this.RowCount;
            if (this.OnPreAdd) {
                this.RunScript($(this.Element), this.OnPreAdd, [this, rowIndex]);
            }
            //执行绑定事件
            this.newRow = this.template.clone(true).attr("class", "rows").attr("data-row", this.RowCount + 1).removeAttr("style", "display:none");
            // console.log(this.newRow)
            $(this.newRow).find("td").each(function () {
                var childrenElement = $(this).find("[data-field]");
                var field = childrenElement.attr("data-field");
                childrenElement.removeAttr("data-field").attr("data-datafield", field);
                childrenElement.attr("data-row", $(this).closest("tr").attr("data-row"));
            });
            if (this.L == $.MvcSheetUI.LogicType.BizObjectArray) {
                if (this.newRow.length > 1) {
                    $($(this.newRow)[0]).find("td:first").html(++this.RowCount);
                }
                else {
                    $(this.newRow).find("td:first").html(++this.RowCount);
                }
            }

            if (arguments && arguments.length == 1) {
                var guid = arguments[0];
                $(this.newRow).attr("id", guid);
            }

            if (arguments.length > 1) {
                var rownums = $(arguments[1]).attr("data-row") - 1 + 2;
                this.newRow.attr("data-row", rownums);
                if (this.newRow.length > 1) {
                    $($(this.newRow)[0]).find("td:first").html(rownums);
                    var insertr;
                    for (var i = 0; i < this.newRow.length; i++) {
                        insertr = $(arguments[1]).next("tr");
                    }
                    $(insertr).after(this.newRow);
                }
                else {
                    $(this.newRow).find("td:first").html(rownums);
                    $(arguments[1]).after(this.newRow);
                }
            }
            else {
                if ($(this.Element).find("tr.rows").length == 0) {
                    if (this.template.length > 1) {
                        $($(this.template)[this.template.length - 1]).after(this.newRow);
                    }
                    else {
                        $(this.template).after(this.newRow);
                    }
                }
                else {
                   /** var rowlength = $(this.Element).find("tr.rows").length;
                    if (rowlength == 3 && this.DataField == 'zibiao22') {
                        return
                    }**/
                    $(this.Element).find("tr.rows:last").after(this.newRow);
                }
            }

            ++this.RowNum;
            var num = this.RowCount;
            var that = this;
            $(this.newRow).find("td").each(function () {
                var control = $(this).children();
                if ($(control).attr("id")) {
                    var id = $(control).attr("id");
                    id = id + "_Row" + that.RowNum;
                    $(control).attr("id", id);
                }
                // console.log($(control), '$(control)')
                var cmanager = $(control).SheetUIManager2(that.RowCount);
                // console.log(cmanager, 'cmanager')
            });
            if (this.AlternatingRowStyle && num % 2 == 0) {
                $(this.newRow).attr("style", this.AlternatingRowStyle);
            }

            var tds = $(this.newRow).find("td");
            for (var i = 0; i < tds.length; i++) {
                var td = tds[i];

                if (this.GetSummaryTd(td)) {
                    // console.log($(tds[i]), 'text')
                    this._Summary($(tds[i]).children()[0]);
                    this._Summary($("input:checked").val());
                    $(td).children().unbind("change.Summary").bind("change.Summary", [this], function (e) {
                        e.data[0]._Summary(this);
                    });
                }
            }
            // 添加行的时候，重新初始化Rule
            if ($.MvcSheetUI.MvcRuntime && !$.MvcSheetUI.Loading) {
                $.MvcSheetUI.MvcRuntime.init($("body"));// $(this.newRow[0]));
            }
            //绑定删除事件
            var delbtn = $(this.newRow).find("a.delete");
            $(delbtn).unbind("click").bind("click", [this], function (e) {
                e.data[0]._Deleterow($(this).closest("tr"));
            });
            //绑定插入事件
            var insertbtn = $(this.newRow).find("a.insert");
            $(insertbtn).unbind("click").bind("click", [this], function (e) {
                e.data[0]._Insertrow($(this).closest("tr"));
            });
            if (this.OnAdded) {
                this.RunScript($(this.newRow), this.OnAdded, [this, this.V.R[rowIndex], rowIndex]);
            }
            var dataTable = this.Element;//主体table
            this.deafaultTableHeight = $(dataTable).height();
            if (this.VirtualPaging) {
                this._SetVirtualPagingContainerHeight();
                //虚拟分页时使表头的宽度与表的内容td的宽度保持一致
                var tdHead = $(this.Element).parent(".SheetGridViewData").siblings(".SheetGridViewTitle").find("tr.header td");
                $(this.Element).find("tr.rows").find("td").each(function (i, e) {
                    $(e).children().each(function () {
                        if ($(this).attr("data-displayrule")) { //虚拟分页时控件元素有displayrule的时候，控件不显示也占有位置。
                            $(e).children().addClass("block");
                        }
                    });
                });
                $(this.Element).find("tr.rows").eq(0).find("td").each(function (i, e) {
                    tdHead.eq(i).css("width", $(e).outerWidth(true));
                });
                if (this.Element.parentElement.getAttribute("scroll") == "scroll") {
                } else {
                    //$(this.Element).find("tr[class='rows']:last").find("td input:first").focus();
                    var a = $(this.Element).find("tr[class='rows']:last").find("td:first").next();
                    if (a.find("input").length > 0) {
                        a.find("input").focus();
                    } else if (a.find("textarea").length > 0) {
                        a.find("textarea").focus();
                    } else if (a.find("select").length > 0) {
                        a.find("select").focus();
                    }
                }
            }
        },
        // 添加一行
        _AddRow: function (e) {
            if (!this.SheetInfo.BizObject.DataItems[this.DataField].V.R) {
                this.TransferValue();
            }

            var rowIndex = this.RowCount;
            if (this.OnPreAdd) {
                this.RunScript($(this.Element), this.OnPreAdd, [this, rowIndex]);
            }
            //执行绑定事件            
            this.newRow = this.template.clone(true).attr("class", "rows").attr("data-row", this.RowCount + 1).removeAttr("style", "display:none");
            // console.log(this.newRow)
            $(this.newRow).find("td").each(function () {
                var childrenElement = $(this).find("[data-field]");
                var field = childrenElement.attr("data-field");
                childrenElement.removeAttr("data-field").attr("data-datafield", field);
                childrenElement.attr("data-row", $(this).closest("tr").attr("data-row"));
            });
            if (this.L == $.MvcSheetUI.LogicType.BizObjectArray) {
                if (this.newRow.length > 1) {
                    $($(this.newRow)[0]).find("td:first").html(++this.RowCount);
                }
                else {
                    $(this.newRow).find("td:first").html(++this.RowCount);
                }
            }

            if (arguments && arguments.length == 1) {
                var guid = arguments[0];
                $(this.newRow).attr("id", guid);
            }

            if (arguments.length > 1) {
                var rownums = $(arguments[1]).attr("data-row") - 1 + 2;
                this.newRow.attr("data-row", rownums);
                if (this.newRow.length > 1) {
                    $($(this.newRow)[0]).find("td:first").html(rownums);
                    var insertr;
                    for (var i = 0; i < this.newRow.length; i++) {
                        insertr = $(arguments[1]).next("tr");
                    }
                    $(insertr).after(this.newRow);
                }
                else {
                    $(this.newRow).find("td:first").html(rownums);
                    $(arguments[1]).after(this.newRow);
                }
            }
            else {
                if ($(this.Element).find("tr.rows").length == 0) {
                    if (this.template.length > 1) {
                        $($(this.template)[this.template.length - 1]).after(this.newRow);
                    }
                    else {
                        $(this.template).after(this.newRow);
                    }
                }
                else {
                    $(this.Element).find("tr.rows:last").after(this.newRow);
                }
            }

            ++this.RowNum;
            var num = this.RowCount;
            var that = this;
            $(this.newRow).find("td").each(function () {
                var control = $(this).children();
                if ($(control).attr("id")) {
                    var id = $(control).attr("id");
                    id = id + "_Row" + that.RowNum;
                    $(control).attr("id", id);
                }
                // console.log($(control), '$(control)')
                var cmanager = $(control).SheetUIManager(that.RowCount);
                // console.log(cmanager, 'cmanager')
            });
            if (this.AlternatingRowStyle && num % 2 == 0) {
                $(this.newRow).attr("style", this.AlternatingRowStyle);
            }

            var tds = $(this.newRow).find("td");
            for (var i = 0; i < tds.length; i++) {
                var td = tds[i];
                if (this.GetSummaryTd(td)) {
                    $(td).children().unbind("change.Summary").bind("change.Summary", [this], function (e) {
                        e.data[0]._Summary(this);
                    });
                }
            }
            // 添加行的时候，重新初始化Rule
            if ($.MvcSheetUI.MvcRuntime && !$.MvcSheetUI.Loading) {
                $.MvcSheetUI.MvcRuntime.init($("body"));// $(this.newRow[0]));
            }
            //绑定删除事件
            var delbtn = $(this.newRow).find("a.delete");
            $(delbtn).unbind("click").bind("click", [this], function (e) {
                e.data[0]._Deleterow($(this).closest("tr"));
            });
            //绑定插入事件
            var insertbtn = $(this.newRow).find("a.insert");
            $(insertbtn).unbind("click").bind("click", [this], function (e) {
                e.data[0]._Insertrow($(this).closest("tr"));
            });
            if (this.OnAdded) {
                this.RunScript($(this.newRow), this.OnAdded, [this, this.V.R[rowIndex], rowIndex]);
            }
            var dataTable = this.Element;//主体table
            this.deafaultTableHeight = $(dataTable).height();
            if (this.VirtualPaging) {
                this._SetVirtualPagingContainerHeight();
                //虚拟分页时使表头的宽度与表的内容td的宽度保持一致
                var tdHead = $(this.Element).parent(".SheetGridViewData").siblings(".SheetGridViewTitle").find("tr.header td");
                $(this.Element).find("tr.rows").find("td").each(function (i, e) {
                    $(e).children().each(function () {
                        if ($(this).attr("data-displayrule")) { //虚拟分页时控件元素有displayrule的时候，控件不显示也占有位置。
                            $(e).children().addClass("block");
                        }
                    });
                });
                $(this.Element).find("tr.rows").eq(0).find("td").each(function (i, e) {
                    tdHead.eq(i).css("width", $(e).outerWidth(true));
                });
                if (this.Element.parentElement.getAttribute("scroll") == "scroll") {
                } else {
                    //$(this.Element).find("tr[class='rows']:last").find("td input:first").focus();
                    var a = $(this.Element).find("tr[class='rows']:last").find("td:first").next();
                    if (a.find("input").length > 0) {
                        a.find("input").focus();
                    } else if (a.find("textarea").length > 0) {
                        a.find("textarea").focus();
                    } else if (a.find("select").length > 0) {
                        a.find("select").focus();
                    }
                }
            }
        },
        // 删除行
        _Deleterow: function (deleterow, isRemoveAll) {
            var delnum = parseInt($(deleterow).attr("data-row"));
            if (this.OnPreRemove) {
                this.RunScript($(deleterow), this.OnPreRemove);
            }

            // 清除 ControlManagers 的内容
            $(deleterow).find("[data-datafield]").each(function (index, control) {
                var id = $(this).data($.MvcSheetUI.SheetIDKey);
                if (id && $.MvcSheetUI.ControlManagers[id]) {
                    $.MvcSheetUI.ControlManagers[id].DataItem.V = "";
                    delete $.MvcSheetUI.ControlManagers[id];
                }
            });
            $(deleterow).remove();
            var rows = $(this.Element).find("tr.rows");
            // 重新计算行
            if (typeof (isRemoveAll) == "undefined" || !isRemoveAll) {
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if ($(row).attr("data-row") == delnum) {
                        $(row).remove();
                    }

                    var rownum = parseInt($(row).attr("data-row"));
                    if (rownum > delnum) {
                        if (this.AlternatingRowStyle) {
                            if (rownum % 2 == 1) {
                                $(row).attr("style", this.AlternatingRowStyle);
                            } else {
                                $(row).attr("style", "");
                            }
                        }

                        $(row).attr("data-row", rownum - 1);

                        if ($(row).find("td:first").html() == rownum)
                            $(row).find("td:first").html(rownum - 1);

                        $(row).find("td").each(function () {
                            if ($(this).attr("data-title"))
                                $(this).attr("data-title", rownum - 1);
                            if ($(this).children() && $(this).find("[data-datafield]"))
                                $(this).find("[data-datafield]").attr("data-row", rownum - 1);
                        });
                    }
                }

                var tds = $(this.template).find("td");
                for (var i = 0; i < tds.length; i++) {
                    if (this.GetSummaryTd(tds[i])) {
                        this._Summary($(tds[i]).children());
                    }
                }
            }

            this.RowCount = this.RowCount - 1;

            if (this.OnRemoved) {
                this.RunScript($(deleterow), this.OnRemoved);
            }
            if (typeof (isRemoveAll) == "undefined" || !isRemoveAll) {
                //删除行的时候，重新初始化Rule
                if ($.MvcSheetUI.MvcRuntime) {
                    // $.MvcSheetUI.MvcRuntime.init($(this.Element));
                    $.MvcSheetUI.MvcRuntime.init($("body"));
                }
            }

            if (this.VirtualPaging) {
                this._SetVirtualPagingContainerHeight();
                //虚拟分页时，删除行从新设置表头宽度对齐。
                if (!$(this.Element).find("tr.rows").length && !$(this.Element).find("tr.footer").is(":hidden")) {
                    var tdHead = $(this.Element).parent(".SheetGridViewData").siblings(".SheetGridViewTitle").find("tr.header td");
                    $(this.Element).find("tr.footer").eq(0).find("td").each(function (i, e) {
                        tdHead.eq(i).css("width", $(e).outerWidth(true));
                    });
                }
            }
        },

        _Insertrow: function (nowrow) {
            var insertnum = parseInt($(nowrow).attr("data-row"));
            var rows = $(this.Element).find("tr.rows");
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rownum = parseInt($(row).attr("data-row"));
                if (rownum > insertnum) {
                    rownum = rownum - 1 + 2;
                    $(row).attr("data-row", rownum);
                    if ($(row).find("td:first").html() == rownum - 1)
                        $(row).find("td:first").html(rownum);
                }
            };
            this._AddRow(true, nowrow);
        },

        _Clear: function (e) {
            var that = this;
            $(this.Element).find("tr.rows").each(function (e) {
                that._Deleterow.apply(that, [$(this), true]);
            });
            this.RowCount = 0;
            // 重新计算统计
            var tds = $(this.template).find("td");
            for (var i = 0; i < tds.length; i++) {
                if (this.GetSummaryTd(tds[i])) {
                    this._Summary($(tds[i]).children());
                }
            }
            if ($.MvcSheetUI.MvcRuntime) {
                $.MvcSheetUI.MvcRuntime.init();
            }
            if (this.VirtualPaging)
                this._SetVirtualPagingContainerHeight();
        },

        //虚拟分页 删除，添加行divDataTableContainer高度重新计算
        _SetVirtualPagingContainerHeight: function () {
            var dataTable = this.Element;//主体table
            var dataContainerDiv = this.Element.parentElement;//主体Div,每个子表都是设置的

            var dataTableHeight = $(dataTable).height();
            //var dataContainerDivHeight = this.dataContainerDivHeight;
            var dataContainerDivHeight = dataTableHeight;
            this.trHeight = dataContainerDivHeight - (this.trHeight == undefined ? this.deafaultTableHeight : this.trHeight);
            dataContainerDivHeight = dataTableHeight > this.trHeight * 10 && this.trHeight > 0 ? this.trHeight * 10 : dataTableHeight;
            //dataContainerDivHeight = this.trHeight > 0 ? dataContainerDivHeight:this.trHeight*10;

            $(dataContainerDiv).css("height", dataContainerDivHeight);
            $(dataContainerDiv.parentElement).css("height", 100 + dataContainerDivHeight);//100是给表头预留的位置
            this.trHeight = dataTableHeight;
        },

        _Export: function (e) {
            var columnNames = {};
            if (this.VirtualPaging) {
                var tds = $(this.Element).parent().parent().find("tr.header").find("td");
            } else {
                var tds = $(this.Element).find("tr.header").find("td");
            }
            //var tds = $(this.Element).find("tr.header").find("td");
            for (var i = 0; i < tds.length; i++) {
                var datafield = $(tds[i]).attr("data-field");
                if (datafield) {
                    var dataitem = $.MvcSheetUI.GetSheetDataItem(datafield, 1);
                    if (dataitem) {
                        columnNames[datafield.split(".")[1]] = dataitem.N;
                    }
                }
            }
            var datatab = this.GetValue(true);

            if (this.VirtualPaging) {
                var LoadData = this.pageIndex * this.loadNum;
                var AllValue = this.V.R;
                if (LoadData < AllValue.length && LoadData != 0) {
                    var notShowData = this.GetNotShowData(LoadData, "Export");
                    if (notShowData.length > 0) {
                        for (var i = 0; i < notShowData.length; i++) {
                            datatab.push(notShowData[i]);
                        }
                    }
                }
            }

            $.MvcSheet.PostSheet({"Command": "Exportexcel", "Param": JSON.stringify([datatab, columnNames])},
                function (data) {
                    if (data)
                    //数据格式是json  UPDATE BY ZHANGJ
                        window.location.href = data.FileUrl;
                }, null, true);
        },

        _Import: function (e) {
            var thisElement = this;
            if (!$('#importExcel_' + thisElement.ButtonId).val()) {
                alert("未选择任何文件！");
                return;
            }
            // console.log(e, 'e')
            $.ajaxFileUpload({
                url: $.MvcSheetUI.PortalRoot + "/ImportHandler/ImportHandler",
                secureuri: false,
                fileElementId: "importExcel_" + this.ButtonId,
                // dataType: "json",
                type: "post",
                success: function (data, status) {
                    $('#importExcel_' + thisElement.ButtonId).val('');
                    // console.log(data, status)
                    var str = $(data).find("body").text();
                    var json = $.parseJSON(str);
                    if (json.sucess && json.data.length > 0) {
                        thisElement._ImportInit.apply(thisElement, [json.data]);
                    } else {
                        alert($.Lang(json.message));
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },

        _ImportInit: function (data) {
            this._Clear();
            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                //if (i > 0) {
                this._AddRow();
                //}
                var rowdata = row.split(';');
                var tds = $(this.newRow).find("td");
                var k = 0;
                for (var y = 0; y < tds.length; y++) {
                    if ($(tds[y]).find("[data-datafield]") && $(tds[y]).find("[data-datafield]").length > 0
                        && $(tds[y]).is(':visible')) {
                        if (rowdata[k] != undefined) {
                            $(tds[y]).find("[data-datafield]").SheetUIManager(i + 1).SetValue(rowdata[k]);
                            this._Summary($(tds[y]).find("[data-datafield]"));
                            k++;
                        }
                    }
                }

                //导入后重新计算pageIndex，防止在加载数据
                if (this.VirtualPaging) {
                    this.pageIndex = Math.ceil(data.length / this.loadNum);
                }
            }
        },

        GetDefaultRow: function (trvalue) {
            var tds = $(this.Element).parent().parent().find("tr.header").find("td");
            trvalue.push("ObjectID");
            for (var j = 0; j < tds.length; j++) {
                var datafield = $(tds[j]).attr("data-field");
                if (datafield) {
                    var tdName = datafield.split(".")[1];
                    trvalue.push(tdName);
                }
            }
            return trvalue;
        },

        GetNotShowData: function (LoadData, callmode) {
            var value = [];
            var AllValue = this.V.R;
            if (LoadData < AllValue.length) {
                var parentDatafield = $(this.Element).attr("data-datafield");
                var tdTitle = [];
                tdTitle = this.GetDefaultRow(tdTitle);
                //循环行
                for (var i = LoadData; i < AllValue.length; i++) {
                    var rowvalue = {};
                    var data = AllValue[i].DataItems;
                    //循环列
                    for (var item in tdTitle) {
                        var itemkey = tdTitle[item];
                        if (data[parentDatafield + "." + itemkey] == undefined) continue;
                        if (data[parentDatafield + "." + itemkey].L == 24) {//附件
                            if (callmode == "save") {
                                var attach = data[parentDatafield + "." + itemkey].V;
                                var rowAttachment = {};
                                var AttachmentIds = "";
                                var DelAttachmentIds = "";
                                if (attach.length > 0) {
                                    for (var j = 0; j < attach.length; j++) {
                                        AttachmentIds = AttachmentIds + attach[j].Code + ";";
                                    }
                                }
                                rowAttachment["AttachmentIds"] = AttachmentIds;
                                rowAttachment["DelAttachmentIds"] = DelAttachmentIds;

                                rowvalue[itemkey] = rowAttachment;
                            }
                            else {
                                rowvalue[itemkey] = "";
                            }

                        }
                        else if (data[parentDatafield + "." + itemkey].L == 26) {//单人参与者
                            var itemvalue;
                            itemvalue = data[parentDatafield + "." + itemkey].V == null ? "" : data[parentDatafield + "." + itemkey].V;//.Code;
                            rowvalue[itemkey] = itemvalue;
                        }
                        else if (data[parentDatafield + "." + itemkey].L == 27) {//多人参与者
                            var itemvalue = new Array();
                            var users = data[parentDatafield + "." + itemkey].V;
                            if (users == "" || users == null) {
                                rowvalue[itemkey] = "";
                            }
                            else if (users.length > 0) {
                                for (var j = 0; j < users.length; j++) {
                                    var code = users[j].Code;
                                    itemvalue.push(code);
                                }
                                rowvalue[itemkey] = itemvalue;
                            }

                        }
                        else {
                            var itemvalue;
                            itemvalue = data[parentDatafield + "." + itemkey].V == null ? "" : data[parentDatafield + "." + itemkey].V;
                            rowvalue[itemkey] = itemvalue;
                        }
                    }
                    value.push(rowvalue);
                }
            }
            return value;
        },

        TransferValue: function () {
            if (this.originateValue == null) return;
            //TODO:将this.SheetInfo.BizObject.DataItems[this.DataFiled].V转为this.originateValue
            var sheetDataValue = this.SheetInfo.BizObject.DataItems[this.DataField].V;
            var originateValue = this.originateValue;

            var transferRowValue = [];
            for (var i = 0; i < sheetDataValue.length; i++) {
                transferRowValue.push(JSON.parse(JSON.stringify(this.originateValue.R[0])));
            }

            for (var i = 0; i < sheetDataValue.length; i++) {
                var oldRoeValue = sheetDataValue[i];
                for (var column in transferRowValue[0].DataItems) {
                    var shortColumn = column.split(".")[1];
                    transferRowValue[i].DataItems[column].V = oldRoeValue[shortColumn];
                    delete transferRowValue[i].DataItems[column].BizObjectID;
                    delete transferRowValue[i].DataItems[column].RoeNum;
                }
            }
            var newStructure = {};
            newStructure["R"] = transferRowValue;
            newStructure["T"] = originateValue.T;
            this.SheetInfo.BizObject.DataItems[this.DataField].V = newStructure;
        },

        SaveDataField: function () {
            if (this.originateValue == null)
                this.originateValue = this.SheetInfo.BizObject.DataItems[this.DataField].V;

            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                return {};
            }
            var value = this.GetValue();

            if (this.VirtualPaging) {
                var LoadData = this.pageIndex * this.loadNum;
                var AllValue = this.V.R;
                if (LoadData < AllValue.length && LoadData != 0) {
                    var notShowData = this.GetNotShowData(LoadData, "save");
                    if (notShowData.length > 0) {
                        for (var i = 0; i < notShowData.length; i++) {
                            value.push(notShowData[i]);
                        }
                    }
                }
            }
            if (result[this.DataField].V != value) {
                var T = result[this.DataField].V.T;
                result[this.DataField].V = value;

                result[this.DataField].V.T = T;
                return result;
            }
            return {};
        }

    });
})(jQuery);
// SheetHiddenField控件

; (function ($) {
    //控件执行
    $.fn.SheetHiddenField = function () {
        return $.MvcSheetUI.Run.call(this, "SheetHiddenField", arguments);
    };

    $.MvcSheetUI.Controls.SheetHiddenField = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetHiddenField.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetHiddenField.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            var $element = $(this.Element);
            var hiddenFields = $.MvcSheetUI.SheetInfo.HiddenFields;
            if (hiddenFields) {
                for (var key in hiddenFields) {
                    if ($element.attr("id") == key) {
                        $element.val(hiddenFields[key]);
                        break;
                    }
                }
            }
        },
        // 返回数据值,该值需要和其他的区别处理
        SaveDataField: function () {
            var $element = $(this.Element);
            var hiddenFields = $.MvcSheetUI.SheetInfo.HiddenFields;
            if (!hiddenFields || !hiddenFields[$element.attr("id")]) {
                $.MvcSheetUI.HiddenFields[$element.attr("id")] = $element.val();
            }
            else if (hiddenFields[$element.attr("id")] != $element.val()) {
                $.MvcSheetUI.HiddenFields[$element.attr("id")] = $element.val();
            }
            return {};
        }
    });
})(jQuery);
// SheetHyperLink控件

; (function ($) {

    //控件执行
    $.fn.SheetHyperLink = function () {
        return $.MvcSheetUI.Run.call(this, "SheetHyperLink", arguments);
    };

    $.MvcSheetUI.Controls.SheetHyperLink = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetHyperLink.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetHyperLink.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            var $element = $(this.Element);

            //是否可见
            if (!this.Visiable) {
                $element.hide();
                return;
            }

            //text
            var text = this.Text;
            //update by ouyangsk 当text为空时，将text设置为href值
            if (!text) {
            	text = this.NavigateUrl;
            }
            if (this.TextDataField) {
                text = $.MvcSheetUI.GetControlValue(this.TextDataField, this.RowNum);
            }
            $element.text(text);
            $element.addClass("SheetHyperLink").addClass("printHidden");
            $("<span></span>").addClass("viewHidden").text(text).insertAfter($element);

            //href
            var href = this.NavigateUrl;
            if (this.NavigateUrlDataField) {
                href = $.MvcSheetUI.GetControlValue(this.NavigateUrlDataField, this.RowNum);
            }
            if (href && this.IsMobile) {
                if (href.indexOf("?") != -1) { href += "&UC=true"; }
                else { href += "?UC=true"; }
                $element.attr("href", href);
            }
            if (!this.IsMobile) {
            	//update by ouyangsk 当href为空时，将href设置成#，点击链接页不跳转
                if (href) {
                	$element.attr("target", "_blank");
                	$element.attr("href", href);
                } else {
                	$element.removeAttr("target");
                	$element.removeAttr("href");
                }
            }
        },
        RenderMobile: function () {
            this.Render();
        },
        //链接不允许输入,永不校验
        Validate: function () {
            return true;
        },
        //返回数据值
        SaveDataField: function () {
            result = {};
            result[this.DataField] = this.DataItem;
            var href = this.NavigateUrl;
            if (this.NavigateUrlDataField) {
                href = $.MvcSheetUI.GetControlValue(this.NavigateUrlDataField, this.RowNum);
            }
            result[this.DataField].V = href;
            return result;
        },
        //获取数据值
        GetValue: function () {
            return this.NavigateUrl;
        }
    });
})(jQuery);
// SheetInstancePrioritySelector控件
(function ($) {
    //控件执行
    $.fn.SheetInstancePrioritySelector = function () {
        return $.MvcSheetUI.Run.call(this, "SheetInstancePrioritySelector", arguments);
    };

    $.MvcSheetUI.Controls.SheetInstancePrioritySelector = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetInstancePrioritySelector.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetInstancePrioritySelector.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            var $element = $(this.Element);
            var that = this;
            //不可见返回
            if (!this.Visiable) {
                $element.hide();
                return;
            }
			// 查看痕迹
			if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            //绑定change事件
            $element.unbind("change.SheetInstancePrioritySelector").bind("change.SheetInstancePrioritySelector", function () {
                if ($.isFunction(that.OnChange)) {
                    that.OnChange.apply(this);
                }
                else {
                    (new Function(that.OnChange)).apply(this);
                }
            });

            var priorities = $.MvcSheetUI.SheetInfo.Priorities;
            if (priorities) {
                $element.empty();
                for (var key in priorities) {
                    $element.append("<option value='" + key + "'>" + priorities[key] + "</option>");
                    if (this.IsMobile) {
                        this.AddMobileItem(key, priorities[key], false);
                    }
                }
                this.V = this.V || this.DefaultValue;
                if (this.V && this.V != "") {
                    $element.val(this.V);
                }
                else {
                    $element.val("Normal");
                }
                //不可编辑
                if (!this.Editable) {
                    $element.after("<label style='width:100%;'>" + $element.children("option:selected").text() + "</label>");
                    $element.hide();
                }
                if (this.IsMobile && this.Editable)
                    this.ionicInit($.MvcSheetUI.IonicFramework);
            }
        },
        RenderMobile: function () {
            //可编辑
            this.MobileOptions = [];
            if (this.Editable) {
                this.constructor.Base.RenderMobile.apply(this);
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).hide();
            }
            else {
                this.Render();
            }
        },

        ionicInit: function (ionic) {
            var that = this;
            $(this.Element.parentElement.parentElement).unbind('click.showChoice').bind('click.showChoice', function (e) {
                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover.html', {
                    scope: ionic.$scope
                }).then(function (popover) {
                    console.log(popover);
                    ionic.$scope.popover = popover;
                    popover.scope.RadioListDisplay = that.MobileOptions;
                    popover.scope.RadioListValue = that.GetValue();
                    popover.show();
                    popover.scope.hide = function() {
                        popover.hide();
                    };
                    popover.scope.clickRadio = function (value, text) {
                        that.SetValue(value);
                        $(that.Mask).html(text);
                        that.Validate();
                    };
                    popover.scope.searchFocus = false;
                    popover.scope.searchAnimate = function () {
                        popover.scope.searchFocus = !popover.scope.searchFocus;
                    };
                    popover.scope.searChange = function () {
                        popover.scope.searchNum = $(".active .popover .list").children('label').length;
                    };
                });
                return;
            });
            if (that.IsMobile) {
                var text = that.GetText();
                if (that.Editable) {
                    that.Mask.html(text);
                    $(that.Mask).css({ 'color': '#2c3038' });
                }
                else {
                    //移动端不可编辑
                    $(that.Element).html(text);
                }
            }
        },
        AddMobileItem: function (value, text, isDefault) {
            var MobileOption = {
                DataField: this.DataField,
                Value: value,
                Text: text
            };
            this.MobileOptions.push(MobileOption);
        },
        GetText: function () {
            return $(this.Element).children("option:selected").text();
        },
        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                return {};
            }
            //update by luwei : 总是设置优先级
            $.MvcSheetUI.Priority = $(this.Element).val();
            
            if (result[this.DataField].V != $(this.Element).val()) {
                result[this.DataField].V = $(this.Element).val();
                return result;
            }
            return {};
        }
    });
})(jQuery);
// Label控件
(function ($) {

    // 控件实例执行方式
    $.fn.SheetLabel = function () {
        return $.MvcSheetUI.Run.call(this, "SheetLabel", arguments);
    };

    // 控件定义
    $.MvcSheetUI.Controls.SheetLabel = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetLabel.Base.constructor.call(this, element, options, sheetInfo);
    };

    // 继承事件
    $.MvcSheetUI.Controls.SheetLabel.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }
            //没有这个属性，宽度无效
            $(this.Element).css("display", "block");

            if (this.BindType.toLowerCase() == this.BindTypeEnum.OnlyData) {
                var val = this.V;

                var lbl = $(this.Element);
                if (val && (val = $.trim(val))) {
                    var strs = val.split("\n");
                    $(strs).each(function (i) {
                        if (i > 0) {
                            lbl.append("<br />");
                        }
                        lbl.text(this.toString());
                        //lbl.append($("<span></span>").text(this.toString()));
                    });
                }
                else {
                    lbl.text("");
                }
            }
            else if (!$(this.Element).text()) {
                $(this.Element).text(this.Text || this.N || "");
            }
            else if (!$(this.Element).text().trim()) {
                if (this.DataField) {
                    $(this.Element).text(this.DataField);
                }
            }
            // 绑定焦点事件
            if (this.OnClick) {
                $(this.Element).unbind("click.SheetLabel").bind("click.SheetLabel", [this], function (e) {
                    var that = e.data[0];
                    (new Function(that.OnClick)).apply(that.Element, arguments);
                });
            }
        },
        GetValue: function () {
            return $(this.Element).text() || this.DataField;
        },
        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable
                || this.BindType.toLowerCase() == this.BindTypeEnum.OnlyVisiable) return result;
            result[this.DataField] = $.MvcSheetUI.GetSheetDataItem(this.DataField);// this.DataItem;

            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }
            if (result[this.DataField].V != $(this.Element).html()) {
                result[this.DataField].V = $(this.Element).html();
                return result;
            }
            return {};
        }
    });
})(jQuery);
// SheetOffice控件
(function ($) {
    //控件执行
    $.fn.SheetOffice = function () {
        return $.MvcSheetUI.Run.call(this, "SheetOffice", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetOffice = function (element, options, sheetInfo) {
        this.NTKO = null; // NTKO控件对象
        $.MvcSheetUI.Controls.SheetOffice.Base.constructor.call(this, element, options, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetOffice.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            // <div id="xxx" SheetType="SheetOffice" DataField=""/>
            // TODO:构造 NTKO 的控件输出
            // TODO:如果是发起模式，那么加载Template模板
            // TODO:如果是非发起模式，那么从  URL 加载模板，URL地址为  Office/WordOpen.aspx
            // TODO:根据配置功能，显示不同的按钮
            /*
            // wordObject 是配置在活动节点的属性上的，读到这个属性，设置不同的按钮权限
            var wordObject = {
                ReadOnly: false,   // 是否只读
                Print: false,      // 是否允许打印
                Sign: false,       // 是否允许手写签名
                Stamp: false,      // 是否允许盖章
                Template: false,   // 是否允许套用模板
                Mark: false,       // 打开文档时是否处于修订状态
                Accept: false,     // 是否接受修订状态
                PDF: false         // 是否允许保存PDF
            };
            // 例如：设置 Mark:true,那么设置文档是修订痕迹状态,如果
            */
            if (typeof (wordObject) == "undefined") {
                this.wordObject = {
                    ReadOnly: false,   // 是否只读
                    Print: false,      // 是否允许打印
                    Sign: false,       // 是否允许手写签名
                    Stamp: false,      // 是否允许盖章
                    Template: false,   // 是否允许套用模板
                    Mark: false,       // 打开文档时是否处于修订状态
                    Accept: false,     // 是否接受修订状态
                    PDF: false         // 是否允许保存PDF
                };
            }
            else {
                this.wordObject = wordObject;
            }
            //if (typeof (bookmarks) != undefined)
            //    this.bookmarks = bookmarks;
            var table = $("<table border='0' style='text-align: center; width: 100%'></table>");
            var objectNtko = $("<object id='TANGER_OCX' classid='clsid:" + this.ClassID + "' codebase='" + this.CABPath + "#version=" + this.ProductVersion + "' width='" + this.OfficeWidth + "' height='" + this.OfficeHeight + "'><param name='ProductCaption' value='" + this.ProductCaption + "'><param name='ProductKey' value='" + this.ProductKey + "'></object>");
            $(table).append($("<tr></tr>").append($("<td style='height: " + this.OfficeHeight + ";'></td>").append(objectNtko)));
            $(this.Element).append(table);

            var actionTr = $("<tr></tr>");
            var pdfPrint = $("<td><input type='button' value='" + SheetLanguages.Current.CreatePDF + "' ></td>");
            var viewPDF = $("<td><input type='button' value='" + SheetLanguages.Current.ViewPDF + "' ></td>");
            var addSign = $("<td><input type='button' value='" + SheetLanguages.Current.AddESP + "' ></td>");
            var addTemplate = $("<td><input type='button' value='" + SheetLanguages.Current.AddTemplate + "' ></td>");
            $(actionTr).append($(pdfPrint)).append($(viewPDF)).append($(addSign)).append($(addTemplate));

            if (!this.wordObject.PDF) {
                $(pdfPrint).hide();
                $(viewPDF).hide();
            }
            if (!this.wordObject.Stamp) {
                $(addSign).hide();
            }
            if (!this.wordObject.Template) {
                $(addTemplate).hide();
            }

            $(this.Element).before($(actionTr));
            $(pdfPrint).unbind("click").bind("click", [this], function (e) {
                e.data[0].SavePDF();
            });
            $(viewPDF).unbind("click").bind("click", [this], function (e) {
                e.data[0].ViewPDF();
            });
            $(addSign).unbind("click").bind("click", [this], function (e) {
                e.data[0].AddSign();
            });
            $(addTemplate).unbind("click").bind("click", [this], function (e) {
                e.data[0].AddTemplate();
            });

            var that = this;
            setTimeout(function () {
                that.InitOffice();
            }, 1000)
        },
        InitOffice: function () {
            
            this.NTKO = document.getElementById($(this.Element).find("object").attr("id"));
            var right = true;
            try {
                if (this.Originate) {
                    //this.NTKO.OpenFromURL(this.Template);
                    //this.NTKO.BeginOpenFromURL("http://localhost:8020/portal/office/template.doc");
                    this.NTKO.OpenFromURL(this.Template);
                }
                else {
                    try {
                        var strurl = _PORTALROOT_GLOBAL + "/Office/WordOpen.aspx?SchemaCode=" + $.MvcSheetUI.SheetInfo.SchemaCode + "&BizObjectID=" + $.MvcSheetUI.SheetInfo.BizObjectID + "&InstanceID=" + $.MvcSheetUI.SheetInfo.InstanceId + "&dataField=" + this.DataField;
                        this.NTKO.OpenFromURL(strurl);
                    }
                    catch (e) {
                        this.NTKO.OpenFromURL(this.Template);
                    }
                }
            }
            catch (e) {
                right = false;
                alert(SheetLanguages.Current.IE);
            }

            if (right) {
                //
                if (!this.wordObject.ReadOnly) {
                    this.SetReadOnly(!this.Editable);
                }
                else {
                    this.SetReadOnly(this.wordObject.ReadOnly);
                }
                
                this.NTKO.fileprint = this.wordObject.Print;
                this.NTKO.fileprintPreview = this.wordObject.Print;
                this.NTKO.IsNoCopy = false;
            }
        },
        // 查看 PDF 文档
        ViewPDF: function () {
            // TODO:转向查看PDF的URL，当没有保存PDF时，这个URL弹出保存PDF信息、点击确定后自动关闭
            // BizObjectID,PDFDataField
            var strurl = _PORTALROOT_GLOBAL + "/Office/WordOpen.aspx?SchemaCode=" + $.MvcSheetUI.SheetInfo.SchemaCode + "&BizObjectID=" + $.MvcSheetUI.SheetInfo.BizObjectID + "&dataField=" + this.PDFDataField;
            window.open(strurl);
        },
        SetReadOnly: function (readonly) {
            // TODO:设置文档是否为只读模式
            this.NTKO.SetReadOnly(readonly);
        },
        SaveOffice: function () {
            
            // TODO:保存 WORD 文档保存的文件名称为 [流程实例名称].doc，如果流程实例名称为空，那么保存为 BizObjectID.doc,后台实现
            if (!this.NTKO.ActiveDocument.Saved) {
                // 文档被更改才进入保存方法
                // TODO:NTKO使用独立的方法进行保存，调用 ntkoOffice.js 的 saveDocument 方法
                if (this.wordObject.ReadOnly == null || this.wordObject.ReadOnly) return;

                var retHTML = this.NTKO.SaveToURL
                (
                    _PORTALROOT_GLOBAL + "/Office/OfficeService.aspx",  // 保存的文件地址
                    //_PORTALROOT_GLOBAL + "/OfficeService/SaveOfficeAttachment",
                    "UploadFile",  // 设置文件输入域名称,可任选,不与其他<input type=file name=..>的name部分重复即可
                    "Command=SaveDocument&InstanceID=" + $.MvcSheetUI.SheetInfo.InstanceId + "&dataField=" + this.DataField + "&SchemaCode=" + $.MvcSheetUI.SheetInfo.SchemaCode + "&BizObjectID=" + $.MvcSheetUI.SheetInfo.BizObjectID + "&SaveType=Doc",
                    "dd.doc",                                        // 文件名,此处从表单输入获取，也可自定义
                    document.forms[0].id,                                    // 控件的智能提交功能可以允许同时提交选定的表单的所有数据.此处可使用id或者序号
                    false
                ); //此函数会读取从服务器上返回的信息并保存到返回值中。
            }
        },
        SavePDF: function () {
            // TODO:保存PDF
            // NTKO使用独立的方法进行保存，调用 ntkoOffice.js 的 saveAsPDF 方法
            var download = 1;
            var fileName = "fileName" + ".pdf";
            var isPrint, isCopy;
            isPrint = isCopy = (download == "1");
            if (this.NTKO.fileOpen && this.NTKO.IsPDFCreatorInstalled()) {
                this.setSingPrint(true); // 设置印章可以打印
                var result = this.NTKO.PublishAsPDFToURL(_PORTALROOT_GLOBAL + "/Office/OfficeService.aspx", //提交到的url地址
                    "SavePDF", //文件域的id，类似<input type=file id=upLoadFile 中的id
                    "DataField=" + this.PDFDataField + "&Download=" + download + "&FileName=" + encodeURI(fileName) + "&SchemaCode=" + $.MvcSheetUI.SheetInfo.SchemaCode + "&BizObjectID=" + $.MvcSheetUI.SheetInfo.BizObjectID + "&InstanceID=" + $.MvcSheetUI.SheetInfo.InstanceId + "&SaveType=PDF",
                    "abc.pdf",      // 上传文件的名称，类似<input type=file 的value
                    0,              // 与控件一起提交的表单id，也可以是form的序列号，这里应该是0.
                    null,           // sheetname,保存excel的哪个表格
                    false,          // IsShowUI,是否显示保存界面
                    true,           // IsShowMsg,是否显示保存成功信息
                    true,           // IsUseSecurity,是否使用安全特性   false
                    "123",          // OwnerPass,安全密码.可直接传值
                    isPrint,        // IsPermitPrint,是否允许打印
                    isCopy          // IsPermitCopy,是否允许拷贝
                );
                this.setSingPrint(false); // 设置印章不可以打印
                return true;
            }
            else {
                alert(SheetLanguages.Current.PdfNotSave);
                return false;
            }
        },
        AddSign: function () {
            // TODO:加盖印章
            if (this.wordObject.ReadOnly == null || this.wordObject.ReadOnly) {// 只读状态下，先撤销只读，再进行盖章操作
                this.NTKO.SetReadOnly(false);
                this.addServerSign(this.SignUrl, this.SignBookmark, this.SignTop, this.SignLeft, "", this.SignType);
                this.NTKO.SetReadOnly(true);
                this.wordObject.ReadOnly = false;
            }
            else {
                this.addServerSign(this.SignUrl, this.SignBookmark, this.SignTop, this.SignLeft, "", this.SignType);
            }
        },

        setSingPrint: function (printAble) {
            var shapes = this.NTKO.ActiveDocument.shapes;
            for (i = 1; i <= shapes.Count; i++) {
                if (12 == shapes(i).Type) //如果是控件,判断控件类型  			
                {
                    if ("NTKO.SecSignControl".toUpperCase() == shapes(i).OLEFormat.ClassType.toUpperCase()) {
                        // 如果你要删除印章，首先要明确满足什么条件的印章，应该被删除。示例中判断印章序列号满足一定条件，就删除该印章。 					
                        // 其它用于判断的条件可以有：signer，signname，signcomment，signtime等等 					
                        // shapes(i).OLEFormat.object为印章控件对象                                                                               
                        // shapes(i).OLEFormat.object.SetPrintMode(2);//设置印章打印模式
                        if (printAble) {
                            shapes(i).OLEFormat.object.SetPrintMode(2); // 设置印章可以打印
                        }
                        else {
                            shapes(i).OLEFormat.object.SetPrintMode(0); // 设置印章不可以打印
                        }
                    }
                }
            }
        },

        addServerSign: function (signUrl, bookmark, top, left, signDate, type) {
            if (this.NTKO.fileOpen) {
                try {
                    // 设置文档为可写
                    this.NTKO.SetReadOnly(false);
                    // signDate  2010年9月15日
                    // var dayLength = signDate.substring(signDate.indexOf("月") + 1);
                    // if (dayLength.length == 2) left = parseInt(left) + 30;
                    // else if (dayLength.length == 3) left = parseInt(left) + 15;
                    if (this.NTKO.ActiveDocument.BookMarks != null) {
                        if (this.NTKO.ActiveDocument.BookMarks.Exists(bookmark)) {
                            // 存在签发日期时的印章处理
                            this.NTKO.ActiveDocument.BookMarks(bookmark).Select();
                        }
                        else {// 不存在签发日期书签时的印章处理
                            left = 100;
                            top = 200;
                        }
                    }
                    //var url = document.location.href.toLowerCase();
                    //signUrl = url.split("/portal")[0] + this.SignUrl;
                    if (type == "Server") { // 从服务器加载印章
                        // addSignFromURL(signUrl, this.sheetOfficeInfo.currentUser, parseInt(left), parseInt(top)); // 普通印章
                        this.addSecSignFromURL(this.SignUrl, $.MvcSheetUI.SheetInfo.currentUser, parseInt(left), parseInt(top)); // 安全印章
                    }
                    else if (type == "EKEY") { // 从 E-KEY 加载印章
                        this.addSecSignFromEkey($.MvcSheetUI.SheetInfo.currentUser, parseInt(left), parseInt(top));
                    }
                    else if (type == "2") { // 从 本机 加载印章
                        this.addLocalSign($.MvcSheetUI.SheetInfo.currentUser, parseInt(left), parseInt(top), "");
                    }
                }
                catch (error) {
                    // 设置文档为只读
                    if (this.wordObject.ReadOnly == null || this.wordObject.ReadOnly) {
                        this.NTKO.SetReadOnly(true);
                    }
                    return false;
                }
            }
            return true;
        },
        // 从服务器加盖普通签章
        addSignFromURL: function (signUrl, userName, left, top) {
            this.NTKO.AddSignFromURL(
                                userName,   // 印章的用户名
                                signUrl,    // 印章所在服务器相对url
                                left,       // 左边距
                                top,        // top,上边距 根据Relative的设定选择不同参照对象
                                userName,   // 调用DoCheckSign函数签名印章信息,用来验证印章的字符串
                                3,          // Relative,取值1-4。设置左边距和上边距相对以下对象所在的位置 1：光标位置；2：页边距；3：页面距离 4：默认设置栏，段落
                                100,        // 缩放印章,默认100%
                                1);         // 0印章位于文字下方,1位于上方
        },
        // 从服务器加盖安全印章
        addSecSignFromURL: function (signUrl, userName, left, top) {
            this.NTKO.AddSecSignFromURL(
                                userName, // 印章使用者名称
                                signUrl,  // 印章路径
                                left,     // 左位移
                                top,      // 上位移
                                1,        // 设置印章相对值， 1：光标位置；2：页边距；3：页面距离 4：默认设置栏，段落
                                0,        // 是否允许打印
                                false,    // 签章是否使用数字证书
                                false,    // 签章是否锁定
                                true,     // 检查文档是否改变
                                false,    // 指定签章是否显示以上设定的对话框
                                "",       // 签章口令，如果正确，将不弹出输入口令密码
                                false,    // 是否允许用户输入批注
                                true      // 签章是否在文字下方
                            );
        },
        //从EKEY加盖电子印章
        addSecSignFromEkey: function (userName, left, top) {
            this.NTKO.AddSecSignFromEkey(
                        userName,  // 当前用户名,
                        left,      // 印章左位移
                        top,       // 印章上位移
                        1,         // 设置印章相对值， 1：光标位置；2：页边距；3：页面距离 4：默认设置栏，段落
                        0,         // 设置不打印  1是打印灰色  2是打印原始
                        false,     // 签章是否使用数字证书
                        false,     // 签章是否锁定
                        true,      // 检查文档是否改变
                        false,     // 指定签章是否显示以上设定的对话框
                        "",        // 签章口令，如果正确，将不弹出输入口令密码
                        -1,        // 需要加盖的在 EKEY 的印章索引，如果传递 -1 表示让用户选择
                        false,     // 是否允许用户输入批注
                        true       // 签章是否在文字下方
                    );
        },
        // 从本地加盖印章
        addSignFromLocal: function (userName, left, top, fileName) {
            this.NTKO.AddSignFromLocal(
                userName,     // 印章的用户名
                fileName,     // 缺省文件名，必须是 .esp 类型文件
                true,         // 是否允许用户选择文件
                left,         // 左边距
                top,          // 上边距 根据Relative的设定选择不同参照对象
                userName,     // 调用 DoCheckSign 函数签名印章信息,用来验证印章的字符串
                1,            // Relative,取值1-4。设置左边距和上边距相对以下对象所在的位置 1：光标位置；2：页边距；3：页面距离 4：默认设置栏，段落
                100,          // 缩放印章,默认100%
                1);           // 0印章位于文字下方,1位于上方
        },

        AddTemplate: function () {
            // TODO:套用模板
            // 读取 BookmartMapping  属性  {书签名1:数据项名1,书签名2:数据项名2}
            // 将数据项的值替换到书签名
            // 注册KeyUp事件
            if (this.OnTemplate) {
                this.RunScript(this, this.OnTemplate);
            }
            else {
                //this.NTKO.AddTemplateFromURL(this.RedTemplate);
                try {
                    var doc, curSel;
                    var message = SheetLanguages.Current.BookmarkNotExists;
                    // 选择对象当前文档的所有内容
                    doc = this.NTKO.ActiveDocument;

                    curSel = doc.Application.Selection;
                    // 复制当前文档内容
                    /*
                    curSel.WholeStory();
                    curSel.Cut();
                    */
                    //插入模板
                    //var url = document.location.href.toLowerCase();
                    //var templateDoc = url.split("/portal")[0] + this.RedTemplate;
                    this.NTKO.AddTemplateFromURL(this.RedTemplate);

                    this.bookmarks = [];
                    if (this.BookmartMapping) {
                        var mappings = this.BookmartMapping.split(";");
                        if (mappings && mappings.length > 0) {
                            for (i = 0; i < mappings.length; i++) {
                                var mapDetail = mappings[i].split(":");
                                this.bookmarks.push({ Name: mapDetail[0], Value: mapDetail[1] });
                            }
                        }
                    }

                    // 处理其他书签
                    for (var i = 0; i < this.bookmarks.length; i++) {
                        if (this.bookmarks[i] == null) continue;
                        if (!doc.BookMarks.Exists(this.bookmarks[i].Name)) {
                            continue;
                        }
                        var data = $.MvcSheetUI.GetControlValue(this.bookmarks[i].Value);
                        doc.BookMarks(this.bookmarks[i].Name).Range.Text = data;
                    }
                    // 删除后面的回车键
                    curSel.EndKey(6, 1);
                    curSel.Delete();
                }
                catch (err) {
                    alert("ERROR：" + err.number + ":" + err.description);
                };
            }
            // 注意套用模板的时候，原文档内容移动到 body 中
        },
        // 返回数据值
        SaveDataField: function () {
            this.SaveOffice();
            return {};
        }
    });
})(jQuery);
// SheetInstancePrioritySelector控件
(function ($) {
    //控件执行
    $.fn.SheetOriginatorUnit = function () {
        return $.MvcSheetUI.Run.call(this, "SheetOriginatorUnit", arguments);
    };

    $.MvcSheetUI.Controls.SheetOriginatorUnit = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetOriginatorUnit.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetOriginatorUnit.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            var $element = $(this.Element);
            var that = this;

            // 绑定change事件
            $element.unbind("change.SheetOriginatorUnit").bind("change.SheetOriginatorUnit", function () {
                if ($.isFunction(that.OnChange)) {
                    that.OnChange.apply(this);
                }
                else {
                    (new Function(that.OnChange)).apply(this);
                }
            });
            var parentUnits = $.MvcSheetUI.SheetInfo.DirectParentUnits;
            if (parentUnits) {
                $element.empty();
                for (var key in parentUnits) {
                    $element.append("<option value='" + key + "'>" + parentUnits[key] + "</option>");
                }
                this.V = $.MvcSheetUI.SheetInfo.OriginatorOU; //当前流程发起人OU
                if (this.V && this.V != "") {
                    $element.val(this.V);
                }

                var length = 0;
                for (var key in $.MvcSheetUI.SheetInfo.DirectParentUnits) {
                    length++;
                }

                // 非发起模式或者不存在兼职情况，则不可编辑
                //if (!this.Originate || length == 1) {
                //非发起环节或者不存在兼职情况，则不可编辑                
                if ($.MvcSheetUI.SheetInfo.ActivityCode != $.MvcSheetUI.SheetInfo.StartActivityCode || length == 1 || $.MvcSheetUI.QueryString("Mode").toLowerCase() == "view") {
                    $element.after("<label style='width:100%;'>" + $element.children("option:selected").text() + "</label>");
                    $element.hide();
                } 
            }
        },
        RenderMobile: function () {

            //返回对象属性的个数
            function countObjectProperties(obj){
                var count=0;
                for(var key in obj){
                    if(obj.hasOwnProperty(key)){
                        count++;
                    }
                }
                return count;
            }

            var $element = $(this.Element);
            var parentUnits = $.MvcSheetUI.SheetInfo.DirectParentUnits;
            $element.empty();
            for (var key in parentUnits) {
                $element.append("<option value='" + key + "'>" + parentUnits[key] + "</option>");
            }
            var ionic = $.MvcSheetUI.IonicFramework;
            var that = this;
            $element.hide();

            var arrowElement = $('<i class="icon ion-ios-arrow-right"></i>');
            var inputLabel = $("<span class='input-label'></span>");
            that.Mask = inputLabel;
            var ParentElement = $element.closest('.detail');
            ParentElement.append(inputLabel);
            ParentElement.append(arrowElement);
            
            
            that.V = $.MvcSheetUI.SheetInfo.OriginatorOU;
            if (that.V && that.V != "") {
                that.Mask.html(parentUnits[that.V]);
                $element.val(that.V);
            }
            
            ParentElement.unbind("click.showSelect").bind("click.showSelect", function () {
                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover.html', {
                    scope: ionic.$scope
                }).then(function (popover) {
                    popover.scope.header = SheetLanguages.Current.BasicInfo.divOriginateOUName;
                    popover.scope.RadioListDisplay = [];

                    // console.log($element.val());
                    popover.scope.RadioListValue = $element.val();

                    for (var key in parentUnits) {
                        var emptyOption = {
                            Value: key,
                            Text: parentUnits[key]
                        };
                        popover.scope.RadioListDisplay.push(emptyOption);
                    }

                    popover.show();
                    popover.scope.hide = function () {
                        popover.hide();
                    }
                    popover.scope.clickRadio = function (value, text) {
                        $element.val(value);
                        $(that.Mask).html(text);
                    }
                    popover.scope.searchFocus = false;
                    popover.scope.searchAnimate = function () {
                        popover.scope.searchFocus = !popover.scope.searchFocus;
                    };
                });
                return;
            });

            var length = countObjectProperties(parentUnits);
            if ($.MvcSheetUI.SheetInfo.ActivityCode != $.MvcSheetUI.SheetInfo.StartActivityCode || length == 1 || $.MvcSheetUI.QueryString("Mode").toLowerCase() == "view") {
                that.Mask.text($element.children("option:selected").text());
                arrowElement.hide();
                ParentElement.addClass("uneditableOU");
                ParentElement.unbind("click.showSelect");
            } else {
                ParentElement.addClass("editableOU");
            }

        },
        GetText: function () {
            return $(this.Element).children("option:selected").text();
        },
        // 返回数据值
        SaveDataField: function () {
            $.MvcSheetUI.ParentUnitID = $(this.Element).val();
        }
    });
})(jQuery);
(function ($) {
    // 控件实例执行方式
    $.fn.SheetQuery = function () {
        return $.MvcSheetUI.Run.call(this, "SheetQuery", arguments);
    };


    // 构造函数
    $.MvcSheetUI.Controls.SheetQuery = function (element, ptions, sheetInfo) {
        this.QueryCss = {
            List: "list",
            AfList: "orglist"
        };
        //传入参数配置
        this.InputMapJson = {};
        //传出参数配置
        this.OutputMapJson = {};
        //过滤设置的标示,避免重复添加
        this.FilterFlag = true;
        this.Columns = null;

        /// <summary>
        /// 控件类型
        /// </summary>
        this.ControlType =
        {
            /// <summary>
            /// 文本框类型
            /// </summary>
            TextBox: 0,
            /// <summary>
            /// 下拉框类型
            /// </summary>
            DropdownList: 1,
            /// <summary>
            /// 单选框类型
            /// </summary>
            RadioButtonList: 2,
            /// <summary>
            /// 复选框类型
            /// </summary>
            CheckBoxList: 3,
            /// <summary>
            /// 长文本框类型
            /// </summary>
            RichTextBox: 4
        }

        $.MvcSheetUI.Controls.SheetQuery.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetQuery.Inherit($.MvcSheetUI.IControl, {
        //SheetQuery本身不是输入控件,无需验证
        Validate: function () {
            return true;
        },

        RenderMobile: function () {
            var that = this;
            //处理映射配置
            this.MappingSetting();
            //初始化查询
            this.InitQuery();
        },

        //移动容器显示后
        AfterMobileEditShow: function () {
            //第一次加载，需要加载数据，第二次的话，如果没有传入参数，不需要刷新
            if (this.Scrllable == null || this.InputMappings.length > 0) {
                this.IsBindInputVlues = false;
                this.LoadQueryData();
            }
        },

        //处理映射配置
        MappingSetting: function () {
            var mapping = this.OutputMappings.split(',');
            for (var i = 0; i < mapping.length; i++) {
                var map = mapping[i].split(':');
                this.OutputMapJson[map[0]] = map[1];
            }

            this.InputMappingSetting();
        },

        //处理传入参数映射配置
        InputMappingSetting: function () {
            var mapping = this.InputMappings.split(',');
            for (var i = 0; i < mapping.length; i++) {
                var map = mapping[i].split(':');
                var targetDataField = map[0];
                var e = $.MvcSheetUI.GetElement(targetDataField, this.RowNum);
                if (e != null) {
                    this.InputMapJson[map[1]] = e.SheetUIManager();
                }
            }
        },

        //初始化查询
        InitQuery: function () {
            $(this.Element).append('<div class="scroll-wrapper"><div class="scroller"></div></div>');
            this.UlElementID = $.MvcSheetUI.NewGuid();
            //数据列表
            this.UlElement = $("<ul>").attr("id", this.UlElementID).addClass(this.QueryCss.AfList).addClass(this.QueryCss.List).appendTo($(this.Element).find("div.scroller"));
        },

        //从后台读取数据
        LoadQueryData: function () {
            var that = this;
            var params = {
                Action: "GetQuerySettingAndData",
                SchemaCode: this.SchemaCode,
                QueryCode: this.QueryCode,
                InputMapping: this.GetInputMappings()
            };

            if (that.FilterPanelID) {
                params["Action"] = "GetQueryData";

                //如何没绑定inputmapping的值，得绑定
                if (!that.IsBindInputVlues) {
                    that.BindFilterInputValues.apply(that);
                }

                params["Filters"] = that.GetFilters();
            }

            if (this.Scrllable) {
                this.UlElement.html("");
                this.Scrllable.UpdateLoadParams(params);
            }
            else {
                this.Scrllable = new ScrollableList({
                    url: $.MvcSheetUI.PortalRoot + "/BizQueryHandler/BizQueryHandler",
                    panelSelector: "#" + this.MobilePanelID,
                    ulSelector: "#" + this.UlElementID,
                    loadMoreAble: true,
                    loadParams: params,
                    //data:后台返回的数据包
                    //scrllable:当前ScrollableList对象
                    //loadMore:true 下一页，false 刷新
                    OnSucceed: function (data, scrllable, loadMore) {
                        that.QueryData = data.QueryData;
                        that.Columns = data.Columns;
                        if (!that.QuerySetting) {
                            that.QuerySetting = data.QuerySetting;
                            that.FilterItems = that.QuerySetting.QueryItems;

                            if (!that.FilterItems) {
                                that.FilterFlag = false;
                            }
                            that.BindFilter.apply(that);
                        }

                        if (!loadMore) {
                            that.UlElement.html("");
                        }

                        that.BindData.apply(that);
                    }
                });

                this.Scrllable.LoadItems();
            }
        },
        GetDisplayName: function (key) {
            if (!this.Columns) return key;
            return this.Columns[key] || key;
        },
        //绑定过滤
        BindFilter: function () {
            if (!this.FilterFlag) return;
            this.FilterFlag = false;

            //查询
            this.FilterBtn = $("<a  class='icon magnifier big'></a>")
                .css("position", "absolute")
                .css("bottom", "20px")
                .css("right", "50px")
                .css("z-index", "999")
                .css("cursor", "pointer").appendTo($(this.Element).find(".scroll-wrapper"));

            this.FilterPanelID = $.MvcSheetUI.NewGuid();
            this.FilterPanel = $("<div>").attr("id", this.FilterPanelID).hide().appendTo(this.Element);

            //添加过滤项
            var ulElement = $("<ul>").addClass("list").appendTo(this.FilterPanel);
            for (var i = 0; i < this.FilterItems.length; i++) {
                var filterItem = this.FilterItems[i];
                if (!filterItem.Visible) continue;//不可见
                if (filterItem.FilterType == 3) continue;//系统参数

                var defaultVal = filterItem.DefaultValue;
                if (this.InputMapJson[filterItem.PropertyName]) {
                    //传入参数
                }

                var liElement = $("<li>").appendTo(ulElement);
                var label = $("<label for='" + this.FilterPanelID + filterItem.PropertyName + "'>" + this.GetDisplayName(filterItem.PropertyName) + "</label>").css("text-align", "left");
                liElement.append(label);
                switch (filterItem.DisplayType) {
                    case this.ControlType.DropdownList:
                        var input = $("<select id='" + this.FilterPanelID + filterItem.PropertyName + "' data-property='" + filterItem.PropertyName + "'>");
                        input.append("<option value=''>" + SheetLanguages.Current.All + "</option>");
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                input.append("<option value='" + vals[j] + "'>" + vals[j] + "</option>");
                            }
                        }
                        input.val(filterItem.DefaultValue);
                        liElement.append(input);
                        break;

                    case this.ControlType.RadioButtonList:
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                var newid = $.MvcSheetUI.NewGuid();
                                liElement.append("<input id='" + newid + "' type='radio' name='" + filterItem.PropertyName + "' value='" + vals[j] + "'></input>");
                                liElement.append("<label for='" + newid + "'>" + vals[j] + "</label>");
                            }
                        }
                        $("input[name='" + filterItem.PropertyName + "'][value='" + filterItem.DefaultValue + "']").attr("checked", "checked")
                        liElement.append("<br style='clear: both;'></br>");
                        break;

                    case this.ControlType.CheckBoxList:
                        var vals = filterItem.SelectedValues.split(";");
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] != "") {
                                var newid = $.MvcSheetUI.NewGuid();
                                liElement.append("<input id='" + newid + "' type='checkbox' name='" + filterItem.PropertyName + "' value='" + vals[j] + "'></input>");
                                liElement.append("<label for='" + newid + "'>" + vals[j] + "</label>");
                            }
                        }
                        $("input[name='" + filterItem.PropertyName + "'][value='" + filterItem.DefaultValue + "']").attr("checked", "checked")
                        liElement.append("<br style='clear: both;'></br>");
                        break;

                    default:
                        //Error:文本类型，需要判断FilterType 和 LogicType,日期、数字 范围
                        liElement.append("<input type='text' id='" + this.FilterPanelID + filterItem.PropertyName + "' data-property='" + filterItem.PropertyName + "'></input>");
                        $("#" + filterItem.PropertyName).val(filterItem.DefaultValue);
                        break;
                }
            }
            //添加容器
            $.ui.addContentDiv(this.FilterPanelID);

            //确定按钮
            this.FooterID = $.MvcSheetUI.NewGuid();
            var footerObj = $("<footer id=" + this.FooterID + " ><a class='icon magnifier big' >" + SheetLanguages.Current.OK + "</a><footer>");
            $("#afui").append(footerObj);
            $(footerObj).unbind("click.footerObj").bind("click.footerObj", this, function (f) {
                f.data.LoadQueryData();
                $.ui.goBack();
            });
            this.FilterPanel.attr("data-footer", this.FooterID);

            //点击事件
            this.FilterBtn.unbind("click.FilterBtn").bind("click.FilterBtn", this, function (e) {
                //显示
                $.ui.loadContent(e.data.FilterPanelID);
            });
        },

        //绑定过滤条件的传入数据
        BindFilterInputValues: function () {
            this.IsBindInputVlues = true;
            for (var i = 0; i < this.FilterItems.length; i++) {
                var filterItem = this.FilterItems[i];
                if (!filterItem.Visible) continue;//不可见
                if (filterItem.FilterType == 3) continue;//系统参数
                if (!this.InputMapJson[filterItem.PropertyName]) continue;
                switch (filterItem.DisplayType) {
                    case this.ControlType.RadioButtonList:
                    case this.ControlType.CheckBoxList:
                        this.FilterPanel.find("input[name='" + filterItem.PropertyName + "'][value='" + this.InputMapJson[filterItem.PropertyName].GetValue() + "']").attr("checked", "checked");
                        break;

                    default:
                        $("#" + this.FilterPanelID + filterItem.PropertyName).val(this.InputMapJson[filterItem.PropertyName].GetValue());
                        break;
                }
            }
        },

        //读取过滤数据
        GetFilters: function () {
            var filters = {};
            for (var i = 0; i < this.FilterItems.length; i++) {
                var filterItem = this.FilterItems[i];
                if (!filterItem.Visible) continue;//不可见
                if (filterItem.FilterType == 3) continue;//系统参数
                switch (filterItem.DisplayType) {
                    case this.ControlType.RadioButtonList:
                    case this.ControlType.CheckBoxList:
                        if (this.FilterPanel.find("input[name='" + filterItem.PropertyName + "']:checked").val()) {
                            filters[filterItem.PropertyName] = $("input[name='" + filterItem.PropertyName + "']:checked").val();
                        }
                        break;

                    default:
                        if ($("#" + this.FilterPanelID + filterItem.PropertyName).val()) {
                            filters[filterItem.PropertyName] = $("#" + this.FilterPanelID + filterItem.PropertyName).val();
                        }
                        break;
                }
            }

            return JSON.stringify(filters);
        },

        //读取inputmapping映射值
        GetInputMappings: function () {
            var inputJson = {};
            if (this.InputMapJson) {
                for (var key in this.InputMapJson) {
                    if (this.InputMapJson[key])
                        inputJson[key] = this.InputMapJson[key].GetValue();
                }
            }

            return JSON.stringify(inputJson);
        },
        getPropertyNameFromData: function (bizObject, propertyName) {
            for (var k in bizObject) {
                if (k.toLocaleLowerCase() == propertyName.toLocaleLowerCase()) {
                    return k;
                }
            }
        },
        //从后台读取数据后，绑定到前端
        BindData: function () {
            for (var i = 0; i < this.QueryData.length; i++) {
                var row = this.QueryData[i];
                var liElement = $("<li>").data("dataindex", i).data("v", JSON.stringify(row));
                var pElement = $("<p>");
                var datafield = $("#" + this.ElementID).attr("data-datafield");

                for (var j = 0; j < this.QuerySetting.Columns.length; j++) {
                    var PropertyName = this.QuerySetting.Columns[j].PropertyName;
                    PropertyName = this.getPropertyNameFromData(row, PropertyName);

                    if (PropertyName == this.OutputMapJson[datafield]) {
                        liElement.html("");
                        liElement.append("<h2>" + row[PropertyName] + "</h2>");
                    }
                    else if (j == 0) {
                        liElement.append("<h2>" + row[PropertyName] + "</h2>");
                    }
                    else if (this.QuerySetting.Columns[j].Visible == 1) {
                        pElement.append("<span style='font-style:italic'>" + this.GetDisplayName(PropertyName) + "</span>:" + row[PropertyName] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                    }
                }

                liElement.append(pElement).appendTo(this.UlElement);

                liElement.unbind("click.liElement").bind("click.liElement", this, function (e) {
                    e.data.ItemClick.apply(e.data, [JSON.parse($(this).data("v"))]);
                });
            }
        },
        //点击事件
        ItemClick: function (rowdata) {
            // var rowdata = this.QueryData[dataindex];
            var datafield = $("#" + this.ElementID).attr("data-datafield");
            var rowIndex = $("#" + this.ElementID).attr("data-row");
            for (var key in this.OutputMapJson) {
                if (key == datafield) {
                    //当前控件，直接赋值
                    $("#" + this.ElementID).val(rowdata[this.OutputMapJson[key]]);
                    $(this.ElementMask).text(rowdata[this.OutputMapJson[key]]);

                    //赋值后自动验证
                    try {
                        $.MvcSheetUI.ControlManagers[$("#" + this.ElementID).data('sheetid')].Validate()
                    }
                    catch (e) { }

                }
                else {
                    var e = $.MvcSheetUI.GetElement(key, rowIndex);
                    if (e != null && e.data($.MvcSheetUI.SheetIDKey)) {
                        e.SheetUIManager().SetValue(rowdata[this.OutputMapJson[key]]);
                        if (e.SheetUIManager().Validate) {
                            e.SheetUIManager().Validate();
                        }
                    }
                }
            }
            $.ui.goBack(0);
        }
    });

})(jQuery);
// RadioButtonList控件
; (function ($) {
    //控件执行
    $.fn.SheetRadioButtonList = function () {
        return $.MvcSheetUI.Run.call(this, "SheetRadioButtonList", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetRadioButtonList = function (element, ptions, sheetInfo) {
        $.MvcSheetUI.Controls.SheetRadioButtonList.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetRadioButtonList.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            //不可见返回
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }
            // 查看痕迹
			if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            //渲染前端
            this.HtmlRender();

            //绑定选择事件
            $(this.Element).unbind("change.SheetRadioButtonList").bind("change.SheetRadioButtonList", [this], function (e) {
                // e.data[0].RemoveInvalidText(e.data[0].Element, "*", false);
                e.data[0].Validate();
                e.data[0].RunScript(this, e.data[0].OnChange);
            });
        },

        GetValue: function () {
            var value = "";
            $(this.Element).find("input").each(function () {
                if (this.checked)
                    value = $(this).val();
            });
            return value;
        },

        //设置控件的值
        SetValue: function (value) {
            $(this.Element).find("input").each(function () {
                if (this.value == value)
                    $(this).prop("checked", "checked");
            });
            if (this.IsMobile) {
                this.Mask.text(this.GetText());
                if (this.OnChange) {
                    this.RunScript(this, this.OnChange);
                }
                if (this.Editable) {
                    if (this.Mask.text() == '' || this.Mask.text() == SheetLanguages.Current.PleaseSelect) {
                        this.Mask.text(SheetLanguages.Current.PleaseSelect);
                        this.Mask.css({ 'color': '#797f89' });
                    } else {
                        this.Mask.css({ 'color': '#2c3038' });
                    }
                }
            }
        },
        GetText: function () {
            if (this.OnChange) {
                this.RunScript(this, this.OnChange);
            }
            return $(this.Element).find("input:checked").next().text();
        },
        SetReadonly: function (flag) {
            if (flag) {
                $(this.Element).find("input").prop("disabled", true);
            }
            else {
                $(this.Element).find("input").prop("disabled", false);
            }
        },

        //设置一行显示数目
        SetColumns: function () {
            if (this.RepeatColumns && /^([1-9]\d*)$/.test(this.RepeatColumns)) {
                var width = (100 / this.RepeatColumns) + "%";
                var divs = $(this.Element).find("div"),
                    i;
                for (i = 0; i < divs.length; i++) {
                    $(divs[i]).css({ "width": width });
                }
            }
        },

        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                return {};
            }

            // if (result[this.DataField].V != this.GetValue())
            {
                result[this.DataField].V = this.GetValue();
                return result;
            }
            return {};
        },

        //设置默认值
        InitValue: function () {
            if (this.SheetInfo.SheetMode == $.MvcSheetUI.SheetMode.Originate && !this.V) {
                if (this.DefaultSelected) {
                    if ($(this.Element).find("input:checked").length === 0) {
                        $(this.Element).find("input").first().prop("checked", "checked");
                        this.V = $(this.Element).find("input").first().val();
                    }
                    // 如果设置了SelectedValue，其优先级大于数据字典的默认值
                    if (this.SelectedValue) {
                        if ($(this.Element).find("input[type='radio'][value='" + this.SelectedValue + "']").length == 1) {
                            $(this.Element).find("input[type='radio'][value='" + this.SelectedValue + "']").prop("checked", "checked");
                            this.V = $(this.Element).find("input[type='radio'][value='" + this.SelectedValue + "']").val();
                        }
                    }
                }
            }

            $(this.Element).find("input[type='radio'][value='" + this.V + "']").prop("checked", "checked");

            if (this.IsMobile) {
                var text = $(this.Element).find("input[type='radio'][value='" + this.V + "']").text();
                if (!text) {
                    text = $(this.Element).find("input[type='radio'][value='" + this.V + "']").parent().find("label").text();
                }
                if (this.Editable) {
                    this.Mask.html(text);
                }
                else {
                    //移动端不可编辑
                	text = text.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                    $(this.Element).html(text);
                }
            }
        },

        HtmlRender: function () {
            if (!this.Visiable) { $(this.Element).hide(); return; }
            $(this.Element).addClass("SheetRadioButtonList");
            //组标示
            //this.SheetGropName = this.DataField + "_" + Math.floor(Math.random() * 1000);//设置统一的name                        
            //子表中的单选按钮名字重复不能选择_tangsheng20180828
            this.SheetGropName = this.DataField + "_" + $.MvcSheetUI.NewGuid();
            var existedHtml = $(this.Element).html();

            $(this.Element).html("");

            if (this.MasterDataCategory) {
                var that = this;
                var cmdParam = JSON.stringify([this.MasterDataCategory]);
                if ($.MvcSheetUI.CacheData && $.MvcSheetUI.CacheData[cmdParam]) {
                    var cacheData = $.MvcSheetUI.CacheData[cmdParam];
                    for (var key in cacheData) {
                        that.AddRadioItem.apply(that, [cacheData[key].Code, cacheData[key].EnumValue, cacheData[key].IsDefault]);
                    }
                    that.InitValue.apply(that);
                    that.DoRepeatDirection.apply(that);
                    if (that.IsMobile && that.Editable)
                        that.ionicInit($.MvcSheetUI.IonicFramework);
                }
                else {
                    $.MvcSheet.GetSheet({
                        "Command": "GetMetadataByCategory",
                        "Param": cmdParam
                    },
                        function (data) {
                            if (data) {
                                //将数据缓存
                                if (!$.MvcSheetUI.CacheData) { $.MvcSheetUI.CacheData = {}; }
                                if (data.Successful != null && !data.Successful) {// 执行报错则输出日志
                                    return;
                                }
                                $.MvcSheetUI.CacheData[cmdParam] = data;

                                for (var i = 0, len = data.length; i < len; i++) {
                                    that.AddRadioItem.apply(that, [data[i].Code, data[i].EnumValue, data[i].IsDefault]);
                                }
                            }
                            //初始化默认值
                            that.InitValue.apply(that);
                            that.DoRepeatDirection.apply(that);
                            if (that.IsMobile && that.Editable)
                                that.ionicInit($.MvcSheetUI.IonicFramework);
                        }, null, this.DataField.indexOf(".") == -1);
                }
            }
            else if (this.DefaultItems) {
                var items = this.DefaultItems.split(';');
                for (var i = 0; i < items.length; i++) {
                    this.AddRadioItem.apply(this, [items[i], items[i], false]);
                }
                this.InitValue();
                this.DoRepeatDirection();
                if (this.IsMobile && this.Editable)
                    this.ionicInit($.MvcSheetUI.IonicFramework);
            }
            else {
                $(this.Element).html(existedHtml);
                this.InitValue();
                if (this.IsMobile && this.Editable)
                    this.ionicInit($.MvcSheetUI.IonicFramework);
            }
        },

        //SetCheckView: function (item, value, checkitem) {  //不可编辑时,设置图标字体
        //    var checkbox = $("<i class='icon-checkbox-unchecked'></i>");
        //    if (this.Editable) {
        //        checkbox = $("<input type='radio' />");
        //    }
        //    else {
        //        if (this.V) {
        //            if (checkitem == value) {
        //                checkbox = $("<i class='icon-checkbox-checked'></i>");
        //            }
        //        }
        //    }
        //    this.AddRadioItem.apply(this, [checkbox, value, item])
        //},

        RenderMobile: function () {
            this.MobileOptions = [];
            this.HtmlRender();
            //不可用
            if (!this.Editable) {
                $(this.Element).addClass(this.Css.Readonly);
            }
            else {
                this.MoveToMobileContainer();
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).hide();
                this.SetValue();
            }
        },

        ionicInit: function (ionic) {
            var that = this;
            //只往上一级，只能通过控件绑定click事件，防止DisplayRule属性存在时出现异常
            $(this.Element.parentElement).unbind('click.showChoice').bind('click.showChoice', function (e) {
                ionic.$ionicModal.fromTemplateUrl('Mobile/form/templates/radio_popover.html', {
                    scope: ionic.$scope
                }).then(function (popover) {
                    popover.scope.header = that.N;
                    popover.scope.RadioListDisplay = that.MobileOptions;
                    popover.scope.RadioListValue = that.GetValue();
                    popover.show();
                    popover.scope.hide = function () {
                        popover.hide();
                    };
                    popover.scope.clickRadio = function (value, text) {
                        for (var i = 0; i < $(that.Element).children("div").length; i++) {
                            if ($($($(that.Element).children("div"))[i])[0].innerText === value)
                                //触发原始radio的change事件
                                $($(that.Element).children("div").children("input")[0]).trigger("change", value);
                        }
                        that.SetValue(value);
                        text = text.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;");
                        $(that.Mask).html(text);
                        that.Validate();
                        
                    };
                    popover.scope.searchFocus = false;
                    popover.scope.searchAnimate = function () {
                        popover.scope.searchFocus = !popover.scope.searchFocus;
                    };
                    popover.scope.searChange = function () {
                        popover.scope.searchNum = $(".active .popover .list").children('label').length;
                    };
                });
                return;
            });
        },

        DoRepeatDirection: function () {
            //横向展示
            if (this.RepeatDirection == "Horizontal") {
                $(this.Element).find("[SheetGropName='" + this.SheetGropName + "']").css("float", "left");
                $(this.Element).find("[SheetGropName='" + this.SheetGropName + "']").addClass("radio radio-primary");
            }

            //设置一行显示数目
            this.SetColumns();

            // 显示红色*号提示
            if (this.Editable && this.Required) {
                var inputs = $(this.Element).find("input");
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs[i]).prop("checked"))
                        this.RemoveInvalidText(this.Element, "*", false);
                }
            }
        },

        AddRadioItem: function (value, text, isDefault) {
            if (text || value) {
                var option = $("<div SheetGropName='" + this.SheetGropName + "'></div>");
                if (this.IsMobile) {
                    option.attr("style", "display:none;");
                    var MobileOption = {
                        DataField: this.DataField,
                        Value: value,
                        Text: text
                    };
                    this.MobileOptions.push(MobileOption);
                }
                
                //update by xl@Future
                text = $('<div/>').text(text).html();
                text = text.replace(/\"/g,"&quot;").replace(/\'/g,"&apos;");
                value = $('<div/>').text(value).html();
                value = value.replace(/\"/g,"&quot;").replace(/\'/g,"&apos;");
                var id = $.MvcSheetUI.NewGuid();
                var radio = $("<input type='radio' />").prop("name", this.SheetGropName).prop("id", id).val(value);//.text(text || value)
                if (this.DefaultSelected) {
                    radio.prop("checked", isDefault);
                }
                if (!this.Editable) {//不可用
                    radio.prop("disabled", true);
                }
                var span = $("<label for='" + id + "'  style=\"padding-left:3px;padding-right:5px;\">" + (text || value) + "</label>");
                $(this.Element).append(option);
                option.append(radio);
                option.append(span);
                
            }
        }
    });
})(jQuery);
﻿// 关联流程实例控件
(function ($) {

    $.fn.SheetRelationInstance = function () {
        return $.MvcSheetUI.Run.call(this, "SheetRelationInstance", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetRelationInstance = function (element, ptions, sheetInfo) {
        this.RelationInstances = [];
        this.ModalId = "divModal_RelationInstance";
        this.LoadUrl = null;
        this.LinkUrl = null;
        this.InstanceTable = null;

        $.MvcSheetUI.Controls.SheetRelationInstance.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetRelationInstance.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            if (!this.Visiable) {
                $(this.Element).hide();
                return;
            }

            this.LoadUrl = this.PortalRoot + "/SelectInstance.html?InstanceId=" + this.SheetInfo.InstanceId + "&ID=" + this.Element.id;
            this.LinkUrl = this.PortalRoot + "/InstanceSheets.html";

            if (this.V) {
                this.GetInstancesFromValue();
            }

            this.RenderHistory();
            if (this.Editable) {
                this.RenderUpload();
            }
        },
        GetInstancesFromValue: function () {
            var instances = this.V.split("#,#");
            for (var i = 0; i < instances.length; i++) {
                if (instances[i].indexOf("#_#") == -1) continue;
                var arr = instances[i].split("#_#");
                this.RelationInstances.push({ ObjectID: arr[0], InstanceId: arr[1], InstanceName: arr[2] });
            }
        },
        GetValueFromInstances: function () {
            var result = "";
            for (var i = 0; i < this.RelationInstances.length; i++) {
                if (i > 0) result += "#,#";
                result += this.RelationInstances[i].ObjectID + "#_#" + this.RelationInstances[i].InstanceId + "#_#" + this.RelationInstances[i].InstanceName;
            }
            return result;
        },
        RenderHistory: function () {
            // 初始化已经关联的文件
            if (this.InstanceTable == null) {
                var table = "<table class=\"table table-striped\" style=\"margin: 0px; min-height: 0px;\">";
                table += "<tbody>";
                table += "</tbody>";
                table += "</table>";
                this.InstanceTable = $(table);
                this.InstanceTable.appendTo($(this.Element));
            }
            this.InstanceTable.find("row").remove();
            // 增加行
            for (var i = 0; i < this.RelationInstances.length; i++) {
                this.AddItem(this.RelationInstances[i]);
            }
        },
        RenderUpload: function () {
            // 初始化上传按钮
            var id = this.Element.id || this.DataField;
            var html = "<div class=\"btn btn-outline btn-lg\" style=\"width: 100%; border: 1px dashed rgb(221, 221, 221);\" data-toggle=\"modal\" data-target=\"#" + this.ModalId + "\">";
            html += "点击绑定流程";
            html += "</div>";
            if ($("#" + this.ModalId).length == 0) {
                html += "<div id=\"" + this.ModalId + "\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" style=\"display: none;\" aria-hidden=\"true\">";
                html += "<div class=\"modal-dialog\" style=\"width:600px;height:452px;\">";
                html += "<div class=\"modal-content\" style=\"height:100%;\">";
                html += "<div class=\"modal-header\">";
                html += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>";
                html += "<h4 class=\"modal-title\">请选择关联流程</h4>";
                html += "</div>";
                html += "<div class=\"modal-body\">";
                html += "<iframe id=\"frm_RelationInstance\" name=\"frm_RelationInstance\" scrolling=\"no\" frameborder=\"0\" style=\"width: 100%; height: 452px;\" src=\"" + this.LoadUrl + "\"></iframe>";
                html += "</div>";
                html += "</div>";
                html += "</div>";
                html += "</div>";
            }

            $(html).appendTo($(this.Element));
        },
        AddItem: function (instance) {
            var that = this;
            var linkUrl = this.LinkUrl + "?RelationID=" + encodeURI(instance.InstanceId);
            var row = "<tr id=\"" + instance.ObjectID + "\">";
            row += "<td>";
            row += "<a href=\"" + linkUrl + "\" target=\"_blank\"><i class=\"fa fa-angle-right\" style=\"padding-right:5px;\"></i>" + instance.InstanceName + "</a>";
            row += "</td>";
            if (this.Editable) {
                row += "<td class=\"printHidden\" style=\"text-align: center;width:60px;\">";
                row += "<a href=\"javascript:void(0);\" data-action=\"" + instance.ObjectID + "\" class=\"fa fa-minus\">删除</a>";
                row += "</td>";
            }
            row += "</tr>";
            $(row).appendTo(this.InstanceTable)
                  .find(".fa-minus").click(function () {
                      var id = $(this).data("action");
                      that.RemoveItem(id);
                  });
            // this.InstanceTable.append($(row));
        },
        AddNewItem: function (objectId, instanceId, instanceName) {
            var item = { ObjectID: objectId, InstanceId: instanceId, InstanceName: instanceName };
            this.RelationInstances.push(item);
            this.AddItem(item);
        },
        RemoveItem: function (objectId) {
            // 删除一项
            for (var i = 0; i < this.RelationInstances.length; i++) {
                if (this.RelationInstances[i].ObjectID == objectId) {
                    // 移除数组
                    this.RelationInstances.splice(i, 1);
                    // 移除行
                    this.InstanceTable.find("#" + objectId).remove();
                    break;
                }
            }
            if (window.frames["frm_RelationInstance"] && window.frames["frm_RelationInstance"].removeItemFromParent) {
                window.frames["frm_RelationInstance"].removeItemFromParent(objectId);
            }
        },
        RenderMobile: function () {
            this.Render();
            this.MoveToMobileContainer(this.Element);
        },
        // 数据验证
        Validate: function (effective, initValid) {
            if (!this.Editable) return true;
            if (initValid) {
                if (this.Required && this.RelationInstances < 1) {
                    this.AddInvalidText(this.Element, "*", false);
                    return false;
                }
            }
            if (!effective) {
                if (this.Required) {//必填的
                    if (this.RelationInstances < 1) {
                        this.AddInvalidText(this.Element, "*");
                        return false;
                    }
                }
            }

            this.RemoveInvalidText(this.Element);
            return true;
        },
        GetValue: function () {
            return this.RelationInstances;
        },
        SetValue: function (options) {
            $.extend(this.RelationInstances, options);
            this.RenderHistory();
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;

            result[this.DataField] = this.DataItem;
            result[this.DataField].V = this.GetValueFromInstances();
            return result;
        }
    });
})(jQuery);
/// <reference path="../MvcSheetUI.js" />
//文本框(SheetTextBox/SheetBizTextBox/SheetTime)
(function ($) {
    // 控件执行
    // 参数{AutoTrim:true,DefaultValue:datavalue,OnChange:""}
    //可以通过  $("#id").SheetTextBox(参数)  来渲染控件和获取控件对象
    $.fn.SheetRichTextBox = function () {
        return $.MvcSheetUI.Run.call(this, "SheetRichTextBox", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetRichTextBox = function (element, ptions, sheetInfo) {
        this.EditorObject = null;
        this.EditorIndex = 0;
        $.MvcSheetUI.Controls.SheetRichTextBox.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetRichTextBox.Inherit($.MvcSheetUI.IControl, {
        //控件渲染函数
        Render: function () {
            if (!this.Visiable) {
                $(this.Element).hide();
                return;
            }
            // 查看痕迹
            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            if (!this.Element.id) {
                alert("控件:" + this.DataField + "未设置ID");
                return;
            }
            //把属性重新渲染到页面上去
            // 移动端设置PlaceHolder
            if (this.IsMobile) {
                this.PlaceHolder = this.PlaceHolder || SheetLanguages.Current.PleaseInput;
                this.ionicInit($(this.Element), $.MvcSheetUI.IonicFramework);
            }
            $(this.Element).attr("PlaceHolder", this.PlaceHolder);
            //富文本在移动端显示为长文本样式
            if (this.RichTextBox && this.Editable && this.IsMobile) {
                this.RichTextBox = false;
            }

            var v;
            if ($.MvcSheetUI.SheetInfo.SheetMode == $.MvcSheetUI.SheetMode.Originate && !this.V) {
                v = this.DefaultValue || "";
            } else {
                v = this.V || "";
            }

            this.SetValue(v);

            if (this.RichTextBox && this.Editable && !this.IsMobile) {
                //if (typeof (CKEDITOR) == "undefined") {
                //    //动态加载
                //    $.ajax({
                //        url: _PORTALROOT_GLOBAL + "/WFRes/ckeditor/ckeditor.js",
                //        type: "GET",
                //        dataType: "script",
                //        async: false,//同步请求
                //        global: false
                //    });
                //    CKEDITOR.basePath = "http://" + location.host + _PORTALROOT_GLOBAL + "/WFRes/ckeditor/";
                //}

                // CKEDITOR.replace(this.Element.id);

                this.InitKindEditor();
            }
            //if (typeof (CKEDITOR) != "undefined" && this.RichTextBox && this.Editable) {  }
            if (!this.Editable) { this.SetReadonly(true); return; }

            if (this.ToolTip) {
                $(this.Element).attr("title", this.ToolTip);
            }

            $(this.Element).unbind("change.SheetRichTextBox").bind("change.SheetRichTextBox", [this], function (e) {
                e.data[0].Validate();
            });
        },
        ionicInit: function (element, ionic) {
            element.attr("rows", "4");
            element.parent().addClass("textarea");
        },
        InitKindEditor: function () {
            if (KindEditor == undefined) return;
            this.EditorIndex = KindEditor.instances.length;
            var index = this.EditorIndex;
            var sheetInfo = this.SheetInfo;
            KindEditor.SchemaCode = sheetInfo.SchemaCode;
            KindEditor.UserID = sheetInfo.UserID;
            KindEditor.BizObjectID = sheetInfo.BizObjectID;

			//update by luwei : 使用jsp上传
            this.EditorObject = KindEditor.create(this.Element, {
                cssPath: 'WFRes/editor/plugins/code/prettify.css',
                uploadJson: _PORTALROOT_GLOBAL + '/upload/upload_json.jsp',
                fileManagerJson: _PORTALROOT_GLOBAL + '/upload/file_manager_json.jsp',
                allowFileManager: true,
                items: [
                    'source', '|', 'undo', 'redo', '|', 'code', 'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter',
                    'justifyright', 'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                    'superscript', 'clearhtml', 'selectall', '|', 'fullscreen', '/',
                    'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'strikethrough',
                    'lineheight', 'removeformat', '|', 'image', 'table', 'hr', 'emoticons', 'anchor', 'link', 'unlink', '|', 'about'
                ],
                afterCreate: function () {
                    var self = this;
                    // 给KindEditor绑定paste事件，用于粘贴截图
                    $(self.edit.doc).on("paste", function (e) {
                        // 需支持HTML5
                        if (!(!!window.ActiveXObject || "ActiveXObject" in window) && typeof(Worker) === "undefined") {
                            return;
                        }

                        var itmes = (e.clipboardData || e.originalEvent.clipboardData).items,
                            blob = null,
                            i,
                            length;

                        for (i = 0, length = itmes.length; i < length; i++) {
                            if (itmes[i].type.indexOf("image") === 0) {
                                blob = itmes[i].getAsFile();
                                break;
                            }
                        }

                        if (blob) {
                            var data = new FormData();
                            data.append("imgFile", blob, "screenshot.png");
                            data.append("BizObjectID", sheetInfo.BizObjectID);
                            data.append("UserID", sheetInfo.UserID);
                            data.append("SchemaCode", sheetInfo.SchemaCode);
                            data.append("EditorIndex", index);

                            $.ajax({
                                url: _PORTALROOT_GLOBAL + "/WFRes/editor/asp.net/upload_json.ashx",
                                type: "POST",
                                data: data,
                                cache: false,
                                processData: false, // 告诉jQuery不要去处理发送的数据
                                contentType: false, // 告诉jQuery不要去设置Content-Type请求头
                                dataType: "json",
                                success: function (data) {
                                    if (data.error === 0) {
                                        KindEditor.instances[data.editorIndex].insertHtml("<img src=\"" + data.url + "\" alt=\"\" /> ");
                                    }
                                }
                            });
                        }
                    });
                }
            });
        },
        SetReadonly: function (v) {
            if (v) {
                $(this.Element).hide();

                //var parentContainer = $("<div class=\"SheetRichTextBox\"></div>");
                var parentContainer = $("<label class=\"SheetRichTextBox\"></div>");
                // style=\"overflow: auto;\"
                var contentValue = this.Element.value;
                //update by ouyangsk 调整white-space样式，处理AutoTrim无效的问题
                //parentContainer.html("<div style=\"overflow-x:auto;display:block;white-space:normal;padding:7px 0;\" id=\"divRich_" + this.Element.id + "\">" + contentValue + "</div>")
                //    .insertAfter($(this.Element));

                 //update by xl@Future
                //去除<>转义 解决长文本内容 不换行问题
                // contentValue = contentValue.replace(/\"/g,"&quot;");
                // contentValue = contentValue.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                // 对于富文本 有两种方案
                // 1.过滤标签
                // 2.列白名单加属性
                // var html = filterXSS(contentValue,{
                //     onTag : function (tag, html, options) {
                //         console.log(tag, html, options)
                //         if (tag === 'script') {
                //             // 不对其属性列表进行过滤
                //             return filterXSS(html);
                //         } else {
                //             return html
                //         }
                //     }
                // });

                var html = filterXSS(contentValue,{
                    whiteList: {
                        div: ['style'],
                        p: ['style'],
                        span: ['style'],
                        a: ['style'],
                        br: ['style'],
                        b: ['style'],
                        em: ['style'],
                        i: ['style'],
                        strong: ['style']
                    }
                });

                parentContainer.html("<div style=\"overflow-x:auto;display:block;white-space:inherit;padding:7px 0;\" id=\"divRich_" + this.Element.id + "\">" + html + "</div>")
                	.insertAfter($(this.Element));

                if (this.IsMobile) {
                    var defaults = { ox: 0, oy: 0, cx: 0, cy: 0 };
                    this.Element.addEventListener("touchstart", function () {
                        defaults.ox = event.targetTouches[0].pageX;
                        defaults.oy = event.targetTouches[0].pageY;
                        //console.log("ox->" + defaults.ox + ",oy->" + defaults.oy);
                        //if (window.navigator.userAgent.toLowerCase().indexOf("android") == -1) {
                        //    $(this).parent().trigger("touchstart");
                        //    event.stopPropagation();
                        //}
                    });
                    this.Element.addEventListener("touchmove", function () {
                        defaults.cx = event.targetTouches[0].pageX;
                        defaults.cy = event.targetTouches[0].pageY;
                        // 左右滑动大于上下滑动
                        if (Math.abs(defaults.cy - defaults.oy) < Math.abs(defaults.cx - defaults.ox)) {
                            event.stopPropagation();
                        }
                    });
                }

                parentContainer.find("p").each(function () {
                    var indent = $(this).css("text-indent");
                    if (indent) {
                        indent = parseInt(indent.replace("px", ""));
                        if (indent < 0) {
                            $(this).css("text-indent", 0);
                        }
                    }
                });
                //.html(this.Element.value)
                //.insertAfter($(this.Element));
            } else {
                $(this.Element).show();
                if ($(this.Element).next().hasClass("Readonly")) $(this.Element).next().remove();
            }
        },
        // 数据验证
        Validate: function (effective, initValid) {
            if (!this.Editable) return true;
            if (initValid) {
                if (this.Required && !this.GetValue()) {
                    this.AddInvalidText(this.Element, "*", false);
                    return false;
                }
            }
            if (!effective) {
                // 必填验证
                var v = this.GetValue();
                if (this.Required && !this.DoValidate(this.Valid.Required, [v], "*")) {
                    return false;
                }
                if (this.RegularExpression) {
                    if (!this.DoValidate(this.Valid.RegularExpression, [v, this.RegularExpression], this.RegularInvalidText)) {
                        return false;
                    }
                }
            }
            return true;
        },
        // 获取值
        GetValue: function () {
            var value;
            if (this.EditorObject != null && this.EditorObject != "" && typeof (this.EditorObject) != "undefined" && this.RichTextBox) { // 富文本框
                value = this.EditorObject.html();
            } else {
                value = $(this.Element).val();
            }
            if (this.AutoTrim) {
                value = value.trim()
            }
            return value;
        },
        // 设置值
        SetValue: function (val) {
        // if(this.RichTextBox){
        // 		//update by xl@Future
        // 		val = val ? val.replace(/\</g,"&lt;"):val;
        // 		val = val ? val.replace(/\>/g,"&gt;"):val;
        // 		val = val ? val.replace(/\"/g,"&quot;"):val;
        // 	}
            if (this.RichTextBox && this.EditorObject) { // 富文本框
                this.EditorObject.html(val);
            } else {
                if (!this.RichTextBox && !this.Editable) {
                    val = val.replace(/\n/g, "<br>");
                }
                // console.log(val,'val');
                $(this.Element).val(val);
            }
        },
        // 设置焦点
        SetFocus: function () {
            if (this.RichTextBox) { // 富文本框
                // return CKEDITOR.instances[this.Element.id].focus();
                this.EditorObject.focus();
            } else {
                return this.Element.focus();
            }
        },
        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Editable) return result;
            result[this.DataField] = this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }
            var v = this.GetValue();
            if (result[this.DataField].V != v) {
                result[this.DataField].V = v;
                return result;
            }
            return {};
        }
    });
})(jQuery);
/// <reference path="../MvcSheetUI.js" />

//文本框(SheetTextBox/SheetBizTextBox/SheetTime)
(function ($) {
    // 控件执行
    // 参数{AutoTrim:true,DefaultValue:datavalue,OnChange:""}
    //可以通过  $("#id").SheetTextBox(参数)  来渲染控件和获取控件对象
    $.fn.SheetTextBox = function () {
        return $.MvcSheetUI.Run.call(this, "SheetTextBox", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetTextBox = function (element, options, sheetInfo) {
        this.TextRightAlign = false; // 全局是否右对齐
        this.NumberRightAlign = false; // 数值是否右对齐
        $.MvcSheetUI.Controls.SheetTextBox.Base.constructor.call(this, element, options, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetTextBox.Inherit($.MvcSheetUI.IControl, {
        //控件渲染函数
        Render: function () {
            if (!this.Visiable && !this.Editable) {
                this.Element.style.display = "none";
                return;
            }
            // 查看痕迹
            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            // 移动端设置PlaceHolder
            if (this.IsMobile) {
                //添加手机拍照识别二维码
                // if(this.Type == "SheetTextBox" && this.Editable) {
                //     var that = this;
                //     var input = $('<input class="inputCamera" type="file" tabindex=-1 accept="audio/*;capture=microphone" />');
                //     var camera = $('<i class="icon ion-camera sheet-text-camera"></i>');
                //     $(this.Element).after(camera);
                //     $(this.Element).after(input);
                //     $(this.Element).parent().css('position','relative');
                //     $(this.Element).css('padding-right','20px');
                //     camera.css({'position':'absolute','right':'0','font-size':'26px','top':'4px'});
                //     input.css('cssText','position:absolute !important;right:0;width:20px;height:30px:right:0;top:0;z-index:99;opacity:0');
                //     $(this.Element).siblings('input').on("change",function (e) {
                //         $.LoadingMask.Show('识别中', false);
                //         var node= e.target;
                //         var reader = new FileReader();
                //         reader.onload = function() {
                //             node.value = "";
                //             qrcode.callback = function(res) {
                //                 if(res instanceof Error) {
                //                     $.LoadingMask.Hide();
                //                     alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
                //                 } else {
                //                     $(that.Element).val(res);
                //                     $.LoadingMask.Hide();
                //                 }
                //             };
                //             qrcode.decode(reader.result);
                //         };
                //         reader.readAsDataURL(node.files[0]);
                //     })
                // }
                this.PlaceHolder = this.PlaceHolder || SheetLanguages.Current.PleaseInput;
                // 微信端点击显示日期控件
                if ($.MvcSheetUI.IonicFramework.$rootScope.loginfrom == "wechat") {
                    this.Element.addEventListener("touchstart", function () {
                        event.stopPropagation();
                    });
                }
            }
            $(this.Element).attr("PlaceHolder", this.PlaceHolder);

            if ($.MvcSheetUI.SheetInfo.SheetMode == $.MvcSheetUI.SheetMode.Originate && !this.V) {
                if (this.DefaultValue) {
                    if (this.DefaultValue.indexOf("{") > -1 && this.DefaultValue.indexOf("}") > -1) {
                        var datafield = this.DefaultValue.replace("{", "").replace("}", "");
                        if (datafield) {
                            var data = $.MvcSheetUI.GetSheetDataItem(datafield, 0);
                            if (data)
                                $(this.Element).val(data.V);
                        }
                    } else
                        $(this.Element).val(this.DefaultValue);
                } else
                    $(this.Element).val("");
                //$(this.Element).val(this.DefaultValue || "");
                if (!this.DefaultValue && this.V !== "") {
                	//update by ouyangsk 下方SetReadonly会再次发送GetFormatValue请求，所以加上条件，这样使请求只发送一次
                	if (this.Editable) {
                		this.SetValue(this.V);
                	}
                }
            }
            else {
            	//update by ouyangsk 下方SetReadonly会再次发送GetFormatValue请求，所以加上条件，这样使请求只发送一次
            	if (this.Editable) {
            		if(this.DefaultValue && this.V == ""){
            			this.SetValue(this.DefaultValue);
            		}else{
            			this.SetValue(this.V);
            		}
            	}
            }

            if (!this.Editable) { // 不可编辑
                this.SetReadonly(true);
                this.SetValue(this.V);
                return;
            }
            if (this.TextRightAlign) $(this.Element).addClass("txtAlignRight");
            else if (this.NumberRightAlign && this.IsNubmer()) { $(this.Element).addClass("txtAlignRight"); }
            if (this.ToolTip) $(this.Element).attr("title", this.ToolTip);

            // 注册KeyDown事件
            $(this.Element).unbind("change.SheetTextBox").bind("change.SheetTextBox", [this], function (e) {
                e.data[0]._OnChange();
            });


            // 绑定焦点事件
            $(this.Element).unbind("focus.SheetTextBox").bind("focus.SheetTextBox", [this],
                function (e) {
                    if (e.data[0].FormatRule) {
                        this.value = this.value.replace(/,/g, "").replace(/$/g, "").replace(/¥/g, "");
                    }
                    if (e.data[0].OnFocus) {
                        e.data[0].RunScript(this, e.data[0].OnFocus);
                    }
                });
            // 注册KeyUp事件
            if (this.OnKeyUp) {
                $(this.Element).unbind("keyup.SheetTextBox").bind("keyup.SheetTextBox", [this], function (e) {
                    e.data[0].RunScript(this, e.data[0].OnKeyUp);
                });
            }
            // 注册KeyDown事件

            $(this.Element).unbind("keydown.SheetTextBox").bind("keydown.SheetTextBox", [this], function (e) {
                if (e.key == "Enter") return false;
                if (e.data[0].OnKeyDown) {
                    e.data[0].RunScript(this, e.data[0].OnKeyDown);
                }
            });
            // 失去焦点事件
            $(this.Element).unbind("blur.SheetTextBox").bind("blur.SheetTextBox", [this], function (e) {
                if (e.data[0].FormatRule && e.data[0].GetValue() != "") {
                    e.data[0].GetFromatValue($(e.data[0].Element), e.data[0].GetValue());
                }
            });

            if (this.IsMobile) {
                //移动端的开窗查询
                this._mobilePopup();
            } else {
                this._createPopup();
            }
            //this.Validate();
        },
        decodeQrcode: function(base64) {
            let self = this
            // $('#screenshot_img').attr('src', base64)
            qrcode.decode(base64)
            qrcode.callback = function(imgMsg) {
                if (!self.visible) {
                    return
                }
                if (imgMsg == 'error decoding QR Code') {
                    setTimeout(function() {
                        //截图重新识别
                        self.screenShot()
                    }, 2000)
                } else {
                    alert(imgMsg)
                    window.location.href = imgMsg
                }
            }
        },
        IsNubmer: function () {
            return (this.LogicType == 7 || this.LogicType == 9 || this.LogicType == 35);
        },
        SetValue: function (v) {
            $(this.Element).val(v);
            $(this.Element).change();
            if (this.FormatRule) {
                this.GetFromatValue($(this.Element), v);
            }
            //移动
            if (this.IsMobile) {
                this.Mask.html(this.GetText());
            }
        },
        //移动端开窗
        _mobilePopup: function () {
            if (this.PopupWindow == "None") return;

            //1.隐藏当前输入框
            //2.增加显示返回值 a
            //3.增加图标提示点击事件
            //4.item 添加样式 item-icon-right
            //this.ViewInNewContainer = $(this.Element).parent();
            this.ID = $(this.Element).attr("Id");
            $(this.Element).hide();
            $(this.Element).parent().find("[id*=mask]").remove();
            $(this.Element).parent().find("i.icon").remove();
            this.Mask = $("<span></span>").insertAfter(this.Element).attr("id", "mask_" + this.ID);
            this.Mask.text(this.GetText());
            this.Mask.insertAfter(this.Element).attr("id", "mask_" + this.ID);
            var _that = this;
            if (_that.Editable) {
                this.pupIcon = $("<i class='icon ion-ios-arrow-right'></i>").insertAfter(this.Mask);
                $(this.Element).closest("div.item").addClass("item-icon-right");
                $(this.Element).parent().parent().unbind("click.query").bind("click.query", function () {
                    //跳转到查询页面
                    $.MvcSheetUI.IonicFramework.$state.go("form.sheetquery", { datafield: _that.DataField, rownum: $(this).find("[data-datafield='" + _that.DataField + "']").attr("data-row") });
                })
            }

        },
        AfterMobileEditShow: function () {
            if (this.PopupElement)
                this.PopupElement.SheetQuery().AfterMobileEditShow();
        },
        _createPopup: function () {
            var that = this;
            //开窗查询(DisplayText SchemaCode QueryCode InputMappings OutputMappings)
            if (this.PopupWindow === "PopupWindow") { //弹窗模式
                var displayText = this.DisplayText === "" ? "&nbsp;" : this.DisplayText;
                //update by xl@Future xss过滤 
                displayText = displayText.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                var popupDivId = "popupLink" + (new Date()).getTime();
                var outputParams = "";
                if (this.OutputMappings != "") {
                    outputParams = "&OutputParams=" + encodeURI(this.OutputMappings.replace(/,/g, "|").replace(/:/g, ","));
                }
                var w = that.PopupWidth ? that.PopupWidth : "600px";
                var h = that.PopupHeight ? that.PopupHeight : "400px";
                //弹窗div
                var popupDiv = "<div id='" + popupDivId + "' class='modal fade' tabindex='-1' role='dialog' aria-hidden='true'>"
                popupDiv += "<div class='modal-dialog'>";
                popupDiv += "<div class='modal-content' style='width:" + w + ";'>";
                popupDiv += "<div class='modal-header'>";
                popupDiv += "<button type='button' class='close' data-dismiss='modal'>";
                popupDiv += "<span aria-hidden='true'>&times;</span></button>";
                popupDiv += "<h4 class='modal-title'>" + displayText  + "</h4>";
                popupDiv += "</div><div class='modal-body'>";
                popupDiv += "<iframe scrolling='no' frameborder='0' width='100%' height='" + h + "'></iframe>";
                popupDiv += "</div></div></div></div>";
                popupDiv = $(popupDiv);
                //弹窗按钮
                var popupLink = $("<a href='javascript:;'>" + displayText + "</a>");
                popupLink.click(function () {
                	// modify by kinson.guo@20180611 for 支持开窗复选 begin
                	var src = "";
                	var ctrlID = that.Element.id===undefined?"":that.Element.id;
                	if(ctrlID.indexOf("mutiselect") > -1){
                		 src = that.PortalRoot + "/admin/TabMaster.html?url=ListMasterDataNew.html&OpenType=1&IsPopup=1&SchemaCode=" + that.SchemaCode +
                         "&QueryCode=" + that.QueryCode + "&CtrlID=" + popupDivId + outputParams + that._getInputParam();
                	}else{
                		 src = that.PortalRoot + "/admin/TabMaster.html?url=ListMasterData.html&OpenType=1&IsPopup=1&SchemaCode=" + that.SchemaCode +
                        "&QueryCode=" + that.QueryCode + "&CtrlID=" + popupDivId + outputParams + that._getInputParam();
                	}
                	// modify by kinson.guo@20180611 for 支持开窗复选 end
                    popupDiv.find("iframe").attr("src", src);
                    popupDiv.modal("show");
                });
                //在Element后添加弹窗元素
                $(this.Element).after(popupLink).after(popupDiv);
                //弹窗页面双击回调函数(\Portal\WFRes\_Scripts\bizquery.js)
                window[popupDivId] = {};
                window[popupDivId].ListMasterCallBack = function (data) {
                    //将选择的记录值，赋值到界面元素
                    if (data) {
                        for (var field in data) {
                            $.MvcSheetUI.SetControlValue(field, data[field], that.GetRowNumber());
                        }
                    }
                    //关闭弹窗
                    popupDiv.modal("hide");
                };
            } else if (this.PopupWindow === "Dropdown") { //浮动层模式
                var popupDivId = "popupLink" + (new Date()).getTime();
                var outputParams = "";
                if (this.OutputMappings != "") {
                    outputParams = "&OutputParams=" + encodeURI(this.OutputMappings.replace(/,/g, "|").replace(/:/g, ","));
                }
                //浮动层div
                var popupDiv = $("<div style='display:none;z-index:9999;position:absolute;background-color:#f8f8f8;' id='" + popupDivId + "'><iframe scrolling='no' frameborder='0' width='550px' height='300px'></iframe></div>");

                //在Element后添加弹窗元素
                $(this.Element).after(popupDiv);

                //在Element后添加弹窗元素
                $(this.Element).after(popupLink).after(popupDiv);
                function showDownList() {
                    // modify by kinson.guo@20180611 for 下拉浮动框支持多选 begin
                    var src = "";
                    var SheetCode = $.MvcSheetUI.QueryString("SheetCode");
                    var ctrlID = that.Element.id==undefined?"":that.Element.id;
                    if(ctrlID.indexOf("mutiselect") > -1){
                        src = that.PortalRoot + "/admin/TabMaster.html?url=ListMasterDataNew.html&OpenType=1&IsPopup=1&SchemaCode=" + that.SchemaCode +
                            "&QueryCode=" + that.QueryCode + "&CtrlID=" + popupDivId + outputParams + that._getInputParam();
                    }else{
                        src = that.PortalRoot + "/admin/TabMaster.html?url=ListMasterData.html&OpenType=1&IsPopup=1&SchemaCode=" + that.SchemaCode +
                            "&QueryCode=" + that.QueryCode + "&CtrlID=" + popupDivId + outputParams + that._getInputParam();
                    }
                    // modify by kinson.guo@20180611 for 下拉浮动框支持多选 end
                    popupDiv.find("iframe").attr("src", src);
                    popupDiv.show();
                    var offset = $(that.Element).offset();
                    popupDiv.offset({ top: offset.top + $(that.Element).outerHeight() + 3, left: offset.left });
                }
                //给focus事件绑定浮动层方法
                $(this.Element).unbind("focus.Popup").bind("focus.Popup", function () {
                    showDownList();
                });
                //浮动层双击回调函数(\Portal\WFRes\_Scripts\bizquery.js)
                window[popupDivId] = {};
                window[popupDivId].ListMasterCallBack = function (data) {
                    //将选择的记录值，赋值到界面元素
                    if (data) {
                        for (var field in data) {
                            $.MvcSheetUI.SetControlValue(field, data[field], that.GetRowNumber());
                        }
                    }
                    //隐藏浮动层
                    popupDiv.hide();
                };
                //点击界面上的其它元素时，隐藏浮动层（浮动层为iframe，点击不会触发该事件）
                $(document).unbind("click." + popupDivId).bind("click." + popupDivId, function (e) {
                    if (!($(e.target).attr("type") == "text" &&
                            $(e.target).attr($.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase()) == that.DataField)) {
                        popupDiv.hide();
                    }
                })
            }
        },
        _getInputParam: function () {
            var inputParam = "";
            if (this.InputMappings) {
                var items = this.InputMappings.split(",");
                for (var i = 0; i < items.length; i++) {
                    var fields = items[i].split(":");
                    if (fields && fields.length == 2) {
                        if (fields[0] && $.MvcSheetUI.GetSheetDataItem(fields[0], this.GetRowNumber())) {
                            inputParam += fields[1] + "," + $.MvcSheetUI.GetControlValue(fields[0], this.GetRowNumber()) + "|";
                        }
                    }
                }
                if (inputParam) {
                    inputParam = "&InputParam=" + encodeURI(inputParam.substring(0, inputParam.length - 1));
                }
            }
            return inputParam;
        },
        SetReadonly: function (v) {
            if (v) {
                $(this.Element).hide();
                var that = this;
                var lbl = $("<label for='" + $(that.Element).attr("id") + "'></label>");
                if (this.TextRightAlign) lbl.addClass("txtAlignRight").css("width", $(this.Element).width());
                else if (this.NumberRightAlign && this.IsNubmer()) { lbl.addClass("txtAlignRight"); }
                var val = $.trim(this.V);
                if (val != "") {
                    var strs = val.split("\n");
                    $(strs).each(function (i) {
                        if (i > 0) {
                            lbl.append("<br />");
                        }
                        lbl.append($("<span></span>").text(this.toString()));
                    });
                }
                lbl.insertAfter($(this.Element));
                this.GetFromatValue(lbl,  val);
                //移动
                if (this.IsMobile) {
                    this.Mask.html(this.GetText());
                }
            } else {
                $(this.Element).show();
                $(this.Element).next().remove();
            }
        },
        //值改变事件
        _OnChange: function (e) {
            // 执行验证
            this.Validate();

            if (this.OnChange) {
                //执行绑定事件
                this.RunScript(this.Element, this.OnChange);
            }

            //是否自动去除前后空格
            if (this.AutoTrim) {
                this.Value = that.Value.trim();
            }
        },
        // 数据验证
        Validate: function (effective, initValid) {
            if (!this.Editable) return true;
            if (initValid) {
                if (this.Required && !this.GetValue()) {
                    this.AddInvalidText(this.Element, "*", false);
                    return false;
                }
            }
            var val = this.GetValue();
            if (!effective) {
                if ($(this.Element).attr("data-required") || this.O.indexOf("R") > -1) this.Required = true;
                else this.Required = false;
                // 必填验证
                if (this.Required && !this.DoValidate(this.Valid.Required, [val], "*")) {
                    this.ValidateResult = false;
                    return false;
                }
                if (this.RegularExpression && val) {
                	this.RegularInvalidText = this.RegularInvalidText.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\"/g,"&quot;");
                    if (!this.DoValidate(this.Valid.RegularExpression, [val, this.RegularExpression], this.RegularInvalidText)) {
                        this.ValidateResult = false;
                        return false;
                    }
                }
            }

            // 处理数据逻辑型验证
            switch (this.LogicType) {
                case $.MvcSheetUI.LogicType.Int:
                	if (!this.DoValidate(this.Valid.Integer, [val], SheetLanguages.Current.EnterInteger)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    if (!this.DoValidate(this.Valid.VerifyIntRange, [val], SheetLanguages.Current.VerifyIntRange)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    break;
                case $.MvcSheetUI.LogicType.Long:
                    if (!this.DoValidate(this.Valid.Integer, [val], SheetLanguages.Current.EnterInteger)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    if (!this.DoValidate(this.Valid.VerifyLongRange, [val], SheetLanguages.Current.VerifyLongRange)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    break;
                case $.MvcSheetUI.LogicType.Double:
                    if (!this.DoValidate(this.Valid.Number, [val], SheetLanguages.Current.EnterNumber)) {
                        this.ValidateResult = false;
                        return false;
                    }
                    break;
                default:
                    break;
            }
            this.ValidateResult = true;
            return true;
        },
        //返回数据值
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = $.MvcSheetUI.GetSheetDataItem(this.DataField); // this.SheetInfo.BizObject.DataItems[this.DataField];
            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }

            // if (("" + result[this.DataField].V) != this.GetValue())
            {
                this.RefreshDataTrackLink();
                result[this.DataField].V = this.GetValue().trim();
                return result;
            }

            return {};
        }
    });
})(jQuery);
// SheetTime控件
//引用WdatePicker.js
//$.ajax({
//    url: _PORTALROOT_GLOBAL + "/WFRes/_Scripts/Calendar/WdatePicker.js",
//    type: "GET",
//    dataType: "script",
//    async: false,
//    cache: true,
//    global: false
//});

;
(function ($) {
    //控件执行
    $.fn.SheetTime = function () {
        return $.MvcSheetUI.Run.call(this, "SheetTime", arguments);
    };


    $.MvcSheetUI.Controls.SheetTime = function (element, options, sheetInfo) {
        //update by luxm
        element.removeAttribute("data-viewinnewcontainer");
        $.MvcSheetUI.Controls.SheetTime.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetTime.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
            // console.log(this.V,'this.V')
            var $element = $(this.Element),
                dataFieldValue = this.V,
                that = this;
            //是否可见
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }

            //设置初始化值
            var displayDate;
            //发起模式
            //update by luxm 驳回后添加子表日期没有默认值，增加判断后还未发现其它bug
            // console.log(this.Originate,this.Editable,dataFieldValue,this.DefaultValue, '-------------------')
            if (this.Originate && this.Editable || this.Editable && !dataFieldValue && this.DefaultValue === "CurrentTime") {
                // console.log(dataFieldValue, 'dataFieldValue---')
                if (dataFieldValue && dataFieldValue !== "0001-01-01 00:00:00" && dataFieldValue !== "1753-01-01 00:00:00" && dataFieldValue !== "9999-12-31 00:00:00") {
                    displayDate = new Date(Date.parse(dataFieldValue.replace(/-/g, "/")));
                    // displayDate = '';
                    // console.log(displayDate, 'displayDate---')
                } else if (this.DefaultValue === "CurrentTime") {
                    displayDate = new Date();
                    // console.log(this.DefaultValue, 'this.DefaultValue');
                } else {
                    var ms = Date.parse(this.DefaultValue.replace(/-/g, "/"));
                    if (!isNaN(ms)) {
                        displayDate = new Date(ms);
                    }
                }
            } else {
                // console.log(dataFieldValue, 'dataFieldValue---')
                if ((this.DefaultValue === '' || this.DefaultValue == undefined)
                    && this.V.toString() == "1970-01-01 00:00:00") {
                    displayDate = "";
                } else if (dataFieldValue) {
                    if (dataFieldValue == "0001-01-01 00:00:00" || dataFieldValue == "1753-01-01 00:00:00" || dataFieldValue == "9999-12-31 00:00:00") {
                        displayDate = "";
                    } else {
                        displayDate = new Date(Date.parse(dataFieldValue.replace(/-/g, "/")));
                    }
                    if (dataFieldValue == "1970-01-01 00:00:00") {
                        displayDate = new Date();
                    }
                } else {
                    displayDate = "";
                }
            }
            //始化日期为空
            if (this.DefaultValue == "LBInitTime") {
                displayDate = "";
            }
            //不可编辑
            if (!this.Editable) {
                $element.after("<label style='width:100%;'>" + this._getDateTimeFormatString(displayDate).replace(/T/g, " ").replace("/Z/g", "") + "</label>");
                $element.hide();
                return;
            }

            //移动端
            if (this.IsMobile) {
                //移动端使用HTML5原生日期时间选择控件
                var inputType;
                switch (this.TimeMode) {
                    case "FullTime":
                    case "SimplifiedTime":
                        inputType = "datetime-local";
                        break;
                    case "OnlyDate":
                        inputType = "date";
                        break;
                    case "OnlyTime":
                        inputType = "time";
                        break;
                    default:
                        inputType = "date";
                        break;
                }
                $element.attr("type", "text");
                $element.attr('placeholder', SheetLanguages.Current.PleaseInput);
                var that = this;
                //通过IONIC初始化控件
                this.ionicInit(that, $element, inputType, $.MvcSheetUI.IonicFramework);
                var ua = window.navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == 'micromessenger' && ua.toLowerCase().indexOf("android") > -1) {
                    // $element.attr("disabled", true).css("color", "#000");
                }
                // 微信端点击显示日期控件
                this.Element.addEventListener("touchend", function () {
                    event.stopPropagation();
                });
                this.Element.addEventListener("touchstart", function () {
                    event.stopPropagation();
                });
                $element.val(this._getDateTimeFormatString(displayDate).replace("T", " "));
                //绑定change事件
                var that = this;
                $element.unbind("change.SheetTime").bind("change.SheetTime", function () {
                    that.Validate();
                    if (that.OnChange) {
                        that.RunScript(this, that.OnChange);
                    }
                });
            } else {
                // 查看痕迹
                if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) {
                    this.RenderDataTrackLink();
                }

                $element.val(this._getDateTimeFormatString(displayDate));

                //绑定click事件
                $element.attr("onclick", "WdatePicker(" + this._getWdatePickerJson() + ")");
                $element.attr("autocomplete", "off");

                // 绑定修改事件
                $element.attr("onchange", ""); //这行鬼东西不能少，否则无法触发change事件(可能由于WdatePicker的影响)

                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    $element[0].onchange = function () {
                        that.Validate();
                        if (that.OnChange) {
                            that.RunScript(this, that.OnChange);
                        }
                    };
                } else {
                    $element.unbind("change.SheetTime").bind("change.SheetTime", function () {
                        that.Validate();
                        if (that.OnChange) {
                            that.RunScript(this, that.OnChange);
                        }
                    });
                }

                //MinValue设置为另外一个控件的数据项，那个控件失去焦点时，重新设置minDate
                if (this.MinValue != "CurrentTime" && isNaN(Date.parse(this.MinValue.replace(/-/g, "/")))) {
                    var $control = $.MvcSheetUI.GetElement(this.MinValue);
                    if ($control) {
                        $control.unbind("blur.MinValue").bind("blur.MinValue", function () {
                            $element.attr("onclick", "WdatePicker(" + that._getWdatePickerJson() + ")");
                        });
                    }
                }
                //MaxValue设置为另外一个控件的数据项，那个控件失去焦点时，重新设置maxDate绑定focus
                if (this.MaxValue != "CurrentTime" && isNaN(Date.parse(this.MaxValue.replace(/-/g, "/")))) {
                    var $control = $.MvcSheetUI.GetElement(this.MaxValue);
                    if ($control) {
                        $control.unbind("blur.MaxValue").bind("blur.MaxValue", function () {
                            $element.attr("onclick", "WdatePicker(" + that._getWdatePickerJson() + ")");
                        });
                    }
                }
            }
        },
        ionicInit: function (that, element, inputType, ionic) {
            element.attr("readonly", "readonly");
            ionic.$scope.dateTimeTitle = "选择日期";
            var elementName = that.DataField.replace(".", "") + "element";
            ionic.$scope[elementName] = element;
            ionic.$scope.cancelClick = function (element) {
                element.val('');
            }
            element.parent().parent().attr("ion-datetime-picker", "");
            element.parent().parent().attr("data-title", "dateTimeTitle");
            element.parent().parent().attr("cancel-Click", "cancelClick");
            element.parent().parent().attr("element", elementName);
            element.parent().parent().attr(inputType, "");
            if (that.TimeMode != "SimplifiedTime")
                element.parent().parent().attr("seconds", "");
            var ngmodel = that.DataField + that.Options.RowNum;
            element.parent().parent().attr("ng-model", ngmodel);
            ionic.$compile(element.parent().parent())(ionic.$scope);
            ionic.$scope[ngmodel] = new Date();
            ionic.$scope.$watch(ngmodel, function (newVal, oldVal) {


                //update by luxm
                //移动端时间范围设置不生效
                var ms = new Date(Date.parse(that.MinValue.replace(/-/g, "/")));
                var mx = new Date(Date.parse(that.MaxValue.replace(/-/g, "/")));
                if (newVal && newVal < ms) {
                    alert("不能小于设置的最小时间");
                } else if (newVal > mx) {
                    alert("不能大于设置的最大时间");
                } else {
                    if (newVal == "Invalid Date" || newVal === oldVal) return;
                    if (!newVal) that._SetValue("");
                    else
                        that._SetValue(new Date(newVal));
                    that.RunScript(element, that.OnChange);
                    //修改不触发onchang事件问题
                    element.change();
                    that.Validate();
                }
            });
        },
        /* Validate: function (effective, initValid) {
             if (!this.Editable) return true;
             if (!effective) {
                 if ($(this.Element).attr("data-required") || this.O.indexOf("R") > -1) this.Required = true;
                 else this.Required = false;
                 // 必填验证
                 if (this.Required && !this.DoValidate(this.Valid.Required, [val], "*")) {
                     this.ValidateResult = false;
                     return false;
                 }
                 if (this.RegularExpression && val) {
                     if (!this.DoValidate(this.Valid.RegularExpression, [val, this.RegularExpression], this.RegularInvalidText)) {
                         this.ValidateResult = false;
                         return false;
                     }
                 }
             }
             var val = this.GetValue();
             var minDate = this.MinValue;
             var maxDate = this.MaxValue;

             var ms = new Date(Date.parse(minDate.replace(/-/g, "/")));
             var mx = new Date(Date.parse(maxDate.replace(/-/g, "/")));
             var newDate = new Date(Date.parse(val.replace(/-/g, "/")));
             if(val == "" && (minDate != "" || maxDate != "")){
                 return false;
             }

             //update by luwei
             if (this.IsMobile && typeof(newVal) !== "undefined" && newVal && (newVal < ms ||newVal > mx)) {
                  return false;
             }
            return true;
         },*/
        MobilePreBack: function () {

            //返回时，检查wdatepicker是否关闭
            if ($dp && typeof ($dp.hide) == "function") {
                $dp.hide();
            }
            return true;
        },
        //根据TimeMode返回对应格式的字符串
        _getDateTimeFormatString: function (dateTime) {
            if (!dateTime) {
                return "";
            }
            var month = dateTime.getMonth() + 1 < 10 ? ("0" + (dateTime.getMonth() + 1)) : (dateTime.getMonth() + 1);
            var day = dateTime.getDate() < 10 ? ("0" + dateTime.getDate()) : dateTime.getDate();
            var hour = dateTime.getHours() < 10 ? ("0" + dateTime.getHours()) : dateTime.getHours();
            var minute = dateTime.getMinutes() < 10 ? ("0" + dateTime.getMinutes()) : dateTime.getMinutes();
            var second = dateTime.getSeconds() < 10 ? ("0" + dateTime.getSeconds()) : dateTime.getSeconds();

            var date = dateTime.getFullYear() + "-" + month + "-" + day;
            var time = hour + ":" + minute + ":" + second;
            var stime = hour + ":" + minute;
            switch (this.TimeMode) {
                case "OnlyDate":
                    return date;
                    break;
                case "FullTime":
                    return date + " " + time;
                    break;
                case "OnlyTime":
                    return time;
                    break;
                case "SimplifiedTime":
                    return date + " " + stime;
                    break;
                default:
                    return date;
                    break;
            }
        },
        //构造WdatePickerJson
        _getWdatePickerJson: function () {
            if (this.WdatePickerJson != "") {
                return this.WdatePickerJson;
            } else {
                var p = "";
                switch (this.TimeMode) {
                    case "OnlyDate":
                        p += "dateFmt:'yyyy-MM-dd'";
                        break;
                    case "FullTime":
                        p += "dateFmt:'yyyy-MM-dd HH:mm:ss'";
                        break;
                    case "OnlyTime":
                        p += "dateFmt:'HH:mm:ss'";
                        break;
                    case "SimplifiedTime":
                        p += "dateFmt:'yyyy-MM-dd HH:mm'";
                        break;
                    default:
                        p += "dateFmt:'yyyy-MM-dd'";
                        break;
                }

                var minValue;
                if (this.MinValue != "") {
                    if (this.MinValue == "CurrentTime") {
                        minValue = new Date();
                    } else {
                        var ms = Date.parse(this.MinValue.replace(/-/g, "/"));
                        if (!isNaN(ms)) {
                            minValue = new Date(ms);
                        } else {
                            var $control = $(":text[" + $.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase() +
                                "='" + this.MinValue + "']");
                            if ($control) {
                                var ms = Date.parse($control.val().replace(/-/g, "/"));
                                if (!isNaN(ms)) {
                                    minValue = new Date(ms);
                                }
                            }
                        }
                    }
                }
                if (minValue != undefined) {
                    p += ",minDate:'" + this._getDateTimeFormatString(minValue) + "'";
                }

                var maxValue;
                if (this.MaxValue != "") {
                    if (this.MaxValue == "CurrentTime") {
                        maxValue = new Date();
                    } else {
                        var ms = Date.parse(this.MaxValue.replace(/-/g, "/"));
                        if (!isNaN(ms)) {
                            maxValue = new Date(ms);
                        } else {
                            var $control = $(":text[" + $.MvcSheetUI.PreDataKey + $.MvcSheetUI.DataFieldKey.toLowerCase() +
                                "='" + this.MaxValue + "']");
                            if ($control) {
                                var ms = Date.parse($control.val().replace(/-/g, "/"));
                                if (!isNaN(ms)) {
                                    maxValue = new Date(ms);
                                }
                            }
                        }
                    }
                }
                if (maxValue != undefined) {
                    p += ",maxDate:'" + this._getDateTimeFormatString(maxValue) + "'";
                }
                return "{" + p + "}";
            }
        },
        GetText: function () {
            return $(this.Element).val().replace(/T/g, " ").replace(/Z/g, "");
        },
        SetValue: function (obj) {
            if (obj) {
                if (Array.isArray(obj) && obj.length === 1) {
                    obj = obj[0];
                }
                var stamp = Date.parse(obj.replace(/T/g, " ").replace(/-/g, "/"));
                if (!isNaN(stamp)) {
                    var date = new Date(stamp);
                    $(this.Element).val(this._getDateTimeFormatString(date));
                }
            }
        },
        _SetValue: function (obj) {
            //if (obj) {
            var value = this._getDateTimeFormatString(obj);
            value = value.replace("T", " ");
            $(this.Element).val(value);
            //  }
        },
        GetValue: function () {
            var v = null;
            if (this.Editable) {
                v = $(this.Element).val();
            } else {
                v = $(this.Element).siblings('label').html();
            }
            return v;
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;

            if (this.DataField) {
                var dataFieldItem = $.MvcSheetUI.GetSheetDataItem(this.DataField);
                if (dataFieldItem) {
                    var value = $(this.Element).val();
                    //如果为OnlyTime 需要补全年月日，否则数据无法保存
                    if (this.TimeMode == "OnlyTime") {
                        value = "1970-01-01 " + value;
                    }
                    result[this.DataField] = dataFieldItem;
                    result[this.DataField].V = value;
                } else {
                    if (this.DataField.indexOf(".") == -1) {
                        alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                    }
                }
            }
            return result;
        }
    });
})(jQuery);
// SheetTimeSpan控件
;
(function ($) {
    //控件执行
    $.fn.SheetTimeSpan = function () {
        return $.MvcSheetUI.Run.call(this, "SheetTimeSpan", arguments);
    };

    $.MvcSheetUI.Controls.SheetTimeSpan = function (element, options, sheetInfo) {
        $.MvcSheetUI.Controls.SheetTimeSpan.Base.constructor.call(this, element, options, sheetInfo);
    };

    $.MvcSheetUI.Controls.SheetTimeSpan.Inherit($.MvcSheetUI.IControl, {
        Render: function () {
        	if(this.V != null && this.V.indexOf(",") > 0){
        		this.V = this.V.replace(/,/g,"");
        	}
            var that = this;
            $element = $(this.Element);

            //是否可见
            if (!this.Visiable) {
                $element.hide();
                return;

            }
            // 查看痕迹
            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }
            var timespan = this._getTimeSpan(this.V);
            if (this.Editable) {
                var height = this.IsMobile ? "35px" : "30px";
                this.$dayElement = $("<input type='number' min='0' max='99999999' style='width:58px;height:" + height + ";padding-left:3px;margin:0px 2px 0px 0px' />").val(timespan.day);
                this.$hourElement = $("<input type='number' min='0' max='23' style='width:39px;height:" + height + ";padding-left:3px;margin:0px 2px 0px 2px;' />").val(timespan.hour);
                this.$minuteElement = $("<input type='number' min='0' max='59' style='width:39px;height:" + height + ";padding-left:3px;margin:0px 2px 0px 2px' />").val(timespan.minute);
                this.$secondElement = $("<input type='number' min='0' max='59' style='width:39px;height:" + height + ";padding-left:3px;margin:0px 2px 0px 2px' />").val(timespan.second);

                $element.append(this.$dayElement, document.createTextNode(SheetLanguages.Current.Day),
                    this.$hourElement, document.createTextNode(SheetLanguages.Current.Hour),
                    this.$minuteElement, document.createTextNode(SheetLanguages.Current.Minute),
                    this.$secondElement, document.createTextNode(SheetLanguages.Current.Second));

                //天
                this.$dayElement.unbind("keyup.SheetTimeSpan").bind("keyup.SheetTimeSpan", function (e) {
                    var val = $(this).val();
                    if (!that._isDay(val)) {
                        $(this).val("0");
                        that._focusText(this);
                    //add by luwei : 限制时间段天数的长度为8，即最大值99999999
                    } else if (val.length > 8) {
                    	$(this).val("0");
                        that._focusText(this);
                    }
                });
                //时
                this.$hourElement.unbind("keyup.SheetTimeSpan").bind("keyup.SheetTimeSpan", function () {
                    var val = $(this).val();
                    if (!that._isHour(val)) {
                        $(this).val("0");
                        that._focusText(this);
                    }
                });
                //分
                this.$minuteElement.unbind("keyup.SheetTimeSpan").bind("keyup.SheetTimeSpan", function () {
                    var val = $(this).val();
                    if (!that._isMinuteOrSecond(val)) {
                        $(this).val("0");
                        that._focusText(this);
                    }
                });
                //秒
                this.$secondElement.unbind("keyup.SheetTimeSpan").bind("keyup.SheetTimeSpan", function () {
                    var val = $(this).val();
                    if (!that._isMinuteOrSecond(val)) {
                        $(this).val("0");
                        that._focusText(this);
                    }
                });

                $element.find("input").unbind("focus.SheetTimeSpan").bind("focus.SheetTimeSpan", function () {
                    that._focusText(this);
                });

                $element.find("input").unbind("change.SheetTimeSpan").bind("change.SheetTimeSpan", function () {
                    that.Validate();
                    if (that.OnChange) {
                        that.Element.value = that.GetValue();
                        that.RunScript(that.Element, that.OnChange);
                    }
                });
            } else {
                $element.after("<label style='width:100%;'>" + this._getLabelText(timespan) + "</label>");
                $element.hide();
            }
        },
        _focusText: function (input) {
            if (this.IsMobile && $.os.ios) {
                input.setSelectionRange(0, 9999);
            } else {
                $(input).select();
            }
        },
        RenderMobile: function () {
            //可编辑
            if (this.Editable) {
                this.constructor.Base.RenderMobile.apply(this);
                var that = this;
                if (that._isNotEmpty()) {
                    that.Mask.css({ 'color': '#2c3038' });
                } else {
                    that.Mask.css({ 'color': '#797f89' });
                }
                this.ionicInit(that, $.MvcSheetUI.IonicFramework);
            } else {
                this.Render();
            }
        },
        ionicInit: function (that, ionic) {
            
            that.Mask.parent().parent().unbind("click.showTimespan").bind("click.showTimespan", function () {
                ionic.$scope.data = {
                    day: that.$dayElement.val() - 0,
                    hour: that.$hourElement.val() - 0,
                    min: that.$minuteElement.val() - 0,
                    second: that.$secondElement.val() - 0,
                    dataField: that.DataField
                };
                ionic.$ionicPopup.show({
                    templateUrl: 'Mobile/form/templates/timeSpanTemp.html',
                    title: '填写时间段',
                    scope: ionic.$scope,
                    cssClass: 'timespan-popup',
                    buttons: [{
                        text: SheetLanguages.Current.Cancel,
                        onTap: function (e) { }
                    },
                    {
                        text: '<b>' + SheetLanguages.Current.OK + '</b>',
                        type: 'button-calm',
                        onTap: function (e) {
                            that.$dayElement.val(ionic.$scope.data.day);
                            that.$hourElement.val(ionic.$scope.data.hour);
                            that.$minuteElement.val(ionic.$scope.data.min);
                            that.$secondElement.val(ionic.$scope.data.second);
                            that.Validate();                            
                            that._SetValue(ionic.$scope.data);
                            // console.log(ionic.$scope.data);
                        }
                    }
                    ]
                });
                ionic.$scope.DateChange = function (type) {
                    if (type == "day") {
                    	var day = ionic.$scope.data.day || 0;
                        day = day < 0 ? 0 : day > 99999999 ? 99999999 : day;
                        ionic.$scope.data.day = day;
                    } else if (type == "hour") {
                        var hour = ionic.$scope.data.hour || 0;
                        hour = hour < 0 ? 0 : hour > 23 ? 23 : hour;
                        ionic.$scope.data.hour = hour;
                    } else if (type == "min") {
                        var min = ionic.$scope.data.min || 0
                        min = min < 0 ? 0 : min > 59 ? 59 : min;
                        ionic.$scope.data.min = min;
                    } else if (type == "second") {
                        var second = ionic.$scope.data.second || 0;
                        second = second < 0 ? 0 : second > 59 ? 59 : second;
                        ionic.$scope.data.second = second;
                    }

                    if (that.OnChange) {
                        that.Element.value = that.GetValue();
                        that.RunScript(that.Element, that.OnChange);
                    }
                }
            })
        },
        _getTimeSpan: function (text) {
            var timespan = {};
            if (text) {
                var pointIndex = text.indexOf(".");
                var time = text;
                if (pointIndex > -1) {
                    timespan.day = parseInt(text.substring(0, pointIndex));
                    time = text.substring(pointIndex + 1);
                }
                var timeArray = time.split(":");
                if (timeArray && timeArray.length == 3) {
                    timespan.hour = parseInt(timeArray[0]);
                    timespan.minute = parseInt(timeArray[1]);
                    timespan.second = parseInt(timeArray[2]);
                }
            }
            if (!timespan.day) { timespan.day = 0; }
            if (!timespan.hour) { timespan.hour = 0; }
            if (!timespan.minute) { timespan.minute = 0; }
            if (!timespan.second) { timespan.second = 0; }
            return timespan;
        },
        _isDay: function (val) {
            return /^\d+$/.test(val);
        },
        _isHour: function (val) {
            return /^([0-1]?[0-9]|2[0-3])$/.test(val);
        },
        _isMinuteOrSecond: function (val) {
            return /^[0-5]?[0-9]$/.test(val);
        },
        _getLabelText: function (timespan) {
            var labelText = "";
            if (timespan.day != 0) { labelText = timespan.day + SheetLanguages.Current.Day + timespan.hour + SheetLanguages.Current.Hour + timespan.minute + SheetLanguages.Current.Minute + timespan.second + SheetLanguages.Current.Second; } else if (timespan.hour != 0) { labelText = timespan.hour + SheetLanguages.Current.Hour + timespan.minute + SheetLanguages.Current.Minute + timespan.second + SheetLanguages.Current.Second; } else if (timespan.minute != 0) { labelText = timespan.minute + SheetLanguages.Current.Minute + timespan.second + SheetLanguages.Current.Second; } else { labelText = timespan.second + SheetLanguages.Current.Second; }
            return labelText;
        },
        GetText: function () {
            var text = "";
            var val = this.GetValue();
            if (val) {
                var timespan = this._getTimeSpan(val);
                return this._getLabelText(timespan);
            }
            return text;
        },
        GetValue: function () {
            if (!this.Editable) return this.V;
            var day = this.$dayElement.val();
            var hour = this.$hourElement.val();
            var minute = this.$minuteElement.val();
            var second = this.$secondElement.val();
            if (day || hour || minute || second) {
                return (day ? day : "0") + "." +
                    (hour ? hour : "0") + ":" +
                    (minute ? minute : "0") + ":" +
                    (second ? second : "0");
            } else {
                return null;
            }
        },
        SetValue: function (obj) {
            if (this.Editable) {
                var timespan = this._getTimeSpan(obj);
                if (timespan) {
                    this.$dayElement.val(timespan.day);
                    this.$hourElement.val(timespan.hour);
                    this.$minuteElement.val(timespan.minute);
                    this.$secondElement.val(timespan.second);
                }
                if (this.IsMobile) {
                    this.Mask.html(this.GetText());
                }
            }
        },
        _GetValue: function (obj) {
            var day = obj.day;
            var hour = obj.hour;
            var minute = obj.min;
            var second = obj.second;
            var text = "";
            if (day || hour || minute || second) {
                text = (day ? day : "0") + "." +
                    (hour ? hour : "0") + ":" +
                    (minute ? minute : "0") + ":" +
                    (second ? second : "0");
            } else {
                text = null;
            }
            return text;
        },
        _SetValue: function (obj) {
            if (this._isNotEmpty()) {
                this.Mask.css({ 'color': '#2c3038' });
            } else {
                this.Mask.css({ 'color': '#797f89' });
            }
            this.SetValue(this._GetValue(obj));
            this.Mask.html(this.GetText());
        },
        // 数据验证
        _isNotEmpty: function () {
            var day = parseInt(this.$dayElement.val());
            var hour = parseInt(this.$hourElement.val());
            var minute = parseInt(this.$minuteElement.val());
            var second = parseInt(this.$secondElement.val());
            return day || hour || minute || second;
        },
        Validate: function (effective, initValid) {
            if (!this.Editable) return true;

            if (initValid) {
                // 必填验证
                if (this.Required && !this._isNotEmpty()) {
                    this.AddInvalidText(this.Element, "*", false);
                    return false;
                }
            }

            if (!effective) {
                if (this.Required && !this.DoValidate(this._isNotEmpty, [], "*")) {
                    this.ValidateResult = false;
                    return false;
                }
            }

            this.ValidateResult = true;
            return true;
        },
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;

            if (this.DataField) {
                var dataFieldItem = $.MvcSheetUI.GetSheetDataItem(this.DataField);
                if (dataFieldItem) {
                    var value = this.GetValue();
                    //if (value.indexOf(".") > -1) {
                    //    //.在前端存在bug
                    //    value = value.replace(".", ".");
                    //}

                    //if (value && dataFieldItem.V != value)
                    {
                        result[this.DataField] = dataFieldItem;
                        result[this.DataField].V = value;
                    }
                } else {
                    if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                }
            }
            return result;
        }
    });
})(jQuery);
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
	                    url: "/SpecialWorkflowJump/JumpInstanceDetail",// 后台方法名称
	                    type: "GET",
	                    cache: false,
	                    async: false,//同步执行
	                    data: {instanceId: this.SheetInfo.InstanceId},
	                    dataType: "JSON",
	                    success: function (data) {
	                    	if(data.isSpecialWorkflow){
	                    	   isSpecialWorkflow=true;
	                          childrenWorkflowInstanceId=data.childrenWorkflowInstanceId;
	                         ;
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
﻿//选人控件
        (function ($) {
            // 控件执行
            // 参数{AutoTrim:true,DefaultValue:datavalue,OnChange:""}
            //可以通过  $("#id").SheetTextBox(参数)  来渲染控件和获取控件对象
            $.fn.SheetUser = function () {
                return $.MvcSheetUI.Run.call(this, "SheetUser", arguments);
            };
            //update by luxm第一次加载表单的时候没有走MappingControlsHandler中的if方法导致联动失效
            var isInit = true;
            // 构造函数
            $.MvcSheetUI.Controls.SheetUser = function (element, ptions, sheetInfo) {
                //console.log("$.MvcSheetUI.PortalRoot="+ $.MvcSheetUI.PortalRoot);
                // 选择数据集合
                this.Choices = {};
                // 所有选择的元素
                this.ChoicesElement = null;
                // 搜索输入框元素
                this.SearchElement = null;
                this.SearchTxtElement = null;
                this.SearchButton = null;
                // 获取选中的组织ID
                this.SelectedValue = null;
                // 获取当前搜索关键字
                this.SearchKey = null;
                this.SearchMode = false;
                this.KeyTime = null;
                // 搜索结果
                this.SearchResults = [];
                // 组织机构容器
                this.SelectorPanel = null;
                // 只在 Enter 进行搜索
                this.EnterSearch = true;
                this.OrgTreePanel = null;
                this.OrgListPanel = null;
                this.IsOverSelectorPanel = false;
                var url = $.MvcSheetUI.PortalRoot ? $.MvcSheetUI.PortalRoot: "/Portal";
                this.SheetUserHandler = $.MvcSheetUI.PortalRoot + "/SheetUser/LoadOrgTreeNodes";
                this.SheetGetUserProperty = $.MvcSheetUI.PortalRoot + "/SheetUser/GetUserProperty";
                this.SheetGetUserProperty =  url + "/SheetUser/GetUserProperty";
                // console.log($.MvcSheetUI.PortalRoot, '$.MvcSheetUI.PortalRoot--------------------')
                // console.log(this.SheetGetUserProperty, 'this.SheetGetUserProperty')
                this.ModelControl = null;
                $.MvcSheetUI.Controls.SheetUser.Base.constructor.call(this, element, ptions, sheetInfo);
            };

            // 继承及控件实现
            $.MvcSheetUI.Controls.SheetUser.Inherit($.MvcSheetUI.IControl, {
                //移动端
                RenderMobile: function () {
                    //baosc s
                    //初始展示当前用户OU人员  包括虚拟用户
                    //if ($.MvcSheetUI.SheetInfo.UserOUMembers || !this.UserVisible) {
                    //} else {
                    //    $.MvcSheetUI.SheetInfo.UserOUMembers = [];
                    //    var parentUnits = $.MvcSheetUI.SheetInfo.DirectParentUnits;
                    //    for (var key in parentUnits) {
                    //        var loadUrl = this.SheetUserHandler + "?IsMobile=true&ParentID=" + key + "&o=U";
                    //        $.ajax({
                    //            type: "GET",
                    //            url: loadUrl,
                    //            dataType: "json",
                    //            async: false,//同步执行
                    //            success: function (data) {
                    //                var filterdata = $.grep(data, function (value) {
                    //                    if (value.ExtendObject.UnitType == "U") {
                    //                        return value;
                    //                    }
                    //                });
                    //                $.MvcSheetUI.SheetInfo.UserOUMembers = $.MvcSheetUI.SheetInfo.UserOUMembers.concat(filterdata);
                    //            }
                    //        });
                    //    }
                    //}
                    ////baosc e

                    //是否多选
                    this.IsMultiple = this.LogicType == $.MvcSheetUI.LogicType.MultiParticipant;
                    //不可用
                    if (!this.Editable) {
                        $(this.Element).prop("readonly", true);
                        $(this.Element).addClass(this.Css.Readonly);
                        $(this.Element).addClass("item-content");
                    } else {
                        this.MoveToMobileContainer();
                        var that = this;
                        //ionic初始化控件
                        this.ionicInit(that, $.MvcSheetUI.IonicFramework);
                    }
                    //初始化默认值
                    this.InitValue();
                },
                //Ionic初始化
                ionicInit: function (that, ionic) {
                    // console.log(that, ionic)
                    //tll:传阅、征询、转发界面展示人员头像采用bpm-sheet-user-selected标签，保存之前表单设计
                    if (that.DataField == "fetchUserSelect") {
                        ionic.TempScope = ionic.$scope;
                        ionic.$scope = $.MvcSheetUI.IonicFramework.$scopeFetchUser;
                        var loadOptions = that.GetLoadTreeOption();
                        var loadUrl = that.SheetUserHandler + "?IsMobile=true&Recursive=" + that.Recursive;
                        var ngmodel = encodeURI(that.DataField).replace(/%/g, '_') + that.Options.RowNum;
                        //  that.Mask.parent().addClass("item-icon-right").css("width", "0px");;
                        // that.Mask.after('<i class="icon icon-rightadd"></i>');
                        that.Mask.parent().addClass("item-icon-right");
                        that.Mask.after('<i class="icon ion-ios-arrow-right"></i>');
                        var tagName = ngmodel;
                        if (tagName.indexOf('.') > -1) {
                            tagName = tagName.replace('.', '_');
                        }
                        ionic.$scope["sheetUsers" + tagName] = that.ConvertIonicItems(that.GetChoices());
                        if (that.Editable) {
                            ionic.$scope["sheetShow"] = true;
                        } else {
                            ionic.$scope["sheetShow"] = false;
                        }
                        //非编辑状态下展示**人*部门
                        if (that.V && !that.Editable && that.IsMultiple) {
                            var user = [];
                            var dep = [];
                            that.V.forEach(function (n, i) {
                                if (n.ContentType == 'U') {
                                    user.push(n);
                                } else {
                                    dep.push(n);
                                }
                            });
                            var obj = $.format(SheetLanguages.Current.Record, user.length, dep.length);
                            that.Mask.parent().before('<span class="record">' + obj + '</span>');
                        }

                        that.Mask.parent().parent().after('<div class="line"></div>');
                        if (that.DataField == "fetchUserSelect") {
                            that.Mask.parent().parent().after('<bpm-sheet-user-selected sheet-show="sheetShow" tag-name="' + tagName + '"  select-users="sheetUsers' + tagName + '" cancel-selected="delUserItem"></bpm-sheet-user-selected>');
                            // var add = $(' ')

                            // that.Mask.parent().parent().after(add);
                        }
                        that.Mask.parent().parent().attr("data-scopedata", ngmodel);
                        that.Mask.parent().parent().attr("data-loadurl", loadUrl);
                        that.Mask.parent().parent().attr("data-datafield", ngmodel);
                        if (that.Editable) {
                            that.Mask.parent().parent().unbind("click.sheetUser").bind("click.sheetUser", function () {
                                var dataField = $(this).attr("data-scopedata");
                                var loadUrl = $(this).attr("data-loadurl");

                                if (that.DataField == "fetchUserSelect") {
                                    ionic.$scope = $.MvcSheetUI.IonicFramework.$scopeFetchUser;
                                } else if (ionic.TempScope) {
                                    ionic.$scope = ionic.TempScope;
                                }
                                var obj = ionic.$scope[ngmodel];
                                console.log(obj, 'obj')
                                var options = {
                                    options: obj.Options,
                                    selecFlag: that.GetSelectableFlag(),
                                    dataField: dataField,
                                    ngmodel: ngmodel,
                                    loadUrl: loadUrl,
                                    loadOptions: obj.GetLoadTreeOption(),
                                    initUsers: obj.GetChoices(),
                                    isMutiple: obj.IsMultiple
                                };
                                $.MvcSheetUI.sheetUserParams = options;
                                ionic.$state.go("form.sheetuser", {index: 0, parentID: ""});
                            });
                        } else {
                            that.Mask.parent().css("display", "none");
                        }
                        ionic.$compile(that.Mask.parent().parent().next())(ionic.$scope);
                        ionic.$scope[ngmodel] = that;
                    }
                    else {
                        var loadOptions = that.GetLoadTreeOption();
                        var loadUrl = that.SheetUserHandler + "?IsMobile=true&Recursive=" + that.Recursive;
                        var ngmodel = that.DataField + that.Options.RowNum;
                        that.Mask.parent().addClass("item-icon-right");
                        that.Mask.after('<i class="icon ion-ios-arrow-right"></i>');
                        that.Mask.parent().parent().attr("data-scopedata", that.DataField);
                        that.Mask.parent().parent().attr("data-loadurl", loadUrl);
                        that.Mask.parent().parent().attr("data-datafield", that.DataField);
                        that.Mask.parent().parent().unbind("click.sheetUser").bind("click.sheetUser", function () {
                            var dataField = $(this).attr("data-scopedata");
                            var loadUrl = $(this).attr("data-loadurl");
                            var obj = ionic.$scope[ngmodel];
                            console.log(ionic.$scope[ngmodel], 'ionic.$scope');
                            console.log(ngmodel, 'ngmodel');
                            // debugger
                            var options = {
                                options: obj.Options,
                                selecFlag: that.GetSelectableFlag(),
                                dataField: dataField,
                                ngmodel: ngmodel,
                                loadUrl: loadUrl,
                                loadOptions: obj.GetLoadTreeOption(),
                                initUsers: obj.GetChoices(),
                                isMutiple: obj.IsMultiple
                            };
                            $.MvcSheetUI.sheetUserParams = options;
                            // console.log($.MvcSheetUI.sheetUserParams, '$.MvcSheetUI.sheetUserParams')
                            ionic.$state.go("form.sheetuser", {index: 0, parentID: ""});
                        });
                    }
                    ionic.$scope[ngmodel] = that;
                },
                //转化成IONIC所需要的对象格式
                ConvertIonicItems: function (users) {
                    var objs = [];
                    if (users) {
                        if (users.constructor == Object) {
                            var tempUser = {id: users.ObjectID, name: users.Name, type: users.type, UserGender: users.UserGender, UserImageUrl: users.UserImageUrl};
                            objs.push(tempUser);
                        } else {
                            users.forEach(function (n, i) {
                                var tempUser = {id: n.ObjectID, name: n.Name, type: n.type, UserGender: n.UserGender, UserImageUrl: n.UserImageUrl};
                                objs.push(tempUser);
                            });
                        }
                    }
                    return objs;
                },
                //清除所有的选择
                ClearChoices: function () {
                    for (var ObjectID in this.Choices) {
                        this.RemoveChoice(ObjectID);
                    }
                    this.OnMobileChange();
                },

                //移除选择
                RemoveChoice: function (ObjectID) {
                    if (this.Choices[ObjectID]) {
                        if (!this.IsMobile) {
                            //this.OrgListPanel.find("input[ObjectID='" + ObjectID + "']").attr("checked", false);
                            //$(this.DivSelectResult).children('[ObjectID="' + ObjectID + '"]').click();
                        }
                        $("#" + this.Choices[ObjectID].ChoiceID).remove();
                        delete this.Choices[ObjectID];
                    }
                    this.SetSearchTxtElementWidth.apply(this);
                    this.Validate();

                    this.OnMobileChange();

                    if (this.OnChange) {
                        this.RunScript(this, this.OnChange, [this]);
                    }
                },
                //PC端
                Render: function () {
                    if (!this.Visiable) {
                        this.Element.style.display = "none";
                        return;
                    }
                    // 查看痕迹
                    if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) {
                        this.RenderDataTrackLink();
                    }
                    //是否多选
                    this.IsMultiple = this.Options.IsMultiple || this.LogicType == $.MvcSheetUI.LogicType.MultiParticipant;

                    //不可用
                    if (!this.Editable) {
                        $(this.Element).prop("readonly", true);
                        $(this.Element).addClass(this.Css.Readonly);
                        $(this.Element).css("padding-top", "6px");
                    } else {
                        this.ClearChoices();
                        this.IsLoaded = false;
                        this.SelectedValue = "";
                        this.__QueryOptions = "";

                        //渲染界面
                        this.HtmlRender();
                        //绑定事件
                        this.BindEnvens();
                    }

                    //初始化默认值
                    this.InitValue();
                },

                //初始化值
                InitValue: function () {
                    // 设置默认值
                    if (this.Originate && !this.V && this.DefaultValue) {
                        this.V = this.DefaultValue;
                        if (this.V.constructor == String) {
                            if (this.V.toLowerCase() == "originator" || this.V.toLowerCase() == "{originator}") {
                                this.V = this.SheetInfo.Originator;
                            } else if (this.V.toLowerCase() == "{originator.ou}" || this.V.toLowerCase() == "originator.ou") {
                                this.V = this.SheetInfo.OriginatorOU;
                            }
                        }
                    }
                    this.SetValue(this.V);
                    //if (this.IsMobile) {
                    //    if (this.Editable) {
                    //        this.Mask.html(this.GetText());
                    //    } else {
                    //        $(this.Elment).html(this.GetText());
                    //    }
                    //}
                },
                //设置组织机构的根目录，传组织编码
                SetRootUnit: function (unitId) {
                    // 设置顶点 unit
                    // 重新加载树
                    this.RootUnitID = RootUnitID;
                    this.TreeManager.clear();
                    this.TreeManager.loadData(null, this.SheetUserHandler + "?RootUnitID=" + this.RootUnitID);
                },
                //设置值
                SetValue: function (Obj) {
                    if (Obj == undefined || Obj == null || Obj == "") {
                        if (this.IsMobile) {
                            if (this.Editable) {
                                if (this.PlaceHolder) {
                                    this.Mask.text(this.PlaceHolder);
                                } else {
                                    this.Mask.text(SheetLanguages.Current.PleaseSelect);
                                }
                                this.Mask.css({'color': '#797f89'});
                            } else {
                                this.Mask.html(this.PlaceHolder);
                            }
                            return;
                        } else {
                            return;
                        }
                    }
                    if (Obj.constructor == Object) {
                        this.AddChoice({ObjectID: Obj.Code, Name: Obj.Name, type: Obj.ContentType, UserGender: Obj.UserGender, UserImageUrl: Obj.UserImageUrl});
                    } else if (Obj.constructor == Array) {
                        for (var i = 0; i < Obj.length; i++) {
                            if (Obj[i].constructor == Object) {
                                this.AddChoice({ObjectID: Obj[i].Code, Name: Obj[i].Name, type: Obj[i].ContentType, UserGender: Obj[i].UserGender, UserImageUrl: Obj[i].UserImageUrl});
                            } else if (Obj[i].constructor == String) {
                                this.AddUserID(Obj[i]);
                                if (!this.IsMultiple)
                                    break;
                            }
                        }
                    } else if (Obj.constructor == String) {
                        if(Obj.indexOf("[")>-1){
                            var users = Obj.replace("[","").replace("]","").replace(" ","").split(",");
                            for (var i = 0; i < users.length; i++) {
                                this.AddUserID(users[i]);
                                if (!this.IsMultiple)
                                    break;
                            }
                        }else{
                            this.AddUserID(Obj);
                        }
                    }

                    if (this.IsMobile) {
                        if (this.Editable) {
                            this.Mask.html(this.GetText());
                            this.Mask.css({'color': '#2c3038'});
                        } else {
                            //$(this.Element).html(this.GetText());
                            var txt = this.GetText();
                            var mask = $("<label>").html(this.GetText());
                            $($(this.Element).html("")).append(mask);
                        }
                    }
                },
                //用户ID
                GetValue: function () {
                    var users;
                    for (var ObjectID in this.Choices) {
                        if (this.IsMultiple) {
                            if (users == undefined)
                                users = new Array();
                            users.push(ObjectID);
                        } else {
                            users = ObjectID;
                        }
                    }
                    return users == undefined ? "" : users;
                },
                //转化为对象
                GetChoices: function () {
                    var choices;
                    for (var ObjectID in this.Choices) {
                        if (this.IsMultiple) {
                            if (choices == undefined)
                                choices = new Array();
                            choices.push(this.Choices[ObjectID]);
                        } else {
                            choices = this.Choices[ObjectID];
                        }
                    }
                    return choices == undefined ? [] : choices;
                },
                //获取显示
                GetText: function () {
                    var userNames;
                    for (var ObjectID in this.Choices) {
                        if (this.IsMultiple) {
                            if (userNames == undefined)
                                userNames = new Array();
                            userNames.push(this.Choices[ObjectID].Name);
                        } else {
                            userNames = this.Choices[ObjectID].Name;
                        }
                    }
                    return userNames == undefined ? "" : userNames.toString();
                },

                //保存数据
                SaveDataField: function () {
                    var result = {};
                    if (!this.Visiable || !this.Editable)
                        return result;
                    result[this.DataField] = this.DataItem;
                    if (!result[this.DataField]) {
                        if (this.DataField.indexOf(".") == -1) {
                            alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField);
                        }
                        return {};
                    }

                    var users = this.GetValue();
                    // if (result[this.DataField].V != users)
                    {
                        result[this.DataField].V = users;
                        return result;
                    }
                    return {};
                },

                //渲染样式
                HtmlRender: function () {
                    this.ID = $(this.Element).attr("ID") || $.MvcSheetUI.NewGuid();
                    $(this.Element).attr("ID", this.ID);
                    $(this.Element).css("z-index", "inherit");

                    //设置页面元素的样式
                    $(this.Element).addClass("select2-container select2-container-multi ").attr("data-sheetusercontrol", true);
                    $(this.Element).css("min-width", "150px");

                    //设置输入框
                    if (this.ChoicesElement == null) {
                        this.ChoicesElement = $("<ul>").addClass("select2-choices").css("overflow", "hidden");
                        this.SearchElement = $("<li>").addClass("select2-search-field");
                        this.SearchTxtElement = $("<input>").addClass("form-control").addClass("no-padding");
                        this.SearchTxtElement.width("1px");

                        //添加输入框
                        this.SearchElement.append(this.SearchTxtElement);
                        this.ChoicesElement.append(this.SearchElement);
                        $(this.Element).append(this.ChoicesElement);
                    }

                    this.SetSearchTxtElementWidth.apply(this);
                    //不可用
                    if (!this.Editable) {
                        $(this.SearchTxtElement).prop("readonly", true);
                        $(this.SearchElement).width("100%");
                        $(this.SearchElement).addClass(this.Css.Readonly);
                        this.SearchTxtElement.closest("ul").css("border", "0px");
                        this.SearchTxtElement.width("100%");
                        return;
                    }
                    if (this.SelectorPanel == null) {
                        //组织机构选择Panel
                        this.SelectorPanel = $("<div>").addClass("bordered").addClass("SelectorPanel")
                                .css("position", "absolute")
                                .css("z-index", "888")
                                // .css("overflow", "auto")
                                .width("100%")
                                .css("min-width", "340px")
                                .css("height", "300px")
                                .css("display", "none")
                                .css("background-color", "#FFFFFF")
                                .css("left", "0")
                                .attr("data-SheetUserPanel", "SelectorPanel");

                        this.OrgTreePanel = $("<div>").css("max-width", "50%").css("width", "50%").addClass("bordered").css("float", "left").height("100%").css("overflow", "scroll");
                        this.SelectorPanel.append(this.OrgTreePanel);

                        // 组织机构选择列表
                        this.OrgListPanel = $("<div>").height("100%").css("overflow-y", "auto");
                        //增加全选按钮  update by lisonglin 20190118
                        this.PanelSelectAll = $('<div class="task" style="padding: 5px 10px; border-bottom: 1px solid rgb(228, 228, 228); cursor: pointer;">' +
                            '<i class="task-sort-icon fa  fa fa-user"></i><span class="task-title" style="word-break: break-all;margin-top: 0;flex-grow:1;padding-left: 4px">'+$.Lang("ReportDesigner.SelectAll")+'</span>' +
                            '<div class="action-checkbox pull-right"><div class="checkbox checkbox-primary checkbox-single" style="padding-top:0;padding-left: 10px">' +
                            '<input type="checkbox" class="styled styled-primary" id="selectAll" value="option2" checked aria-label="Single checkbox Two">'+
                            '  <label></label></div></div></div>');

                        this.SelectorPanel.append(this.OrgListPanel);
                        // 添加组织机构
                        $(this.Element).append(this.SelectorPanel);
                    }

                    if (!this.Recursive ||
                            this.RoleName ||
                            this.OrgPostCode ||
                            this.UserCodes) { // 只显示下拉框，不显示左侧菜单
                        this.OrgTreePanel.hide();
                        this.SelectorPanel.css("min-width", "0px");
                    } else {
                        this.OrgTreePanel.show();
                        this.SelectorPanel.css("min-width", "340px");
                    }
                },
                //绑定事件
                BindEnvens: function () {
                    if (!this.Editable)
                        return; //不可用

                    //点击到当前元素，设置input焦点
                    $(this.ChoicesElement).unbind("click.SheetUser").bind("click.SheetUser", this, function (e) {
                        e.data.SearchTxtElement.focus();
                    });

                    //得到焦点显示
                    $(this.SearchTxtElement).unbind("focusin.SearchTxtElement").bind("focusin.SearchTxtElement", this, function (e) {
                        e.data.FocusInput.apply(e.data);
                    });
                    if (!this.Recursive) { //不递归的时候，直接显示内容
                        var SheetUserManager = this;
                        //读取控件上的属性
                        $.ajax({
                            type: "GET",
                            url: this.SheetUserHandler + "?Recursive=false&" + this.GetLoadTreeOption(),
                            dataType: "json",
                            //async: false,//同步执行
                            success: function (data) {
                                for (var i = 0; i < data.length; ++i) {
                                    // data[i].Text = SheetUserManager.decrypt(data[i].Text);
                                    // data[i].Code = SheetUserManager.decrypt(data[i].Code);
                                    data[i].Text = data[i].Text;
                                    data[i].Code = data[i].Code;
                                    SheetUserManager.AddListItem.apply(SheetUserManager, [data[i]]);
                                }
                            }
                        });
                        if (this.IsMobile) {
                            //this.FocusInput();
                        } else {
                            $(document).unbind("click." + this.ID).bind("click." + this.ID, this, function (e) {
                                if ($(e.target).closest("div[id='" + e.data.ID + "']").length == 0) {
                                    e.data.FocusOutput.apply(e.data);
                                }
                            });
                        }
                        $(this.SearchTxtElement).prop("readonly", "readonly");
                        return;
                    }

                    if (this.IsMobile) {
                        // 输入控件
                        $(this.SearchTxtElement).unbind("keydown.SearchTxtElement").bind("keydown.SearchTxtElement", this, function (e) {
                            if (e.which == 13) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });

                        // 移动端仅在Enter时执行搜索
                        $(this.SearchTxtElement).unbind("keyup.SearchTxtElement").bind("keyup.SearchTxtElement", this, function (e) {
                            if (e.which == 13) {
                                e.data.SetSearchTxtElementWidth.apply(e.data);
                                e.data.FocusInput.apply(e.data);
                                e.data.SearchOrg.apply(e.data, [e.data]);
                            }
                        });
                    } else {
                        // 输入控件
                        $(this.SearchTxtElement).unbind("keyup.SearchTxtElement").bind("keyup.SearchTxtElement", this, function (e) {
                            e.data.SetSearchTxtElementWidth.apply(e.data);
                            e.data.FocusInput.apply(e.data);
                            e.data.KeyTime = new Date();
                            // setTimeout("e.data.SearchOrg.apply(e.data, [e.data])", 500);
                            var that = e.data;
                            setTimeout(function () {
                                that.SearchOrg.apply(that, [that]);
                            }, 500)
                        });
                        $(this.SearchTxtElement).unbind("keydown.SearchTxtElement").bind("keydown.SearchTxtElement", this, function (e) {
                            if (e.keyCode == 8 && $(this).val() == "") {
                                e.data.RemoveChoice.apply(e.data, [$(this).parent().prev().attr("data-code")]);
                            }
                        });
                    }
                    $(document).unbind("click." + this.ID).bind("click." + this.ID, this, function (e) {
                        if ($(e.target).closest("div[id='" + e.data.ID + "']").length == 0) {
                            e.data.FocusOutput.apply(e.data);
                        }
                    });
                    if (this.IsMobile) {
                        $(this.OrgListBtn).unbind("click.OrgListBtn").bind("click.OrgListBtn", this, function (e) {
                            var targetID = $(this).data("targetID");
                            e.data.AddMobilePanel.apply(e.data, [targetID, ""]);
                        });
                    }
                },
                //移动端:添加panel
                AddMobilePanel: function (id, parentID) {
                    this.Level++;
                    var that = this;
                    var divObj = $("#" + id);
                    if (divObj.length == 0) {
                        //新pannel
                        divObj = $("<div>").attr('id', id).addClass('panel').addClass('no-scroll').hide();
                        if (parentID != "") {
                            var parentObj = $("li[objectID='" + parentID + "']>label");
                            if (parentObj.length == 0)
                                parentObj = $("li[objectID='" + parentID + "']");
                            divObj.attr("data-title", parentObj.text());
                        } else {
                            divObj.attr("data-title", $.ui.prevHeader.find("#pageTitle").text());
                        }
                        divObj.attr("data-footer", this.FooterID);
                        divObj.data("parentid", parentID);
                        var loadUrl = that.SheetUserHandler + "?IsMobile=true&" + that.GetLoadTreeOption();
                        if (parentID) {
                            loadUrl = that.SheetUserHandler + "?IsMobile=true&ParentID=" + parentID + "&" + that.GetLoadTreeOption();
                        }

                        $.ajax({
                            type: "GET",
                            url: loadUrl,
                            dataType: "json",
                            context: that,
                            async: false, //同步执行
                            success: function (data) {
                                var ul = $("<ul>").addClass('orglist').addClass('list');
                                that.AddMobileOptions(data, ul);

                                var wrapper = $("<div class='scroll-wrapper'>");
                                wrapper.append(ul);
                                divObj.append(wrapper);

                                $('#content').append(divObj);

                                that.SetMobilePanelRefreshOnload(id);
                            }
                        });

                        //添加
                        //$.ui.addContentDiv(id);
                    }

                    //显示
                    $.ui.loadContent(id);
                    //检查是否选中
                    this.MobileFindCheckbox(id);
                },

                MobilePreBack: function () {
                    var id = "#" + $.ui.activeDiv.id;
                    if (this.Level > 0) {
                        this.Level--;
                    }
                    this.MobileFindCheckbox(id);
                },

                //设置页面加载时自动刷新滚动条
                SetMobilePanelRefreshOnload: function (panelId) {
                    var that = this;
                    //进入页面时自动刷新滚动条
                    window.PanelLoadActions = window.PanelLoadActions || {};
                    var that = this;
                    var fnName = 'F' + this.EditPanel.attr('id').replace(/\-/g, '');

                    $('#' + panelId).attr('data-load', 'window.PanelLoadActions.' + fnName)

                    window.PanelLoadActions[fnName] = function () {
                        setTimeout(function () {
                            that.RefreshMobilePage();
                        }, 600);
                    }
                },

                AddMobileOptions: function (data, ulList, searchKey) {
                    if (data) {
                        var that = this;
                        if (data instanceof Array) {
                            if (data.length) {
                                $(data).each(function () {
                                    that._AddMobileOption(this, ulList, searchKey);
                                })
                            } else {
                                ulList.html('<li class="user-item">没有任何组织</li>');
                            }
                        } else {
                            that._AddMobileOption(data, ulList, searchKey);
                        }
                    } else {
                        ulList.html('<li class="user-item">没有任何组织</li>');
                    }
                },

                //获取是否允许选择组、OU、用户的标识
                GetSelectableFlag: function () {
                    if (typeof (this.__SelectableOption) == 'undefined') {
                        this.__SelectableOption = '';

                        loadOptions = this.GetLoadTreeOption();
                        var o = loadOptions.match(/o=[A-z]*/)
                        if (o && o.length) {
                            this.__SelectableOption = o[0].replace('o=', '');
                        }
                    }
                    return this.__SelectableOption;
                },

                //添加可选项
                _AddMobileOption: function (item, ulList, searchKey) {
                    // debugger
                    var selectableFlag = this.GetSelectableFlag();
                    var li = $("<li>").addClass('user-item');
                    if (selectableFlag.indexOf(item.ExtendObject.UnitType) > -1) {
                        var checkboxid = $.uuid();
                        var checkbox = $("<input type='checkbox'  id='" + checkboxid + "' data-objectid='" + item.ObjectID + "'/>");
                        checkbox.attr("checked", this.Choices && this.Choices[item.ObjectID] != undefined);
                        li.append(checkbox);

                        var displayText = item.Text;
                        if (searchKey) {
                            displayText = displayText.replace(searchKey, "<span class='bg-info'>" + searchKey + "</span>");
                            if (displayText.indexOf("[" + item.Code + "]") == -1) {
                                displayText += "[" + item.Code.replace(searchKey, "<span class='bg-info'>" + searchKey + "</span>") + "]";
                            }
                        }

                        li.append($("<label type='checkbox' label-for='" + checkboxid + "'>" + displayText + "</label>").css("float", "none").css("left", "25px"));
                    } else {
                        li.append(item.Text);
                    }
                    li.attr("objectID", item.ObjectID);
                    var targetId = $.uuid();
                    li.attr("targetID", targetId);

                    if (!item.IsLeaf) {
                        var linkelemnt = $("<a data-ignore=true>" + $(li).html() + "</a>");
                        $(li).html("").append(linkelemnt);

                        li.append($('<div>').addClass('org-expand').css({
                            width: '20%',
                            height: '100%',
                            'z-index': 2,
                            position: 'absolute',
                            right: 0,
                            top: 0
                        }));
                    }
                    ulList.append(li);

                    var node = {
                        ObjectID: item.ObjectID,
                        Name: item.Text
                    }
                    $(li).unbind("click.OrgListBtn").bind("click.OrgListBtn", [this, node], function (e) {
                        var t = e.data[0];
                        var n = e.data[1];
                        if ($(e.target).is('.org-expand') || $(this).find('input[type=checkbox]').length == 0) {
                            var parentID = $(this).attr("objectID");
                            var targetID = $(this).attr("targetID");
                            $("#defaultHeader>.backButton").data("pannelid", targetId);
                            t.AddMobilePanel.apply(t, [targetID, parentID]);
                        } else {
                            var chk = $(this).find("input[type=checkbox]")
                            chk.prop('checked', !chk.prop('checked'));

                            t.UnitCheckboxClick.apply($(this).find("input[type=checkbox]").get(0), e.data);
                        }
                    });
                },

                //检查是否选中
                MobileFindCheckbox: function (id) {
                    if (id == undefined && $.ui.history) {
                        id = $.ui.history[$.ui.history.length - 1].target
                    }

                    if (id.indexOf("#") < 0) {
                        id = "#" + id;
                    }

                    var that = this;
                    $(id).find("input:checkbox").each(function () {
                        $(this).prop("checked", that.Choices[$(this).attr("data-objectid")] != undefined);
                    });
                },

                //设置输入框的宽度
                SetSearchTxtElementWidth: function () {
                    if (this.IsMobile) {
                        return;
                    }
                    var w = "1px";
                    var length = this.SearchTxtElement.val().length;
                    if (length > 0) {
                        w = length * 15 + "px";
                        this.SearchTxtElement.removeAttr("PlaceHolder", this.PlaceHolder);
                    } else if ($.isEmptyObject(this.Choices)) {
                        w = "150px";//update by zhangj
                        this.SearchTxtElement.attr("PlaceHolder", this.PlaceHolder);
                    } else {
                        this.SearchTxtElement.removeAttr("PlaceHolder", this.PlaceHolder);
                    }
                    $(this.SearchTxtElement).width(w);

                    if (this.IsMobile) {
                        //$(this.SelectorPanel).css("top", ($(this.Element).height()+20)+"px");
                    }
                },

                //获取焦点焦点
                FocusInput: function () {
                    if (this.IsMobile) {
                        return;
                    }
                    if (this.SelectorPanel.is(":visible"))
                        return;

                    $("div[data-SheetUserPanel='SelectorPanel']").hide();
                    this.SelectorPanel.show();
                    if (!this.IsMobile && !this.IsLoaded) {
                        //加载组织机构树
                        this.LoadOrgTree();
                    }

                    if (!this.IsMobile && this.OrgListPanel.find("input").length == 0) {
                        this.TreeManager.selectNode(this.TreeManager.data[0]);
                    }
                },

                //失去焦点
                FocusOutput: function () {
                    if (this.IsMobile) {
                        return;
                    }
                    if ($(this.SearchTxtElement).val().length > 0) {
                        this.OrgListPanel.html("");
                        $(this.SearchTxtElement).val("");
                    }
                    if (this.SelectorPanel.is(":hidden"))
                        return;

                    this.SelectorPanel.hide();
                },

                //处理映射关系
                MappingControlsHandler: function (Object) {
                    if (!this.MappingControls)
                        return;

                    var Propertys = "";
                    var MapJson = {};
                    var mapping = this.MappingControls.split(',');
                    for (var i = 0; i < mapping.length; i++) {
                        var map = mapping[i].split(':');
                        MapJson[map[0]] = map[1];
                        Propertys += map[1] + ";";
                    }

                    var that = this;
                    var param = {Command: "GetUserProperty", Param: JSON.stringify([Object.ObjectID, Propertys])};
                    $.MvcSheet.GetSheet(param, function (data) {
                        for (var p in data) {
                            for (var key in MapJson) {
                                if (MapJson[key] == p) {
                                    //var e = $.MvcSheetUI.GetElement(key, that.RowNum);
                                    var e = $.MvcSheetUI.GetElement(key, that.GetRowNumber());
                                    //update by luxm 初始化时联动
                                    if (e != null && e.data($.MvcSheetUI.SheetIDKey) || e != null && isInit) {
                                        isInit = false;
                                        e.SheetUIManager().SetValue(data[p]);
                                    }
                                }
                            }
                        }
                    });
                },

                //添加选择:{ObjectID:"",Name:""}
                AddChoice: function (Object) {
                    if (!Object)
                        return;
                    if (!Object.ObjectID)
                        return;
                    if (this.Choices[Object.ObjectID])
                        return;
                    if (!this.IsMultiple) { // 清除其他所有选项
                        this.ClearChoices();
                    }
                    this.Choices[Object.ObjectID] = Object;

                    //映射关系
                    if (this.MappingControls) {
                        this.MappingControlsHandler(Object);
                    }

                    //只读
                    if (!this.Editable) {
                        $(this.Element).html(this.GetText());
                        return;
                    }

                    var choiceID = $.MvcSheetUI.NewGuid();
                    Object.ChoiceID = choiceID;
                    var choice = $("<li class='select2-search-choice'></li>")

                    var NameDiv = $("<div>" + Object.Name + "</div>");
                    choice.css("cursor", "pointer").css("margin-top", "2px").css('background-color', '#fafafa');
                    choice.attr("id", choiceID).attr("data-code", Object.ObjectID).append(NameDiv);

                    if (this.IsMobile) {
                        choice.css("margin-top", "10px")
                        // this.ChoicesElement.append(choice);
                    } else {
                        this.SearchElement.before(choice);
                        this.SetSearchTxtElementWidth.apply(this);
                        // this.ChoicesElement.append(choice);
                        choice.insertBefore(this.ChoicesElement.find("li:last"));
                    }

                    //关闭按钮
                    var colseChoice = $("<a href='javascript:void(0)' class='select2-search-choice-close'></a>");
                    choice.append(colseChoice);
                    choice.unbind("click.choice").bind("click.choice", this, function (e) {
                        //移除当前筛选条件
                        e.data.RemoveChoice.apply(e.data, [$(this).attr("data-code")]);
                        //触发Input框的chagne事件
                        $(e.data.Element).trigger("change");
                    });
                    //校验
                    this.Validate();

                    if (this.IsMobile) {
                        this.OnMobileChange();
                    }

                    if (this.OnChange) {
                        this.RunScript(this, this.OnChange, [this]);
                    }
                    $(this.Element).trigger('change');
                },

                OnMobileChange: function () {
                    if (this.IsMobile) {
                        var that = this;
                        setTimeout(function () {
                            that.RefreshMobilePage();
                        }, 100)
                    }
                },

                RefreshMobilePage: function () {
                    //如果当前在选择的主界面里，重新计算高度
                    // if ($.ui.activeDiv.id == this.EditPanelID) {
                    if (this.EditPanelID) {
                        //选中项容器高度自增减
                        this.ChoicesPanel.height($(this.ChoicesElement).outerHeight());

                        if (this.SelectorPanel) {
                            //搜索框填充页面高度
                            this.SelectorPanel.outerHeight($('#afui').height() - $('header:visible').outerHeight() - $('#footer:visible').outerHeight() - this.ChoicesPanel.outerHeight() - this.SearchElement.parent().outerHeight())
                        }
                    }

                    var that = this;

                },

                _GetScroller: function (wrapperSelector) {
                    this.IScrollers = this.IScrollers || {};

                    var wrapper = $(wrapperSelector).first();
                    var scrollerId = wrapper.data("scroller-id");
                    if (!scrollerId) {
                        scrollerId = $.uuid();
                        wrapper.data("scroller-id", scrollerId);
                        this.IScrollers[scrollerId] = new IScroll(wrapper.get(0));
                    }
                    return this.IScrollers[scrollerId];
                    ;
                },

                //Error:这里有时间，可以实现批量的效果
                //添加:UserID/UserCode
                AddUserID: function (UserID) {
                    var that = this;
                    var param = {UserID: UserID, Propertystr: "Name;ObjectID"};
                    $.ajax({
                        type: "GET",
                        url: this.SheetGetUserProperty,
                        data: param,
                        dataType: "json",
                        async: false, //同步执行
                        success: function (data) {
                            if (data) {
                                that.AddChoice({ObjectID: data["ObjectID"], Name: data["Name"]});
                            }
                        }
                    });
                },

                //清除所有的选择
                ClearChoices: function () {
                    for (var ObjectID in this.Choices) {
                        this.RemoveChoice(ObjectID);
                    }
                    this.OnMobileChange();
                },

                //移除选择
                RemoveChoice: function (ObjectID) {


                    if (this.Choices[ObjectID]) {
                        if (!this.IsMobile) {
                            this.OrgListPanel.find("input[ObjectID='" + ObjectID + "']").attr("checked", false);
                        }
                        $("#" + this.Choices[ObjectID].ChoiceID).remove();
                        delete this.Choices[ObjectID];
                    }
                    this.SetSearchTxtElementWidth.apply(this);
                    this.Validate();

                    this.OnMobileChange();

                    if (this.OnChange) {
                        this.RunScript(this, this.OnChange, [this]);
                    }
                    
                    //更新全选状态
                    if (!this.IsMobile && this.IsMultiple && this.IsLoaded) {
                    	this.OrgListPanel.find("input[ObjectID='" + ObjectID + "']").closest("div.SelectorPanel").find("#selectAll").prop("checked", this.isAllSelect(this.Choices));
                    }
                },

                //加载组织机构树
                LoadOrgTree: function () {
                    //加载样式和脚本
                    if (!this.OrgTreePanel)
                        return;
                    var that = this;
                    var treeUl = $("<ul>").css("min-width", "520px");
                    this.OrgTreePanel.append(treeUl);

                    //加载LigerUI
                    if (!treeUl.ligerTree) {
                        $("body:first").append("<link rel='stylesheet' type='text/css' href=" + $.MvcSheetUI.PortalRoot + "'/WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-tree.less' />");
                        $.ajax({
                            url: $.MvcSheetUI.PortalRoot + "/WFRes/_Scripts/ligerUI/ligerui.all.js",
                            type: "GET",
                            dataType: "script",
                            async: false, //同步请求
                            global: false
                        });
                    }

                    this.IsLoaded = false;
                    var paramOptions = this.GetLoadTreeOption();
                    this.TreeManager = $(treeUl).ligerTree({
                        checkbox: false,
                        idFieldName: 'Code',
                        textFieldName: 'Text',
                        iconFieldName: "Icon",
                        btnClickToToggleOnly: true,
                        isExpand: 2,
                        isLeaf: function (data) {
                            return data.IsLeaf;
                        },
                        // render: function(e, data) {
                        //     var textHtml = '<span title="'+ data +'" ' +
                        //         'style="display:inline-block;max-width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">'+ data +'</span>';
                        //     return textHtml
                        // },
                        delay: function (e) {
                            // e.data.Text = that.decrypt(e.data.Text);
                            // e.data.Code = that.decrypt(e.data.Code);
                            // e.data.Text = e.data.Text;
                            // e.data.Code = e.data.Code;
                            var node = e.data;
                            if (node == null)
                                return false;
                            if (node.IsLeaf == null)
                                return false;
                            if (!node.IsLeaf && node.children == null) {
                                return {
                                    url: that.SheetUserHandler + "?ParentID=" + node.Code + "&LoadTree=true&Recursive=false&" + paramOptions,
                                }
                            }
                            return false;
                        },
                        url: this.SheetUserHandler + "?LoadTree=true&Recursive=" + this.Recursive + "&" + paramOptions,
                        onSelect: this.TreeNodeClick,
                        onCancelselect: this.TreeNodeClick,
                        SheetUserManager: this,
                        onSuccess: function () {
                            if (!this.options.SheetUserManager.IsLoaded) {
                                if (this.data.length > 0) {
                                    this.options.SheetUserManager.TreeNodeClick.apply(this, [{data: this.data[0]}]);
                                }
                                this.options.SheetUserManager.IsLoaded = true;
                            }
                        }
                    });
                },

                //获取加载组织机构的参数
                GetLoadTreeOption: function () {
                    if (!this.__QueryOptions) {
                        var querystr = "o=";
                        var querystr = "o=";
                        if (this.SegmentVisible) {
                            querystr += "S";
                        }
                        if (this.OrgUnitVisible) {
                            querystr += "O";
                        }
                        if (this.GroupVisible) {
                            querystr += "G";
                        }
                        if (this.PostVisible) {
                            querystr += "P";
                        }
                        if (this.UserVisible) {
                            querystr += "U";
                        }
                        if (this.VisibleUnits) {
                            querystr += "&VisibleUnits=" + this.VisibleUnits;
                        }
                        if (this.RootUnitID) {
                            querystr += "&RootUnitID=" + this.RootUnitID;
                        }
                        //if (this.RoleName) {
                        //    querystr += "&RoleName=" + encodeURI(this.RoleName);
                        //}
                        if (this.OrgPostCode) {
                            querystr += "&OrgPostCode=" + encodeURI(this.OrgPostCode);
                        }
                        if (this.UserCodes) {
                            querystr += "&UserCodes=" + encodeURI(this.UserCodes);
                        }
                        //显示离职人员  liming 20180918
                        if (this.ResignVisible)
                        {
                            querystr += "&ResignVisible=" + this.ResignVisible;
                        }

                        this.__QueryOptions = querystr;
                    }
                    return this.__QueryOptions;
                },
                //点击节点
                TreeNodeClick: function (e) {
                    if (e == null)
                        return;
                    if (e.data == null)
                        return;
                    var node = e.data;

                    var SheetUserManager = this.options.SheetUserManager;
                    if (SheetUserManager.SelectedValue == node.ObjectID && !SheetUserManager.SearchMode)
                        return;
                    SheetUserManager.SelectedValue = node.ObjectID;
                    SheetUserManager.SearchMode = false;
                    // 读取控件上的属性
                    var querystr = SheetUserManager.GetLoadTreeOption();
                    // querystr = querystr.replace("&VisibleUnits=", "&V=");
                    SheetUserManager.OrgListPanel.html("");
                    if (e.data.treedataindex == 0
                            && SheetUserManager.OrgUnitVisible
                            && SheetUserManager.RootSelectable
                            //update by ouyangsk 如果未指定userCodes，就不需再查找组织，避免可选列表出现重复用户的问题
                            && !this.options.SheetUserManager.UserCodes) {
                        SheetUserManager.AddListItem.apply(SheetUserManager, [e.data]);
                    }

                    $.ajax({
                        type: "GET",
                        url: SheetUserManager.SheetUserHandler + "?ParentID=" + node.ObjectID + "&" + querystr,
                        dataType: "json",
                        //async: false,//同步执行
                        success: function (data) {
                        	//update by lisonglin 20190118
                        	if (data.length > 0 && SheetUserManager.IsMultiple) {//如果有数据，并且是多选
                                SheetUserManager.OrgListPanel.prepend(SheetUserManager.PanelSelectAll);//增加全选按钮
                                SheetUserManager.PanelSelectAll.bind("click.PanelSelectAll", function (e) {//绑定点击事件
                                    SheetUserManager.SelectAll(e, SheetUserManager);
                                });
                            }
                        	
                            var len = 0;//这里需要统计选中的数量，用于初始化全选按钮状态
                            for (var i = 0; i < data.length; ++i) {
                                // data[i].Text = SheetUserManager.decrypt(data[i].Text);
                                // data[i].Code = SheetUserManager.decrypt(data[i].Code);
                            	if (SheetUserManager.Choices[data[i].ObjectID] != undefined) {//如果当前对象已经选中，则len加1
                                    len++;
                                }
                                SheetUserManager.AddListItem.apply(SheetUserManager, [data[i]]);
                            }
                            
                            if (data.length > 0 && SheetUserManager.IsMultiple && $("#selectAll")) {
                                if (len == data.length) {
                                	$(".SelectorPanel:visible").find("#selectAll").prop("checked",true);//全选状态
                                } else {
                                	$(".SelectorPanel:visible").find("#selectAll").prop("checked",false);//取消全选状态
                                }
                            }
                        }
                    });
                },
                //搜索用户
                SearchOrg: function (SheetUserManager) {
                    var searchkey = $(SheetUserManager.SearchTxtElement).val().trim();
                    var currentTime = new Date();
                    if ((currentTime - this.KeyTime) < 499)
                        return;
                    if (!SheetUserManager.SearchKey && !searchkey) {
                        return;
                    }
                    if (!searchkey) {
                        if (!this.IsMobile) {
                            SheetUserManager.SearchKey = searchkey;
                            SheetUserManager.OrgListPanel.html("");
                            // SheetUserManager.TreeManager.selectNode(0);
                            SheetUserManager.TreeManager.selectNode(SheetUserManager.TreeManager.nodes[0]);
                        } else {
                            SheetUserManager.OrgListPanel.html("");
                        }
                        return;
                    }
                    SheetUserManager.SearchMode = true;
                    SheetUserManager.SearchKey = searchkey;
                    SheetUserManager.OrgListPanel.html("");

                    for (var k in SheetUserManager.SearchResults) {
                        if (SheetUserManager.SearchResults[k].SearchKey == searchkey &&
                                SheetUserManager.SearchResults[k].ParentID == SheetUserManager.SelectedValue) {
                            if (SheetUserManager.SearchResults[k].Data && SheetUserManager.SearchResults[k].Data.length) {
                            	//update by lisonglin 20190118
                            	if (this.IsMultiple) {//如果是多选，则增加全选按钮并绑定点击事件
                                    SheetUserManager.OrgListPanel.prepend(SheetUserManager.PanelSelectAll);
                                    SheetUserManager.PanelSelectAll.bind("click.PanelSelectAll", function (e) {
                                        SheetUserManager.SelectAll(e, SheetUserManager);
                                    });
                                }
                            	
                            	var len = 0;//这里需要统计选中的数量，用于初始化全选按钮状态
                                for (var i = 0; i < SheetUserManager.SearchResults[k].Data.length; ++i) {
                                	//如果当前对象已经选中，则len加1
                                	if (SheetUserManager.Choices[SheetUserManager.SearchResults[k].Data[i].ObjectID] != undefined) {
                                        len++;
                                    }
                                    SheetUserManager.AddListItem.apply(SheetUserManager, [SheetUserManager.SearchResults[k].Data[i], searchkey]);
                                }
                                if (this.IsMultiple && $("#selectAll")) {
                                    if (len == SheetUserManager.SearchResults[k].Data.length) {
                                    	$(".SelectorPanel:visible").find("#selectAll").prop("checked",true);//全选状态
                                    } else {
                                    	$(".SelectorPanel:visible").find("#selectAll").prop("checked",false);//取消全选状态
                                    }
                                }
                            } else {
                                SheetUserManager.OrgListPanel.html('<li class="user-item">没有任何组织</li>');
                            }
                            return;
                        }
                    }
                    $.ajax({
                        type: "GET",
                        url: SheetUserManager.SheetUserHandler + "?IsMobile=" + (!!this.IsMobile) +
                                "&SearchKey=" + encodeURI(searchkey) +
                                "&ParentID=" + (SheetUserManager.SelectedValue || SheetUserManager.RootUnit || "") +
                                "&" + SheetUserManager.GetLoadTreeOption(),
                        dataType: "json",
                        //async: false,//同步执行
                        success: function (data) {
                            if (SheetUserManager.IsMobile) {
                                SheetUserManager.AddMobileOptions(data, SheetUserManager.OrgListPanel, searchkey);

                                setTimeout(function () {
                                    SheetUserManager.RefreshMobilePage();
                                }, 550);
                            } else {
                                if (data != null && data.length > 0) {
                                	
                                	//update by lisonglin 20190118 搜索用户后全选
                                    if (SheetUserManager.IsMultiple) {
                                        SheetUserManager.OrgListPanel.prepend(SheetUserManager.PanelSelectAll);
                                        SheetUserManager.PanelSelectAll.bind("click.PanelSelectAll", function (e) {
                                            SheetUserManager.SelectAll(e, SheetUserManager);
                                        });
                                    }
                                	
                                    var len = 0;//这里需要统计选中的数量，用于初始化全选按钮状态
                                    for (var i = 0; i < data.length; ++i) {
                                        // data[i].Text = SheetUserManager.decrypt(data[i].Text);
                                        // data[i].Code = SheetUserManager.decrypt(data[i].Code);
                                    	if (SheetUserManager.Choices[data[i].ObjectID] != undefined) {//如果当前对象已经选中，则len加1
                                            len++;
                                        }
                                        SheetUserManager.AddListItem.apply(SheetUserManager, [data[i], searchkey]);
                                    }
                                    if (SheetUserManager.IsMultiple && $("#selectAll")) {
                                        if (len == data.length) {
                                        	$(".SelectorPanel:visible").find("#selectAll").prop("checked",true);//全选状态
                                        } else {
                                        	$(".SelectorPanel:visible").find("#selectAll").prop("checked",false);//取消全选状态
                                        }
                                    }
                                } else {
                                    SheetUserManager.OrgListPanel.html("<li class='user-item'>没搜索到组织</li>");
                                }
                            }
                            SheetUserManager.SearchResults.push({SearchKey: searchkey, ParentID: SheetUserManager.SelectedValue, Data: data});
                        }
                    });
                },

                //添加组织机构选择列项
                AddListItem: function (node, searchkey) {
                    var displayText = node.Text;
                    var titleText = node.Text;
                    if (searchkey) {
                        displayText = displayText.replace(searchkey, "<span class='bg-info'>" + searchkey + "</span>");
                        if (node.Code != "" && node.Text.indexOf("[" + node.Code + "]") == -1) {
                            displayText += "[" + node.orgInfo.replace(searchkey, "<span class='bg-info'>" + searchkey + "</span>") + "]";
                        }
                    }
                    if (this.IsMobile) {
                        // debugger
                        var item = $("<div></div>");
                        item.css("border-bottom", "1px solid #ccc");
                        item.height("50px");
                        item.css("clear", "both");
                        var checkid = $.MvcSheetUI.NewGuid();
                        var checkbox = $("<input type='checkbox' ObjectID='" + node.ObjectID + "' id='" + checkid + "'/>");
                        item.append(checkbox);
                        item.append($("<label type='checkbox' label-for='" + checkid + "'>" + displayText + "</label>").css("float", "none").css("left", "25px"));
                        this.OrgListPanel.append(item);

                        var thatSheetUser = this;
                        item.bind("touchstart", function () {
                            checkbox.click();

                            thatSheetUser.UnitCheckboxClick.apply(checkbox.get(0), [thatSheetUser, {ObjectID: node.ObjectID, Name: node.Text}]);
                        });
                    } else {
                        var item = $("<div>").addClass("task").append("<i style='float:left;line-height: 18px;' class='task-sort-icon fa  " + node.Icon + "'></i>")
                            .append("<span title='" + titleText+ " ' class='task-title' " +
                                "style='word-break: break-all;display: inline-block;width: 65%;margin-top: 0;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;padding-left: 4px;margin-bottom: 0;'>" + displayText + "</span>");
                        item.css("padding", "5px 10px 5px 10px").css("border-bottom", "1px solid #e4e4e4").css("cursor", "pointer");
                        var checkid = $.MvcSheetUI.NewGuid();
                        var checkbox = $("<input type='checkbox' ObjectID='" + node.ObjectID + "' id='" + checkid + "' aria-label='Single checkbox Two'/>").show();
                        var checkItem = $("<div>").addClass("action-checkbox pull-right");
                        var checkBox = $("<div class='checkbox checkbox-primary checkbox-single'></div>");
                        checkBox.append(checkbox).append('<label></label>');
                        checkItem.append(checkBox);
                        item.click(function (e) {
                            if (e.target.tagName.toLowerCase() != "input") {
                                $(this).find("input").click();
                            }
                        });
                        this.OrgListPanel.append(item.append(checkItem));
                        checkbox.attr("checked", this.Choices[node.ObjectID] != undefined);

                        checkbox.click({that: this, option: {ObjectID: node.ObjectID, Name: node.Text}}, function (e) {
                            e.data.that.UnitCheckboxClick.apply(this, [e.data.that, e.data.option]);
                        });
                    }
                },

                //单元选人点击
                UnitCheckboxClick: function (that, node) {
                    if (this.checked) {
                        if (!that.IsMultiple) {
                            that.ClearChoices.apply(that);
                            that.OrgListPanel.find("input").attr("checked", false);
                            this.checked = true;
                            if (that.IsMobile && that.Level > 0) {
                                $.ui.goBack(that.Level);
                                that.Level = 0;
                            }
                            that.FocusOutput.apply(that);
                        }
                        that.AddChoice.apply(that, [node]);
                        if (that.IsMultiple) {
                        	// console.log($(".SelectorPanel:visible").find("#selectAll"))
                            //判断全选状态
                        	$(".SelectorPanel:visible").find("#selectAll").prop("checked",that.isAllSelect(that.Choices));
                        }
                    } else {
                        if (that.IsMultiple)
                            that.RemoveChoice.apply(that, [node.ObjectID]);
                        else
                            that.ClearChoices.apply(that);
                    }
                },
                // decrypt: function (encryptText) {
                // 	var decrypt;
                // 	$.ajax({
                //         url: $.MvcSheetUI.PortalRoot + "/AES/decrypt",
                //         data: {"original": encryptText},
                //         async: false,
                //         method : 'post',
                //         success: function (result) {
                //         	decrypt = result;
                //         }
                //     });
                // 	return decrypt;
                // },
                //判断当前部门是否全部选中
                isAllSelect: function (Choices) {
                	//closest:获得匹配选择器的第一个祖先元素   siblings():获得匹配集合中每个元素的同胞
                    var $this = $(".SelectorPanel:visible").find("#selectAll").closest("div.task").siblings(".task").find("input");
                    var len = 0;
                    $this.each(function () {
                        if (Choices[$(this).attr("ObjectID")] != undefined) {
                            len++;
                        }
                    });
                    if (len == $this.length) {
                        return true;
                    } else { 
                    	return false; 
                    }
                },
                //全选按钮事件
                SelectAll: function (e, that) {
                	//点击事件绑定在整个全选按钮对象(PanelSelectAll)上
                    if (e.target.tagName.toLowerCase() != "input") {//如果点击的不是复选框
                        if (!$(e.target).closest("div.task").find("input")[0].checked) {
                        	//点击之前复选框是未选中状态，则点击之后状态置为全选状态
                            $(e.target).closest("div.task").find("input")[0].checked = true;
                            $(e.target).closest("div.task").siblings().each(function () {
                                $(this).find("input")[0].checked = true;
                                that.AddChoice.apply(that, [{ ObjectID: $(this).find("input").attr("ObjectID"), Name: $.trim($(this).text()) }]);
                            })
                        } else {//点击之前复选框是选中状态，则点击之后取消全选状态
                            $(e.target).closest("div.task").find("input")[0].checked = false;
                            $(e.target).closest("div.task").siblings().each(function () {
                                $(this).find("input")[0].checked = false;
                                that.RemoveChoice.apply(that, [$(this).find("input").attr("ObjectID")]);
                            })
                        }
                    } else {//如果点击的是复选框
                        if ($(e.target)[0].checked) {//全选
                            $(e.target).closest("div.task").siblings().each(function () {
                                $(this).find("input")[0].checked = true;
                                that.AddChoice.apply(that, [{ ObjectID: $(this).find("input").attr("ObjectID"), Name: $.trim($(this).text()) }]);
                            })
                        } else {//取消全选
                            $(e.target).closest("div.task").siblings().each(function () {
                                $(this).find("input")[0].checked = false;
                                that.RemoveChoice.apply(that, [$(this).find("input").attr("ObjectID")]);
                            })
                        }
                    }
                }
            });
        })(jQuery);

﻿//选人控件
(function ($) {
    // 控件执行
    // 参数{AutoTrim:true,DefaultValue:datavalue,OnChange:""}
    //可以通过  $("#id").SheetTextBox(参数)  来渲染控件和获取控件对象
    $.fn.SheetWorkflow = function () {
        return $.MvcSheetUI.Run.call(this, "SheetWorkflow", arguments);
    };

    // 构造函数
    $.MvcSheetUI.Controls.SheetWorkflow = function (element, ptions, sheetInfo) {
        // 选择数据集合
        this.Choices = {};
        // 所有选择的元素
        this.ChoicesElement = null;
        // 搜索输入框元素
        this.SearchElement = null;
        this.SearchTxtElement = null;
        this.SearchButton = null;
        // 获取选中的值
        this.SelectedValue = null;
        // 获取当前搜索关键字
        this.SearchKey = null;
        // 获取是否是搜索模式
        this.SearchMode = false;
        this.KeyTime = null;
        // 搜索结果
        this.SearchResults = [];
        // 下拉框容器
        this.SelectorPanel = null;
        // 只在 Enter 进行搜索
        this.EnterSearch = true;
        this.OrgTreePanel = null;
        this.OrgListPanel = null;
        this.IsOverSelectorPanel = false;
        this.SheetWorkflowHandler = $.MvcSheetUI.PortalRoot + "/Workflow/QueryWorkflowNodes";
        this.GetWorkflowsHandler = $.MvcSheetUI.PortalRoot + "/Workflow/GetWorkflows";
        this.ModelControl = null;

        $.MvcSheetUI.Controls.SheetWorkflow.Base.constructor.call(this, element, ptions, sheetInfo);
    };

    // 继承及控件实现
    $.MvcSheetUI.Controls.SheetWorkflow.Inherit($.MvcSheetUI.IControl, {
        //移动端
        RenderMobile: function () {
            //是否多选
            this.IsMultiple = this.LogicType == $.MvcSheetUI.LogicType.MultiParticipant;

            //不可用
            if (!this.Editable) {
                // $(this.Element).prop("readonly", true);
                $(this.Element).addClass(this.Css.Readonly);
                $(this.Element).addClass("item-content");
            }
            else {
                this.MobileHtmlRender();
                this.MoveToMobileContainer();
            }
            //初始化默认值
            this.InitValue();

            if (!this.EditPanel) {
                this.EditPanel = $("<div>").attr("id", $.uuid()).attr("data-title", this.Title).attr("data-footer", "none").addClass("panel")
                    .appendTo("#content");
            }
            $(this.EditPanel).addClass('no-scroll')
            this.SetMobilePanelRefreshOnload($(this.EditPanel).attr('id'));
        },
        // PC端
        Render: function () {
            //是否多选

            //this.IsMultiple = this.LogicType == $.MvcSheetUI.LogicType.ShortString;
            if (!this.Visiable) {
                this.Element.style.display = "none";
                return;
            }
            // 查看痕迹
            if (this.TrackVisiable && !this.Originate && this.DataField.indexOf(".") == -1) { this.RenderDataTrackLink(); }

            //不可用
            if (!this.Editable) {
                // console.log(this.Element, 'this.Element')
                // $(this.Element).prop("readonly", true);
                $(this.Element).addClass(this.Css.Readonly);
                $(this.Element).css("padding-top", "6px");
            }
            else {
                this.ClearChoices();
                this.IsLoaded = false;
                this.SelectedValue = "";
                this.__QueryOptions = "";

                //渲染界面
                this.HtmlRender();
                //绑定事件 
                this.BindEnvens();
            }

            //初始化默认值
            this.InitValue();
        },

        //初始化值
        InitValue: function () {
            // 设置默认值
            if (this.Originate && !this.V && this.DefaultValue) {
                this.V = this.DefaultValue;
            }

            this.SetValue(this.V);
            if (this.IsMobile) {
                if (this.Editable) {
                    this.Mask.html(this.GetText());
                }
                else {
                    $(this.Elment).html(this.GetText());
                }
            }
        },
        // 设置组织机构的根目录，传组织编码
        SetRootUnit: function (unitId) {
            // 设置顶点 unit 
            // 重新加载树
            this.RootUnitID = RootUnitID;

            this.TreeManager.clear();
            this.TreeManager.loadData(null, this.SheetUserHandler + "?RootUnitID=" + this.RootUnitID);
        },
        // 设置值
        SetValue: function (Obj) {
            if (Obj == undefined || Obj == null || Obj == "") return;
            if (Obj.constructor == Object) {
                this.AddChoice({ Code: Obj.Code, DisplayName: Obj.DisplayName || Obj.Name });
            }
            else if (Obj.constructor == Array) {
                for (var i = 0; i < Obj.length; i++) {
                    if (Obj[i].constructor == Object) {
                        this.AddChoice({ Code: Obj[i].Code, DisplayName: Obj[i].DisplayName || Obj.Name });
                    }
                    else if (Obj[i].constructor == String) {
                        this.AddWorkflow(Obj[i]);
                        if (!this.IsMultiple) break;
                    }
                }
            }
            else if (Obj.constructor == String) {
                this.AddWorkflow(Obj);
            }
        },
        //用户ID
        GetValue: function () {
            var users;
            for (var ObjectID in this.Choices) {
                if (this.IsMultiple) {
                    if (users == undefined) users = new Array();
                    users.push(ObjectID);
                }
                else {
                    users = ObjectID;
                }
            }
            return users == undefined ? "" : users;
        },

        //获取显示
        GetText: function () {
            var userNames;
            for (var ObjectID in this.Choices) {
                if (this.IsMultiple) {
                    if (userNames == undefined) userNames = new Array();
                    userNames.push(this.Choices[ObjectID].DisplayName);
                }
                else {
                    userNames = this.Choices[ObjectID].DisplayName;
                }
            }
            return userNames == undefined ? "" : userNames.toString();
        },

        //保存数据
        SaveDataField: function () {
            var result = {};
            if (!this.Visiable || !this.Editable) return result;
            result[this.DataField] = this.DataItem;
            if (!result[this.DataField]) {
                if (this.DataField.indexOf(".") == -1) { alert(SheetLanguages.Current.DataItemNotExists + ":" + this.DataField); }
                return {};
            }

            var users = this.GetValue();
            //if (result[this.DataField].V != users)
            {
                result[this.DataField].V = users;
                return result;
            }
            return {};
        },

        //渲染样式
        HtmlRender: function () {
            this.ID = $(this.Element).attr("ID") || $.MvcSheetUI.NewGuid();
            $(this.Element).attr("ID", this.ID);
            $(this.Element).css("z-index", "inherit");

            //设置页面元素的样式
            $(this.Element).addClass("select2-container select2-container-multi ").attr("data-sheetusercontrol", true);
            $(this.Element).css("min-width", "150px");

            //设置输入框
            if (this.ChoicesElement == null) {
                if (!this.IsMultiple)
                    this.ChoicesElement = $("<ul>").addClass("select2-choices").css("overflow", "hidden");
                else
                    this.ChoicesElement = $("<ul>").addClass("select2-choices").css("overflow", "hidden").attr("style", "width: 100% !important; height: 32px !important;min-height: 30px !important;overflow-y: scroll;");

                this.SearchElement = $("<li>").addClass("select2-search-field");
                this.SearchTxtElement = $("<input>").addClass("form-control").addClass("no-padding");
                this.SearchTxtElement.width("1px");

                //添加输入框
                this.SearchElement.append(this.SearchTxtElement);
                this.ChoicesElement.append(this.SearchElement);
                $(this.Element).append(this.ChoicesElement);
            }

            this.SetSearchTxtElementWidth.apply(this);
            //不可用
            if (!this.Editable) {
                $(this.SearchTxtElement).prop("readonly", true);
                $(this.SearchElement).width("100%");
                $(this.SearchElement).addClass(this.Css.Readonly);
                this.SearchTxtElement.closest("ul").css("border", "0px");
                this.SearchTxtElement.width("100%");
                return;
            }
            if (this.SelectorPanel == null) {
                //组织机构选择Panel
                this.SelectorPanel = $("<div>").addClass("bordered").addClass("SelectorPanel")
                    .css("position", "absolute")
                    .css("z-index", "888")
                    .width("100%")
                    .css("min-width", "320px")
                    .css("height", "300px")
                    .css("display", "none")
                     //.css("overflow", "auto")
                    .css("background-color", "#FFFFFF").css("left", "0").attr("data-SheetUserPanel", "SelectorPanel");
                if (!this.IsMultiple) {
                    this.OrgTreePanel = $("<div>").css("width", "100%").addClass("bordered").css("float", "left").height("100%").css("overflow", "scroll");
                }
                if (this.IsSearch || this.IsSearch2 || this.IsSearch3)
                    this.OrgTreePanel = $("<div>").attr("style", "margin-top: 5px;").css("width", "100%").addClass("bordered").css("float", "left").height("87%").css("overflow", "scroll");
                else
                    this.OrgTreePanel = $("<div>").attr("style", "margin-top: 5px;").css("width", "100%").addClass("bordered").css("float", "left").height("100%").css("overflow", "scroll");

                if (this.IsSearch || this.IsSearch3) {
                    this.SearchLableElement1 = $("<label>").addClass("input-setworkflow").addClass("form-control").attr("style", "width: 98% !important; margin-left: 4px;");
                    this.SearchTxtElement1 = $("<i>").addClass("input-i-search").addClass("fa fa-search").css("top", "9px");
                    this.SearchTxtElement2 = $("<input>").addClass("input-text").attr("style", "width:92% !important;border: none; margin-top: -5px;padding-left: 10px;").css("height", "26px");
                    this.SearchLableElement1.append(this.SearchTxtElement1).append(this.SearchTxtElement2);
                    this.SelectorPanel.append(this.SearchLableElement1);
                }
                if (this.IsSearch2) {
                    this.SearchLableElement1 = $("<div>").attr("style", "width: auto;border: 1px solid #a8a8a8; ");
                    this.SearchTxtElement1 = $("<i>").addClass("input-i-search").addClass("fa fa-search").attr("style", " position: absolute;top: 12px;left: 11px;");
                    this.SearchTxtElement2 = $("<input>").addClass("input-text").attr("style", "width: 90% !important;border: 0;outline: white;margin-left: 29px;height: 28px; ");
                    this.SearchLableElement1.append(this.SearchTxtElement1).append(this.SearchTxtElement2);
                    this.SelectorPanel.append(this.SearchLableElement1);
                }
                this.SelectorPanel.append(this.OrgTreePanel);
                // 组织机构选择列表 
                if (this.IsSearch3)
                    this.OrgListPanel = $("<div>").height("100%").width("96%").css("overflow", "auto");
                else if (!this.IsSearch2)
                    this.OrgListPanel = $("<div>").height("100%").attr("style", "margin-top:37px;width: 96%;"); 
                  // this.OrgListPanel = $("<div>").height("100%").attr("style", "margin-top:0px;width: 100%;");
                else
                    this.OrgListPanel = $("<div>").height("100%").css("overflow", "auto");
                this.SelectorPanel.append(this.OrgListPanel);
                // 添加组织机构
                $(this.Element).append(this.SelectorPanel);
            }

            if (this.WorkflowCodes) { // 显示固定的流程模板
                this.OrgTreePanel.hide();
                this.OrgListPanel.show();
                this.SelectorPanel.css("min-width", "0px");
            }
            else {
                this.OrgTreePanel.show();
                this.OrgListPanel.hide();
                this.SelectorPanel.css("min-width", "430px");
            }
        },
        //移动端渲染
        MobileHtmlRender: function () {
            this.Level = 0;
            this.ID = $.MvcSheetUI.NewGuid();
            $(this.Element).attr("ID", this.ID);
            //选中的用户
            this.ChoicesPanel = $("<div></div>")
                .addClass("select2-container").addClass('scroll-wrapper')
                .css({
                    'background-color': 'white',
                    position: 'relative',
                    //最小显示一行
                    'min-height': '37px',
                    //最多显示三行
                    'max-height': '110px',
                    width: '100%'
                });
            this.ChoicesElement = $("<ul>").addClass("select2-choices").addClass('scroller')
                .css({
                    width: '100%',
                    overflow: 'hidden',
                    'min-height': '35px'
                });
            this.ChoicesPanel.append(this.ChoicesElement);
            $(this.Element).append(this.ChoicesPanel);

            //搜索框
            this.SearchElement = $("<li>").addClass("select2-search-field").css({ width: '100%' });
            this.SearchTxtElement = $("<input>").attr('placeholder', '搜索')
                .css({
                    width: '85%',
                    height: '40px',
                    'padding-left': '10px',
                    'padding-right': '10px',
                    'font-size': '14px'
                });
            //添加搜索输入框
            this.SearchElement.append(this.SearchTxtElement);
            //限制了范围时，禁用搜索
            if (this.VisibleUnits) {
                this.SearchElement.hide();
            }
            //搜索按钮
            this.SearchButton = $("<a>").attr("data-ignore", "true").addClass("button icon magnifier big")
                .css({ border: 'none', margin: 0, padding: '12px', width: '15%' });
            this.SearchElement.append(this.SearchButton);
            $(this.Element).append($('<ul>').width('100%').append(this.SearchElement));

            //搜索结果列表
            this.OrgListPanel = $("<ul>").width("100%").addClass('list');
            this.SelectorPanel = $("<div>").attr("id", $.uuid()).addClass('list').addClass("scroll-wrapper").width("100%").css('position', 'relative');
            $(this.SelectorPanel).bind('touchstart', function () {
                thatSheetUser.SearchTxtElement.blur();
            });
            this.SelectorPanel.append(this.OrgListPanel);
            $(this.Element).append(this.SelectorPanel);

            //底部返回按钮
            this.FooterID = $.uuid();
            var footerObj = $("<footer id=" + this.FooterID + " ><a class='icon left'>返回</a><footer>");
            $("#afui").append(footerObj);
            $(footerObj).unbind("click.footerObj").bind("click.footerObj", this, function (e) {
                $.ui.goBack(e.data.Level);
                e.data.Level = 0;

                e.data.Validate();
            });

            var thatSheetUser = this;
            //如果设置了可见组织
            if (this.VisibleUnits && this.VisibleUnits.length) {
                this.OrgListPanel;

                var loadOptions = this.GetLoadTreeOption();
                if (this.VisibleUnits.split(';').length > 1) {
                    var loadUrl = this.SheetUserHandler + "?IsMobile=true&" + loadOptions;
                    //如果有多个可见组织，列出可见组织
                    $.ajax({
                        url: loadUrl,
                        dataType: "json",
                        //async: false,
                        success: function (data) {
                            thatSheetUser.AddMobileOptions(data, thatSheetUser.OrgListPanel)
                        },
                        error: function (e) {
                            // console.log(e);
                        }
                    });
                }
                else {// 只有一个可见组织，直接加载成员列表
                    var loadUrl = this.SheetUserHandler + "?IsMobile=true&ParentID=" + this.VisibleUnits + "&" + loadOptions;
                    //如果有多个可见组织，列出可见组织
                    $.ajax({
                        url: loadUrl,
                        dataType: "json",
                        //async: false,
                        success: function (data) {
                            thatSheetUser.AddMobileOptions(data, thatSheetUser.OrgListPanel);
                        },
                        error: function (e) {
                            // console.log(e);
                        }
                    });
                }
            }
            else {
                //组织机构列表按钮
                this.OrgListBtn = $("<li>").data("targetID", $.uuid()).text("从组织架构选择")//.addClass("icon user big")//.css("position", "absolute")
                    .addClass("selectFromOrg").css({
                        'border-top': '1px solid #ccc',
                        height: '40px',
                        top: '0px',
                        right: '0px',
                        padding: '10px',
                        cursor: 'pointer',
                        'border-bottom': '1px solid #eeeeee'
                    });

                this.OrgListBtn.insertAfter(this.SearchElement);

                //输入控件
                $(this.SearchTxtElement).unbind("keydown.SearchTxtElement").bind("keydown.SearchTxtElement", this, function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                //移动端搜索按钮
                $(this.SearchButton).unbind("click.SearchTxtElement").bind("click.SearchTxtElement", this, function (e) {
                    e.data.SearchWorkflow.apply(e.data.SearchTxtElement, [e.data]);
                });

                $(this.OrgListBtn).unbind("click.OrgListBtn").bind("click.OrgListBtn", this, function (e) {
                    var targetID = $(this).data("targetID");
                    e.data.AddMobilePanel.apply(e.data, [targetID, ""]);
                });
            }
        },
        //绑定事件
        BindEnvens: function () {
            if (!this.Editable) return;//不可用

            //点击到当前元素，设置input焦点
            $(this.ChoicesElement).unbind("click.SheetUser").bind("click.SheetUser", this, function (e) {
                e.data.SearchTxtElement.focus();
            });

            //得到焦点显示
            $(this.SearchTxtElement).unbind("focusin.SearchTxtElement").bind("focusin.SearchTxtElement", this, function (e) {
                e.data.FocusInput.apply(e.data);
            });

            if (this.IsMobile) {
                // 输入控件
                $(this.SearchTxtElement).unbind("keydown.SearchTxtElement").bind("keydown.SearchTxtElement", this, function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                // 移动端仅在Enter时执行搜索
                $(this.SearchTxtElement).unbind("keyup.SearchTxtElement").bind("keyup.SearchTxtElement", this, function (e) {
                    if (e.which == 13) {
                        e.data.SetSearchTxtElementWidth.apply(e.data);
                        e.data.FocusInput.apply(e.data);
                        e.data.SearchWorkflow.apply(e.data, [e.data]);
                    }
                });
            }
            else {
                if (this.IsMultiple || this.IsSearch || this.IsSearch2 || this.IsSearch3) {
                    // 输入控件
                    $(this.SearchTxtElement2).unbind("keyup.SearchTxtElement2").bind("keyup.SearchTxtElement2", this, function (e) {
                    	var searchKey = encodeURIComponent($(this).val());
                    	var that = e.data;
                    	that.TreeManager.clear();
                    	that.TreeManager.loadData(null, that.TreeManager.options.url + "&search=" + searchKey);
                    });
                } else {
                    // 输入控件
                    $(this.SearchTxtElement).unbind("keyup.SearchTxtElement").bind("keyup.SearchTxtElement", this, function (e) {
                        e.data.SetSearchTxtElementWidth.apply(e.data);
                        e.data.FocusInput.apply(e.data);
                        e.data.KeyTime = new Date();
                        // setTimeout("e.data.SearchWorkflow.apply(e.data, [e.data])", 500);
                        var that = e.data;
                        if (that.AllowSearch) {
                            setTimeout(function () {
                                that.SearchWorkflow.apply(that, [that]);
                            }, 500)
                        }
                    });
                }
                $(this.SearchTxtElement).unbind("keydown.SearchTxtElement").bind("keydown.SearchTxtElement", this, function (e) {
                    if (e.keyCode == 8 && $(this).val() == "") {
                        e.data.RemoveChoice.apply(e.data, [$(this).parent().prev().attr("data-code")]);
                    }
                });
            }

            $(document).unbind("click." + this.ID).bind("click." + this.ID, this, function (e) {
                var _that = e.data.ID;
                if ($(e.target).closest("div[id='" + e.data.ID + "']").length == 0 && $("div[id='" + _that + "']").attr("style")) {
                    var _width = 0;
                    var _clientWidth = 0;
                    for (var i = 1; i < e.data.ChoicesElement[0].childNodes.length; i++) {
                        _clientWidth += e.data.ChoicesElement[0].childNodes[i].clientWidth;
                    }
                    if (_clientWidth >= e.data.ChoicesElement[0].offsetWidth * 0.8) {
                        if ($("div[id='" + _that + "']").attr("style").indexOf("left") > -1) {
                            if ($("div[id='" + _that + "']").width())
                                _width = $("div[id='" + _that + "']").width();
                            $("div[id='" + _that + "']").attr("style", "width:" + _width + "px;left: -5px; z-index: inherit; min-width: 150px;");
                        }
                        else {
                            if ($("div[id='" + _that + "']").width())
                                _width = $("div[id='" + _that + "']").width();
                            $("div[id='" + _that + "']").attr("style", "width:" + _width + "px;min-height: 30px !important;");
                            //$("div[id='" + _that + "']").attr("style", "width:" + _width + "px;height: 48px !important;min-height: 30px !important;");
                        }
                        $("div[id='" + _that + "']").children("ul").attr("style", "width: 100% !important;height: 32px !important;min-height: 30px !important;overflow-y: scroll;");
                        //$("div[id='" + _that + "']").children("ul").attr("style", "width: 100% !important;height: 45px !important;min-height: 30px !important;overflow-y: scroll;");
                    } else {
                        if ($("div[id='" + _that + "']").attr("style").indexOf("left") > -1) {
                            if ($("div[id='" + _that + "']").width())
                                _width = $("div[id='" + _that + "']").width();
                            $("div[id='" + _that + "']").attr("style", "width:" + _width + "px;left: -5px; z-index: inherit; min-width: 150px;");
                        }
                        else {
                            if ($("div[id='" + _that + "']").width())
                                _width = $("div[id='" + _that + "']").width();
                            $("div[id='" + _that + "']").attr("style", "width:" + _width + "px;min-height: 30px !important;");
                        }
                        $("div[id='" + _that + "']").children("ul").attr("style", "width: 100% !important;height: 32px !important;min-height: 30px !important;overflow-y: scroll;");
                    }
                    e.data.FocusOutput.apply(e.data);
                }
            });
            if (this.IsMobile) {
                $(this.OrgListBtn).unbind("click.OrgListBtn").bind("click.OrgListBtn", this, function (e) {
                    var targetID = $(this).data("targetID");
                    e.data.AddMobilePanel.apply(e.data, [targetID, ""]);
                });
            }
        },

        //移动端:添加panel
        AddMobilePanel: function (id, parentID) {
            this.Level++;
            var that = this;
            var divObj = $("#" + id);
            if (divObj.length == 0) {
                //新pannel
                divObj = $("<div>").attr('id', id).addClass('panel').addClass('no-scroll').hide();
                if (parentID != "") {
                    var parentObj = $("li[objectID='" + parentID + "']>label");
                    if (parentObj.length == 0) parentObj = $("li[objectID='" + parentID + "']");
                    divObj.attr("data-title", parentObj.text());
                }
                else {
                    divObj.attr("data-title", $.ui.prevHeader.find("#pageTitle").text());
                }
                divObj.attr("data-footer", this.FooterID);
                divObj.data("parentid", parentID);
                var loadUrl = that.SheetUserHandler + "?IsMobile=true&" + that.GetLoadTreeOption();
                if (parentID) {
                    loadUrl = that.SheetUserHandler + "?IsMobile=true&ParentID=" + parentID;
                }

                $.ajax({
                    type: "GET",
                    url: loadUrl,
                    dataType: "json",
                    context: that,
                    async: false,//同步执行
                    success: function (data) {
                        var ul = $("<ul>").addClass('orglist').addClass('list');
                        that.AddMobileOptions(data, ul);

                        var wrapper = $("<div class='scroll-wrapper'>");
                        wrapper.append(ul);
                        divObj.append(wrapper);

                        $('#content').append(divObj);

                        that.SetMobilePanelRefreshOnload(id);
                    }
                });

                //添加
                //$.ui.addContentDiv(id);
            }

            //显示
            $.ui.loadContent(id);
            //检查是否选中
            this.MobileFindCheckbox(id);
        },

        MobilePreBack: function () {
            var id = "#" + $.ui.activeDiv.id;
            if (this.Level > 0) {
                this.Level--;
            }
            this.MobileFindCheckbox(id);
        },

        //设置页面加载时自动刷新滚动条
        SetMobilePanelRefreshOnload: function (panelId) {
            var that = this;
            //进入页面时自动刷新滚动条
            window.PanelLoadActions = window.PanelLoadActions || {};
            var that = this;
            var fnName = 'F' + this.EditPanel.attr('id').replace(/\-/g, '');

            $('#' + panelId).attr('data-load', 'window.PanelLoadActions.' + fnName)

            window.PanelLoadActions[fnName] = function () {
                setTimeout(function () {
                    that.RefreshMobilePage();
                }, 600);
            }
        },


        AddMobileOptions: function (data, ulList, searchKey) {
            if (data) {
                var that = this;
                if (data instanceof Array) {
                    if (data.length) {
                        $(data).each(function () {
                            that._AddMobileOption(this, ulList, searchKey);
                        })
                    }
                    else {
                        ulList.html('<li class="user-item">没有任何组织</li>');
                    }
                }
                else {
                    that._AddMobileOption(data, ulList, searchKey);
                }
            }
            else {
                ulList.html('<li class="user-item">没有任何组织</li>');
            }
        },

        //获取是否允许选择组、OU、用户的标识
        GetSelectableFlag: function () {
            if (typeof (this.__SelectableOption) == 'undefined') {
                this.__SelectableOption = '';

                loadOptions = this.GetLoadTreeOption();
                var o = loadOptions.match(/o=[A-z]*/)
                if (o && o.length) {
                    this.__SelectableOption = o[0].replace('o=', '');
                }
            }
            return this.__SelectableOption;
        },

        //添加可选项
        _AddMobileOption: function (item, ulList, searchKey) {
            var selectableFlag = this.GetSelectableFlag();
            var li = $("<li>").addClass('user-item');
            if (selectableFlag.indexOf(item.ExtendObject.UnitType) > -1) {
                var checkboxid = $.uuid();
                var checkbox = $("<input type='checkbox'  id='" + checkboxid + "' data-objectid='" + item.ObjectID + "'/>");
                checkbox.attr("checked", this.Choices && this.Choices[item.ObjectID] != undefined);
                li.append(checkbox);

                var displayText = item.Text;
                if (searchKey) {
                    displayText.replace(searchKey, "<span class='bg-info'>" + searchKey + "</span>")
                }

                li.append($("<label type='checkbox' label-for='" + checkboxid + "'>" + displayText + "</label>").css("float", "none").css("left", "25px"));
            }
            else {
                li.append(item.Text);
            }
            li.attr("objectID", item.ObjectID);
            var targetId = $.uuid();
            li.attr("targetID", targetId);

            if (!item.IsLeaf) {
                var linkelemnt = $("<a data-ignore=true>" + $(li).html() + "</a>");
                $(li).html("").append(linkelemnt);

                li.append($('<div>').addClass('org-expand').css({
                    width: '20%', height: '100%', 'z-index': 2, position: 'absolute', right: 0, top: 0
                }));
            }
            ulList.append(li);

            var node = {
                ObjectID: item.ObjectID, Name: item.Text
            }
            $(li).unbind("click.OrgListBtn").bind("click.OrgListBtn", [this, node], function (e) {
                var t = e.data[0];
                var n = e.data[1];
                if ($(e.target).is('.org-expand') || $(this).find('input[type=checkbox]').length == 0) {
                    var parentID = $(this).attr("objectID");
                    var targetID = $(this).attr("targetID");
                    $("#defaultHeader>.backButton").data("pannelid", targetId);
                    t.AddMobilePanel.apply(t, [targetID, parentID]);
                }
                else {
                    var chk = $(this).find("input[type=checkbox]")
                    chk.prop('checked', !chk.prop('checked'));

                    t.UnitCheckboxClick.apply($(this).find("input[type=checkbox]").get(0), e.data);
                }
            });
        },

        //检查是否选中
        MobileFindCheckbox: function (id) {
            if (id == undefined && $.ui.history) {
                id = $.ui.history[$.ui.history.length - 1].target
            }

            if (id.indexOf("#") < 0) {
                id = "#" + id;
            }

            var that = this;
            $(id).find("input:checkbox").each(function () {
                $(this).prop("checked", that.Choices[$(this).attr("data-objectid")] != undefined);
            });
        },

        //设置输入框的宽度
        SetSearchTxtElementWidth: function () {
            if (this.IsMobile) {
                return;
            }
            var w = "1px";
            var length = this.SearchTxtElement.val().length;
            if (length > 0) {
                w = length * 15 + "px";
                this.SearchTxtElement.removeAttr("PlaceHolder", this.PlaceHolder);
            }
            else if ($.isEmptyObject(this.Choices)) {
                w = "100%";
                this.SearchTxtElement.attr("PlaceHolder", this.PlaceHolder);
            }
            else {
                this.SearchTxtElement.removeAttr("PlaceHolder", this.PlaceHolder);
            }
            $(this.SearchTxtElement).width(w);

            if (this.IsMobile) {
                //$(this.SelectorPanel).css("top", ($(this.Element).height()+20)+"px");
            }
        },

        //获取焦点焦点
        FocusInput: function () {
            if (this.IsMobile) {
                return;
            }
            if (this.SelectorPanel.is(":visible")) return;

            $("div[data-SheetUserPanel='SelectorPanel']").hide();
            this.SelectorPanel.show();
            if (!this.IsMobile && !this.IsLoaded) {
                this.LoadOrgTree();
            }

            if (!this.IsMobile && this.OrgListPanel.find("input").length == 0) {
                this.TreeManager.selectNode(this.TreeManager.data[0]);
            }
        },

        //失去焦点
        FocusOutput: function () {
            if (this.IsMobile) {
                return;
            }
            if (this.SelectorPanel.is(":hidden")) return;
            if ($(this.SearchTxtElement).val().length > 0) {
                this.OrgListPanel.html("");
                $(this.SearchTxtElement).val("");

                //this.HtmlRender();
                this.SetSearchTxtElementWidth.apply(this);
                if (this.WorkflowCodes) { // 显示固定的流程模板
                    this.OrgTreePanel.hide();
                    this.OrgListPanel.show();
                    this.SelectorPanel.css("min-width", "0px");
                }
                else {
                    this.OrgTreePanel.show();
                    this.OrgListPanel.hide();
                    this.SelectorPanel.css("min-width", "430px");
                }
            }
            this.SelectorPanel.hide();
        },
        //添加选择:{ObjectID:"",Name:""}
        AddChoice: function (Object) {
            if (!Object) return;
            if (!Object.Code) return;
            if (this.Choices[Object.Code]) return;
            if (!this.IsMultiple) {// 清除其他所有选项
                this.ClearChoices();
            }
            this.Choices[Object.Code] = Object;
            for (var codeIndex in this.Choices.length) {
                this.Element.find(".SelectorPanel")
            }
            //只读
            if (!this.Editable) {
                $(this.Element).html(this.GetText());
                return;
            }

            var choiceID = $.MvcSheetUI.NewGuid();
            Object.ChoiceID = choiceID;
            var choice = $("<li class='select2-search-choice'></li>")

            var NameDiv = $("<div>" + Object.DisplayName + "</div>");
            choice.css("cursor", "pointer").css("margin-top", "2px").css('background-color', '#fafafa');
            choice.attr("id", choiceID).attr("data-code", Object.Code).append(NameDiv);

            if (this.IsMobile) {
                choice.css("margin-top", "10px")
                this.ChoicesElement.append(choice);
            }
            else {
                this.SearchElement.before(choice);
                this.SetSearchTxtElementWidth.apply(this);
                this.ChoicesElement.append(choice);
            }

            //关闭按钮
            var colseChoice = $("<a href='javascript:void(0)' class='select2-search-choice-close'></a>");
            choice.append(colseChoice);
            choice.unbind("click.choice").bind("click.choice", this, function (e) {
                e.data.RemoveChoice.apply(e.data, [$(this).attr("data-code")]);
            });
            //校验
            this.Validate();

            if (this.IsMobile) {
                this.OnMobileChange();
            }
        },

        OnMobileChange: function () {
            if (this.IsMobile) {
                var that = this;
                setTimeout(function () {
                    that.RefreshMobilePage();
                }, 100)
            }
        },

        RefreshMobilePage: function () {
            //如果当前在选择的主界面里，重新计算高度
            if ($.ui.activeDiv.id == this.EditPanelID) {
                //选中项容器高度自增减
                this.ChoicesPanel.height($(this.ChoicesElement).outerHeight());

                if (this.SelectorPanel) {
                    //搜索框填充页面高度
                    this.SelectorPanel.outerHeight($('#afui').height() - $('header:visible').outerHeight() - $('#footer:visible').outerHeight() - this.ChoicesPanel.outerHeight() - this.SearchElement.parent().outerHeight())
                }
            }

            var that = this;
            //刷新页面中所有滚动条
            $($.ui.activeDiv).find(".scroll-wrapper").each(function () {
                if ($(this).parent().is(".panel")) {
                    $(this).height($("#afui").height() - ($("header:visible").height() || 0) - ($("footer:visible").height() || 0) + "px");
                }
                var scoller = that._GetScroller(this);
                if (scoller && scoller.refresh) {
                    scoller.refresh();
                }
            })
        },

        _GetScroller: function (wrapperSelector) {
            this.IScrollers = this.IScrollers || {};

            var wrapper = $(wrapperSelector).first();
            var scrollerId = wrapper.data("scroller-id");
            if (!scrollerId) {
                scrollerId = $.uuid();
                wrapper.data("scroller-id", scrollerId);
                this.IScrollers[scrollerId] = new IScroll(wrapper.get(0));
            }
            return this.IScrollers[scrollerId];;
        },

        //Error:这里有时间，可以实现批量的效果
        //添加:UserID/UserCode
        AddWorkflow: function (WorkflowCodes) {
            var that = this;
            if (typeof (WorkflowCodes) == "string") {
                WorkflowCodes = [WorkflowCodes];
            }
            var param = { WorkflowCodes: WorkflowCodes };
            if (this.isBizQuery) {
                param.isBizQuery = true;
            }
            $.ajax({
                type: "POST",
                url: this.GetWorkflowsHandler,
                data: param,
                dataType: "json",
                traditional: true,
                async: false,//同步执行
                success: function (data) {
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            that.AddChoice({ Code: data[i]["Value"], DisplayName: data[i]["Text"] });
                        }
                    }
                }
            });
        },

        //清除所有的选择
        ClearChoices: function () {
            for (var ObjectID in this.Choices) {
                this.RemoveChoice(ObjectID);
            }

            this.OnMobileChange();
        },

        //移除选择
        RemoveChoice: function (code) {
            if (this.Choices[code]) {
                this.OrgListPanel.find("input[ObjectID='" + code + "']").prop("checked", false);

                $("#" + this.Choices[code].ChoiceID).remove();
                delete this.Choices[code];
            }

            var checkedNodes = this.TreeManager.getChecked();
            if (checkedNodes == undefined) { }
            else {
                if (checkedNodes.length > 0) {
                    for (var index = 0; index < checkedNodes.length; index++) {
                        if (checkedNodes[index].data.Code == code) {
                            $(checkedNodes[index].target).find(".l-checkbox").click();
                        }
                    }
                }
            }

            //this.OrgTreePanel.show();
            //this.OrgListPanel.hide();

            this.SetSearchTxtElementWidth.apply(this);
            this.Validate();

            this.OnMobileChange();

            if (this.OnChange) {
                this.RunScript(this, this.OnChange, [this]);
            }
        },

        //加载组织机构树
        LoadOrgTree: function () {
            //加载样式和脚本
            if (!this.OrgTreePanel) return;
            var that = this;
            var treeUl = $("<ul>").css("min-width", "180px");
            this.OrgTreePanel.append(treeUl);

            //加载LigerUI
            if (!treeUl.ligerTree) {
                $("body:first").append("<link rel='stylesheet' type='text/css' href=" + _PORTALROOT_GLOBAL + "'/WFRes/_Content/themes/ligerUI/Aqua/css/ligerui-tree.less' />");
                $.ajax({
                    url: _PORTALROOT_GLOBAL + "/WFRes/_Scripts/ligerUI/ligerui.all.min.js",
                    type: "GET",
                    dataType: "script",
                    async: false,//同步请求
                    global: false
                });
            }
            var that = this;
            this.IsLoaded = false;
            var paramOptions = this.GetLoadTreeOption();
            this.TreeManager = $(treeUl).ligerTree({
                checkbox: this.IsMultiple,
                idFieldName: 'Code',
                textFieldName: 'DisplayName',
                iconFieldName: "Icon",
                btnClickToToggleOnly: true,
                isExpand: function (e) {
                    return e.data.Frequent == 1 || (that.SearchTxtElement2 && that.SearchTxtElement2.val().length > 0);
                },
                isLeaf: function (data) {
                    return data.IsLeaf;
                },
                single: !this.IsMultiple,
                delay: function (e) { 
                    var node = e.data;
                    if (node == null) return false;
                    if (node.IsLeaf == null) return false;
                    if (!that.IsAsync) return false;
                    if (!node.IsLeaf) {
                        return {
                            url: that.SheetWorkflowHandler + "?" + that.GetLoadTreeOption(node.Code)
                        }
                    }
                    return false;
                },
                url: this.SheetWorkflowHandler + "?" + encodeURIComponent(paramOptions),
                onSelect: this.TreeNodeClick,
                // onCancelselect: this.TreeNodeClick,
                onCheck: this.TreeNodeCheck,
                SheetWorkflowManager: this,
                onSuccess: function () {
                    if (!this.options.SheetWorkflowManager.IsLoaded) {
                        if (this.data.length > 0) {
                            this.options.SheetWorkflowManager.TreeNodeClick.apply(this, [{ data: this.data[0] }]);
                        }
                        this.options.SheetWorkflowManager.IsLoaded = true;
                    }
                },
                onBeforeAppend : function (parentNode, newData) {
                	if (newData && newData[0] && newData[0].Frequent === 1) {
                		newData[0].DisplayName = $.Lang("QueryTableColumn.FrequentFlow");
                	}
                }
            });
            
        },
        //获取加载组织机构的参数
        GetLoadTreeOption: function (parentCode) {
            var code = parentCode || this.RootCode;
            if (!this.IsFrequentFlow)
                var querystr = "Mode=" + this.Mode + "&ShowFavorite=false" + "&IsShared=" + this.IsShared;
            else
                var querystr = "Mode=" + this.Mode + "&ShowFavorite=true" + "&IsShared=" + this.IsShared + "&Isbilingual=" + "true";
            if (code) {
                querystr += "&ParentCode=" + code;
            }
            if (this.WorkflowCodes) {
                querystr += "&WorkflowCodes=" + this.WorkflowCodes;
            }
            if (this.IsAsync) {
                querystr += "&IsAsync=" + this.IsAsync;
            }
            if (this.isBizQuery !== undefined) {
                querystr += "&isBizQuery=" + this.isBizQuery;
            }
            return querystr;
        },
        TreeNodeClick: function (e) {
            //初始化展开树节点的时候
            if (e.target == undefined) { } else {
                //如果没有多选样式，则只能是单选
                if ($(e.target).find(".l-checkbox").attr("Class") == undefined) {
                    //如果当前DOM节点未被选中，则设置为选中样式
                    if ($(e.target).find(".l-selected").attr("Class") && $(e.target).find(".l-selected").attr("Class").indexOf("l-selected") > -1) {
                        $(e.target).find(".l-selected").attr("Class", "l-body l-selected");
                        if (e.data.IsLeaf) {
                            this.options.SheetWorkflowManager.TreeNodeCheckRecursive(e.data, true);
                        }
                    }//如果已经选中，则设置为未选中，并删除该元素
                    else {
                        $(e.target).find(".l-selected").attr("Class", "l-body");
                        if (e.data.IsLeaf) {
                            this.options.SheetWorkflowManager.TreeNodeCheckRecursive(e.data, false);
                        }
                    }
                }
                else {

                    //如果当前DOM节点未被选中，则设置为选中样式
                    if ($(e.target).find(".l-checkbox").attr("Class") && $(e.target).find(".l-checkbox").attr("Class").indexOf("l-checkbox-unchecked") > -1) {
                        $(e.target).find(".l-checkbox").attr("Class", "l-box l-checkbox l-checkbox-checked");
                        if (e.data.IsLeaf) {
                            this.options.SheetWorkflowManager.TreeNodeCheckRecursive(e.data, true);
                        }
                    }//如果已经选中，则设置为未选中，并删除该元素
                    else {
                        $(e.target).find(".l-checkbox").attr("Class", "l-box l-checkbox l-checkbox-unchecked");
                        if (e.data.IsLeaf) {
                            this.options.SheetWorkflowManager.TreeNodeCheckRecursive(e.data, false);
                        }
                    }
                }
            }
        },
        TreeNodeCheck: function (e, checked) {
            this.options.SheetWorkflowManager.TreeNodeCheckRecursive(e.data, checked);
        },
        TreeNodeCheckRecursive: function (node, checked) {
            if (node.IsLeaf) {
                // 设置当前节点为选中或未选中
                if (checked) {
                    if (!this.IsMultiple) {
                        this.ClearChoices();
                        if (this.IsMobile && this.Level > 0) {
                            $.ui.goBack(this.Level);
                            this.Level = 0;
                        }
                        this.FocusOutput();
                    }
                    this.AddChoice(node);
                }
                else {
                    if (this.IsMultiple)
                        this.RemoveChoice(node.Code);
                    else {
                        this.ClearChoices();
                    }
                }

                if (this.OnChange) {
                    this.RunScript(this, this.OnChange, [node]);
                }
            }
            else {
                for (var index in node.children) {
                    this.TreeNodeCheckRecursive(node.children[index], checked);
                }
            }
        },
        // 搜索流程模板
        SearchWorkflow: function (SheetWorkflowManager) {
            if (!this.IsMultiple && !this.IsSearch && !this.IsSearch2 && !this.IsSearch3)
                var searchkey = $(SheetWorkflowManager.SearchTxtElement).val().trim();
            else
                var searchkey = $(SheetWorkflowManager.SearchTxtElement2).val().trim();
            var currentTime = new Date();
            if ((currentTime - this.KeyTime) < 499) return;
            if (!SheetWorkflowManager.SearchKey && !searchkey) {
                return;
            }
            if (!searchkey) {
                if (!this.IsMobile) {
                    SheetWorkflowManager.SearchKey = searchkey;
                    SheetWorkflowManager.OrgListPanel.html("");
                    SheetWorkflowManager.TreeManager.selectNode(SheetWorkflowManager.TreeManager.nodes[0]);
                }
                else {
                    SheetWorkflowManager.OrgListPanel.html("");
                }
                SheetWorkflowManager.OrgTreePanel.show();
                SheetWorkflowManager.OrgListPanel.hide();
                return;
            }
            else {
                SheetWorkflowManager.OrgTreePanel.hide();
                SheetWorkflowManager.OrgListPanel.show();
            }
            SheetWorkflowManager.SearchMode = true;
            SheetWorkflowManager.SearchKey = searchkey;
            SheetWorkflowManager.OrgListPanel.html("");

            for (var k in SheetWorkflowManager.SearchResults) {
                if (SheetWorkflowManager.SearchResults[k].SearchKey == searchkey
                    && SheetWorkflowManager.SearchResults[k].ParentID == SheetWorkflowManager.SelectedValue) {
                    if (SheetWorkflowManager.SearchResults[k].Data && SheetWorkflowManager.SearchResults[k].Data.length) {
                        for (var i = 0; i < SheetWorkflowManager.SearchResults[k].Data.length; ++i) {
                            if (SheetWorkflowManager.SearchResults[k].Data[i].DisplayName != "常用流程")
                                SheetWorkflowManager.AddListItem.apply(SheetWorkflowManager, [SheetWorkflowManager.SearchResults[k].Data[i], searchkey, ""]);
                        }
                    }
                    else {
                        SheetWorkflowManager.OrgListPanel.html('<li class="user-item">没有流程模板</li>');
                    }
                    return;
                }
            }
            var param = SheetWorkflowManager.GetLoadTreeOption();
            $.ajax({
                type: "GET",
                url: SheetWorkflowManager.SheetWorkflowHandler + "?" + param + "&SearchKey=" + encodeURIComponent(searchkey),
                dataType: "json",
                //async: false,//同步执行
                success: function (data) {
                    if (SheetWorkflowManager.IsMobile) {
                        SheetWorkflowManager.AddMobileOptions(data, SheetWorkflowManager.OrgListPanel);

                        setTimeout(function () {
                            SheetWorkflowManager.RefreshMobilePage();
                        }, 550);
                    }
                    else {
                        if (data != null && data.length > 0) {
                            for (var i = 0; i < data.length; ++i) {
                                if (data[i].DisplayName != "常用流程")
                                    SheetWorkflowManager.AddListItem.apply(SheetWorkflowManager, [data[i], searchkey, ""]);
                            }
                        }
                        else {
                            SheetWorkflowManager.OrgListPanel.html("<li class='user-item'>没搜索到流程</li>");
                        }
                    }
                    SheetWorkflowManager.SearchResults.push({ SearchKey: searchkey, ParentID: SheetWorkflowManager.SelectedValue, Data: data });
                }
            });
        },

        // 添加组织机构选择列项
        AddListItem: function (node, searchkey, path) {
            var displayText = node.DisplayName;
            if (searchkey && node.IsLeaf) {
                this.AddSelectListItem(node, searchkey, path)
            } else if (searchkey && !node.IsLeaf && node.children.length > 0) {
                path += node.DisplayName + "/";
                for (var i = 0; i < node.children.length; i++) {
                    this.AddListItem(node.children[i], searchkey, path);
                }
            }
        },

        AddSelectListItem: function (node, searchkey, nodepath) {
            var displayText = node.DisplayName;
            if (searchkey) {
                displayText = displayText.replace(searchkey, "<span class='bg-info'>" + searchkey + "</span>");
            }
            var pathlength = nodepath.split('/').length;
            if (pathlength > 3) {
                nodepath = nodepath.split('/')[0] + "/.../" + nodepath.split('/')[pathlength - 2] + '/';
                displayText = "<span style='color:lightgray;'>" + nodepath + "</span>" + displayText;
            } else {
                displayText = "<span style='color:lightgray;'>" + nodepath + "</span>" + displayText;
            }


            if (this.IsMobile) {
                var item = $("<div></div>");
                item.css("border-bottom", "1px solid #ccc");
                item.height("50px");
                item.css("clear", "both");
                var checkid = $.MvcSheetUI.NewGuid();
                var checkbox = $("<input type='checkbox' ObjectID='" + node.Code + "' id='" + checkid + "'/>");
                item.append(checkbox);
                item.append($("<label type='checkbox' label-for='" + checkid + "'>" + displayText + "</label>").css("float", "none").css("left", "25px"));
                this.OrgListPanel.append(item);

                var thatSheetUser = this;
                item.bind("touchstart", function () {
                    checkbox.click();

                    thatSheetUser.UnitCheckboxClick.apply(checkbox.get(0), [thatSheetUser, { Code: node.Code, DisplayName: node.DisplayName }]);
                });
            }
            else {
                var item = $("<div>").addClass("task").append("<i class='task-sort-icon fa  " + node.Icon + "'></i>").append("&nbsp;<span class='task-title' style='word-break: break-all;width: 85%;display: inline-table;'>" + displayText + "</span>");
                item.css("padding", "5px 10px 5px 10px").css("border", "1px solid #e4e4e4").css("cursor", "pointer");
                var checkid = $.MvcSheetUI.NewGuid();
                var checkbox = $("<input type='checkbox' ObjectID='" + node.Code + "' id='" + checkid + "'/>").css("height", "auto").css("margin", "0px").show();
                var checkItem = $("<div>").addClass("action-checkbox pull-right").append(checkbox);

                //全选按钮(多选才出现全选按钮)
                if ($('#SearchSelectAll').html() == null && this.IsMultiple) {
                    var Allselectitem = $("<div>").addClass("task").append("<span class='task-title'>全选</span>");
                    Allselectitem.css("padding", "5px 10px 5px 10px").css("cursor", "pointer");
                    this.OrgListPanel.append(Allselectitem.append('<div class="pull-right"><input type="checkbox" id="SearchSelectAll" style="height: auto; margin: 0px; display: inline-block;"></div>'));
                    Allselectitem.click(function (e) {
                        var obj = $(this).parent().find('div.action-checkbox').find('input[type="checkbox"]');
                        if ($("#SearchSelectAll").prop("checked") == true) {
                            obj.prop("checked", false);
                        } else {
                            obj.prop("checked", true);
                        }
                        obj.trigger('click');
                    });
                }

                item.click(function (e) {
                    if (e.target.tagName.toLowerCase() != "input") {
                        $(this).find("input").click();
                    }
                });
                this.OrgListPanel.append(item.append(checkItem));
                checkbox.attr("checked", this.Choices[node.Code] != undefined);

                checkbox.click({ that: this, option: { Code: node.Code, DisplayName: node.DisplayName } }, function (e) {
                    if ($(this).prop("checked") == true) {
                        e.data.that.UnitCheckboxClick.apply(this, [e.data.that, e.data.option]);
                    } else {
                        e.data.that.RemoveChoice([e.data.option.Code]);
                    }
                });
            }
        },

        // 单元选人点击
        UnitCheckboxClick: function (that, node) {
            if (this.checked) {
                if (!that.IsMultiple) {
                    that.ClearChoices.apply(that);
                    that.OrgListPanel.find("input").attr("checked", false);
                    this.checked = true;
                    if (that.IsMobile && that.Level > 0) {
                        $.ui.goBack(that.Level);
                        that.Level = 0;
                    }
                    that.FocusOutput.apply(that);
                }
                that.AddChoice.apply(that, [node]);
            }
            else {
                if (that.IsMultiple)
                    that.RemoveChoice.apply(that, [node.ObjectID]);
                else
                    that.ClearChoices.apply(that);
            }

            if (that.OnChange) {
                that.RunScript(this, that.OnChange, [node]);
            }
        }
    });
})(jQuery);
