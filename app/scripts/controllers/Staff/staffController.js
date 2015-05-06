/* global moment */

'use strict';
 
angular.module('angularjsApp').controller('StaffController', function($route, $scope, RoleService, APPLICATION, REST_URL, $location) {
  var url = '';
  $scope.formData = {isActive: true};
  $scope.itemsByPage = 10;
  $scope.isLoading = true;
  $scope.params_id = $route.current.params.id;

  var loadStaffSuccess = function(result) {
    $scope.isLoading = false;
    $scope.displayed = result.data;
  };
  var loadStaffFail = function() {
    console.log('Error : Return from loadRole.');
  };

  if ($scope.params_id) {
    var loadItemStaffSuccess = function(result) {
      $scope.isLoading = false;
      $scope.offices = angular.copy(result.data.allowedOffices);
      $scope.genderOptions = angular.copy(result.data.genderOptions);
      $scope.maritalStatusOptions = angular.copy(result.data.maritalStatusOptions);
      $scope.emergencyContactRelationOptions = angular.copy(result.data.emergencyContactRelationOptions);

      delete result.data.genderOptions;
      delete result.data.maritalStatusOptions;
      delete result.data.emergencyContactRelationOptions;
      delete result.data.allowedOffices;

      $scope.formData = result.data;
      $scope.formData.genderId = result.data.gender.id;
      $scope.formData.maritalStatusId = result.data.maritalStatus.id;
      $scope.formData.emergencyContactRelationId = result.data.emergencyContactRelation.id;

      delete $scope.formData.gender;
      delete $scope.formData.maritalStatus;
      delete $scope.formData.emergencyContactRelation;

      if($scope.formData.joiningDate){
        $scope.formData.joiningDate = new Date($scope.formData.joiningDate[0],
                                               $scope.formData.joiningDate[1] - 1,
                                               $scope.formData.joiningDate[2]);

      }
    };
    var loadItemStaffFail = function() {
      console.log('Error : Return from loadPermissions.');
    };
    url = REST_URL.BASE + 'staff/' + $scope.params_id + '?template=true';
    RoleService.getData(url).then(loadItemStaffSuccess, loadItemStaffFail);
  } else if ($location.$$url.indexOf('create')>=0) {
    url = REST_URL.BASE + 'staff/template';
    RoleService.getData(url).then(function(result) {
      $scope.isLoading = false;
      $scope.offices = angular.copy(result.data.allowedOffices);
      $scope.genderOptions = angular.copy(result.data.genderOptions);
      $scope.maritalStatusOptions = angular.copy(result.data.maritalStatusOptions);
      $scope.emergencyContactRelationOptions = angular.copy(result.data.emergencyContactRelationOptions);
    }, function() {
      // TODO: do we really need this?
    });
  } else {
    url = REST_URL.BASE + 'staff?status=ALL';
    RoleService.getData(url).then(loadStaffSuccess, loadStaffFail);
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
    $scope.formData.dateFormat = APPLICATION.DF_MIFOS;
    if (typeof $scope.formData.joiningDate === 'object') {
      $scope.formData.joiningDate = moment($scope.formData.joiningDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
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

  $scope.findValue = function(id, options) {
    for(var i=0; i<options.length; i++) {
      if(options[i].id===id) {
        return options[i];
      }
    }

    return {};
  };

  $scope.validate = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.formData.joiningDate.getTime()>new Date().getTime()) {
      $scope.type = 'error';
      $scope.message = 'Join date cannot be in the future';
      $scope.errors = [];
    } else if ($scope.userForm.$valid) {
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