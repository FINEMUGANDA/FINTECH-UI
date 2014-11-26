'use strict';
 
  // Here we attach this controller to our testApp module
var chargesController = angular.module('chargesController',['chargesService','Constants', 'smart-table']);

chargesController.controller('ChargesCtrl', function ($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION) {
      console.log('ChargesCtrl : loadCharges');
      //To load the loadproducts page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[];
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

chargesController.controller('CreateChargeCtrl', function ($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL) {
    console.log('chargesController : CreateChargeCtrl');
    //To load create charge page
    $scope.isLoading = false;
    $scope.chargeDetails = {};
    $rootScope.message="";
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
            $scope.chargeDetails.chargeTimeType="8";            
            //Charge Type
            $scope.chargeDetails.chargeCalculationType="1";
            $scope.chargeDetails.currencyCode="USD";
            $scope.chargeDetails.chargePaymentMode="0";
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

    //Save block
    $scope.saveCharge = function(chargeDetails){
      console.log('chargesController : CreateChargeCtrl : saveCharge');

      var saveChargeSuccess = function(result){
        console.log('Success : Return from charge service.');    
        $rootScope.type="alert-success";
        $rootScope.message="Charge saved successfully";
        $location.url(PAGE_URL.CHARGES);                
      }

      var saveChargeFail = function(result){
        console.log('Error : Return from charge service.');                    
        $scope.type="error";
        $scope.message="Charge not saved: "+result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
        if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
        }
      }
      console.log("JSON.toJson(chargeDetails) > " + angular.toJson(this.chargeDetails));
      ChargesService.saveCharge(REST_URL.CREATE_CHARGE, angular.toJson(this.chargeDetails)).then(saveChargeSuccess, saveChargeFail);
    };
});

chargesController.controller('EditChargeCtrl', function ($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL, $route) {
    console.log('chargesController : EditChargeCtrl');
    //To load create charge page
    $scope.isLoading = false;
    $scope.chargeDetails = {};
    $rootScope.message="";
    //Success callback
    var chargeTeplateSuccess = function(result) {
       $scope.isLoading = false;
       console.log('chargesController : EditChargeCtrl : chargeTeplateSuccess');
       try {
            $scope.product = result.data; 
            $scope.chargeDetails.name=$scope.product.name;
            $scope.chargeDetails.amount=$scope.product.amount;
            $scope.chargeDetails.penalty="true";
            $scope.chargeDetails.chargeAppliesTo=$scope.product.chargeAppliesToOptions[0].id;
            $scope.chargeDetails.locale= "en";
            //Application Frequency
            $scope.chargeDetails.chargeTimeType="8";            
            //Charge Type
            $scope.chargeDetails.chargeCalculationType="1";
            $scope.chargeDetails.currencyCode="USD";
            $scope.chargeDetails.chargePaymentMode="0";
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
            var $url=REST_URL.RETRIVE_CHARGE_BY_ID + $route.current.params.id + '?template=true';
            ChargesService.getData($url).then(chargeTeplateSuccess, chargeTemplateFail);
        }, 500
      );
    };

    loadchargeTemplate();

    //Update block
    $scope.updateCharge = function(chargeDetails){
      console.log('chargesController : EditChargeCtrl : updateCharge');

      var updateChargeSuccess = function(result){
        console.log('Success : Return from charge service.');    
        $rootScope.type="alert-success";
        $rootScope.message="Charge updated successfully";
        $location.url(PAGE_URL.CHARGES);                
      }

      var updateChargeFail = function(result){
        console.log('Error : Return from charge service.');                    
        $scope.type="error";
        $scope.message="Charge not updated: "+result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
        if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
        }
      }
      console.log("JSON.toJson(chargeDetails) > " + angular.toJson(this.chargeDetails));
      var $url=REST_URL.RETRIVE_CHARGE_BY_ID +$route.current.params.id;
      ChargesService.updateCharge($url, angular.toJson(this.chargeDetails)).then(updateChargeSuccess, updateChargeFail);
    };    
});