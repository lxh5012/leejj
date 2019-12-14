//复选框

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