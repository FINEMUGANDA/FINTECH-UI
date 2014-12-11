'use strict';

angular.module('angularjsApp').controller('CustomConfirmController', function($scope, $modalInstance, data) {
  $scope.data = data;
  $scope.msg = data.msg || 'Are you sure?';
  $scope.title = data.title || 'Confirm Removing';
  $scope.submitBtn = data.submitBtn || {value: 'Remove', class: 'btn-danger'};
  $scope.yes = function() {
    $modalInstance.close(true);
  };
  $scope.no = function() {
    $modalInstance.close(false);
  };
});
