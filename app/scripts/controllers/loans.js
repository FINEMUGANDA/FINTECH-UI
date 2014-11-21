'use strict';
 
  // Here we attach this controller to our testApp module
var LoanProductCrtl = angular.module('loanProductController',['loanProductService','Constants', 'smart-table']);

LoanProductCrtl.controller('LoanProductsCtrl', function ($scope, $rootScope, $location, $timeout, LoanProductService, REST_URL, APPLICATION) {
      console.log('LoanProductsCtrl : LoanProducts');
      //To load the loadproducts page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var loanProductsSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var loanProductsFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from loanProducts service.');
      }

      var loadLoanProducts = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get clients from server
              //Enter the path or url to get the datas
              LoanProductService.getData(REST_URL.LOANS_PRODUCTS_LIST).then(loanProductsSuccess, loanProductsFail);              
          }, 2000
        );
      };

      loadLoanProducts();
});