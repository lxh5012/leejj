angular.module("starter.directives", [])
.directive('bpmSheetUserSelected', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            selectUsers: '=',
            cancelSelected: '='
        },
        templateUrl: 'templates/sheetUserSelected.html?v=201802081117a',
    }
})