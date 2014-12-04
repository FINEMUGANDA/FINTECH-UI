'use strict';

angular.module('angularjsApp').controller('CustomConfirmController', function($scope, $modalInstance, data) {
  $scope.data = data;
  $scope.msg = data.msg || 'Are you sure?';
  $scope.yes = function() {
    $modalInstance.close(true);
  };
  $scope.no = function() {
    $modalInstance.close(false);
  };
});
