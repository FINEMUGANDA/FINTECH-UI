'use strict';

// Here we attach this controller to our testApp module
var chargesController = angular.module('chargesController', ['chargesService', 'Constants', 'smart-table']);

chargesController.controller('ChargesCtrl', function($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL) {
  console.log('ChargesCtrl : loadCharges');
  //To load the loadproducts page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  //Success callback
  var chargesSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var chargesFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from charges service.');
  };

  var loadCharges = function getData() {
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

  //Redirect to edit charges
  $scope.routeTo = function(loanProductId) {
    $location.url(PAGE_URL.EDITCHARGE + '/' + loanProductId);
  };
});

chargesController.controller('CreateChargeCtrl', function($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL) {
  console.log('chargesController : CreateChargeCtrl');
  //To load create charge page
  $scope.isLoading = false;
  $scope.chargeDetails = {};
  $rootScope.message = '';
  //Success callback
  var chargeTeplateSuccess = function(result) {
    $scope.isLoading = false;
    console.log('chargesController : CreateChargeCtrl : chargeTeplateSuccess');
    try {
      $scope.product = result.data;
      $scope.chargeDetails.penalty = 'true';
      $scope.chargeDetails.chargeAppliesTo = $scope.product.chargeAppliesToOptions[0].id;
      $scope.chargeDetails.locale = 'en';
      //Application Frequency
      $scope.chargeDetails.chargeTimeType = '8';
      //Charge Type
      $scope.chargeDetails.chargeCalculationType = '1';
      $scope.chargeDetails.currencyCode = $scope.product.currencyOptions[7].code;
      $scope.chargeDetails.chargePaymentMode = '0';
    } catch (e) {
      console.log(e);
    }
  };

  //failur callback
  var chargeTemplateFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from charge service.');
  };

  var loadchargeTemplate = function getData() {
    $scope.isLoading = true;
    $timeout(function() {
      $scope.rowCollection = [];
      ChargesService.getData(REST_URL.CHARGE_TEMPLATE).then(chargeTeplateSuccess, chargeTemplateFail);
    }, 500);
  };

  loadchargeTemplate();

  //Save block
  $scope.saveCharge = function() {
    console.log('chargesController : CreateChargeCtrl : saveCharge');
    //Set amount according to charge type
    this.chargeDetails.amount = $scope.flat;
    if(this.chargeDetails.chargeCalculationType===2){
      this.chargeDetails.amount = $scope.percentage;
    }
    var saveChargeSuccess = function() {
      console.log('Success : Return from charge service.');
      $rootScope.type = 'alert-success';
      $rootScope.message = 'Charge saved successfully';
      $location.url(PAGE_URL.CHARGES);
    };

    var saveChargeFail = function(result) {
      console.log('Error : Return from charge service.');
      $scope.type = 'error';
      $scope.message = 'Charge not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
    };
    console.log('JSON.toJson(chargeDetails) > ' + angular.toJson(this.chargeDetails));
    ChargesService.saveCharge(REST_URL.CREATE_CHARGE, angular.toJson(this.chargeDetails)).then(saveChargeSuccess, saveChargeFail);
  };
});

chargesController.controller('EditChargeCtrl', function($scope, $rootScope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL, $route) {
  console.log('chargesController : EditChargeCtrl');
  //To load create charge page
  $scope.isLoading = false;
  $scope.chargeDetails = {};
  $rootScope.message = '';
  //Success callback
  var chargeTeplateSuccess = function(result) {
    $scope.isLoading = false;
    console.log('chargesController : EditChargeCtrl : chargeTeplateSuccess');
    try {
      $scope.product = result.data;
      $scope.chargeDetails.name = $scope.product.name;
      $scope.chargeDetails.amount = $scope.product.amount;
      $scope.chargeDetails.penalty = 'true';
      $scope.chargeDetails.chargeAppliesTo = $scope.product.chargeAppliesToOptions[0].id;
      $scope.chargeDetails.locale = 'en';
      $scope.chargeDetails.currencyCode = $scope.product.currency.code;
      //Application Frequency
      $scope.chargeDetails.chargeTimeType = '8';
      //Charge Type
      $scope.chargeDetails.chargeCalculationType = '1';
      $scope.chargeDetails.chargePaymentMode = '0';
      //Set charge type
      $scope.flat = $scope.chargeDetails.amount;
      if($scope.product.chargeCalculationType===2){        
        $scope.percentage = $scope.chargeDetails.amount <=100 ? $scope.chargeDetails.amount : 100;
      }
    } catch (e) {
      console.log(e);
    }
  };

  //failur callback
  var chargeTemplateFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from charge service.');
  };

  var loadchargeTemplate = function getData() {
    $scope.isLoading = true;
    $timeout(function() {
      $scope.rowCollection = [];
      var $url = REST_URL.RETRIVE_CHARGE_BY_ID + $route.current.params.id + '?template=true';
      ChargesService.getData($url).then(chargeTeplateSuccess, chargeTemplateFail);
    }, 500);
  };

  loadchargeTemplate();

  //Update block
  $scope.updateCharge = function() {
    console.log('chargesController : EditChargeCtrl : updateCharge');
    //Set amount according to charge type
    this.chargeDetails.amount = $scope.flat;
    if(this.chargeDetails.chargeCalculationType===2){
      this.chargeDetails.amount = $scope.percentage;
    }

    var updateChargeSuccess = function() {
      console.log('Success : Return from charge service.');
      $rootScope.type = 'alert-success';
      $rootScope.message = 'Charge updated successfully';
      $location.url(PAGE_URL.CHARGES);
    };

    var updateChargeFail = function(result) {
      console.log('Error : Return from charge service.');
      $scope.type = 'error';
      $scope.message = 'Charge not updated: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
    };
    console.log('JSON.toJson(chargeDetails) > ' + angular.toJson(this.chargeDetails));
    var $url = REST_URL.RETRIVE_CHARGE_BY_ID + $route.current.params.id;
    ChargesService.updateCharge($url, angular.toJson(this.chargeDetails)).then(updateChargeSuccess, updateChargeFail);
  };
});