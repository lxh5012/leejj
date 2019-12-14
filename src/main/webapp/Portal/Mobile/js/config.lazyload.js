
// lazyload config

angular.module('starter')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      LoadReportPage: [
          '../css/bootstrapMobile.css',
          '../css/H3Report/bootstrap-datetimepicker/bootstrap-datetimepicker.css',
          '../vendor/jquery/bootstrap-select-1.12.4/dist/css/bootstrap-select.min.css',
          '../css/H3Report/dataTables-bootstrap/dataTables.bootstrapMobile.min.css',
          '../css/H3Report/autocomplete/jquery.autocomplete.css',
          '../css/H3Report/SheetUser.css',
          '../css/H3Report/PageTurnMobile.css',
          '../css/H3Report/H3-Icon-Tool/style.css',
          '../css/H3Report/ChartBase.css',
          '../css/H3Report/DropDownList.css',
          '../css/H3Report/Reporting/ReportMobileView.css?v=201802091644',
          '../WFRes/_Scripts/jquery/jquery.lang.min.js?v=201812011636',
          '../css/H3Report/jquery.gritter.css',
          '../js/H3Report/jquery.gritter.min.js',
          '../js/H3Report/H3.plugins.system.js',
          '../js/H3Report/bootstraptable/bootstrap-datetimepicker.js',
          '../js/H3Report/bootstraptable/jquery.nicescroll.min.js',
          '../js/H3Report/bootstraptable/bootstrap-datetimepicker.zh-CN.js',
          '../js/H3Report/bootstraptable/bootstrap-table.js',
          '../js/H3Report/bootstraptable/bootstrap-table-zh-CN.js',
          '../vendor/jquery/datatables/jquery.dataTables.min.min.js',
          '../js/H3Report/echart/echarts.js',
          '../js/H3Report/Reporting/Report/ReportBase.js?v=20171211',
          '../js/H3Report/Reporting/ReportViewManagerMobile.js?v=20180329720338',
          '../js/H3Report/H3Chart/ChartBase.js?v=20171211',
          '../js/H3Report/H3Chart/excanvas.min.js',
          '../js/H3Report/H3Chart/Chart.js?v=20171211',
          '../js/H3Report/html2canvas.js'
      ]
  })
;