'use strict';
 
  // Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController',['clientsService','Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('ClientsCtrl : loadClients');
      //To load the clients page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allClientsSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allClientsFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allClients service.');
      }

      var loadClients = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get clients from server
              ClientsService.getData(REST_URL.ALL_CLIENTS).then(allClientsSuccess, allClientsFail);              
          }, 2000
        );
      };

      loadClients();
});


clientsCtrl.controller('LoansCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('LoansCtrl : Loans');
      //To load the loans page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansFail service.');
      }

      var loadLoans = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get loans from server
              ClientsService.getData(REST_URL.LOANS).then(allLoansSuccess, allLoansFail);              
          }, 2000
        );
      };

      loadLoans();
});


clientsCtrl.controller('LoansPendingApprovalsCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('LoansPendingApprovalsCtrl : LoansPendingApprovals');
      //To load the LoansPendingApprovals page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansPendingApprovalsSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansPendingApprovalsFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansPendingApprovalsFail service.');
      }

      var loadLoansPendingApprovals = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get LoansPendingApprovals from server
              ClientsService.getData(REST_URL.LOANS_PENDING_APPROVALS).then(allLoansPendingApprovalsSuccess, allLoansPendingApprovalsFail);              
          }, 2000
        );
      };

      loadLoansPendingApprovals();
});

clientsCtrl.controller('LoansAwaitingDisbursementCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
    console.log('LoansAwaitingDisbursementCtrl : LoansAwaitingDisbursement');
      //To load the LoansAwaitingDisbursement page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansAwaitingDisbursementSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansAwaitingDisbursemensFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansAwaitingDisbursemensFail service.');
      }

      var loadLoansPendingApprovals = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get allLoansAwaitingDisbursemensFail from server
              ClientsService.getData(REST_URL.LOANS_AWAITING_DISBURSEMENT).then(allLoansAwaitingDisbursementSuccess, allLoansAwaitingDisbursemensFail);              
          }, 2000
        );
      };

      loadLoansPendingApprovals();
});

clientsCtrl.controller('LoansRejectedCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
    console.log('LoansRejectedCtrl : LoansRejected');
      //To load the LoansRejected page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansRejectedSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansRejectedFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from LoansRejected service.');
      }

      var loadLoansRejected = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get allLoansAwaitingDisbursemensFail from server
              ClientsService.getData(REST_URL.LOANS_REJECTED).then(allLoansRejectedSuccess, allLoansRejectedFail);              
          }, 2000
        );
      };

      loadLoansRejected();
});

clientsCtrl.controller('LoansWrittenOffCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
  console.log('LoansWrittenOffCtrl : LoansWrittenOff');
      //To load the LoansWrittenOff page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansWrittenOffSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansWrittenOffFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from LoansWrittenOff service.');
      }

      var loadLoansWrittenOff = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get LoansWritten from server
              ClientsService.getData(REST_URL.LOANS_WRITTEN_OFF).then(allLoansWrittenOffSuccess, allLoansWrittenOffFail);              
          }, 2000
        );
      };

      loadLoansWrittenOff();
});