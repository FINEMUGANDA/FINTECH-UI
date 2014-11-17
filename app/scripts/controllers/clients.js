'use strict';
 
  // Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController',['clientsService','Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
	//To load the dashboard page

  	$scope.loadClients = function(tableState, tableController){
    	console.log('ClientsCtrl : loadClients');
    	//Success callback
    	var allClientsSuccess = function(result){
          //var temp = result.data
          //$scope.allClients = temp;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          $scope.isLoading = false;
          console.log('Success : Return from allClients service.'); 
      		
	    } 
	    //failur callback
	    var allClientsFail = function(result){
          $scope.isLoading = false;
	        console.log('Error : Return from allClients service.');
	    }
        //allClientsSuccess();
        $scope.isLoading = true;
        //$timeout(function () {
            //service to get active clients from server
        //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allClientsSuccess, allClientsFail);
        //    $scope.isLoading = false;
        //}, 2000);
        allClientsSuccess();
  	};
    $scope.loadClients();
});


clientsCtrl.controller('LoansCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
  //To load the dashboard page
    $scope.loadLoans = function(){
      console.log('LoansCtrl : loadLoans');
      //Success callback
      var allLoansSuccess = function(result){
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allLoans service.'); 
          
      } 
      //failur callback
      var allLoansFail = function(result){
          console.log('Error : Return from allLoans service.');
      }
      //service to get active loans from server
      //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allLoansSuccess, allLoansFail);
      allLoansSuccess();
    };
  //will fire on every page load
  $scope.loadLoans();
});


clientsCtrl.controller('LoansPendingApprovalsCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
  //To load the dashboard page
    $scope.loadLoansPendingApprovals = function(){
      console.log('ClientsCtrl : LoansPendingApprovalsCtrl');
      //Success callback
      var allLoansPendingApprovalsSuccess = function(result){
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allLoans service.'); 
          
      } 
      //failur callback
      var allLoansPendingApprovalsFail = function(result){
          console.log('Error : Return from allLoans service.');
      }
      //service to get active LoansPendingApprovals from server
      //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allLoansPendingApprovalsSuccess, allLoansPendingApprovalsFail);
      allLoansPendingApprovalsSuccess();
    };
  //will fire on every page load
  $scope.loadLoansPendingApprovals();
});

clientsCtrl.controller('LoansAwaitingDisbursementCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
  //To load the dashboard page
    $scope.loadLoansAwaitingDisbursement = function(){
      console.log('LoansAwaitingDisbursementCtrl : LoansAwaitingDisbursement');
      //Success callback
      var allLoansAwaitingDisbursementSuccess = function(result){
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allLoans service.'); 
          
      } 
      //failur callback
      var allLoansAwaitingDisbursementFail = function(result){
          console.log('Error : Return from allLoans service.');
      }
      //service to get active LoansPendingApprovals from server
      //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allLoansAwaitingDisbursementSuccess, allLoansAwaitingDisbursementFail);
      allLoansAwaitingDisbursementSuccess();
    };
  //will fire on every page load
  $scope.loadLoansAwaitingDisbursement();
});

clientsCtrl.controller('LoansRejectedCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
  //To load the dashboard page
    $scope.loadLoansRejected = function(){
      console.log('LoansRejectedCtrl : LoansRejected');
      //Success callback
      var allLoansRejectedSuccess = function(result){
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allLoans service.'); 
          
      } 
      //failur callback
      var allLoansRejectedFail = function(result){
          console.log('Error : Return from allLoans service.');
      }
      //service to get active LoansRejected from server
      //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allLoansRejectedSuccess, allLoansRejectedFail);
      allLoansRejectedSuccess();
    };
  //will fire on every page load
  $scope.loadLoansRejected();
});

clientsCtrl.controller('LoansWrittenOffCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
  //To load the dashboard page
    $scope.loadLoansWrittenOff = function(){
      console.log('LoansWrittenOffCtrl : LoansWrittenOff');
      //Success callback
      var allLoansWrittenOffSuccess = function(result){
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "0","loanStatusCode": "100"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "200","loanStatusCode": "300"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50","statusCode": "800","loanStatusCode": ""}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allLoans service.'); 
          
      } 
      //failur callback
      var allLoansWrittenOffFail = function(result){
          console.log('Error : Return from allLoans service.');
      }
      //service to get active LoansRejected from server
      //ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allLoansWrittenOffSuccess, allLoansWrittenOffFail);
      allLoansWrittenOffSuccess();
    };
  //will fire on every page load
  $scope.loadLoansWrittenOff();
});