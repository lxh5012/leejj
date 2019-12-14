'use strict';
/**
 * 路由配置
 */
angular.module('app')
  .config(
    ['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {
          $stateProvider
          //
           .state('app.processQry', {
               url: '/processQry',
               controller: 'processQryController',
               templateUrl: 'report/html/processQry.html?t=' + Math.floor(Date.now() / 1000),
               resolve: {
                   deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                       return $ocLazyLoad.load([
                           'WFRes/_Scripts/jquery/jquery.lang.js',
                           'WFRes/_Scripts/bizquery.js'
                       ]).then(function () {
                           return $ocLazyLoad.load([
                                 'report/js/processQry.js?v=123'
                           ]);
                       });
                   }]
               }
           })

              .state('app.processTimeQry', {
                  url: '/processTimeQry',
                  controller: 'processTimeQryController',
                  templateUrl: 'report/html/processTimeQry.html?t=' + Math.floor(Date.now() / 1000),
                  resolve: {
                      deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                          return $ocLazyLoad.load([
                              'WFRes/_Scripts/jquery/jquery.lang.js',
                              'WFRes/_Scripts/bizquery.js'
                          ]).then(function () {
                              return $ocLazyLoad.load([
                                  'report/js/processTimeQry.js'
                              ]);
                          });
                      }]
                  }
              })
          // End
      }
    ]
  );