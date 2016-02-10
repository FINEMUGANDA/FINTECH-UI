'use strict';

// Here we attach this controller to our testApp module
var LoanProductCrtl = angular.module('loanProductController', ['loanProductService', 'Constants', 'smart-table']);

LoanProductCrtl.controller('LoanProductsCtrl', function($scope, $location, $timeout, LoanProductService, SearchService, REST_URL, APPLICATION, PAGE_URL) {
  console.log('LoanProductsCtrl : LoanProducts');
  //To load the loadproducts page      
  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.itemsByPage = 10;

  $scope.$watch('tableSearch', function() {
    SearchService.data('product', $scope.tableSearch);
  });

  //Success callback
  var loanProductsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
      $scope.tableSearch = SearchService.data('product');
    } catch (e) {
    }
  };

  //failur callback
  var loanProductsFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from loanProducts service.');
  };

  var loadLoanProducts = function getData() {
    $scope.isLoading = true;

    $timeout(
      function() {
        $scope.rowCollection = [];
        //service to get clients from server              
        LoanProductService.getData(REST_URL.LOANS_PRODUCTS).then(loanProductsSuccess, loanProductsFail);
      }, 2000
      );
  };

  loadLoanProducts();

  //Redirect to edit loan product
  $scope.routeTo = function(loanProductId) {
    $location.url(PAGE_URL.EDITLOANPRODUCT + '/' + loanProductId);
  };
});

LoanProductCrtl.controller('CreateLoanProductsCtrl', function($scope, $location, $timeout, LoanProductService, CurrencyService, REST_URL, APPLICATION, PAGE_URL, ChargesService) {
  console.log('LoanProductsCtrl : CreateLoanProducts');

  //To highlight selected tab
  $scope.step = 1;
  $scope.newProTab = 'active';
  $scope.setStep = function(step) {
    $scope.step = step;
    if (step === 1) {
      $scope.newProTab = 'active';
      $scope.charTab = '';
    } else {
      $scope.newProTab = '';
      $scope.charTab = 'active';
    }
  };

  $scope.interestRateFrequencyTypeOptions = [
    {id: 3, value: 'Per year'}
  ];
  $scope.transactionProcessingStrategyOptions = [
    {id: 8, value: 'P/I/F/LPI'}
  ];
  $scope.amortizationTypeOptions = [
    {id: 1, value: 'Equal installments'}
  ];
  $scope.repaymentFrequencyTypeOptions = [
    {id: 2, value: 'Monthly'}
  ];
  $scope.interestTypeOptions = [
    {id: 1, value: 'Flat'}
  ];

  //To load the loadproducts page
  $scope.isLoading = false;
  $scope.loanProductDetails = {};
  $scope.charges = [];
  $scope.message = '';
  //Success callback
  var loanProductTeplateSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.product = result.data;
      $scope.loanProductDetails.digitsAfterDecimal = '2';
      $scope.loanProductDetails.currencyCode = $scope.product.currencyOptions && $scope.product.currencyOptions.length>0 ? $scope.product.currencyOptions[0].code : null;
      //Days and weeks options are hidden
      $scope.loanProductDetails.repaymentFrequencyType = $scope.product.repaymentFrequencyType.id;
      //Per month option is hidden
      $scope.loanProductDetails.interestRateFrequencyType = $scope.product.interestRateFrequencyType.id;
      $scope.loanProductDetails.amortizationType = $scope.product.amortizationType.id;
      //Declining Balance option is hidden
      $scope.loanProductDetails.interestType = $scope.product.interestType.id;
      //$scope.loanProductDetails.transactionProcessingStrategyId = $scope.product.transactionProcessingStrategyOptions[0].id;

      //Set defaults value as per requirements
      $scope.loanProductDetails.includeInBorrowerCycle = 'true';
      $scope.loanProductDetails.transactionProcessingStrategyId = 8;
      $scope.loanProductDetails.interestType = 1;
      $scope.loanProductDetails.interestRateFrequencyType = 3;
      //Set as default now
      $scope.loanProductDetails.inMultiplesOf = '0';
      $scope.loanProductDetails.repaymentEvery = '1';
      $scope.loanProductDetails.interestCalculationPeriodType = 1;
      $scope.loanProductDetails.accountingRule = '1';
      $scope.loanProductDetails.isInterestRecalculationEnabled = 'false';
      $scope.loanProductDetails.daysInYearType = 1;
      $scope.loanProductDetails.daysInMonthType = 1;
      $scope.loanProductDetails.locale = 'en';
      $scope.step = 1;
      CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
        $scope.loanProductDetails.currencyCode = result.data.base;
      }, function() {
        $scope.loanProductDetails.currencyCode = $scope.product.currencyOptions && $scope.product.currencyOptions.length>0 ? $scope.product.currencyOptions[0].code : null;
      });
    } catch (e) {
    }
  };

  //failur callback
  var loanProductTemplateFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from loanProducts service.');
  };

  var loadLoanProductTemplate = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        LoanProductService.getData(REST_URL.LOAN_PRODUCTS_TEMPLATE).then(loanProductTeplateSuccess, loanProductTemplateFail);
      }, 500
      );
  };

  loadLoanProductTemplate();

  $scope.chargeSelected = function(chargeId) {
    if (chargeId) {
      var chargeTeplateSuccess = function(result) {
        result.data.chargeId = result.data.id;
        $scope.charges.push(result.data);
        $scope.chargeId = '';
        $('select#chargeId').val('');
      };
      var chargeTemplateFail = function() {
        console.log('Error : Return from ChargesService service.');
      };
      var $url = REST_URL.RETRIVE_CHARGE_BY_ID + chargeId + '?template=true';
      ChargesService.getData($url).then(chargeTeplateSuccess, chargeTemplateFail);
    }
  };

  $scope.deleteCharge = function(index) {
    $scope.charges.splice(index, 1);
  };

  $scope.validateLoanProduct = function(loanProductDetails) {
    console.log('LoanProductsCtrl : CreateLoanProducts : authenticateLoanProduct' + angular.toJson($scope.createloanproductform));
    $scope.message = '';
    $scope.errors = [];
    if ($scope.createloanproductform.$valid) {
      $scope.saveLoanProduct(loanProductDetails);
    } else {
      $scope.invalidateForm();
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };

  //invalidate login form
  $scope.invalidateForm = function() {
    $scope.createloanproductform.invalidate = false;
  };

  $scope.saveLoanProduct = function(loanProductDetails) {
    console.log('LoanProductsCtrl : CreateLoanProducts : saveLoanProduct');
    $scope.message = '';
    $scope.chargesSelected = [];
    var temp = '';
    for (var i in $scope.charges) {
      temp = {
        id: $scope.charges[i].id
      };
      $scope.chargesSelected.push(temp);
    }
    loanProductDetails.charges = $scope.chargesSelected;

    var saveloanProductSuccess = function(result) {
      console.log('Success : Return from loanProducts service.');
      $scope.type = 'alert-success';
      $scope.message = 'Loan product saved successfully';
      $scope.isCreated = true;
      LoanProductService.setEditStep(2);
      $location.url(PAGE_URL.EDITLOANPRODUCT + '/' + result.data.resourceId);
    };

    var saveloanProductFail = function(result) {
      console.log('Error : Return from loanProducts service.');
      $scope.type = 'error';
      $scope.message = 'Loan product not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
      $('html, body').animate({scrollTop: 0}, 800);
    };
    console.log('JSON.toJson(loanProductDetails) > ' + angular.toJson(this.loanProductDetails));
    LoanProductService.saveProduct(REST_URL.LOANS_PRODUCTS, angular.toJson(this.loanProductDetails)).then(saveloanProductSuccess, saveloanProductFail);
  };
});


LoanProductCrtl.controller('EditLoanProductsCtrl', function($route, $scope, $timeout, LoanProductService, CurrencyService, REST_URL, APPLICATION, PAGE_URL, ChargesService, Utility) {
  console.log('LoanProductsCtrl : EditLoanProductsCtrl');
  $scope.id = $route.current.params.id;
  //To highlight selected tab
  $scope.setStep = function(step) {
    $scope.step = step;
    $scope.newProTab = '';
    $scope.charTab = '';
    if (step === 2) {
      $scope.charTab = 'active';
    } else {
      $scope.newProTab = 'active';
      $scope.step = 1;
    }
  };
  //$scope.step = 1;
  if($scope.editStep && $scope.editStep !== 'undefined'){
    $scope.step = $scope.editStep;
  }
  if(LoanProductService.getEditStep()){
    $scope.step = LoanProductService.getEditStep();
    LoanProductService.setEditStep('');
  }

  $scope.setStep($scope.step);

  //To load the loadproducts page
  $scope.isLoading = false;
  $scope.loanProductDetails = {};
  $scope.charges = [];

  $scope.interestRateFrequencyTypeOptions = [
    {id: 3, value: 'Per year'}
  ];
  $scope.transactionProcessingStrategyOptions = [
    {id: 8, value: 'P/I/F/LPI'}
  ];
  $scope.amortizationTypeOptions = [
    {id: 1, value: 'Equal installments'}
  ];
  $scope.repaymentFrequencyTypeOptions = [
    {id: 2, value: 'Monthly'}
  ];
  $scope.interestTypeOptions = [
    {id: 1, value: 'Flat'}
  ];

  //Success callback
  var editLoanProductTeplateSuccess = function(result) {
    if (!Utility.isUndefinedOrNull($scope.isCreated) || $scope.type === 'alert-success') {
      $scope.setStep(2);
    }
    $scope.isLoading = false;
    try {
      $scope.product = result.data;
      $scope.loanProductDetails.digitsAfterDecimal = '2';
      $scope.loanProductDetails.currencyCode = $scope.product.currency.code;
      $scope.loanProductDetails.repaymentFrequencyType = $scope.product.repaymentFrequencyType.id;
      $scope.loanProductDetails.interestRateFrequencyType = $scope.product.interestRateFrequencyType.id;
      $scope.loanProductDetails.amortizationType = $scope.product.amortizationType.id;
      $scope.loanProductDetails.interestType = $scope.product.interestType.id;
      $scope.charges = $scope.product.charges || [];
      var chargeOptions = _.union($scope.product.chargeOptions, $scope.product.penaltyOptions);
      //Filter charge options
      $scope.product.filteredChargeOptions = Utility.filterOptions(chargeOptions, null, $scope.charges);
      //$scope.loanProductDetails.transactionProcessingStrategyId = $scope.product.transactionProcessingStrategyOptions[0].id;

      //set the values from the response on the edit page
      $scope.loanProductDetails.name = $scope.product.name;
      $scope.loanProductDetails.shortName = $scope.product.shortName;
      $scope.loanProductDetails.description = $scope.product.description;
      $scope.loanProductDetails.currencyCode = $scope.product.currency.code;
      $scope.loanProductDetails.minPrincipal = $scope.product.minPrincipal;
      $scope.loanProductDetails.principal = $scope.product.principal;
      $scope.loanProductDetails.maxPrincipal = $scope.product.maxPrincipal;
      $scope.loanProductDetails.minNumberOfRepayments = $scope.product.minNumberOfRepayments;
      $scope.loanProductDetails.numberOfRepayments = $scope.product.numberOfRepayments;
      $scope.loanProductDetails.maxNumberOfRepayments = $scope.product.maxNumberOfRepayments;
      $scope.loanProductDetails.minInterestRatePerPeriod = $scope.product.minInterestRatePerPeriod;
      $scope.loanProductDetails.interestRatePerPeriod = $scope.product.interestRatePerPeriod;
      $scope.loanProductDetails.maxInterestRatePerPeriod = $scope.product.maxInterestRatePerPeriod;
      $scope.loanProductDetails.repaymentFrequencyType = $scope.product.repaymentFrequencyType.id;
      $scope.loanProductDetails.amortizationType = $scope.product.amortizationType.id;
      $scope.loanProductDetails.interestRateFrequencyType = $scope.product.interestRateFrequencyType.id;
      $scope.loanProductDetails.transactionProcessingStrategyId = $scope.product.transactionProcessingStrategyId;
      $scope.loanProductDetails.interestType = $scope.product.interestType.id;
      $scope.loanProductDetails.includeInBorrowerCycle = 'true';

      //Set as default now
      $scope.loanProductDetails.inMultiplesOf = '0';
      $scope.loanProductDetails.repaymentEvery = '1';
      $scope.loanProductDetails.interestCalculationPeriodType = 1;
      $scope.loanProductDetails.accountingRule = '1';
      $scope.loanProductDetails.isInterestRecalculationEnabled = 'false';
      $scope.loanProductDetails.daysInYearType = 1;
      $scope.loanProductDetails.daysInMonthType = 1;
      $scope.loanProductDetails.locale = 'en';
      //To hide message
      $scope.message = '';
      CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
        $scope.loanProductDetails.currencyCode = result.data.base;
      }, function() {
        $scope.loanProductDetails.currencyCode = $scope.product.currency.code;
      });
    } catch (e) {
      console.log(e);
    }
  };

  //failur callback
  var editLoanProductTemplateFail = function() {
    $scope.message = '';
    $scope.isLoading = false;
    console.log('Error : Return from loanProducts service.');
  };

  var loadEditProductTemplate = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id + '?template=true';
        LoanProductService.getData($url).then(editLoanProductTeplateSuccess, editLoanProductTemplateFail);
      }, 500
      );
  };

  loadEditProductTemplate();

  $scope.validateLoanProduct = function(loanProductDetails) {
    console.log('LoanProductsCtrl : CreateLoanProducts : authenticateLoanProduct');
    try {
      $scope.updateLoanProduct(loanProductDetails);
    } catch (e) {
      $scope.invalidateForm();
    }
  };

  $scope.invalidateForm = function() {
    $scope.createloanproductform.invalidate = false;
  };

  $scope.updateLoanProduct = function() {
    console.log('LoanProductsCtrl : updateLoanProduct');
    $scope.message = '';
    $scope.chargesSelected = [];
    var temp = '';
    for (var i in $scope.charges) {
      temp = {
        id: $scope.charges[i].id
      };
      $scope.chargesSelected.push(temp);
    }
    $scope.loanProductDetails.charges = $scope.chargesSelected;

    // TODO: find out why this magic number is necessary; this is hard coded in MapAccountingCtrl
    $scope.loanProductDetails.accountingRule = '4';

    var updateloanProductSuccess = function() {
      console.log('Success : Return from loanProducts service.');
      $scope.type = 'alert-success';
      $scope.message = 'Loan product Updated successfully';
      $scope.errors = '';
      //loadEditProductTemplate();
      $scope.setStep(2);
      //$location.url(PAGE_URL.LOANPRODUCTS);                  
    };

    var updateloanProductFail = function(result) {
      console.log('Error : Return from loanProducts service.');
      $scope.type = 'error';
      $scope.message = 'Loan product not updated: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
      $('html, body').animate({scrollTop: 0}, 800);
    };
    var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id;
    LoanProductService.updateProduct($url, angular.toJson($scope.loanProductDetails)).then(updateloanProductSuccess, updateloanProductFail);
  };

  //Add charges
  $scope.loanProductCharges = {};
  $scope.chargeSelected = function(chargeId) {
    $scope.chargesSelected = [];
    if (chargeId) {
      var chargeTeplateSuccess = function(result) {
        result.data.chargeId = result.data.id;
        $scope.charges.push(result.data);
        $scope.chargeId = '';
        $('select#chargeId').val('');
        $scope.saveCharges();
      };
      var chargeTemplateFail = function() {
        console.log('Error : Return from ChargesService service.');
      };
      var $url = REST_URL.RETRIVE_CHARGE_BY_ID + chargeId + '?template=true';
      ChargesService.getData($url).then(chargeTeplateSuccess, chargeTemplateFail);
    }
  };
  //Delete charges
  $scope.deleteCharge = function(index) {
    $scope.charges.splice(index, 1);    
    $scope.saveCharges();
  };
  //Save charges
  $scope.saveCharges = function() {
    console.log('EditLoanProductsCtrl : Save Charges');
    $scope.chargesSelected = [];
    var temp = '';
    for (var i in $scope.charges) {
      temp = {
        id: $scope.charges[i].id
      };
      $scope.chargesSelected.push(temp);
    }

    var chargeOptions = _.union($scope.product.chargeOptions, $scope.product.penaltyOptions);
    //Filterd charge options
    $scope.product.filteredChargeOptions = Utility.filterOptions(chargeOptions, null, $scope.chargesSelected);

    var updateloanProductChargesSuccess = function() {
      console.log('Success : Return from loanProducts service.');
    };

    var updateloanProductChargesFail = function(result) {
      console.log('Error : Return from loanProducts service.');
      $scope.type = 'error';
      $scope.message = 'Charges cannot be mapped with loan product: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
      $('html, body').animate({scrollTop: 0}, 800);
    };

    $scope.loanProductCharges.charges = $scope.chargesSelected;
    $scope.loanProductCharges.currencyCode = $scope.loanProductDetails.currencyCode;
    var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id;
    LoanProductService.updateProduct($url, angular.toJson(this.loanProductCharges)).then(updateloanProductChargesSuccess, updateloanProductChargesFail);
  };
});