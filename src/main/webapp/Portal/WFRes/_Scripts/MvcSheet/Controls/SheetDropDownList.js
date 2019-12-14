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