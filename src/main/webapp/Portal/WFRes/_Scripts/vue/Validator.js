$(function () {
    // number
    Vue.validator('number', function (val) {
        return /^[+]?[0-9]+$/.test(val);
    });
    // onlynumber
    Vue.validator('onlyNumber', function (val) {
        if (val) {
            return /^[+]?[0-9]+$/.test(val);
        } else {
            return true
        }
    });
    // space
    Vue.validator('space', function (val) {
        return /^\S*$/.test(val);
    });
    Vue.validator('chineseforbid', function (val) {
        return /[\u4e00-\u9fa5]/.test(val);
    });
    //add by hxc@Future
    // ' " < >
    // 特殊字符
    Vue.validator('htmlEscape', function (val) {
        return !/['|"|<|>|#]/.test(val);
    });
    Vue.validator('htmlEscapes', function (val) {
        return !/[<|>]/.test(val);
    });
    // 字母开头
    Vue.validator('codeEscapes', function (val) {
        return /^[a-zA-Z][0-9a-zA-Z]*$/.test(val);
    });
    Vue.validator("int", function (val) {
        //int -2147483648到2147483647
        if (/^[+]?[0-9]+$/.test(val)) {
            return val >= 0 && val <= 2147483647;
        } else {
            return false;
        }
    });
    Vue.validator('nameEscapes', function (val) {
        return /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(val);
    });
});