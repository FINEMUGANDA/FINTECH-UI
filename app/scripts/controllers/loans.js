'use strict';
 
  // Here we attach this controller to our testApp module
var LoanProductCrtl = angular.module('loanProductController',['loanProductService','Constants', 'smart-table']);

LoanProductCrtl.controller('LoanProductsCtrl', function ($scope, $rootScope, $location, $timeout, LoanProductService, REST_URL, APPLICATION) {
      console.log('LoanProductsCtrl : LoanProducts');
      //To load the loadproducts page      
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
              LoanProductService.getData(REST_URL.LOANS_PRODUCTS_LIST).then(loanProductsSuccess, loanProductsFail);              
          }, 2000
        );
      };

      loadLoanProducts();
});

LoanProductCrtl.controller('CreateLoanProductsCtrl', function ($scope, $rootScope, $location, $timeout, LoanProductService, REST_URL, APPLICATION) {
      console.log('LoanProductsCtrl : CreateLoanProducts');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.formData = {};
      //Success callback
      var loanProductTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.product = result.data;
              $scope.formData.digitsAfterDecimal = '2';
              $scope.formData.currencyCode = $scope.product.currencyOptions[0].code;
              $scope.formData.repaymentFrequencyType = $scope.product.repaymentFrequencyType.id;
              $scope.formData.interestRateFrequencyType = $scope.product.interestRateFrequencyType.id;
              $scope.formData.amortizationType = $scope.product.amortizationType.id;
              $scope.formData.interestType = $scope.product.interestType.id;
              $scope.formData.transactionProcessingStrategyId = $scope.product.transactionProcessingStrategyOptions[0].id;
          } catch (e) {
          }
      }

      //failur callback
      var loanProductTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from loanProducts service.');
      }

      var loadLoanProductTemplate = function getData(tableState) {
        $scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];              
              LoanProductService.getData(REST_URL.LOAN_PRODUCTS_TEMPLATE).then(loanProductTeplateSuccess, loanProductTemplateFail);              
          }, 500
        );
      };

      loadLoanProductTemplate();
});