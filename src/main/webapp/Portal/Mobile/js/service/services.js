var rootpath = window.location.pathname;

var services = angular.module('starter.services', [])
//获取代办和待阅的数目
    .factory('GetWorkItemCount',['$rootScope', 'httpService', function($rootScope, httpService){
        return {
            all:function(params){
                if (window.cordova) {
                    return httpService.get($rootScope.appServiceUrl + '/GetWorkItemCount', params);
                }else {
                    return httpService.get('GetWorkItemCount',params);
                }
            }
        };
    }])
    //登录
    .factory('login', ['httpService', '$rootScope', function (httpService, $rootScope) {
        return {
            browser: function (params) {
                if (window.cordova) {
                    // return httpService.get($rootScope.appServerPortal + '/Organization/LoginIn', params);
                    return httpService.postWithBody('../Organization/LoginIn',params)
                } else {
                    //add by luwei@Future 2018.8.10
                    return httpService.postWithBody('../Organization/LoginIn',params);
                }
                //浏览器
            },
            //update by ousihang 暂时不用这个接口 2017.12.11
            app: function (params) {
                //独立app
                return httpService.post($rootScope.appServiceUrl + '/login/app');
            }
        };
    }])

    .factory('logout', ['httpService', '$rootScope',function (httpService, $rootScope) {
        return {
            browser: function (params) {
                //浏览器
                if (window.cordova) {
                    return httpService.get($rootScope.appServerPortal + '/Organization/LoginOut', params);
                } else {
                    return httpService.get('../Organization/LoginOut', params);
                }
            },
            app: function (params) {
                //跨域登录
            }
        };
    }])

  //待办数据请求
  .factory('UnfinishedWorkItems', ['$rootScope', 'httpService', function ($rootScope, httpService) {
    return {
        all: function (params) {
        	if (window.cordova) {
        		return httpService.get($rootScope.appServiceUrl + '/GetWorkItems', params);
        	} else {
        		return httpService.get('GetWorkItems',params);
        	}
        }
    };
  }])
  //已办数据请求
  .factory('finishedworkitems', ['$rootScope', 'httpService', function ($rootScope, httpService) {
    return {
        all: function (params) {
        	if (window.cordova) {
        		return httpService.get($rootScope.appServiceUrl + '/GetWorkItems', params);
        	} else {
        		return httpService.get('GetWorkItems',params);
        	}
        }
    };
  }])
  .factory('workItemService', ['$rootScope', 'httpService', function ($rootScope, httpService) {
	  return {
		  search: function (url, params){
			  return httpService.get(url, params);
		  }
		}
  }])
  //待阅数据请求
  .factory('Unreadedworkitems', ['$rootScope', 'httpService', function ($rootScope, httpService) {
    return {
        all: function (params) {
            if (window.cordova) {
                return httpService.get($rootScope.appServiceUrl + '/LoadCirculateItems', params);
            } else {
                return httpService.get('LoadCirculateItems', params);
            }
        },
        remove: function (params) {
            if (window.cordova) {
                return httpService.get($rootScope.appServiceUrl + '/ReadCirculateItems', params);
            } else {
                return httpService.get('ReadCirculateItems', params);
            }
        }
    }
    }])
    //待阅数据请求
    .factory('Unreadedworkitems', ['$rootScope', 'httpService', function ($rootScope, httpService) {
        return {
            all: function (params) {
                if (window.cordova) {
                    return httpService.get($rootScope.appServiceUrl +'/LoadCirculateItems', params);
                }else {
                    return httpService.get('LoadCirculateItems', params);
                }
            },
            remove:function(params){
                if (window.cordova) {
                    return httpService.get($rootScope.appServiceUrl+'/ReadCirculateItems', params);
                }else {
                    return httpService.get('ReadCirculateItems', params);
                }

            }
        };
    }])
    //已阅数据请求
    .factory('Readedworkitems', ['$rootScope', 'httpService', function ($rootScope, httpService) {
        return {
            all: function (params) {
                if(window.cordova) {
                    return httpService.get($rootScope.appServiceUrl + '/LoadCirculateItems', params);
                } else {
                    return httpService.get('LoadCirculateItems', params);
                }
            }
        };
    }])
    //发起流程全部数据
    .factory('categories', ['$rootScope', 'httpService', function ($rootScope, httpService) {
        var path = '';
        return {
            all: function (params) {
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/LoadWorkflows';
                } else {
                    url = 'LoadWorkflows';
                }
                return httpService.get(url, params);
            },
            refreshWorkItems:function(params){
                return httpService.get('js/datas/startworkflow.json', params);
            },
            setFavorite:function(params){
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/SetFavorite';
                } else {
                    url = 'SetFavorite';
                }
                return httpService.get(url, params);
            },

        };
    }])
    //应用中心
    .factory('appCenterService',['httpService', '$rootScope', function (httpService, $rootScope) {
        return {
            //一级
            getAppList: function (params) {
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/GetAppList';
                } else {
                    url = 'GetAppList';
                }
                return httpService.get(url, params);
            },
            //二级
            getFunctions: function (params) {
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/GetFunctions';
                } else {
                    url = 'GetFunctions';
                }
                return httpService.get(url, params);
            }
        }
    }
    ])
    //发起流程
    .factory('startInstanceService', ['commonJS', '$rootScope', 'httpService', function (commonJS, $rootScope, httpService) {
        return {
            startInstance : function (workflowCode, params){
                commonJS.loadingShow();
                var url = $rootScope.startInstanceUrl + workflowCode
                    + "&LoginName=" +  params.LoginName
                    + "&LoginSID=" + params.LoginSID
                    + "&MobileToken=" + params.MobileToken;
                var paramString = JSON.stringify(commonJS.getUrlVars(url));
                var params = { paramString: paramString };
                url = url.split("StartInstance.html")[0] + "StartInstance/StartInstance";
                if (window.cordova) {
                    return httpService.post($rootScope.appServerPortal + '/StartInstance/StartInstance', params);
                } else {
                    return httpService.post(url, params);
                }
            }
        }
    }])
    //我的流程
    .factory('instanceService', ['httpService', '$rootScope', function (httpService, $rootScope) {
        var path = '';
        return {
            all: function (params) {
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/myInstance/loadAllInstances';
                } else {
                    url = 'myInstance/loadAllInstances';
                }
                return httpService.get(url, params);
            },
            queryInstances:function(params){
                var url = '';
                if (window.cordova) {
                    url = $rootScope.appServiceUrl + '/myInstance/queryInstances';
                } else {
                    url = 'myInstance/queryInstances';
                }
                return httpService.get(url, params);
            },
        };
    }
    ]);
