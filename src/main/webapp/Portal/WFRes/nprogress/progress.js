var start = new Date().getTime();
console.time("结束时间");
// 添加进度
document.write("<div id='container' style='height:4px; margin: 0;width: 100%;position: fixed;top:0;z-index:99999'></div>");
var line = new ProgressBar.Line(container, {
    strokeWidth: 1,
    easing: 'easeInOut',
    // easing: 'easeOut',
    duration: 1400,
    color: '#5291ff',
    borderRadius: '0.2rem',
    trailColor: '#f4f4f4',
    trailWidth: 2,
    svgStyle: {width: '100%', height: '100%', backgroundColor:'#fff',borderRadius:'0.2rem' },
    text: {
        style: {
            color: '#999',
            position: 'fixed',
            right: "10px",
            top: '15px',
        },
        autoStyleContainer: false
    },
    from: {color: '#2970ff'},
    to: {color: '#5291ff'},
    step: (function (state, line) {
        // line.path.setAttribute('stroke', 'linear-gradient(red, blue)');
        line.path.setAttribute('stroke', state.color);
        line.setText(' ');
        // bar.setText(Math.round(line.value() * 100) + ' %');
    })
});
var opts = {
    duration: 100
};
function getRandomNumberByRange(start, end) {
    return Math.round((Math.random() * (end - start) + start) * 10) / 10
}
var progress = getRandomNumberByRange(0.1,0.3);
// console.log(progress,'progress');
function getProgress(progress, opts) {
    line.animate(progress, opts);
}
getProgress(progress, opts);
line.animate(progress + 0.1, {
    duration: 300
});
line.animate(progress + 0.2, {
    duration: 500
});
line.animate(progress + 0.6, {
    duration: 1000
});