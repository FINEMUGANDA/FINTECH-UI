/* global moment */

'use strict';

angular.module('angularjsApp').controller('LoansReassignmentCtrl',
  function($scope, APPLICATION, REST_URL, RoleService) {

    var url = '';
    $scope.formData = {};

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    var loadOfficesSuccess = function(result) {
      $scope.isLoading = true;
      $scope.offices = result.data;
    };
    var loadOfficesFail = function() {
      console.log('Error.');
    };
    url = REST_URL.BASE + 'offices';
    RoleService.getData(url).then(loadOfficesSuccess, loadOfficesFail);

    $scope.getFromOfficer = function() {
      $scope.toLoanOfficeshow = false;
      $scope.fromLoanOfficeshow = false;
      $scope.clients = [];
      var loadOfficesSuccess = function(result) {
        $scope.fromLoanOfficeshow = true;
        $scope.from_officers = [];
        angular.forEach(result.data.loanOfficerOptions, function(officer) {
          if(officer.isLoanOfficer) {
            $scope.from_officers.push(officer);
          }
        });
      };
      var loadOfficesFail = function() {
        console.log('Error.');
      };
      url = REST_URL.BASE + 'loans/loanreassignment/template?officeId=' + $scope.formData.officeId;
      RoleService.getData(url).then(loadOfficesSuccess, loadOfficesFail);
    };

    $scope.getToOfficer = function() {
      $scope.toLoanOfficeshow = false;
      $scope.clients = [];
      var loadOfficesSuccess = function(result) {
        $scope.toLoanOfficeshow = true;
        $scope.to_officers = result.data.loanOfficerOptions;
        for (var i = 0; i < $scope.to_officers.length; i++) {
          if (!$scope.to_officers[i].isLoanOfficer || $scope.to_officers[i].id === result.data.fromLoanOfficerId) {
            $scope.to_officers.splice(i, 1);
            break;
          }
        }
        $scope.clients = result.data.accountSummaryCollection.clients;
      };
      var loadOfficesFail = function() {
        console.log('Error.');
      };
      url = REST_URL.BASE + 'loans/loanreassignment/template?fromLoanOfficerId=' + $scope.formData.fromLoanOfficerId + '&officeId=' + $scope.formData.officeId;
      RoleService.getData(url).then(loadOfficesSuccess, loadOfficesFail);
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

    $scope.save = function() {
      var saveSuccess = function() {
        $scope.type = 'alert-success';
        $scope.message = 'Loans reassigned successfully';
        $scope.errors = [];
        $scope.formData = [];
        $scope.clients = [];
        $scope.toLoanOfficeshow = false;
        $scope.fromLoanOfficeshow = false;
      };
      var saveFail = function(result) {
        $scope.type = 'error';
        $scope.message = 'not saved: ' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
      };

      var send = {};
      if ($scope.formData.loans) {
        send.loans = $.map($scope.formData.loans, function(value, index) {
          return [index];
        });
      }
      send.locale = 'en';
      send.dateFormat = APPLICATION.DF_MIFOS;
      if (typeof $scope.formData.assignmentDate === 'object') {
        send.assignmentDate = moment($scope.formData.assignmentDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
      }
      send.fromLoanOfficerId = $scope.formData.fromLoanOfficerId;
      send.toLoanOfficerId = $scope.formData.toLoanOfficerId;

      url = REST_URL.BASE + 'loans/loanreassignment';
      RoleService.createData(url, angular.toJson(send)).then(saveSuccess, saveFail);
    };
  });