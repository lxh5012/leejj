(function ($) {

    var _CLUSTERROOT_GLOBAL = window.localStorage.getItem("H3.ClusterRoot") || "";
    // 获取当前语言
    var getCurrentLanguage = function () {
        return window.localStorage.NG_TRANSLATE_LANG_KEY || "zh_CN";
    };

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
    }

    // 语言对象
    // console.log("CLUSTERROOT_GLOBAL = " + _CLUSTERROOT_GLOBAL);
    //$.Languages = loadJSON("Cluster_LanguageData_" + getCurrentLanguage(), _CLUSTERROOT_GLOBAL + "/lang/" + getCurrentLanguage() + ".json");
    $.Languages = loadJSON("Cluster_LanguageData_" + getCurrentLanguage(), "lang/" + getCurrentLanguage() + ".json");

    // 控制器对象
    //$.Controller = loadJSON("Cluster_ControllerData", _CLUSTERROOT_GLOBAL+"/lang/ControllerData.json");
    $.Controller = loadJSON("Cluster_ControllerData", "lang/ControllerData.json");

    // 初始化语言配置
    $.initLanguage = function () {
        $("*[data-lang]").each(function (n, k) {
            var key = $.Lang($(this).attr("data-lang"));
            $(this).html(key);
        });

        $("*[data-title]").each(function (n, k) {
            var key = $.Lang($(this).attr("data-title"));
            $(this).attr("title", key);
        });

        $("*[data-desc]").each(function (n, k) {
            var key = $.Lang($(this).attr("data-desc"));
            $(this).attr("desc", key);
        });
    }

    // 获取配置文件中的名称
    $.Lang = function (name) {
        if (name.indexOf("_") == 0) return name.substring(1);
        if (!$.Languages) { return "当前语言包未定义"; };
        if (!name) { throw new Error("获取语言的关键词不能为空!") };
        try {
            return eval("$.Languages." + name) || name;
        }
        catch (e) {
            // throw new Error("语言未设置->Key=" + name);
            return name;
        }
    };

    // 将JSON对象语言化
    $.LangArray = function (obj, key) {
        if (!$.Languages) { return "当前语言包未定义"; };
        if (!obj) { throw new Error("获取语言的关键词不能为空!") };
        try {
            var languangKeys = [];
            if (key instanceof Array) {
                $.each(key, function (k, v) { languangKeys.push(v); });
            }
            else {
                languangKeys.push(key);
            }

            $.each(obj, function (n, o) {
                if (!o) return;
                if (o instanceof Array) {
                    $.LangArray(o, key);
                }
                else if (typeof (o) == "object") {
                    for (var i = 0; i < languangKeys.length; i++) {
                        if (o[languangKeys[i]]) {
                            o[languangKeys[i]] = $.Lang(o[languangKeys[i]]);
                        }
                    }
                }
            });
            return obj;
        } catch (e) {
            throw new Error(e + "<--" + name);
        };
    }
    // 实现C#Format
    $.format = function (source, params) {
        if (arguments.length == 1)
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.format.apply(this, args);
            };
        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };

})($)
