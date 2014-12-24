'use strict';

angular.module('angularjsApp').controller('StaffController', function($route, $scope, RoleService, REST_URL, $location) {
  var url = '';
  $scope.formData = {};
  $scope.itemsByPage = 10;
  $scope.isLoading = true;
  $scope.params_id = $route.current.params.id;

  function load_form_data() {
    var loadOfficesSuccess = function(result) {
      $scope.isLoading = false;
      $scope.offices = result.data;
    };
    var loadOfficesFail = function() {
      console.log('Error : Return from loadRole.');
    };
    url = REST_URL.BASE + 'offices';
    RoleService.getData(url).then(loadOfficesSuccess, loadOfficesFail);
  }

  var loadStaffSuccess = function(result) {
    $scope.isLoading = false;
    $scope.displayed = result.data;
  };
  var loadStaffFail = function() {
    console.log('Error : Return from loadRole.');
  };
  url = REST_URL.BASE + 'staff?status=ALL';
  RoleService.getData(url).then(loadStaffSuccess, loadStaffFail);

  if ($scope.params_id) {
    var loadItemStaffSuccess = function(result) {
      $scope.isLoading = false;
      $scope.formData = result.data;
      if($scope.formData.joiningDate){
        $scope.formData.joiningDate = new Date($scope.formData.joiningDate[0],
                                               $scope.formData.joiningDate[1] - 1,
                                               $scope.formData.joiningDate[2]);

      }
      if ($location.$$url.indexOf('edit')) {
        load_form_data();
      }
    };
    var loadItemStaffFail = function() {
      console.log('Error : Return from loadPermissions.');
    };
    url = REST_URL.BASE + 'staff/' + $scope.params_id;
    RoleService.getData(url).then(loadItemStaffSuccess, loadItemStaffFail);
  } else {
    if ($location.$$url.indexOf('create')) {
      load_form_data();
    }
  }

  $scope.save = function() {
    var saveSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'Saved successfully';
      $scope.errors = [];
      $location.url('/admin/staff');
    };
    var saveFail = function(result) {
      $scope.type = 'error';
      $scope.message = 'not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    };

    $scope.formData.locale = 'en';
    $scope.formData.dateFormat = 'dd/MM/yyyy';
    if (typeof $scope.formData.joiningDate === 'object') {
      var date = $scope.formData.joiningDate;
      date = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      $scope.formData.joiningDate = date;
    }

    if ($scope.params_id) {
      delete $scope.formData.id;
      delete $scope.formData.displayName;
      delete $scope.formData.officeName;

      url = REST_URL.BASE + 'staff/' + $scope.params_id;
      RoleService.updateData(url, angular.toJson($scope.formData)).then(saveSuccess, saveFail);
    } else {
      url = REST_URL.BASE + 'staff';
      RoleService.createData(url, angular.toJson($scope.formData)).then(saveSuccess, saveFail);
    }
  };

  $scope.validate = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.userForm.$valid) {
      $scope.save();
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

});