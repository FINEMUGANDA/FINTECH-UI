'use strict';
 
  // Here we attach this controller to our testApp module
var chargesController = angular.module('chargesController',['chargesService','Constants', 'smart-table']);

chargesController.controller('ChargesCtrl', function ($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION) {
      console.log('ChargesCtrl : loadCharges');
      //To load the loadproducts page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var chargesSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var chargesFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from charges service.');
      }

      var loadCharges = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get clients from server
              //Enter the path or url to get the datas
              ChargesService.getData(REST_URL.CHARGES).then(chargesSuccess, chargesFail);              
          }, 2000
        );
      };

      loadCharges();
});

chargesController.controller('CreateChargeCtrl', function ($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION) {
    console.log('chargesController : CreateChargeCtrl');
    //To load create charge page
    $scope.isLoading = false;
    $scope.chargeDetails = {};
    //Success callback
    var chargeTeplateSuccess = function(result) {
       $scope.isLoading = false;
       console.log('chargesController : CreateChargeCtrl : chargeTeplateSuccess');
       try {
            $scope.product = result.data;            
            $scope.chargeDetails.penalty="true";
            $scope.chargeDetails.chargeAppliesTo=$scope.product.chargeAppliesToOptions[0].id;
            $scope.chargeDetails.locale= "en";
            //Application Frequency
            $scope.chargeDetails.chargeTimeType="35";            
            //Charge Type
            $scope.chargeDetails.chargeCalculationType="0";
        } catch (e) {
        }
    }

    //failur callback
    var chargeTemplateFail = function(result){
        $scope.isLoading = false;
        console.log('Error : Return from charge service.');
    }

    var loadchargeTemplate = function getData(tableState) {
      $scope.isLoading = true;
      $timeout(
        function() {
            $scope.rowCollection = [];              
            ChargesService.getData(REST_URL.CHARGE_TEMPLATE).then(chargeTeplateSuccess, chargeTemplateFail);
        }, 500
      );
    };

    loadchargeTemplate();

    $scope.saveCharge = function(){
      console.log('chargesController : CreateChargeCtrl : saveCharge');

      var saveChargeSuccess = function(result){
        console.log('Success : Return from charge service.');                    
      }

      var saveChargeFail = function(result){
        console.log('Error : Return from charge service.');                    
      }
      console.log("JSON.toJson(chargeDetails) > " + angular.toJson(this.chargeDetails));
      //LoanProductService.saveProduct(REST_URL.LOANS_PRODUCTS_LIST, JSON.toJson(loanProductDetails)).then(saveloanProductSuccess, saveloanProductFail);
    };
});