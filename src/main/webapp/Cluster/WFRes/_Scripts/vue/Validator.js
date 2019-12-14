$(function () {
    Vue.validator('number', function (val) {
        return /^[+]?[0-9]+$/.test(val);
    });

    Vue.validator('space', function (val) {
        return /^\S*$/.test(val);
    });
    Vue.validator('chineseforbid', function (val) {
        return !/[\u4e00-\u9fa5]/.test(val);
    });
    Vue.validator('ipaddress', function (val) {
        return /^((?:(?:25[0-5]|2[0-4]\d|(?:1\d{2}|[1-9]?\d))\.){3}(?:25[0-5]|2[0-4]\d|(?:1\d{2}|[1-9]?\d)))$/.test(val);
    });
    
})