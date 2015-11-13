'use strict';

angular.module('angularjsApp').controller('pdfViewerController', function($scope) {
  $scope.scroll = 0;
  $scope.loading = true;

  $scope.onError = function(error) {
    console.log(error);
  };

  $scope.onLoad = function() {
    $scope.loading = false;
  };

  $scope.onProgress = function(progress) {
    console.log(progress);
    $scope.progress = progress.loaded / progress.total;
  };
});
