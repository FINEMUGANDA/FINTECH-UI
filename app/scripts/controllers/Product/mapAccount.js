'use strict';

angular.module('angularjsApp').controller('MapAccountingCtrl', function($rootScope, $route, $scope, $location, LoanProductService, REST_URL, APPLICATION, PAGE_URL, Utility) {
  console.log('MapAccountingCtrl');
  $scope.isLoading = true;
  $scope.mapAccountingForm = {};
  $scope.mapAccExtraForm = {};
  $scope.mapAccExtraForm = {
    lpiwrittenoff: '',
    interestWrittenOff: ''
  };
  $scope.id = $route.current.params.id;
  //Filter on Assests Options
  $scope.changeAssetsOptions = function () {
    //$scope.selectedAssets = [];
    var selectedAssets = [];
    var form = $scope.mapAccountingForm;
    Utility.setSelectedOptions(selectedAssets, form.fundSourceAccountId);
    Utility.setSelectedOptions(selectedAssets, form.loanPortfolioAccountId);
    Utility.setSelectedOptions(selectedAssets, form.receivableInterestAccountId);
    Utility.setSelectedOptions(selectedAssets, form.receivableFeeAccountId);
    Utility.setSelectedOptions(selectedAssets, form.receivablePenaltyAccountId);
    Utility.setSelectedOptions(selectedAssets, form.transfersInSuspenseAccountId);    
    $scope.fundSourceOption = Utility.filterOptions($scope.assetAccountOptions, form.fundSourceAccountId, selectedAssets);
    $scope.loanPortfolioOption = Utility.filterOptions($scope.assetAccountOptions, form.loanPortfolioAccountId, selectedAssets);
    $scope.interestReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivableInterestAccountId, selectedAssets);
    $scope.feesReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivableFeeAccountId, selectedAssets);
    $scope.penaltiesReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivablePenaltyAccountId, selectedAssets);
    $scope.transferSuspenseOption = Utility.filterOptions($scope.assetAccountOptions, form.transfersInSuspenseAccountId, selectedAssets);
    console.log('selectedAssets = ' + selectedAssets);    
  };
  //Filter on Income Options
  $scope.changeIncomeOptions = function () {
    var selectedIncome = [];
    var form = $scope.mapAccountingForm;
    Utility.setSelectedOptions(selectedIncome, form.interestOnLoanAccountId);
    Utility.setSelectedOptions(selectedIncome, form.incomeFromFeeAccountId);
    Utility.setSelectedOptions(selectedIncome, form.incomeFromPenaltyAccountId);
    Utility.setSelectedOptions(selectedIncome, form.incomeFromRecoveryAccountId);
    $scope.interestOnLoanOption = Utility.filterOptions($scope.incomeAccountOptions, form.interestOnLoanAccountId, selectedIncome);
    $scope.incomeFromFeeOption = Utility.filterOptions($scope.incomeAccountOptions, form.incomeFromFeeAccountId, selectedIncome);
    $scope.incomeFromPenaltyOption = Utility.filterOptions($scope.incomeAccountOptions, form.incomeFromPenaltyAccountId, selectedIncome);
    $scope.incomeFromRecoveryOption = Utility.filterOptions($scope.incomeAccountOptions, form.incomeFromRecoveryAccountId, selectedIncome);
  };
  //Filter on Expense Options
  $scope.changeExpenseOptions = function () {
    var selectedExpense = [];
    var form = $scope.mapAccountingForm;
    form.lpiwrittenoff = $scope.mapAccExtraForm.lpiwrittenoff;
    form.interestWrittenOff = $scope.mapAccExtraForm.interestWrittenOff;
    Utility.setSelectedOptions(selectedExpense, form.writeOffAccountId);
    Utility.setSelectedOptions(selectedExpense, form.lpiwrittenoff);
    Utility.setSelectedOptions(selectedExpense, form.interestWrittenOff);
    $scope.losesexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.writeOffAccountId, selectedExpense);
    $scope.lpiexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.lpiwrittenoff, selectedExpense);
    $scope.interestexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.interestWrittenOff, selectedExpense);
  };
  //To move on edit loan product page
  $scope.setStep = function(step) {
    $scope.editStep = step;
    $location.url(PAGE_URL.EDITLOANPRODUCT + '/' + $scope.id);
  };
  $scope.isAccountingEnabled = function () {
    if (parseInt($scope.mapAccountingForm.accountingRule) === 2 || parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
        return true;
    }
    return false;
  };
  $scope.isAccrualAccountingEnabled = function () {
    if (parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
        return true;
    }
    return false;
  };
  //Success callback : Map Accounting Template;
  var mapAccountingTemplateSuccess = function(result) {    
    console.log('Success : Return from loanProducts service.');    
    try {
      $scope.product = result.data;
      $scope.assetAccountOptions = $scope.product.accountingMappingOptions.assetAccountOptions || [];
      $scope.assetAccountOptionsGlobal = $scope.product.accountingMappingOptions.assetAccountOptions || [];
      $scope.incomeAccountOptions = $scope.product.accountingMappingOptions.incomeAccountOptions || [];
      $scope.expenseAccountOptions = $scope.product.accountingMappingOptions.expenseAccountOptions || [];
      $scope.liabilityAccountOptions = $scope.product.accountingMappingOptions.liabilityAccountOptions || [];
      $scope.mapAccountingForm.accountingRule = '4';      
      $scope.mapAccountingForm = {
        accountingRule: $scope.product.accountingRule.id,
      };
      if (parseInt($scope.mapAccountingForm.accountingRule) === 2 || parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
        $scope.mapAccountingForm.fundSourceAccountId = $scope.product.accountingMappings.fundSourceAccount.id;
        $scope.mapAccountingForm.loanPortfolioAccountId = $scope.product.accountingMappings.loanPortfolioAccount.id;
        if (parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
          $scope.mapAccountingForm.receivableInterestAccountId = $scope.product.accountingMappings.receivableInterestAccount.id;
          $scope.mapAccountingForm.receivableFeeAccountId = $scope.product.accountingMappings.receivableFeeAccount.id;
          $scope.mapAccountingForm.receivablePenaltyAccountId = $scope.product.accountingMappings.receivablePenaltyAccount.id;
        }
        $scope.mapAccountingForm.transfersInSuspenseAccountId = $scope.product.accountingMappings.transfersInSuspenseAccount.id;
        $scope.mapAccountingForm.interestOnLoanAccountId = $scope.product.accountingMappings.interestOnLoanAccount.id;
        $scope.mapAccountingForm.incomeFromFeeAccountId = $scope.product.accountingMappings.incomeFromFeeAccount.id;
        $scope.mapAccountingForm.incomeFromPenaltyAccountId = $scope.product.accountingMappings.incomeFromPenaltyAccount.id;
        $scope.mapAccountingForm.incomeFromRecoveryAccountId = $scope.product.accountingMappings.incomeFromRecoveryAccount.id;
        $scope.mapAccountingForm.writeOffAccountId = $scope.product.accountingMappings.writeOffAccount.id;
        $scope.mapAccountingForm.overpaymentLiabilityAccountId = $scope.product.accountingMappings.overpaymentLiabilityAccount.id;
      }
      //Todo Set accountin rule default
      $scope.mapAccountingForm.accountingRule = '4';
      $rootScope.message = '';
      $rootScope.type = '';
      $scope.changeAssetsOptions();
      $scope.changeIncomeOptions();
      $scope.changeExpenseOptions();
    } catch (e) {
      console.log(e);
    }
    $scope.isLoading = false;
  };
  //success map accounting template
  var isExtraInfo = false;
  var mapAccountingTemplateExtraSuccess = function(result) {    
    console.log('Success : Return from loanProducts service.');
    try {
      if(result.data && result.data.length > 0){
        isExtraInfo = true; 
        $scope.mapAccExtraForm = {
          lpiwrittenoff: result.data[0].lpiwrittenoff || '',
          interestWrittenOff: result.data[0].interestWrittenOff || ''
        };        
      }      
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback : Map Accounting Template
  var mapAccountingTemplateFail = function() {    
    $scope.isLoading = false;
    console.log('Error : Return from loanProducts service.');
  };
  if ($scope.id) {
    var $url = REST_URL.LOANS_PRODUCTS + '/' + $scope.id + '?template=true';
    LoanProductService.getData($url).then(mapAccountingTemplateSuccess, mapAccountingTemplateFail);
    $url = REST_URL.LOAN_PRODUCTS_TEMPLATE_EXTRA + $scope.id;
    LoanProductService.getData($url).then(mapAccountingTemplateExtraSuccess, mapAccountingTemplateFail);
  } else {
    $location.path(PAGE_URL.LOANPRODUCTS);
  }
  //Map accounting with loan product and save
  $scope.updateLoanProduct = function() {
    console.log('MapAccountingCtrl : updateLoanProduct');
    $scope.message = '';
    $scope.type = '';
    this.mapAccountingForm.locale = 'en';
    this.mapAccountingForm.accountingRule = parseInt(this.mapAccountingForm.accountingRule);
    if (Utility.isUndefinedOrNull($scope.mapAccExtraForm.lpiwrittenoff) ||
     Utility.isUndefinedOrNull($scope.mapAccExtraForm.interestWrittenOff ) ) {
      $scope.type = 'error';
      $scope.message = 'All parameters are required';
      $scope.errors = [];
      if ($scope.errors && $scope.errors) {
        for (var i = 0; i < $scope.errors; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
      $('html, body').animate({scrollTop: 0}, 800);      
      return;
    }

    var updateloanProductExtraSuccess = function() {
      console.log('Success : Return from loanProducts service.');
      $scope.type = 'alert-success';
      $scope.message = 'Loan product Updated successfully';
      $scope.errors = '';
      $route.reload();
    };

    var updateloanProductSuccess = function() {
      console.log('Success : Return from loanProducts service.');
      $scope.mapAccExtraForm.locale = 'en';
      var json = angular.toJson($scope.mapAccExtraForm);
      var $url = REST_URL.LOAN_PRODUCTS_TEMPLATE_EXTRA + $route.current.params.id;
      if (isExtraInfo) {
        LoanProductService.updateProduct($url, json).then(updateloanProductExtraSuccess, updateloanProductFail);       
      } else {
        LoanProductService.saveProduct($url, json).then(updateloanProductExtraSuccess, updateloanProductFail);       
      }      
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
    delete this.mapAccountingForm.interestWrittenOff;
    delete this.mapAccountingForm.lpiwrittenoff;
    this.mapAccountingForm.transfersInSuspenseAccountId = $scope.product.accountingMappingOptions.assetAccountOptions[0].id;
    this.mapAccountingForm.incomeFromRecoveryAccountId = $scope.product.accountingMappingOptions.incomeAccountOptions[0].id;
    this.mapAccountingForm.overpaymentLiabilityAccountId = $scope.product.accountingMappingOptions.liabilityAccountOptions[0].id;
    console.log(angular.toJson(this.mapAccountingForm));
    var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id;
    LoanProductService.updateProduct($url, angular.toJson(this.mapAccountingForm)).then(updateloanProductSuccess, updateloanProductFail);
  };
});