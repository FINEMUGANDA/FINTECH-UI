'use strict';
// Here we attach this controller to our testApp module
var chargesController = angular.module('chargesController', ['chargesService', 'Constants', 'smart-table']);

chargesController.controller('ChargesCtrl', function(dialogs, $scope, $location, $timeout, ChargesService, REST_URL, APPLICATION, PAGE_URL) {
  console.log('ChargesCtrl : loadCharges');
  //To load the loadproducts page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.itemsByPage = 11;
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

  // Delete charges
  $scope.removeCharge = function(charge) {
    var msg = 'You are about to remove Charge <strong>' + charge.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.rowCollection.indexOf(charge);
        ChargesService.removeCharge(REST_URL.CHARGES + '/' + charge.id).then(function() {
          if (index >= -1) {
            $scope.rowCollection.splice(index, 1);
          }
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Charge not removed: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          $('html, body').animate({scrollTop: 0}, 800);
        });
      }
    });
  };
});

chargesController.controller('EditChargeCtrl', function($scope, $location, $timeout, ChargesService, CurrencyService, REST_URL, APPLICATION, PAGE_URL, $route) {
  console.log('chargesController : EditChargeCtrl');
  //To load create charge page
  $scope.isLoading = false;
  $scope.chargeDetails = {};
  $scope.message = '';
  var ignoreChargeTimeTypeOptions = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11]; //TODO: filter this on REST API
  //Success callback
  var chargeTeplateSuccess = function(result) {
    $scope.isLoading = false;
    console.log('chargesController : EditChargeCtrl : chargeTeplateSuccess');
    try {
      $scope.charge = result.data;
      $scope.charge.chargeTimeTypeOptions = _.filter($scope.charge.chargeTimeTypeOptions, function(chargeTimeTypeOption) {
        return ignoreChargeTimeTypeOptions.indexOf(parseInt(chargeTimeTypeOption.id)) === -1;
      });
      console.log($scope.charge.chargeTimeTypeOptions);
      if ($scope.charge.id) {
        $scope.chargeDetails.name = $scope.charge.name;
        $scope.chargeDetails.amount = $scope.charge.amount;
        $scope.chargeDetails.penalty = String($scope.charge.penalty);
        $scope.chargeDetails.chargeAppliesTo = $scope.charge.chargeAppliesTo.id;
        $scope.chargeDetails.locale = 'en';
        $scope.chargeDetails.currencyCode = $scope.charge.currency.code;
        //Application Frequency
        $scope.chargeDetails.chargeTimeType = $scope.charge.chargeTimeType.id;
        //Charge Type
        $scope.chargeDetails.chargeCalculationType = $scope.charge.chargeCalculationType.id;
        $scope.chargeDetails.feeFrequency = $scope.charge.feeFrequency? $scope.charge.feeFrequency.id : 2;
        $scope.chargeDetails.feeInterval = $scope.charge.feeInterval || 1;
        $scope.chargeDetails.chargePaymentMode = '0';
        $scope.chargeDetails.active = true;
      } else {
        $scope.chargeDetails.penalty = 'false';
        $scope.chargeDetails.chargeAppliesTo = $scope.charge.chargeAppliesToOptions[0].id;
        $scope.chargeDetails.locale = 'en';
        $scope.chargeDetails.currencyCode = $scope.charge.currencyOptions && $scope.charge.currencyOptions.length>0 ? $scope.charge.currencyOptions[0].code : null;
        $scope.chargeDetails.chargeCalculationType = 1;
        $scope.chargeDetails.chargeTimeType = 8;
        $scope.chargeDetails.chargePaymentMode = 0;
        $scope.chargeDetails.feeFrequency = 2;
        $scope.chargeDetails.feeInterval = 1;
        $scope.chargeDetails.active = true;
        CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
          $scope.chargeDetails.currencyCode = result.data.base;
        }, function() {
          $scope.chargeDetails.currencyCode = $scope.charge.currencyOptions && $scope.charge.currencyOptions.length>0 ? $scope.charge.currencyOptions[0].code : null;
        });
      }
      //Set charge type
//      $scope.flat = $scope.chargeDetails.amount;
//      if($scope.product.chargeCalculationType.id===2){        
//        $scope.percentage = $scope.chargeDetails.amount <=100 ? $scope.chargeDetails.amount : 100;
//      }
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
      var chargeId = $route.current.params.id;

      if (chargeId) {
        ChargesService.getData(REST_URL.RETRIVE_CHARGE_BY_ID + chargeId + '?template=true').then(chargeTeplateSuccess, chargeTemplateFail);
      } else {
        ChargesService.getData(REST_URL.CHARGE_TEMPLATE).then(chargeTeplateSuccess, chargeTemplateFail);
      }
    }, 500);
  };

  loadchargeTemplate();

  //Update block
  $scope.updateCharge = function() {
    console.log('chargesController : EditChargeCtrl : updateCharge');
    $scope.type = '';
    $scope.message = '';

    var updateChargeSuccess = function() {
      console.log('Success : Return from charge service.');
      $scope.saveInProgress = false;
      $scope.type = 'alert-success';
      $scope.message = 'Charge updated successfully';
      $location.url(PAGE_URL.CHARGES);
    };

    var updateChargeFail = function(result) {
      console.log('Error : Return from charge service.');
      $scope.saveInProgress = false;
      $scope.type = 'error';
      $scope.message = 'Charge not updated: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length > 0) {
        for (var i = 0; i < result.data.errors.length; i++) {
          if ($scope.errors[i].userMessageGlobalisationCode === 'error.msg.charge.must.be.penalty') {
            $scope.message = 'Charge not saved: After final maturity Charge must be a penalty ';
          }
          if ($scope.errors[i].userMessageGlobalisationCode === 'error.msg.charge.frequency.cannot.be.updated.it.is.used.in.loan') {
            $scope.message = 'Charge not saved: Charge frequency can\'t be updated as it is used in Loan Products ';
          }
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
    };
    if ($scope.chargeDetails.chargeCalculationType !== 1 && $scope.chargeDetails.amount > 100) {
      $scope.type = 'error';
      $scope.message = 'Amount(%) must be or equal to 100';
      $('html, body').animate({scrollTop: 0}, 800);
    } else {
      $scope.saveInProgress = true;
      console.log('JSON.toJson(chargeDetails) > ' + angular.toJson($scope.chargeDetails));
      if (parseInt($scope.chargeDetails.chargeTimeType) !== 12) { //remove feeInterval for not Overdue maturity date charges
        $scope.chargeDetails.feeFrequency = null;
        $scope.chargeDetails.feeInterval = null;
      }
      if ($route.current.params.id) {
        ChargesService.updateCharge(REST_URL.RETRIVE_CHARGE_BY_ID + $route.current.params.id, angular.toJson($scope.chargeDetails)).then(updateChargeSuccess, updateChargeFail);
      } else {
        ChargesService.saveCharge(REST_URL.CREATE_CHARGE, angular.toJson($scope.chargeDetails)).then(updateChargeSuccess, updateChargeFail);
      }
    }
  };
});