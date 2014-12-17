'use strict';

angular.module('angularjsApp').controller('passwordController', function($scope, $modalInstance, data, RoleService, REST_URL) {


//      $scope.type = 'error';
//      $scope.message = 'User saved successfully';
//      $scope.errors = [];
  $scope.form = {};

  $scope.yes = function() {
    if (!$scope.userForm.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }
    var authenticationSuccess = function(result) {

      if (result.data.authenticated) {
        var changeSuccess = function() {
          $scope.type = 'alert-success';
          $scope.message = 'password saved successfully';
          $scope.errors = [];
          $modalInstance.close(true);
        };

        var changeFail = function(result_update) {
          $scope.type = 'error';
          $scope.message = 'password not saved: ' + result_update.data.defaultUserMessage;
          $scope.errors = result_update.data.errors;
        };
        var $url = REST_URL.BASE + 'users/' + result.data.userId;

        var send_obj = {
          password: $scope.form.new_pass,
          repeatPassword: $scope.form.confirm
        };
        RoleService.updateData($url, angular.toJson(send_obj)).then(changeSuccess, changeFail);
      } else {
        $scope.type = 'error';
        $scope.message = 'password not saved: ';
      }
    };

    var authenticationFail = function() {
      $scope.type = 'error';
      $scope.message = 'Current password is incorrect';
      $scope.errors = [];
    };

    var user_name = JSON.parse(localStorage.ang_session).username;
    var $url = REST_URL.BASE + 'authentication?username=' + user_name + '&password=' + $scope.form.current_pass;
    RoleService.createData($url, angular.toJson($scope.formData)).then(authenticationSuccess, authenticationFail);
  };

  $scope.no = function() {
    $modalInstance.close(false);
  };

});