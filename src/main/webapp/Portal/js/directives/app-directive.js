//ng-repeat rendered
app.directive('uiFinshedRender', ['$timeout', '$interval', function ($timeout, $interval) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var interval = $interval(function () {
                if (scope.$last === true) {
                    var linkFunc = scope.$eval('[' + attrs.uiFinshedRender + ']')[0];
                    $interval.cancel(interval);
                    linkFunc();
                }
            }, 100);
        }
    }
}]);

//IE9支持placeholder
app.directive('placeholder', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            var supportPlaceholder = 'placeholder' in document.createElement('input');
            var placeholder = function () {
                var text = attrs.placeholder;
                var id = attrs.id;
                var type = attrs.type;
                if (type != "password") {
                    $(element).val(text).addClass('phcolor');
                    $(element).focus(function () {
                        if ($(element).val() == text) {
                            $(element).val('');
                        }
                    })
                    $(element).blur(function () {
                        if ($(element).val() == "") {
                            $(element).val(text).addClass('phcolor');
                        }
                    })
                    $(element).keydown(function () {
                        $(element).removeClass('phcolor');
                    })
                    $(element).focus();
                    $(element).blur();
                } else if (type == "password") {
                    $(element).after('<input id="pwdPlaceholder" type="text" value=' + text + ' class="form-control" size="20" autocomplete="off">');
                    var pwdPlaceholder = $("#pwdPlaceholder");
                    pwdPlaceholder.show();
                    $(element).hide();
                    pwdPlaceholder.focus(function () {
                        pwdPlaceholder.hide();
                        $(element).show();
                        $(element).focus();
                    })
                    $(element).blur(function () {
                        if ($(element).val() == '') {
                            pwdPlaceholder.show();
                            $(element).hide();
                        }
                    })
                }
            }

            if (!supportPlaceholder) {
                placeholder();
            }
        }
    }
}]);

//定义directive: 密码验证
app.directive('pwChecked', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            if (attrs.pwChecked) {
                //匹配密码
                var firstPassword = '#' + attrs.pwChecked;
                element.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = element.val() === $(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                })
            } else {
                //验证密码强度
                element.on('keyup', function () {
                    var v = element.val();
                    //长度
                    var len = (v.length >= 6 && v.length <= 16) ? true : false;
                    //数字
                    var num = v.match(/\d/g) ? true : false;
                    //字母
                    var en = v.match(/[A-Za-z]/g) ? true : false;
                    //特殊符号
                    var sign = v.match(/\W/g) ? true : false;
                    //true 通过
                    if (len) {
                        if (num) {
                            if (en || sign) {
                                ctrl.$setValidity('pwstrength', true);
                            } else {
                                ctrl.$setValidity('pwstrength', false);
                            }
                        } else if (en && sign) {
                            ctrl.$setValidity('pwstrength', true);
                        } else {
                            ctrl.$setValidity('pwstrength', false);
                        }
                    } else {
                        ctrl.$setValidity('pwstrength', len);
                    }
                })
            }
        }
    }
}]);

//定义directive: 用户图像，签章上传
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModel) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function (event) {
                var imgObj = event.srcElement || event.target;
                var file;
                if (imgObj.files && imgObj.files[0]) {
                    file = imgObj.files[0];
                    if (file.size / 1024 < 100) {
                        scope.imgover = false;
                        //附件预览
                        scope.file = (event.srcElement || event.target).files[0];
                        scope.getFile();
                    } else {
                        scope.imageSrc = "data:image/jpeg;base64,/0";
                        scope.imgover = true;
                    }
                } else {
                    //IE下，使用滤镜  
                    imgObj.select();
                    imgObj.blur();
                    var imageSrc = document.selection.createRange().text;

                    var PreviewId = $(imgObj.parentElement).find("img").attr("id");
                    var imgObjPreview = document.getElementById(PreviewId);

                    var localImag = $(imgObj.parentElement).find("div").attr("id");
                    var localImagId = document.getElementById(localImag);
                    //必须设置初始大小
                    localImagId.style.width = "50px";
                    localImagId.style.height = "50px";
                    //图片异常的捕捉，防止用户修改后缀来伪造图片
                    try {
                        localImagId.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
                        localImagId.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = imageSrc;
                    } catch (e) {
                    }
                    imgObjPreview.style.display = 'none';
                    document.selection.empty();
                }
            });
        }
    }
}]);

app.directive('replaceNull', [function () {
    return {
        require: "ngModel",
        link: function (scope, el, attrs, ctrl) {
            ctrl.$formatters.push(function (value) {
                if (value == "null") return "";
                return value || "";
            });
        }
    };
}]);

app.directive('titleName', ['$state', '$stateParams', '$translate', function ($state, $stateParams, $translate) {
    return {
        restrict: 'A',
        scope: {
            FunctionViewModels: '=functionViewModels'
        },
        link: function (scope, element, attrs, ctrl) {
            var DisplayName = "";
            var url = $state.current.url;
            var StateName = $state.$current.self.name;
            var getDisplayName = function (FunctionViewModel) {
                angular.forEach(FunctionViewModel.Children, function (data, index, arry) {
                    if(data == undefined){
                        return;
                    }
                    //console.log('>>>' + data.DisplayName);

                    if (data.Children.length > 0) {
                        getDisplayName(data);
                    } else {
                        if (data.Url == StateName) {
                            DisplayName = $translate.instant("HomePage." + data.Code);
                            if (DisplayName == "HomePage." + data.Code) {
                                DisplayName = data.DisplayName;
                            }
                        } else if (data.Url.indexOf(StateName) > -1) {
                            var params = url.split('/:').splice(1, 20);
                            var MacthNum = 0;
                            angular.forEach(params, function (paramName, index, full) {
                                var paramValue = $stateParams[paramName];
                                if (paramValue != undefined) {
                                    if (paramValue == "" ||
                                        (data.Url.indexOf(paramName) > -1 && data.Url.indexOf(paramValue) > -1)) {
                                        MacthNum++;
                                    }
                                }
                            })
                            if (MacthNum == params.length) {
                                DisplayName = $translate.instant("HomePage." + data.Code);
                                if (DisplayName == "HomePage." + data.Code) {
                                    DisplayName = data.DisplayName;
                                }
                            }
                        }
                    }
                });
            };
            angular.forEach(scope.FunctionViewModels, function (data, index, arry) {
                getDisplayName(data);
            });
            element.html(DisplayName);
        }
    }
}])