﻿SheetControls = {
    SheetAttachment: {
        DesignProperties: [
            { Name: "DataField", Text: "数据项名称", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "AllowBatchDownload", Text: "批量下载", Description: "获取或设置是否允许批量下载", DefaultValue: true, ValueRange: [true, false] },
            { Name: "FileExtensions", Text: "支持扩展名", Description: "获取或设置附件上传的文件名格式,示例:.jpg,.gif", DefaultValue: "", ValueRange: null },
            { Name: "MaxUploadSize", Text: "最大上传大小", Description: "获取或设置限制文件上传的大小(MB)，默认为 10MB", DefaultValue: 10, ValueRange: null }
        ]
    },
    SheetCheckbox: {
        DesignProperties: [
            { Name: "DataField", Text: "数据项名称", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultValue", Text: "默认值", Description: "获取或设置控件的默认值", DefaultValue: false, ValueRange: [true, false] },
            { Name: "Text", Text: "文本描述", Description: "获取或设置控件的文本说明", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置选项值改变事件" }
        ]
    },
    SheetCheckboxList: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultItems", Description: "获取或设置绑定的选项值，多个值以;隔开", DefaultValue: "", ValueRange: null },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则", DefaultValue: "", ValueRange: null },
            { Name: "MasterDataCategory", Description: "获取或设置绑定的数据字典类型名称", DefaultValue: "", ValueRange: null },
            { Name: "RepeatColumns", Description: "获取或设置要在控件中显示的列数", DefaultValue: "5", ValueRange: null },
            { Name: "RepeatDirection", Description: "获取或设置组中单选按钮的显示方向", DefaultValue: "Horizontal", ValueRange: ["Horizontal", "Vertical"] },
            { Name: "SelectedValue", Description: "获取或设置控件选中的值", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证规则，为True时必填!", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置选择和取消选择事件" }
        ]
    },
    SheetComment: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultComment", Description: "获取或设置默认审批意见", DefaultValue: "", ValueRange: null },
            { Name: "DisplaySign", Description: "获取或设置是否显示用户签名", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DisplayHead", Description: "获取或设置是否显示用户头像", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DisplayBorder", Description: "获取或设置历史意见是否显示边框", DefaultValue: true, ValueRange: [true, false] },
            { Name: "FrequentCommentVisible", Description: "获取或设置是否显示常用意见", DefaultValue: true, ValueRange: [true, false] },
            { Name: "FrequentSettingVisible", Description: "获取或设置是否显示设置为常用意见", DefaultValue: true, ValueRange: [true, false] },
            { Name: "LastestCommentOnly", Description: "获取或设置是否显示最后一条意见", DefaultValue: false, ValueRange: [true, false] },
            { Name: "NullCommentTitleVisible", Description: "获取或设置当意见为空时是否显示意见标题", DefaultValue: true, ValueRange: [true, false] },
            { Name: "OUNameVisible", Description: "获取或设置是否显示OU名称", DefaultValue: false, ValueRange: [true, false] },
            { Name: "ActivityNameVisible", Description: "获取或设置是否显示活动节点名称", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DateNewLine", Description: "获取或设置签名和日期是否换行", DefaultValue: false, ValueRange: [true, false] }
        ]
    },
    SheetDropDownList: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultItems", Description: "获取或设置绑定的默认值，多个值以&quot;;&quot;号隔开", DefaultValue: "", ValueRange: null },
            { Name: "DisplayEmptyItem", Description: "获取或设置是否默认显示空项", DefaultValue: false, ValueRange: [true, false] },
            { Name: "EmptyItemText", Description: "获取或设置空项显示文本", DefaultValue: "", ValueRange: null },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则。", DefaultValue: "", ValueRange: null },
            { Name: "MasterDataCategory", Description: "获取或设置绑定数据字典的类型", DefaultValue: "", ValueRange: null },
            { Name: "Queryable", Description: "获取或设置是否允许对项目进行搜索", DefaultValue: true, ValueRange: [true, false] },

            { Name: "SchemaCode", Description: "获取或设置绑定的业务对象名称", DefaultValue: "", ValueRange: null, Popup: "DropDownListSetting", Height: 450, Width: 540 },
            { Name: "QueryCode", Description: "获取或设置业务对象的查询编码", DefaultValue: "", ValueRange: null, Popup: "DropDownListSetting", Height: 450, Width: 540 },
            { Name: "Filter", Description: "获取或设置过滤条件，例如&quot;数据项:查询字段1,控件ID:查询字段2,固定值:查询字段3&quot;", DefaultValue: "", ValueRange: null, Popup: "DropDownListSetting", Height: 450, Width: 540 },
            { Name: "DataValueField", Description: "获取或设置数据源绑定时显示的值字段的名称", DefaultValue: "", ValueRange: null, Popup: "DropDownListSetting", Height: 450, Width: 540 },
            { Name: "DataTextField", Description: "获取或设置数据源绑定时显示的文本字段的名称", DefaultValue: "", ValueRange: null, Popup: "DropDownListSetting", Height: 450, Width: 540 },

            { Name: "SelectedValue", Description: "获取或设置下拉框选定的值", DefaultValue: "", ValueRange: null },
            { Name: "TextDataField", Description: "获取或设置存储选中项文本值的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证规则，为True时必填!", DefaultValue: "", ValueRange: null },
            { Name: "ViewInNewContainer", Description: "获取或设置在移动端是否显示到新窗口", DefaultValue: false, ValueRange: [true, false] }

        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置数据改变时执行脚本" }
        ]
    },
    SheetGridView: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DisplayAdd", Description: "获取或设置是否显示添加按钮", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DisplayClear", Description: "获取或设置是否显示清除按钮", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DisplayDelete", Description: "获取或设置是否显示删除按钮", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DisplayExport", Description: "获取或设置是否显示导出按钮", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DisplayImport", Description: "获取或设置是否显示导入按钮", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DisplayInsertRow", Description: "获取或设置是否显示插入行按钮", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DefaultRowCount", Description: "获取或设置显示默认行总数", DefaultValue: 1, ValueRange: null },
            { Name: "DisplaySequenceNo", Description: "获取或设置是否显示序号行", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DisplaySummary", Description: "获取或设置是否显示汇总行", DefaultValue: true, ValueRange: [true, false] },
            { Name: "VirtualPaging", Description: "获取或设置是否分页加载", DefaultValue: false, ValueRange: [true, false] },
            { Name: "VirtualPageNum", Description: "获取或设置每页加载行数", DefaultValue: 10, ValueRange: [10, 20, 30, 40, 50] },
            { Name: "AlternatingRowStyle", Description: "获取或设置奇数行样式,如：background-color:#ccc", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnPreAdd", Description: "获取或设置添加行之前的事件", DefaultValue: "", ValueRange: null },
            { Name: "OnAdded", Description: "获取或设置添加行后的事件", DefaultValue: "", ValueRange: null },
            { Name: "OnEditorSaving", Description: "获取或设置子表行的保存事件", DefaultValue: "", ValueRange: null },
            { Name: "OnPreRemove", Description: "获取或设置删除行之前的事件", DefaultValue: "", ValueRange: null },
            { Name: "OnRemoved", Description: "获取或设置删除行后的事件", DefaultValue: "", ValueRange: null },
            { Name: "OnRendered", Description: "获取或设置控件初始化完成后事件", DefaultValue: "", ValueRange: null }
        ]
    },
    SheetCountLabel: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "StatType", Description: "获取或设置控件统计的方式", DefaultValue: "SUM", ValueRange: ["NONE", "SUM", "AVG", "MAX", "MIN"] },
            { Name: "FormatRule", Description: "获取或设置控件的格式化规则,如{0：C2}", DefaultValue: "", ValueRange: null }
        ]
    },
    SheetHyperLink: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "NavigateUrl", Description: "获取或设置链接的URL", DefaultValue: "", ValueRange: null },
            { Name: "NavigateUrlDataField", Description: "获取或设置链接URL绑定的数据项值", DefaultValue: "", ValueRange: null },
            { Name: "Text", Description: "获取或设置链接显示的文本", DefaultValue: "", ValueRange: null },
            { Name: "TextDataField", Description: "获取或设置显示链接文本的数据项名称", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: []
    },
    SheetInstancePrioritySelector: {
        DesignProperties: [
           { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
           { Name: "DefaultValue", Description: "获取或设置默认选定的值", DefaultValue: "Normal", ValueRange: ["High", "Normal", "Low"] }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置控件的点击事件" }
        ]
    },
    SheetLabel: {
        BindTypeEnum: { OnlyVisiable: "onlyvisiable", OnlyData: "onlydata" },
        DesignProperties: [
           { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
           { Name: "BindType", Description: "获取或设置控件绑定的方式", DefaultValue: "OnlyVisiable", ValueRange: ["OnlyVisiable", "OnlyData"] },
           { Name: "ComputationRule", Description: "获取或设置控件的计算规则", DefaultValue: "", ValueRange: null },
           { Name: "DisplayRule", Description: "获取或设置控件的显示规则", DefaultValue: "", ValueRange: null }
           //, { Name: "MobileText", Description: "获取或设置在移动办公模式时显示的文本", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnClick", Description: "设置控件的点击事件" }
        ]
    },
    SheetOffice: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "PDFDataField", Description: "获取或设置绑定的PDF文件数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "Template", Description: "获取或设置文档的模板路径", DefaultValue: "Office/Template.doc", ValueRange: null },
            { Name: "SignType", Description: "获取或设置印章类型(服务器/EKEY)", DefaultValue: "Server", ValueRange: ["Server", "EKEY"] },
            { Name: "SignUrl", Description: "获取或设置(服务器)印章URL", DefaultValue: "", ValueRange: null },
            { Name: "SignBookmark", Description: "获取或设置印章位置书签", DefaultValue: "SignDate", ValueRange: null },
            { Name: "SignLeft", Description: "获取或设置印章位置相对书签的水平位移", DefaultValue: "0", ValueRange: null },
            { Name: "SignTop", Description: "获取或设置印章位置相对书签的垂直位移", DefaultValue: "0", ValueRange: null },
            { Name: "OfficeHeight", Description: "获取或设置Office控件的Height值", DefaultValue: "800px", ValueRange: null },
            { Name: "OfficeWidth", Description: "获取或设置Office控件的OfficeWidth值", DefaultValue: "800px", ValueRange: null },
            { Name: "RedTemplate", Description: "获取或设置套用模板的URL", DefaultValue: "", ValueRange: null },
            { Name: "BookmartMapping", Description: "获取或设置套用模板书签与数据项映射关系", DefaultValue: "", ValueRange: null },
            { Name: "CABPath", Description: "获取或设置CABPath包所在的路径", DefaultValue: "officecontrol.cab", ValueRange: null },
            { Name: "ClassID", Description: "获取或设置绑定的NTKO给定的ClassID", DefaultValue: "A39F1330-3322-4a1d-9BF0-0BA2BB90E970", ValueRange: null },
            { Name: "ProductVersion", Description: "获取或设置绑定的NTKO给定的Version", DefaultValue: "5,0,1,6", ValueRange: null },
            { Name: "ProductCaption", Description: "获取或设置绑定的NTKO给定的ProductCaption", DefaultValue: "", ValueRange: null },
            { Name: "ProductKey", Description: "获取或设置绑定的NTKO给定的ProductKey", DefaultValue: "422A6ECE92EB12A0E87319303E6160A06B3C897E", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnTemplate", Description: "设置文档控件的模板套用事件" },
            { Name: "OnSign", Description: "设置文档控件加盖签章的方法" }
        ]
    },
    SheetRadioButtonList: {
        RepeatDirectionEnum: { OnlyVisiable: "horizontal", All: "vertical" },
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultItems", Description: "获取或设置控件的显示项", DefaultValue: "", ValueRange: null }, /*Render时，转换为<option></option>*/
            { Name: "DefaultSelected", Description: "获取或设置是否默认选中状态", DefaultValue: true, ValueRange: [true, false] },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则。", DefaultValue: "", ValueRange: null },
            { Name: "MasterDataCategory", Description: "获取或设置绑定的数据字典类型名称", DefaultValue: "", ValueRange: null },
            { Name: "RepeatColumns", Description: "获取或设置要在每行显示的列数。", DefaultValue: 5, ValueRange: null },
            { Name: "RepeatDirection", Description: "获取或设置组中单选按钮的显示方向。", DefaultValue: "Horizontal", ValueRange: ["Horizontal", "Vertical"] },
            { Name: "SelectedValue", Description: "获取或设置控件选中的值", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证规则，为True时必填!", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置数据改变时执行脚本。" }
        ]
    },
    SheetRichTextBox: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "AutoTrim", Description: "获取或设置是否自动去除前后空格", DefaultValue: false, ValueRange: [true, false] },
            { Name: "DefaultValue", Description: "获取或设置控件的默认值", DefaultValue: "", ValueRange: null },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "PlaceHolder", Description: "获取或设置控件的水印文本", DefaultValue: "", ValueRange: null },
            { Name: "RichTextBox", Description: "获取或设置是否使用富文本框进行展现", DefaultValue: false, ValueRange: [true, false] },
            { Name: "ToolTip", Description: "获取或设置显示的提示信息", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证规则", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "PopupWindow", Description: "获取或设置是否支持开窗查询", DefaultValue: "None", ValueRange: ["None", "PopupWindow", "Dropdown"] },
            { Name: "DisplayText", Description: "获取或设置开窗查询文本", DefaultValue: "选择", ValueRange: null },
            { Name: "PopupHeight", Description: "获取或设置开窗查询高度", DefaultValue: "400px", ValueRange: null },
            { Name: "PopupWidth", Description: "获取或设置开窗查询宽度", DefaultValue: "600px", ValueRange: null },
            { Name: "SchemaCode", Description: "获取或设置文本框开窗查询绑定的业务对象编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "QueryCode", Description: "获取或设置文本框开窗查询绑定的查询编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "InputMappings", Description: "获取或设置开窗查询输入参数条件，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "OutputMappings", Description: "获取或设置开窗查询输出关系映射，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "ViewInNewContainer", Description: "获取或设置在移动端是否显示到新窗口", DefaultValue: false, ValueRange: [true, false] }
        ],
        DesignEvents: []
    },
    SheetTextBox: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },             // OK
            { Name: "ComputationRule", Description: "获取或设置控件的计算规则", DefaultValue: "", ValueRange: null, Popup: "ComputationRule", Height: 390, Width: 490 },
            { Name: "DefaultValue", Description: "获取或设置控件的默认值", DefaultValue: "", ValueRange: null },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "FormatRule", Description: "获取或设置控件的格式化规则,如{0：C2}", DefaultValue: "", ValueRange: null },
            { Name: "PlaceHolder", Description: "获取或设置控件的水印文本", DefaultValue: "", ValueRange: null },
            { Name: "ToolTip", Description: "获取或设置显示的提示信息", DefaultValue: "", ValueRange: null },
            { Name: "RegularExpression", Description: "获取或设置控件的正则表达式规则", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxRegular", Height: 450, Width: 540 },
            { Name: "RegularInvalidText", Description: "获取或设置验证失败时显示的文本", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证表达式，为True时必填!", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "PopupWindow", Description: "获取或设置是否支持开窗查询", DefaultValue: "None", ValueRange: ["None", "PopupWindow", "Dropdown"] },
            { Name: "DisplayText", Description: "获取或设置开窗查询文本", DefaultValue: "选择", ValueRange: null },
            { Name: "PopupHeight", Description: "获取或设置开窗查询高度", DefaultValue: "400px", ValueRange: null },
            { Name: "PopupWidth", Description: "获取或设置开窗查询宽度", DefaultValue: "600px", ValueRange: null },
            { Name: "SchemaCode", Description: "获取或设置文本框开窗查询绑定的业务对象编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "QueryCode", Description: "获取或设置文本框开窗查询绑定的查询编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "InputMappings", Description: "获取或设置开窗查询输入参数条件，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "OutputMappings", Description: "获取或设置开窗查询输出关系映射，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },

            { Name: "ViewInNewContainer", Description: "获取或设置在移动端是否显示到新窗口", DefaultValue: false, ValueRange: [true, false] }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置文本框值改变事件" },
            { Name: "OnFocus", Description: "获取或设置文本框获取焦点时事件" },
            { Name: "OnKeyDown", Description: "获取或设置键盘摁下事件" },
            { Name: "OnKeyUp", Description: "获取或设置键盘回弹事件" }
        ]
    },
    SheetAssociation: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DisplayRule", Description: "获取或设置控件的显示规则", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "PlaceHolder", Description: "获取或设置控件的水印文本", DefaultValue: "", ValueRange: null },
            { Name: "VaildationRule", Description: "获取或设置控件的验证表达式，为True时必填!", DefaultValue: "", ValueRange: null, RichProperty: true },
            { Name: "LinkMode", Description: "获取或设置点击打开关联表单的链接方式", DefaultValue: "None", ValueRange: ["None", "BizObject", "Workflow"] },
            { Name: "DisplayText", Description: "获取或设置开窗查询文本", DefaultValue: "选择", ValueRange: null },
            { Name: "PopupHeight", Description: "获取或设置开窗查询高度", DefaultValue: "400px", ValueRange: null },
            { Name: "PopupWidth", Description: "获取或设置开窗查询宽度", DefaultValue: "600px", ValueRange: null },
            { Name: "SchemaCode", Description: "获取或设置文本框开窗查询绑定的业务对象编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "QueryCode", Description: "获取或设置文本框开窗查询绑定的查询编码", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "InputMappings", Description: "获取或设置开窗查询输入参数条件，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "OutputMappings", Description: "获取或设置开窗查询输出关系映射，例&quot;数据项1:查询字段1,数据项2:查询字段2&quot;", DefaultValue: "", ValueRange: null, Popup: "SheetTextBoxSetting", Height: 450, Width: 550 },
            { Name: "ViewInNewContainer", Description: "获取或设置在移动端是否显示到新窗口", DefaultValue: true, ValueRange: [true, false] }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置绑定值变更后事件" }
        ]
    },
    SheetTime: {
        TimeModeEnum: { "OnlyDate": "OnlyDate", "SimplifiedTime": "SimplifiedTime", "FullTime": "FullTime", "OnlyTime": "OnlyTime" },
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
            { Name: "DefaultValue", Description: "获取或设置当前控件的默认值", DefaultValue: "", ValueRange: null },
            { Name: "TimeMode", Description: "获取或设置日期控件的显示模式", DefaultValue: "OnlyDate", ValueRange: ["OnlyDate", "FullTime", "SimplifiedTime", "OnlyTime"] },
            { Name: "MinValue", Description: "获取或设置日期控件显示的最小值", DefaultValue: "2010-01-01 00:00:00", ValueRange: null },
            { Name: "MaxValue", Description: "获取或设置日期控件显示的最大值", DefaultValue: "2050-12-31 23:59:59", ValueRange: null },
            { Name: "WdatePickerJson", Description: "获取或设置日期控件的显示JSON字符串(参考WdatePicker控件)", DefaultValue: "", ValueRange: null },
            { Name: "ViewInNewContainer", Description: "获取或设置在移动端是否显示到新窗口", DefaultValue: false, ValueRange: [true, false] }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置日期选定值变更后事件" }
        ]
    },
    SheetWorkflow: {
        DesignProperties: [
             { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
             { Name: "DefaultValue", Description: "获取或设置选人控件绑定的默认值", DefaultValue: "", ValueRange: null },
             { Name: "PlaceHolder", Description: "获取或设置控件的水印文本", DefaultValue: "", ValueRange: null },
             { Name: "RootCode", Description: "获取或设置根节点流程模板编码", DefaultValue: "", ValueRange: null },
             { Name: "WorkflowCodes", Description: "获取或设置根节点流程模板编码", DefaultValue: "", ValueRange: null },
             { Name: "Mode", Description: "获取或设置选择方式(流程包/流程模板)", DefaultValue: "Package", ValueRange: ["Package", "WorkflowTemplate"] },
             { Name: "IsMultiple", Description: "获取或设置是否支持多选", DefaultValue: true, ValueRange: [true, false] },
             { Name: "AllowSearch", Description: "获取或设置是否支持搜索", DefaultValue: true, ValueRange: [true, false] },
             { Name: "IsShared", Description: "获取或设置是否值显示共享流程包", DefaultValue: false, ValueRange: [true, false] }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置流程模板的Change事件" }
        ]
    },
    SheetUser: {
        DesignProperties: [
             { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null },
             { Name: "DefaultValue", Description: "获取或设置选人控件绑定的默认值", DefaultValue: "", ValueRange: null },
             { Name: "PlaceHolder", Description: "获取或设置控件的水印文本", DefaultValue: "", ValueRange: null },
             // { Name: "SegmentVisible", Description: "获取或设置是否选择【组织群】", DefaultValue: false, ValueRange: [true, false] },
             { Name: "OrgUnitVisible", Description: "获取或设置是否选择【组织单元】", DefaultValue: false, ValueRange: [true, false] },
             { Name: "GroupVisible", Description: "获取或设置是否选择【用户组】", DefaultValue: false, ValueRange: [true, false] },
             //{ Name: "PostVisible", Description: "获取或设置是否选择【岗位】", DefaultValue: false, ValueRange: [true, false] },
             { Name: "UserVisible", Description: "获取或设置是否选择【用户】", DefaultValue: true, ValueRange: [true, false] },
             { Name: "RootUnitID", Description: "获取或设置显示的根节点组织节点ID", DefaultValue: "", ValueRange: null },
             { Name: "VisibleUnits", Description: "获取允许显示的组织单元ID集合", DefaultValue: "", ValueRange: null },
             { Name: "Recursive", Description: "获取或设置是否递归显示所有子节点", DefaultValue: true, ValueRange: [true, false] },
             { Name: "RootSelectable", Description: "获取或设置是否允许选择根节点", DefaultValue: true, ValueRange: [true, false] },
             { Name: "OrgSelectable", Description: "获取或设置是否允许选择发起人", DefaultValue: true, ValueRange: [true, false] },
             // { Name: "RoleName", Description: "获取或设置显示指定的组名称中的用户", DefaultValue: "", ValueRange: null },
             // { Name: "OrgJobCode", Description: "获取或设置显示指定的职务编码中的用户", DefaultValue: "", ValueRange: null },
             // { Name: "OrgPostCode", Description: "获取或设置显示指定的岗位编码中的用户", DefaultValue: "", ValueRange: null },
             { Name: "UserCodes", Description: "获取或设置只显示指定帐号的用户，多个以,分隔", DefaultValue: "", ValueRange: null },
             { Name: "MappingControls", Description: "获取控件和属性映射关系", DefaultValue: "", ValueRange: null, Popup: "SheetUserSetting", Height: 430, Width: 520 }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置控件的选人变更事件" }
        ]
    },
    // 属性定义
    SheetTimeSpan: {
        DesignProperties: [
            { Name: "DataField", Description: "获取或设置控件绑定的数据项名称", DefaultValue: "", ValueRange: null }
        ],
        DesignEvents: [
            { Name: "OnChange", Description: "获取或设置日期选定值变更后事件" }
        ]
    }
};

// JS 多语言包
var SheetLanguages = {
    Current: {},
    zh_cn: {
        Approve:'同意',
        Back: "返回",
        Spread: "展开",
        Retract: "收起",
        WorkflowCharts: '流程图',
        ChangeMode: '切换模式',
        ChildSchema: '子表',
        ChildSchemaInfo1: '子表信息',
        ChildSchemaInfo2: '(共',
        ChildSchemaInfo3: '条记录)',
        AddChildSchema: '添加子表明细',
        Copy: '复制',
        Delete: '删除',
        SelectAll: '全选',
        UnselectAll: '全不选',
        TakePhotos: '拍照',
        FileSelect: '文件选择',
        AtatchmentAcction: '附件操作',
        More: "更多",
        Comfirm: '确定',
        State: '流程状态',
        Confirm: '确定',
        InputYourComment: '请输入您的审批意见',
        InputYourForwardComment: '请输入转办意见',
        InputYourAssistComment: '请输入协办意见',
        InputYourConsultComment: '请输入征询意见',
        hasSelectDefault: '已选择默认',
        PleaseInput: '请输入',
        PleaseSelect:'请选择',
        hasBeenSelected: '已选择',
        FreComments: '常用意见',
        PleaseSelectComment:'请选择',
        //常用审批意见
        Signature: '签章',
        Comments: '审批意见',
        ForwardComment: '转办意见',
        AssistComment: '协办意见',
        ConsultComment: '征询意见',
        Forward: '转办',
        Assist: '协办',
        Consult: '征询',
        Circulate: '传阅',
        Approver: '审批',
        Waiting:'等待',
        Uploading: "未上传完!",
        Add: "添加",
        Upload: "上传",
        All: "全部",
        OK: "确定",
        Clear: "清除",
        Remove: "删除",
        Export: "导出",
        Close: "关闭",
        Import: "导入",
        Cancel: "取消",
        DragUpload: "点击上传或拖拽文件到此上传",
        Loading: "请稍候...",
        Doing: "正在处理",
        ConfirmRemove: "确认删除？",
        FileExtError: "文件格式不对",
        OverMaxLength: "超出限制文件上传的大小",
        Download: "下载",
        Preview: "预览",
        UploadError: "上传失败",
        DataItemNotExists: "数据项不存在",
        MyComment: "我的意见",
        Today: "今天",
        Notice: "提示",
        Delegant: "委托",
        SelectComment: "请选择常用意见",
        FrequentlyUsedComment: "设为常用",
        SelectSign: "请选择签章",
        Records: "条记录",
        BookmarkNotExists: "Word 模板中不存在名称为 {{0}} 的书签!",
        PdfNotSave: "不能执行保存,没有编辑文档或者没有安装PDF虚拟打印机!",
        IE: "请使用IE浏览器，并安装第三方插件！",
        CreatePDF: "生成PDF",
        ViewPDF: "查看PDF",
        AddESP: "加盖印章",
        AddTemplate: "套用模板",
        EnterInteger: "请输入一个有效的整数",
        VerifyIntRange: "输入的整数超出范围",
        VerifyLongRange: "输入的长整数超出范围",
        EnterNumber: "请输入一个有效的数值",
        Day: "天",
        Hour: "小时",
        Minute: "分钟",
        Second: "秒",
        SelectUser: "请选择参与者",
        ConfirmCancelInstance: "确定执行取消流程操作?",
        Disagree: "不同意",
        Agree: "同意",
        Search: "搜索",
        ConfirmFinishInstance: "确定执行结束流程操作?",
        SelectForwardUser: "请选择转办人",
        SelectAssistUser: "请选择协办接收人",
        AssistRemind: "用户提交意见或取消协助任务时接收邮件提醒",
        ConsultRemind: "用户提交意见时接收邮件提醒.",
        SelectConsultUser: "请选择要征询意见的人",
        SelectCirculateUser: "请选择要传阅的人员",
        AllowCirculate: "允许再传阅给其他人",
        SelectSignUser: "请选择要加签的人",
        ConfrimClose: "确定要关闭页面?",
        ConfirmReterive: "确定执行取回流程操作",
        SelectFromOrg: "从组织架构选择",
        SearchNone: "没搜索到组织",
        Saving: "正在保存...",
        Sumiting: "正在提交...",
        Reject: "驳回",
        Rejecting: "正在驳回...",
        Finishing: "正在结束流程...",
        Retrieving: "正在取回流程...",
        ConfirmDo: "确定执行",
        Operation: "操作",
        SubmitPrompt:"即同意，流程将继续流转",
        ForwardPrompt:"允许当前用户将任务转&#10;办给其他人，转办后自&#10;己的任务消失，由转办&#10;人进行继续处理；",
        RetrievePrompt:"提交任务后，并且下一活动&#10;环节未处理时，取回后任务&#10;重新回到当前用户的待办中；",
        RejectPrompt:"即拒绝，将流程驳回到某&#10;一节点，被驳回人需在待&#10;办中重新处理",
        CirculatePrompt:"将当前活动环节传阅给其他用户",
        AssistPrompt:"A协办给B，流程从A消失&#10;并流转到B，B拥有和A一&#10;样的表单权限，B提交后会&#10;直接回到A继续审批",
        //表单基本信息中英文特殊处理
        BasicInfo:{
            divFullName: '发起人',
            divOriginateDate: '发起时间',
            divOriginateOUName: '所属组织',
            divSequenceNo:'流水号'
        },
        States:{
        	Reject:"驳回",
        	Disagree:"不同意",
        	Agree:"同意",
        	Canceled:"已取消",
        	Running:"进行中",
        	Assist:"发起协办",
        	Forward:"发起转办",
        	Consult:"发起征询",
        	SystomAssist:"的协办",
        	SystomConsult:"的征询",
        	SystomForward:"的转办",
        	Circulate:"传阅",
        	Finishedread:"已阅：",
        	Toread:"待阅：",
        },

        SheetUser: {
            isShow: true,
            organnization: '组织机构',
            departmentStaff: '本部门',
            search: '搜索',
            checkAll: '全选',
            user: '人员',
            result: '',
            Back: '返回',
            confirm: '确定',
            close: '关闭'
        },
        ISOVideoUploadWarn: "IOS系统不支持上传视频附件",
        Query: "查询",
        AssociatedSheet: "关联查询",
        SheetValidateError: "表单验证不通过！",
        //update by ouyangsk
        Reset: '重置',
        NoMoreData: '没有更多的数据',
        ForwardCommentTip:'转办意见（非必填）',
        AssistCommentTip:'协办意见（非必填）',
        ConsultCommentTip:'征询意见（非必填）',
        OperateSuccess: '操作成功',
        CanNotConsuleSelf: '征询失败，不能征询自己！',
        CanNotCirculateSelf: '传阅失败，不能传阅给自己！',
        CanNotAssistSelf: '协办失败，不能协办自己！',
        CanNotConsultCreator: '征询失败，不能征询请求您征询的人！',
        CanNotConsultParticipent: '征询失败，不能征询当前活动参与者！',
        CanNotConsultOriginator: '征询失败，不能征询发起人！',
        ConsultSuccess: '征询成功！',
        HasConsulted: ' 已被征询，不能再次征询！',
        ConsultSuccessInMultiple: ' 已被征询，不能再次征询！其余征询成功！',
        ConsultFailed: '征询失败！',
        CanNotAssistOriginator: '协办失败，不能协办发起人！',
        CanNotAssistCreator: '协办失败，不能协办请求协办的人！',
        CanNotAssistParticipent: '协办失败，不能协办当前活动参与者！',
        HasAssist: ' 已被协办，不能再次协办！',
        AssistFailed: '协办失败！',
        AssistSuccess: '协办成功！',
        AssistSuccessInMultiple: ' 已被协办，不能再次协办！其余协办成功！',
        CirculateSuccess: '传阅成功！',
        CanNotForwardSelf: '转办失败，不能转办给自己！',
        CanNotForwardParticipent: '转办失败，不能转发给当前活动参与者！',
        ForwardSuccess: '转办成功！'
    },
    en_us: {
        Approve: 'Approve',
        Back: 'Back',
        Spread: 'Extend',
        Retract: 'Shrink',
        WorkflowCharts: 'Flow chart',
        ChangeMode: 'Switching mode',
        ChildSchema: 'Child-sheet',
        ChildSchemaInfo1: 'Schema information',
        ChildSchemaInfo2: '(',
        ChildSchemaInfo3: ' in total)',
        AddChildSchema: 'Add a child schema',
        Copy: 'Copy',
        Delete: 'Delete',
        SelectAll: 'Select all',
        UnselectAll: 'Unselect all',
        TakePhotos: 'Camera',
        FileSelect: 'Files',
        AtatchmentAcction: 'Atatchment',
        More: "More",
        State: 'State',
        Confirm: 'Comfirm',
        InputYourComment: 'Please enter your comment',
        InputYourForwardComment: 'Please enter your Forward comment',
        InputYourAssistComment: 'Please enter your Assist comment',
        InputYourConsultComment: 'Please enter your Consult comment',
        hasSelectDefault: "has select default",
        PleaseInput: 'Please input',
        PleaseSelect:'Please select',
        hasBeenSelected: 'has selected',
        FreComments: 'My frequentely used comments',
        PleaseSelectComment: "Please select comment",
        Signature: 'Signature',
        Comments: 'Comments',
        ForwardComment: 'Forward Comment',
        AssistComment: 'Assist Comment',
        ConsultComment: 'Consult Comment',
        Forward: 'Forward',
        Assist: 'Assist',
        Consult: 'Consult',
        Circulate: 'Circulate',
        Approver: 'approve',
        Waiting: 'Waiting',
        Uploading: "upload not complete!",
        Add: "Add",
        All: "All",
        OK: "OK",
        Cancel: "Cancel",
        Search: "Search",
        Close: "Close",
        Clear: "Clear",
        Upload: "Upload",
        Remove: "Remove",
        Export: "Export",
        Import: "Import",
        DragUpload: "Click or drag file to here for upload",
        Loading: "Load...",
        Doing: "Load",
        ConfirmRemove: "Confrim remove this?",
        FileExtError: "File extension error.",
        OverMaxLength: "File size exceeds the limit.",
        Download: "Download",
        Preview: "Preview",
        UploadError: "Upload error",
        DataItemNotExists: "dataitem not exists",
        MyComment: "My comment",
        Today: "Today",
        Notice: "Notice",
        Delegant: "Delegant",
        SelectComment: "Please select comment",
        FrequentlyUsedComment: "Frequently",
        SelectSign: "Please select sign",
        Records: "records",
        BookmarkNotExists: "Bookmark {{0}} is not exists in this word template!",
        PdfNotSave: "Can't save,does not have edit document or pdf creator not install!",
        IE: "Please use the ie browser!",
        CreatePDF: "Create PDF",
        ViewPDF: "View PDF",
        AddESP: "Add Sign",
        AddTemplate: "Add Template",
        EnterInteger: "Please enter a valid integer",
        VerifyIntRange: "The input integers are out of range",
        VerifyLongRange: "The long integers enteredis out of range",
        EnterNumber: "Please enter a valid number",
        Day: "Day",
        Hour: "Hour",
        Minute: "Minute",
        Second: "Second",
        SelectUser: "Please select user",
        ConfirmCancelInstance: "Confirm cancel this instance?",
        Disagree: "Disagree",
        Agree: "Agree",
        ConfirmFinishInstance: "Confirm finish this instance?",
        SelectForwardUser: "Select forward user",
        SelectAssistUser: "Select assist user",
        AssistRemind: "Receive email after assist user submit or cancel.",
        ConsultRemind: "Receive email after consult user submit.",
        SelectConsultUser: "Select consult user",
        SelectCirculateUser: "Select circulate user",
        AllowCirculate: "Allow recirculate to other",
        SelectSignUser: "Add an approve user",
        ConfrimClose: "Confirm close this page?",
        ConfirmReterive: "Confirm retrieve this instance?",
        SelectFromOrg: "Select from organization",
        SearchNone: "No search results",
        Saving: "Saving...",
        Sumiting: "Submiting...",
        Reject: "Reject",
        Rejecting: "Rejecting...",
        Finishing: "Finishing...",
        Retrieving: "Retrieving...",
        ConfirmDo: "Confirm to do ",
        Operation: "",
        SubmitPrompt:"I agree, the process will continue to flow.",
        ForwardPrompt:"Allow the current user to transfer the task to other people.&#10; After the transfer, &#10;the task disappears and the transferee continues to process it;",
        RetrievePrompt:"After the task is submitted, &#10;and the next activity link is not processed, &#10;the task is returned to the current user's pending operation after being retrieved;",
        RejectPrompt:"That is, reject, the process is rejected back to a certain node, &#10;and the rejected person needs to be reprocessed in the pending",
        CirculatePrompt:"Circulate the current activity to other users",
        AssistPrompt:"A co-organizes to B, the process disappears from A and flows to B.&#10; B has the same form permissions as A. After B submits, &#10;it will return directly to A to continue the approval.",
        //表单基本信息中英文特殊处理
        BasicInfo: {
            divFullName: 'Originator',
            divOriginateDate: 'Originate Date',
            divOriginateOUName: 'Originate OUName',
            divSequenceNo: 'SequenceNo'
        },
        SheetUser: {
            isShow:false,
            organnization: 'Organnization',
            departmentStaff: 'DepartmentStaff',
            search: 'Search',
            checkAll: 'Check all',
            user: 'Personnel',
            result: 'No results related to ',
            Back: 'Back',
            confirm: 'Confirm',
            close: 'Close'
        },
        //update by ouyangsk 移动端中显示字符过长，故缩短为此信息
        ISOVideoUploadWarn: "Can't uploading video in IOS system",
        Query: "Query",
        AssociatedSheet: "Associated Sheet",
        SheetValidateError: "Sheet Validate Error!",
        Reset: 'Reset',
        NoMoreData: 'no more data',
        ForwardCommentTip:'forward comment(not required)',
        AssistCommentTip:'assist comment(not required)',
        ConsultCommentTip:'consult comment(not required)',
        OperateSuccess: 'Operate Success!',
        CanNotConsuleSelf: 'Consule Failed, Can Not Consule Yourserf!',
        CanNotCirculateSelf: 'Circulate Failed, Can Not Circulate Yourserf!',
        CanNotAssistSelf: 'Assist Failed, Can Not Assist Yourserf!',
        CanNotConsultCreator: 'Consult Failed, Can Not Consult Creator!',
        CanNotConsultParticipent: 'Consult Failed, Can Not Consult Current Activity Participant!',
        CanNotConsultOriginator: 'Consult Failed, Can Not Consult Originator!',
        ConsultSuccess: 'Consult Success!',
        HasConsulted: ' Has Consulted Can Not Consult Again!',
        ConsultSuccessInMultiple: ' Has Consulted Can Not Consult Again! Others Consulted Success!',
        ConsultFailed: 'Consult Failed!',
        CanNotAssistOriginator: 'Assist Failed, Can Not Assist Originator!',
        CanNotAssistCreator: 'Assist Failed, Can Not Assist Creator!',
        CanNotAssistParticipent: 'Assist Failed, Can Not Assist Current Activity Participant!',
        HasAssist: ' Has Assist Can Not Assist Again!',
        AssistFailed: 'Assist Failed!',
        AssistSuccess: 'Assist Success!',
        AssistSuccessInMultiple: ' Has Assisted Can Not Consult Again! Others Assist Success!',
        CirculateSuccess: 'Circulate Success!',
        CanNotForwardSelf: 'Forward Failed, Can Not Forward Yourserf!',
        CanNotForwardParticipent: 'Forward Failed, Can Not Forward Current Activity Participant!',
        ForwardSuccess: 'Forward Success!'
    }
}