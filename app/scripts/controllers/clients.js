'use strict';
 
  // Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController',['clientsService','Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', function ($scope, $rootScope, $location, ClientsService, REST_URL, APPLICATION) {
	//To load the dashboard page
  	$scope.loadClients = function(){
    	console.log('ClientsCtrl : loadClients');
    	//Success callback
    	var allClientsSuccess = function(result){
      		$scope.itemsByPage = APPLICATION.PAGE_SIZE;
          //$scope.allClients = result.data;
          try {
              var temp = JSON.parse('[{"id": 1,"name": "StephenSandoval","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "INBADSTANDING","education": "Bachelors","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50"},{"id": 2,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ON HOLD","loanStatus": "CLOSED","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50"},{"id": 3,"name": "Ryan Bradley","type": "Retailer","fileNo": 6743,"status": "ACTIVE","loanStatus": "","education": "O Level","povertyLevel": "500000-1000000","loanOfficer": "PeterSimpson","location" : "http://placehold.it/50x50"}]');              
              $scope.allClients = temp;
          } catch (e) {
          }
          console.log('Success : Return from allClients service.'); 
      		
	    } 
	    //failur callback
	    var allClientsFail = function(result){
	        console.log('Error : Return from allClients service.');
	    }
    	//service to get active clients from server
    	//ClientsService.getActiveClients(REST_URL.ALL_CLIENTS).then(allClientsSuccess, allClientsFail);
      allClientsSuccess();
  	};
  //will fire on every page load
  $scope.loadClients();
});