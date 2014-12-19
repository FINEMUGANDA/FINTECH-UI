'use strict';

angular.module('angularjsApp').controller('ReverseNoteController', function($scope, $modalInstance, data) {
  $scope.data = data;
  $scope.msg = data.msg || 'Please Enter Notes : ';
  $scope.title = data.title || 'Enter note';
  $scope.submitBtn = data.submitBtn || {value: 'Reverse', class: 'btn-danger'};
  $scope.yes = function() {
    if($scope.note) {      
      $modalInstance.close($scope.note);      
    }
  };
  $scope.no = function() {
    $modalInstance.close(false);
  };
});
