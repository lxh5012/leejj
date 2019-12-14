'use strict';

app.service('menuhandle', ['$state', '$stateParams', '$translate', function ($state, $stateParams, $translate) {
    //叶子菜单标题以及 所在一级菜单的索引
    this.getMenuIndex = function (allMenus) {
        var a = [];
        this.menus = allMenus;
        angular.forEach(allMenus, function (data, index, full) {
            if (data.Children && data.Children.length > 0) {
                handleMenuIndex(data, index, a, data.Code);
            } else {
                var DisplayName = $translate.instant("HomePage." + data.Code);
                if (DisplayName == "HomePage." + data.Code) {
                    DisplayName = data.DisplayName;
                }
                a.push({
                    url: data.Url,
                    code: data.Code,
                    index: index,
                    DisplayName: DisplayName,
                    TopAppCode: data.Code
                })
            }
        })
        return a;
    }

    var handleMenuIndex = function (menu, index, a, TopCode) {
        angular.forEach(menu.Children, function (data, i, full) {
            if (data.Children && data.Children.length > 0) {
                handleMenuIndex(data, index, a, TopCode);
            } else {
                var DisplayName = $translate.instant("HomePage." + data.Code);
                if (DisplayName == "HomePage." + data.Code) {
                    DisplayName = data.DisplayName;
                }
                a.push({
                    url: data.Url,
                    code: data.Code,
                    index: index,
                    DisplayName: DisplayName,
                    TopAppCode: data.TopAppCode
                })
            }
        })
    }

    this.getAsideMenus = function (allMenus, allMenusIndex) {
        var menuData = {};
        var url = $state.current.url;
        var StateName = $state.$current.self.name;
        if (StateName == "app.MyUnfinishedWorkItemByGroup" || StateName == "app.MyUnfinishedWorkItemByBatch") {
            angular.forEach(allMenus, function (data, index, full) {
                if (data.Code == "Workflow") {
                    menuData.asideMenu = data;

                }
            })
        } else {
            angular.forEach(allMenusIndex, function (data, index, arry) {
                if (data.url == null) {
                }
                //else if (data.url == StateName) {
                //    menuData = data;
                //}
                else if (data.url.indexOf(StateName) > -1
                    && $stateParams.TopAppCode == data.TopAppCode) {
                    var params = url.split('/:').splice(1, 20);
                    var MacthNum = 0;
                    angular.forEach(params, function (paramName, index, full) {
                        var paramValue = $stateParams[paramName];
                        if (paramValue != undefined) {
                            if (paramValue == "" ||
                                (data.url.indexOf(paramName) > -1 && data.url.indexOf(paramValue) > -1)) {
                                MacthNum++;
                            } else {
                                //报表钻取是特殊处理
                                if (paramValue.indexOf("&randkey=") > -1) {
                                    MacthNum++;
                                }
                            }
                        }
                    })
                    if (MacthNum == params.length) {
                        menuData = data;
                    }
                }
            })
        }

        angular.forEach(allMenus, function (menu, index, full) {
            if ($stateParams.TopAppCode == menu.TopAppCode) {
                menuData.asideMenu = menu;
                var TopDisplayName = $translate.instant("HomePage." + menuData.asideMenu.Code);
                if (TopDisplayName == "HomePage." + menuData.asideMenu.Code) {
                    TopDisplayName = menuData.asideMenu.DisplayName;
                }
                var DisplayName = $translate.instant("HomePage." + menuData.code);
                if (DisplayName == "HomePage." + menuData.code) {
                    DisplayName = menuData.DisplayName;
                }
                menuData.DisplayName = DisplayName;
                menuData.TopDisplayName = TopDisplayName;
            }
        })

        //console.log(menuData)
        //获取失败，调用备用方法
        if (!menuData.asideMenu) {
            var index = this.getMenuTopIndex(allMenus);
            menuData = this.getMenuData(allMenus, index)
        }

        //add by luwei : sort by sortKey, remove duplicate menu
        if (menuData&&menuData.asideMenu) {
            var _arr = [];
            var children = menuData.asideMenu.Children;
            if (children.length<1) {
                return
            }
            for (var i = 0; i <= children.length; i++) {
                var child = children[i];
                if (_arr.indexOf(child) > -1) {
                    continue;
                }
                _arr.push(child);
            }
            _arr.sort(function (p1, p2) {
                return p1.SortKey - p2.SortKey;
            });

            menuData.asideMenu.Children = _arr;
        }
        return menuData;
    }


    //获取菜单的第二种方法，在第一种方法获取失败是调用，做备用方法使用
    this.getMenuTopIndex = function (menus) {
        var a = [];
        this.menus = menus;
        angular.forEach(menus, function (data, index, full) {
            if (data.Children && data.Children.length > 0) {
                handleIndex(data, index, a);
            } else {
                var DisplayName = $translate.instant("HomePage." + data.Code);
                if (DisplayName == "HomePage." + data.Code) {
                    DisplayName = data.DisplayName;
                }
                a.push({
                    url: data.Url,
                    index: index,
                    DisplayName: DisplayName
                })
            }
        })
        return a;
    }
    var handleIndex = function (menu, index, a) {
        angular.forEach(menu.Children, function (data, i, full) {
            if (data && data.Children && data.Children.length > 0) {
                handleIndex(data, index, a);
            } else {
                // console.log(data, 'data');
                var data_code = data ? (data.Code? data.Code: ''): '';
                var data_name = data ? (data.DisplayName? data.DisplayName: ''): '';
                // console.log(data_code, 'dataCode')
                var DisplayName = $translate.instant("HomePage." + data_code);
                if (DisplayName === "HomePage." + data_code) {
                    DisplayName = data_name;
                }
                a.push({
                    url: data ? (data.Url? data.Url: ''): '',
                    code: data_code,
                    index: index? index: '',
                    DisplayName: DisplayName,
                    TopDisplayName: ""
                })
            }
        })
    }
    this.getMenuData = function (menu, menuTopIndex) {
        var menuData;
        var url = $state.current.url;
        var StateName = $state.$current.self.name;
        if (StateName == "app.MyUnfinishedWorkItemByGroup" || StateName == "app.MyUnfinishedWorkItemByBatch") {
            menuData = {};
            menuData.asideMenu = menu[0];
            return menuData;
        }
        angular.forEach(menuTopIndex, function (data, index, arry) {
            if (data.url == null) {
            }
            else if (data.url == StateName) {
                menuData = data;
            } else if (data.url.indexOf(StateName) > -1)
            {
                var params = url.split('/:').splice(1, 20);
                var MacthNum = 0;
                angular.forEach(params, function (paramName, index, full) {
                    var paramValue = $stateParams[paramName];
                    if (paramValue != undefined) {
                        if (paramValue == "" ||
                            (data.url.indexOf(paramName) > -1 && data.url.indexOf(paramValue) > -1)) {
                            MacthNum++;
                        } else {
                            //报表钻取是特殊处理
                            if (paramValue.indexOf("&randkey=") > -1) {
                                MacthNum++;
                            }
                        }
                    }
                })
                if (MacthNum == params.length) {
                    menuData = data;
                }
            }
        });
        if (menuData) {
            menuData.asideMenu = menu[menuData.index];
            if (!menuData.asideMenu || !menuData.asideMenu.Code) {
                console.log(menuData.asideMenu, ' menuData.asideMenu --- error')
                return
            }
            // console.log(menuData.asideMenu, 'menuData.asideMenu---right')
            var TopDisplayName = $translate.instant("HomePage." + menuData.asideMenu.Code);
            if (TopDisplayName == "HomePage." + menuData.asideMenu.Code) {
                TopDisplayName = menuData.asideMenu.DisplayName;
            }
            var DisplayName = $translate.instant("HomePage." + menuData.code);
            if (DisplayName == "HomePage." + menuData.code) {
                DisplayName = menuData.DisplayName;
            }
            menuData.DisplayName = DisplayName;
            menuData.TopDisplayName = TopDisplayName;
            return menuData;
        } else {
            return null
        }
    }
}]);

app.service('datecalculation', [function () {
    //日起加上天数
    this.addDays = function (date, days) {
        var nd = new Date(date);
        nd = nd.valueOf();
        nd = nd + days * 24 * 60 * 60 * 1000;
        nd = new Date(nd);
        var y = nd.getFullYear();
        var m = nd.getMonth() + 1;
        var h = nd.getDate();
        if (m <= 9) m = "0" + m;
        if (h <= 9) h = "0" + h;
        return y + "-" + m + "-" + h;
    }
    //日起减去天数
    this.redDays = function (date, days) {
        days = -days;
        return this.addDays(date, days);
    }
    //两个日期是否一前一后
    this.isOrderBy = function (frontDate, backDate) {
        var frontDate = new Date(frontDate);
        frontDate = frontDate.valueOf();
        var backDate = new Date(backDate);
        backDate = backDate.valueOf();
        if (frontDate <= backDate)
            return true;
        else
            return false;
    }
    //序列化时间
    this.changeDateFormat = function (cellval) {
        var date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var h = date.getDate();
        if (m <= 9) m = "0" + m;
        if (h <= 9) h = "0" + h;
        return y + "-" + m + "-" + h;
    }
}]);

app.service('jq.datables', [function () {
    this.trcss = function () {
        var rows = angular.element(document.querySelectorAll("tbody")).find(".odd,.even");
        angular.forEach(rows, function (row, index, sources) {
            angular.element(row).on("mousemove", function () {
                angular.element(this).addClass("selectedRow");
            })
                .on("mouseleave", function () {
                    angular.element(this).removeClass("selectedRow");
                });
        });
    }
}]);

