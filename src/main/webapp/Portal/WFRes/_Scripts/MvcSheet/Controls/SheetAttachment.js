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
                })
            }
            else {
                document.getElementById("myUpfile").addEventListener("click", function(){
                })
                // var hideSheet = $.MvcSheetUI.IonicFramework.$ionicActionSheet.show({
                //     buttons: [
                //         {text: SheetLanguages.Current.TakePhotos},
                //         {text: SheetLanguages.Current.FileSelect}
                //     ],
                //     cancelText: SheetLanguages.Current.Cancel,
                //     cancel: function () {
                //         return false;
                //     },
                //     buttonClicked: function (index) {
                //         if (index == 0) {
                //             hideSheet();
                //             //限定只能上传图片和相机
                //             _that.FileUpload.removeAttr("multiple").attr("accept", "image/*").attr("capture", "camera");
                //             if ($(_that.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase()) != _that.DataField)
                //                 return;
                //             _that.FileUpload.click();
                //         } else {
                //             hideSheet();
                //             _that.FileUpload.removeAttr("capture").removeAttr("accept");
                //             //if (_that.FileExtensions) {
                //             //    _that.FileUpload.attr("accept", _that.FileExtensions)
                //             //}
                //             if ($(_that.Element).data($.MvcSheetUI.DataFieldKey.toLowerCase()) != _that.DataField)
                //                 return;
                //             _that.FileUpload.click();
                //         }
                //     }
                // });
                // $.MvcSheetUI.IonicFramework.$timeout(function () {
                //     hideSheet();
                // }, 10000);
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