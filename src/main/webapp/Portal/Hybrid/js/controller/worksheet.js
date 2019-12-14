module.controller('worksheetCtrl', function ($scope, $sce) {
    console.log($scope.$parent.worksheetUrl);
    $scope.workItemUrl = $sce.trustAsResourceUrl($scope.$parent.worksheetUrl);
});