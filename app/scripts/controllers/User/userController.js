'use strict';

var appModule = angular.module('angularjsApp');

appModule.controller('UserController', function($route, $scope, RoleService, REST_URL, $location, $timeout, dialogs) {

  $scope.formData = {};
  $scope.params_id = $route.current.params.id;
  var url = '';
  $scope.itemsByPage = 10;
  $scope.getOfficeStaff = function() {
    var loadStaffSuccess = function(result) {
      $scope.staff_vars = result.data;
    };
    var loadStaffFail = function() {
      console.log('Error : Return from loadRole.');
    };

    if ($scope.formData.officeId) {
      url = REST_URL.BASE + 'staff?officeId=' + $scope.formData.officeId + '&status=all';
    } else {
      url = REST_URL.BASE + 'staff?status=all';
    }
    RoleService.getData(url).then(loadStaffSuccess, loadStaffFail);
  };

  function load_form_data(edit) {
    var loadRoleSuccess = function(result) {
      $scope.offices = result.data.allowedOffices;
      $scope.roles = result.data.availableRoles;
      if (edit) {
        $scope.selectedRoles_view = $scope.formData.selectedRoles;
        var role_arr = [];
        for (var i = 0; i < $scope.formData.selectedRoles.length; i++) {
          role_arr.push($scope.formData.selectedRoles[i].id.toString());
        }
        $timeout(function() {
          $scope.formData.selectedRoles = role_arr;
        });
      }
    };
    var loadRoleFail = function() {
      console.log('Error : Return from loadRole.');
    };
    url = REST_URL.BASE + 'users/template?tenantIdentifier=default&pretty=true';
    RoleService.getData(url).then(loadRoleSuccess, loadRoleFail);
    $scope.getOfficeStaff();
  }

  if ($scope.params_id) {
    var loadPermissionsSuccess = function(result) {
      $scope.isLoading = false;
      $scope.formData = result.data;
      if (result.data.staff) {
        $scope.formData.staffId = result.data.staff.id;
      }

      if ($location.$$url.indexOf('edit_user')) {
        load_form_data(true);
      }
    };
    var loadPermissionsFail = function() {
      console.log('Error : Return from loadPermissions.');
    };
    url = REST_URL.BASE + 'users/' + $scope.params_id + '?tenantIdentifier=default&pretty=true';
    RoleService.getData(url).then(loadPermissionsSuccess, loadPermissionsFail);
  } else {
    $scope.formData.sendPasswordToEmail = true;
    if ($location.$$url === '/admin/create_user') {
      load_form_data(false);
    } else {
      var loadRoleSuccess = function(result) {
        $scope.isLoading = false;
        $scope.rowCollection = result.data;
      };
      var loadRoleFail = function() {
        console.log('Error : Return from loadRole.');
      };
      url = REST_URL.BASE + 'users?tenantIdentifier=default&pretty=true';
      RoleService.getData(url).then(loadRoleSuccess, loadRoleFail);
    }
  }

  $scope.editUser = function(id_user) {
    var editUserSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'User saved successfully';
      $scope.errors = [];
      $location.url('/admin/users');
    };
    var editUserFail = function(result) {
      console.log('Error : Return from loadRole.');
      $scope.type = 'error';
      $scope.message = 'User not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    };

    delete $scope.formData.officeName;
    delete $scope.formData.id;
    delete $scope.formData.availableRoles;
    $scope.formData.roles = $scope.formData.selectedRoles;
    delete $scope.formData.selectedRoles;
    delete $scope.formData.staff;
    var $url = REST_URL.BASE + 'users/' + id_user;
    RoleService.updateData($url, angular.toJson($scope.formData)).then(editUserSuccess, editUserFail);
  };

  $scope.createUser = function() {
    var createUserSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'User saved successfully';
      $scope.errors = [];
      $location.url('/admin/users');
    };
    var createUserFail = function(result) {
      $scope.type = 'error';
      $scope.message = 'User not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    };
    $scope.formData.roles = $scope.formData.selectedRoles;
    delete $scope.formData.selectedRoles;

    var $url = REST_URL.BASE + 'users';
    RoleService.createData($url, angular.toJson($scope.formData)).then(createUserSuccess, createUserFail);
  };

  $scope.validateUser = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.userForm.$valid) {
      var id = $route.current.params.id;
      if (typeof (id) === 'undefined') {
        $scope.createUser();
      } else {
        $scope.editUser(id);
      }
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };

  $scope.deleteUser = function(id_user, username) {
    var msg = 'You are about to remove User <strong>' + username + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        RoleService.removeData(REST_URL.BASE + 'users/' + id_user).then(function() {
          $location.url('/admin/users');
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Account not removed: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          $('html, body').animate({scrollTop: 0}, 800);
        });
      }
    });
  };

  $scope.$watch('formData.staffId', function() {
    console.log('STAFF CHANGE...');
    if($scope.staff_vars && $scope.staff_vars.length>0) {
      for(var i=0; i<$scope.staff_vars.length; i++) {
        if($scope.staff_vars[i].id===$scope.formData.staffId) {
          $scope.formData.firstname = $scope.staff_vars[i].firstname;
          $scope.formData.lastname = $scope.staff_vars[i].lastname;
          break;
        }
      }
    }
  });

});

appModule.controller('UserPasswordController', function($route, $scope, $location, RoleService, REST_URL) {
  $scope.loading = false;
  $scope.formData = {resetPassword: true};

  $scope.cancel = function() {
    $location.url('/admin/users');
  };

  $scope.reset = function() {
    $scope.loading = true;
    RoleService.updateData(REST_URL.USERS + $scope.userId, angular.toJson($scope.formData)).then(function() {
      $scope.type = 'alert-success';
      $scope.message = 'User saved successfully';
      $scope.errors = [];
      $scope.loading = false;
      //$location.url('/admin/users');
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Account not removed: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $scope.loading = false;
    });
  };

  RoleService.getData(REST_URL.USERS).then(function(result) {
    $scope.users = result.data;
  }, function() {
    // TODO: do we really need this?
  });
});
