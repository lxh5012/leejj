services.service("commonJS", function ($rootScope, $ionicModal, $http, $ionicLoading, $cordovaToast, $state,
                                       $ionicPopup, $cordovaFileTransfer, $cordovaFileOpener2, $ionicPickerI18n, $timeout, $cordovaNetwork, $ionicPopover) {
    this.loadingShow = function (msg) {
        if (!msg) msg = "<span class=\"lodingspan f13\"><ion-spinner icon=\"ios\" class=\"centerscreen spinner-light  \"></ion-spinner><span>{{languages.moreData}}</span></span>";
        $ionicLoading.show({
            template: msg,
            duration: 6 * 1000,
        }); // ionic内置插件，显示等待框
    };
    this.loadingHide = function () {
        $ionicLoading.hide();
    };
    this.IosJsBridge = function (callback) {
            if (window.WebViewJavascriptBridge) {
                return callback(WebViewJavascriptBridge);
            }
            if (window.WVJBCallbacks) {
                return window.WVJBCallbacks.push(callback);
            }
            window.WVJBCallbacks = [callback]; // 创建一个 WVJBCallbacks 全局属性数组，并将 callback 插入到数组中。
            var WVJBIframe = document.createElement('iframe'); // 创建一个 iframe 元素
            WVJBIframe.style.display = 'none'; // 不显示
            WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'; // 设置 iframe 的 src 属性
            document.documentElement.appendChild(WVJBIframe); // 把 iframe 添加到当前文导航上。
            setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    }
    this.AndroidJsBridge = function(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(WebViewJavascriptBridge)
        } else {
            document.addEventListener(
                'WebViewJavascriptBridgeReady'
                , function() {
                    callback(WebViewJavascriptBridge)
                },
                false
            );
        }
    };
    //语言切换
    this.setLanguages = function () {
        var lang = window.localStorage.getItem('H3.Language') || 'zh_cn';
        // console.log(lang,'lang');
        if (lang == 'en_us') {
            $rootScope.languages = config.languages.en;
            $ionicPickerI18n.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $ionicPickerI18n.months = ["Jan", "Fed", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Otc", "Nov", "Dec"];
            $ionicPickerI18n.ok = "OK";
            $ionicPickerI18n.cancel = "Clear";
            $ionicPickerI18n.okClass = "button-balanced";
            // $ionicPickerI18n.cancelClass = "button-balanced";
            window.localStorage.setItem('H3.Language',lang);
        }
        //update by ouyangsk PC端英文标识为zh_CN，此前移动端为zh_cn，所以调整为适应PC端英文状态
        //else if (lang == 'zh_cn') {
        else {
            $rootScope.languages = config.languages.zh;
            $ionicPickerI18n.weekdays = ["日", "一", "二", "三", "四", "五", "六"];
            $ionicPickerI18n.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
            $ionicPickerI18n.ok = "确定";
            $ionicPickerI18n.cancel = "取消";
            $ionicPickerI18n.okClass = "button-balanced";
            // $ionicPickerI18n.cancelClass = "button-balanced";
            window.localStorage.setItem('H3.Language',lang);
        }
    };
    //时间比较
    this.timeCheck = function (time1, time2) {
        return new Date(time1).getTime() > new Date(time2).getTime();
    };
    this.getHttpData = function (url, params) {
        if (params) {
            return $http({url: url, params: params});
        }
        return $http.jsonp(url);
    };
    //打开任务表单
    this.GetWorkItemSheetUrl = function ($scope, url, workItemId) {
        var that = this;
        that.loadingShow();
        var paramString = JSON.stringify(this.getUrlVars(url));
        $http({
            url: url.split("WorkItemSheets.html")[0] + "WorkItemSheets/WorkItemSheets",
            params: {paramString: paramString}
        })
            .success(function (data) {
                if (data.Success) {
                    // var url = $scope.setting.httpUrl.toLocaleLowerCase().split(config.portalroot.toLocaleLowerCase())[0] + data.Message;
                    var url = data.Message;
                    that.openWorkItem($scope, url, workItemId)
                } else {
                    that.TimeoutHandler();
                }
            })
            .error(function (data) {
            })
    }
    //打开发起流程表单
    this.OpenStartInstanceSheet = function ($scope, url) {
        var that = this;
        that.loadingShow();
        var paramString = JSON.stringify(this.getUrlVars(url));
        $http({
            url: url.split("StartInstance.html")[0] + "StartInstance/StartInstance",
            params: {paramString: paramString}
        })
            .success(function (data) {
                if (data.Success) {
                    var url = $scope.setting.httpUrl.toLocaleLowerCase().split(config.portalroot.toLocaleLowerCase())[0] + data.Message;
                    that.openWorkItem($scope, url)
                } else {
                    that.TimeoutHandler();
                }
            })
            .error(function (data) {
            })
    }
    //打开流程表单
    this.OpenInstanceSheet = function ($scope, url, InstanceId) {
        var that = this;
        that.loadingShow();
        var paramString = JSON.stringify(this.getUrlVars(url));
        $http({
            url: url.split("InstanceSheets.html")[0] + "InstanceSheets/InstanceSheets",
            params: {paramString: paramString}
        })
            .success(function (data) {
                if (data.Success) {
                    if (data.Extend == "Redirect") {
                        //var url = $scope.setting.httpUrl.toLocaleLowerCase().split(config.portalroot.toLocaleLowerCase())[0] + data.Message;
                        var url = data.Message;
                        that.openWorkItem($scope, url);
                    } else {
                        $rootScope.mulSheets = data.Extend;
                        $state.go("mulSheets", {}, {reload: true});
                    }
                } else {
                    that.TimeoutHandler();
                }
            })
            .error(function (data) {
            })
    }
    //登陆超时处理
    this.TimeoutHandler = function () {
        $ionicLoading.hide();//隐藏前操作带来的提示
        if ($rootScope.loginfrom == "dingtalk" && dd) {
            alert($rootScope.languages.loginExit);
            $timeout(function () {
                dd.biz.navigation.close({});
            }, 1000)
        } else if ($rootScope.loginfrom == "wechat" && typeof (WeixinJSBridge) != "undefined") {
            alert($rootScope.languages.loginExit);//登陆超时，即将退出
            $timeout(function () {
                WeixinJSBridge.call("closeWindow");
            }, 1000)
        } else if ($rootScope.loginfrom == "app" || !$rootScope.loginfrom) {
            alert($rootScope.languages.loginExit);
            $state.go("login");
        }
    }
    //单点登录失败处理
    this.MsgErrorHandler = function (stetus) {
        //提示信息
        $ionicLoading.show({
            template: '<span class="setcommon f15">' + stetus + '</span>',
            duration: 2 * 1000,
            animation: 'fade-in',
            showBackdrop: false,
        });
        if ($rootScope.loginfrom == "dingtalk" && dd) {
            $timeout(function () {
                dd.biz.navigation.close({});
            }, 1000)
        } else if ($rootScope.loginfrom == "wechat" && typeof (WeixinJSBridge) != "undefined") {
            $timeout(function () {
                WeixinJSBridge.call("closeWindow");
            }, 1000)
        } else if ($rootScope.loginfrom == "app" || !$rootScope.loginfrom) {
           $state.go("login");
        }
    }
    //获取url参数
    this.getUrlVars = function (url) {
        var vars = {};
        var hash;
        var hashs = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashs.length; i++) {
            hash = hashs[i].split('=');
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    // 从 JSON 字符串转换为 JS 日期
    this.getDateFromJOSN = function (value) {
        value = value.replace(/\/Date\((\d+)\)\//gi, '$1');
        var date = new Date();
        date.setTime(value);
        return date;
    };
    this.showShortTop = function (msg) {
        if (window.plugins) {
            $cordovaToast.showShortTop(msg);
        }
        else {
            $ionicLoading.show({
                template: msg,
                duration: 2 * 1000
            });
        }
    };
    this.showShortMsg = function (style, msg, time) {
        $ionicLoading.show({
            template: '<span class="' + style + '">' + msg + '</span>',
            duration: time,
            animation: 'fade-in',
            showBackdrop: false,
        });
    };
        // 检查是否在线
   this.checkOnline = function () {
            if (window.plugins) {
                if (!$cordovaNetwork.isOnline()) {
                    this.showShortTop($rootScope.languages.checkNetWork);//("您处理离线状态，请检查网络！");
                    return false;
                }
            }
            return true;
        };
    // 打开当前待办
    this.openWorkItem = function ($scope, worksheetUrl, workItemId, transitionstyle) {
        // 如果是App端，那么使用 InAppBrowser 方式打开
        var localLan = window.localStorage.getItem("H3.Language");
        worksheetUrl = worksheetUrl + "&loginfrom=" + $rootScope.loginfrom + "&T=" + new Date().getTime() + "&localLan=" + localLan;
        // worksheetUrl = 'http://192.168.8.240:8083' + worksheetUrl + "&loginfrom=" + $rootScope.loginfrom + "&T=" + new Date().getTime() + "&localLan=" + localLan;
        // worksheetUrl = 'https://www.baidu.com/';
        var that = this;
        if (window.plugins && window.cordova) {
            // 离线检测
            console.log("check online...");
            console.log(this.checkOnline(),'this.checkOnline()');
            if (!this.checkOnline()) {
                $scope.clientInfo.isOffline = true;
                return;
            }
            var hidden = "yes";
            if (!transitionstyle) {
                transitionstyle = "coververtical";
                hidden = "no";
            }
            that.loadingShow();
            var errorUrl = "";
            // console.log("open url,errorUrl=" + errorUrl);
            console.log("worksheetUrl", worksheetUrl);
            // $scope.ref = window.open(worksheetUrl, "_blank", "location=no,closebuttoncaption=关闭,hidden=" + hidden + ",hardwareback=yes,EnableViewPortScale=yes,transitionstyle=" + transitionstyle);
            // $scope.ref = cordova.InAppBrowser.open(worksheetUrl, "_blank",
            //     "location=no,closebuttoncaption=关闭,hidden=" + hidden + ",hardwareback=yes,EnableViewPortScale=yes,transitionstyle=" + transitionstyle);
            $scope.ref = cordova.InAppBrowser.open(worksheetUrl, '_blank', 'location=yes,enableViewportScale=yes');
            // $scope.ref = cordova.InAppBrowser.open(worksheetUrl, '_blank', 'location=yes');
            var isSheetView = true;
            $scope.ref.addEventListener("loadstart", function (event) {
                // 监测回到原移动办公主页时，立即关闭当前页
                if (event.url.toLowerCase().indexOf("index.html") > 0) {
                    that.loadingHide();
                    $scope.ref.close();
                    if (workItemId && $scope.refreshUnfinishedWorkItem) {
                        $scope.refreshUnfinishedWorkItem();
                    } else if (workItemId && $scope.RefreshCirculateItem) {
                        $scope.RefreshCirculateItem();
                    }
                } else if (event.url.toLowerCase().indexOf("readattachment/read?") > 0) {
                    that.openAttachment($scope, event.url, worksheetUrl, workItemId, transitionstyle);
                } else if (event.url.toLowerCase().indexOf("tempimages") > 0) {
                    that.openAttachment($scope, event.url);
                }
                console.log("InAppBrowser.loadstart->" + event.url);
            });
            $scope.ref.addEventListener("loadstop", function (event) {
                that.loadingHide();
                $scope.ref.show();
                console.log("InAppBrowser.loadstop->" + event.url);
            });
            $scope.ref.addEventListener("loaderror", function (event) {
                that.loadingHide();
                var url = event.url.toLocaleLowerCase();
                if (url.indexOf("zherp.") > -1) return;
                console.log("InAppBrowser.loaderror->" + event.url);
            });
            $scope.ref.addEventListener("exit", function (event) {
                that.loadingHide();
                if (!isSheetView) {
                    that.openWorkItem($scope, worksheetUrl, workItemId, "crossdissolve");
                } else {
                    //$state.go($state.$current.self.name, {}, { reload: true });
                }
                $scope.refresh();
                console.log("InAppBrowser.exit");
            });
        }
        else if ($rootScope.dingMobile.isDingMobile && dd) {
            // 钉钉要给出完全路径
            if(!worksheetUrl.startsWith("http")){
                worksheetUrl = getRootPath() + worksheetUrl;
            }
            // alert("ding:" + worksheetUrl)

            document.addEventListener('resume', function () {
                if ($scope.hasOwnProperty("refresh")) {
                    $scope.refresh();
                }
                $scope.GetBadge();
            });

            dd.biz.util.openLink({
                url: worksheetUrl + "&loginfrom=dingtalk",
                onSuccess: function (result) {
                },
                onFail: function (err) {
                }
            });
        }
        else {
            //微信
            var url = worksheetUrl + "&loginfrom=wechat";
            window.location.href = url;
        }
        that.loadingHide();
    };

    this.openAttachment = function ($scope, attachmentUrl, worksheetUrl, workItemId, transitionstyle) {
        // console.log("下载附件");
        var that = this;
        if (window.cordova.InAppBrowser) {
            if (!this.checkOnline()) {
                $scope.clientInfo.isOffline = true;
                return;
            }
            var hidden = "yes";
            if (!transitionstyle) {
                transitionstyle = "coververtical";
                hidden = "no";
            }
            that.loadingShow();
            $scope.ref = window.open(attachmentUrl, "_system",
                "location=no,closebuttoncaption=关闭,hidden=" + hidden + ",hardwareback=yes,EnableViewPortScale=yes,transitionstyle=" + transitionstyle);
            var isSheetView = true;
            $scope.ref.addEventListener("loadstart", function (event) {
                // 监测回到原移动办公主页时，立即关闭当前页
                if (event.url.toLowerCase().indexOf("index.html") > 0) {
                    that.loadingHide();
                    $scope.ref.close();
                    if (workItemId && $scope.refreshWorkItemId) {
                        $scope.refreshWorkItemId(workItemId);
                    }
                }
                else if (event.url.toLowerCase().indexOf("readattachment/read?") > 0) {
                    that.openAttachment($scope, event.url, worksheetUrl, workItemId, transitionstyle);
                } else if (event.url.toLowerCase().indexOf("tempimages") > 0) {
                    that.openAttachment($scope, event.url);
                }
            });
            $scope.ref.addEventListener("loadstop", function (event) {
                that.loadingHide();
                $scope.ref.show();
                console.log("InAppBrowser.loadstop->" + event.url);
            });
            $scope.ref.addEventListener("exit", function (event) {
                that.loadingHide();
            });
        }
    }

    this.openDateSearch = function ($scope) {
        var templateUrl = "templates/home/dateSpanSearch.html";
        $ionicModal.fromTemplateUrl(templateUrl,
            {
                scope: $scope,
                width: "100%",
                height: "100%",
                animation: "slide-in-up"
            }).then(function (modal) {
            $scope.datemodal = modal;
            window._scope = $scope;
            $scope.datemodal.show();
        });
    }

    this.openDateRangeSelectModal = function ($scope) {
        var templateUrl = "templates/home/dateRangeSelect.html";
        $ionicModal.fromTemplateUrl(templateUrl,
            {
                scope: $scope,
                width: "100%",
                height: "100%",
                animation: "slide-in-up"
            }).then(function (modal) {
            $scope.dateselectmodal = modal;
            window._scope = $scope;
            $scope.dateselectmodal.show();
        });
    }

    // 弹出对话框
    this.alert = function (msg) {
        var alertPopup = $ionicPopup.alert({
            title: "系统提示",
            okText: "确认",
            template: msg
        });
        alertPopup.then(function (res) {
        });
    };
    // 检查升级(入口函数)
    this.checkVersion = function (serviceUrl, platform, version) {
        this.checkVersionFromServer(serviceUrl, platform, version, this.upgrade);
    };
    // 升级动作
    this.upgrade = function (platform, result) {
        var storagePath = "";
        if (platform.toLowerCase().indexOf("android") > -1) {
            storagePath = "file:///storage/sdcard0/Download/H3.apk";
            storagePath = cordova.file.externalRootDirectory + "H3.apk";
        }
        var msg = result.Description;
        var that = this;
        if (result.Confirm) {
            this.confirm("系统提示", msg, "下次再说", "立即升级",
                function () {
                    that.download(result.Url, storagePath, true);
                });
        }
        else {
            this.download(result.Url, storagePath, true);
        }
    };
    // 下载文件
    this.download = function (url, storagePath, open) {
        if (!storagePath) {
            // iOS 直接弹出浏览器转向链接
            console.log("ios upgrade url=" + url);
            window.open(url, "_system", "location=yes");
        }
        else {  // Android 直接下载再打开
            try {
                $cordovaFileTransfer.download(url, storagePath, {}, true)
                    .then(function (result) {
                            // 直接打开下载的文件
                            $ionicLoading.show({
                                template: "已经下载：100%"
                            });

                            $cordovaFileOpener2.open(storagePath, "application/vnd.android.package-archive").then(
                                function () {
                                    console.log("open complete");
                                },
                                function (err) {
                                    console.log("open error->" + err);
                                }
                            );
                            $ionicLoading.hide();
                        },
                        function (err) {
                            $ionicLoading.hide();
                            console.log("download error->" + err);
                        },
                        function (progress) {
                            //进度，这里使用文字显示下载百分比
                            $timeout(function () {
                                var downloadProgress = (progress.loaded / progress.total) * 100;
                                $ionicLoading.show({
                                    template: "已经下载：" + Math.floor(downloadProgress) + "%"
                                });
                                if (downloadProgress > 99) {
                                    $ionicLoading.hide();
                                }
                            })
                        });
            }
            catch (e) {
                console.log(e.message);
            }
        }
    };
    // 从服务器检查新的版本
    this.checkVersionFromServer = function (serviceUrl, platform, version) {
        var param = {platform: platform, version: version};
        var that = this;

        var url = serviceUrl + "/mobile/CheckVersion?callback=JSON_CALLBACK&platform=" + platform + "&version=" + version;
        $http.jsonp(url)
            .success(function (result) {
                if (that.isNewVersion(version, result.Version)) {
                    that.upgrade(platform, result);
                }
            })
            .error(function (ex) {
                $rootScope.$broadcast("scroll.refreshComplete");
            });
    }
    this.isNewVersion = function (oldVersion, newVersion) {
        var oldArr = oldVersion.split(".");
        var newArr = newVersion.split(".");

        for (var i = 0; i < newArr.length; i++) {
            if (i >= oldArr.length) return true;
            if (parseInt(newArr[i]) > parseInt(oldArr[i])) {
                return true;
            }
            else if (parseInt(newArr[i]) < parseInt(oldArr[i])) {
                return false;
            }
        }
        return newArr.length > oldArr.length;
    };
    // 弹出确认对话框
    this.confirm = function (title, msg, cancelText, okText, callback, cancel) {
        var confirmPopup = $ionicPopup.confirm({
            title: $rootScope.languages.checkNewVersion,
            template: msg,
            cancelText: cancelText,
            okText: okText
        });
        confirmPopup.then(function (result) {
            if (result) {
                if (callback)
                    callback.call(this);
            }
            else {
                if (cancel)
                    cancel.call(this);
            }
        })
    };
    // 处理微信单点登录
    this.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        //update by ouyangsk 应用中心菜单中文编码的情况下，unescape会乱码
        //if (r != null) return unescape(r[2]); return null;
        if (r != null) {
            return r[2];
        }
        return null;
    };

    // sideSlip侧滑框（筛选弹出）returnPromise是否返回promise对象
    this.sideSlip = function ($scope, templates, mes, returnPromise) {
        $rootScope.searchItem = true;
        // .fromTemplateUrl() 方法
        var promise = $ionicPopover.fromTemplateUrl(templates, {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
            //update by ouyangsk & ousiahng
            //angular.element($scope.popover.$el).css("visibility","hidden");

            //update by ouyangsk 加上标识，此标识在应用中心报表页打开时，会出现一次筛选框闪现，但是必须让popover出现过一次后，才会出现在DOM元素中，报表选人控件才会生效
            if (mes) {
                $scope.popover.show();
                $($scope.popover.$el[0]).css("opacity", "0");
                $scope.popover.hide();
            }
        });
        $scope.openPopover = function ($event) {
            //angular.element($scope.popover.$el).css("visibility","visible");
            $($scope.popover.$el[0]).css("opacity", "1");
            $scope.popover.show();
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        // 清除浮动框
        $scope.$on('$destroy', function () {
            if ($scope.popover) {
                $scope.popover.remove();
            }
        });
        // 在隐藏浮动框后执行
        $scope.$on('popover.hidden', function () {
            // 执行代码
        });
        // 移除浮动框后执行
        $scope.$on('popover.removed', function () {
            // 执行代码
        });
        $scope.stateUser = function (event) {
            $state.go("sheetUser", {displayName: config.languages.current.Filter.originator});
            $scope.filterFlag = true;//判断是否点击过选人控件
            $scope.popover.hide();
        };

        if (returnPromise) {
            return promise;
        }
    };

})
    .directive('focusOn', function () {
        return function (scope, elem, attr) {
            scope.$on('focusOn', function (e, name) {
                if (name === attr.focusOn) {
                    elem[0].focus();
                }
            });
        };
    })
    .factory('focus', function ($rootScope, $timeout) {
        return function (name) {
            $timeout(function () {
                $rootScope.$broadcast('focusOn', name);
            });
        }
    });

Date.prototype.Format = function (fmt) { //author: meizz
    var str = fmt;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    var month = parseInt(this.getMonth()) + 1;
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
    str = str.replace(/MM/, month > 9 ? month.toString() : '0' + month);
    str = str.replace(/M/g, month);
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());
    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());

    return str;
}

// 获取根目录
function getRootPath() {
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht = curWwwPath.substring(0, pos);
    console.log(" >>>> GET WEB ROOTPATH:" + localhostPaht);
    return localhostPaht;
}
