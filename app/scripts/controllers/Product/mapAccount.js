'use strict';

angular.module('angularjsApp').controller('MapAccountingCtrl', function($rootScope, $route, $scope, $location, LoanProductService, REST_URL, APPLICATION, PAGE_URL, Utility) {
  console.log('MapAccountingCtrl');
  $scope.isLoading = true;
  $scope.mapAccountingForm = {};
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
    $scope.fundSourceOption = Utility.filterOptions($scope.assetAccountOptions, form.fundSourceAccountId, selectedAssets);
    $scope.loanPortfolioOption = Utility.filterOptions($scope.assetAccountOptions, form.loanPortfolioAccountId, selectedAssets);
    $scope.interestReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivableInterestAccountId, selectedAssets);
    $scope.feesReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivableFeeAccountId, selectedAssets);
    $scope.penaltiesReceivableOption = Utility.filterOptions($scope.assetAccountOptions, form.receivablePenaltyAccountId, selectedAssets);
    console.log('selectedAssets = ', selectedAssets);
  };
  //Filter on Income Options
  $scope.changeIncomeOptions = function () {
    var selectedIncome = [];
    var form = $scope.mapAccountingForm;
    Utility.setSelectedOptions(selectedIncome, form.interestOnLoanAccountId);
    Utility.setSelectedOptions(selectedIncome, form.incomeFromFeeAccountId);
    Utility.setSelectedOptions(selectedIncome, form.incomeFromPenaltyAccountId);
    Utility.setSelectedOptions(selectedIncome, form.unidentifiedProfitAccountId);
    $scope.interestOnLoanOption = Utility.filterOptions($scope.incomeAccountOptions, form.interestOnLoanAccountId, selectedIncome);
    $scope.incomeFromFeeOption = Utility.filterOptions($scope.incomeAccountOptions, form.incomeFromFeeAccountId, selectedIncome);
    $scope.incomeFromPenaltyOption = Utility.filterOptions($scope.incomeAccountOptions, form.incomeFromPenaltyAccountId, selectedIncome);
    $scope.unidentifiedProfitOption = Utility.filterOptions($scope.incomeAccountOptions, form.unidentifiedProfitAccountId, selectedIncome);
  };
  //Filter on Expense Options
  $scope.changeExpenseOptions = function () {
    var selectedExpense = [];
    var form = $scope.mapAccountingForm;
    Utility.setSelectedOptions(selectedExpense, form.principalWriteOffAccountId);
    Utility.setSelectedOptions(selectedExpense, form.LPIWriteOffAccountId);
    Utility.setSelectedOptions(selectedExpense, form.interestWriteOffAccountId);
    Utility.setSelectedOptions(selectedExpense, form.feeWriteOffAccountId);
    $scope.losesexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.principalWriteOffAccountId, selectedExpense);
    $scope.lpiexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.LPIWriteOffAccountId, selectedExpense);
    $scope.interestexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.interestWriteOffAccountId, selectedExpense);
    $scope.feesexpenseAccountOptions = Utility.filterOptions($scope.expenseAccountOptions, form.feeWriteOffAccountId, selectedExpense);
  };
  
  $scope.changeLiabilityOptions = function() {
    var form = $scope.mapAccountingForm;
    var selectedLiabilities = [];
    Utility.setSelectedOptions(selectedLiabilities, form.unidentifiedDepositsAccountId);
    $scope.unidentifiedDepositsOption = Utility.filterOptions($scope.liabilityAccountOptions, form.unidentifiedDepositsAccountId, selectedLiabilities);
  };

  //To move on edit loan product page
  $scope.setStep = function(step) {
    $scope.editStep = step;
    LoanProductService.setEditStep(step);
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
      //$scope.assetAccountOptions = $scope.product.accountingMappingOptions.assetAccountOptions || [];
      //$scope.assetAccountOptionsGlobal = $scope.product.accountingMappingOptions.assetAccountOptions || [];
      // TODO: the chosen directive is completely broken and doesn't react to updated models; until this is fixed hard code home currency
      /**
      CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
        $scope.assetAccountOptions = [];
        for(var i=0; $scope.product.accountingMappingOptions.assetAccountOptions && i<$scope.product.accountingMappingOptions.assetAccountOptions.length; i++) {
          var opt = $scope.product.accountingMappingOptions.assetAccountOptions[i];
          console.log('MAP: ' + result.data.base + ' - ' + opt.currencyCode);
          if(opt.currencyCode===result.data.base) {
            $scope.assetAccountOptions.push(opt);
          }
        }
        $scope.assetAccountOptionsGlobal = $scope.assetAccountOptions || [];
      }, function() {
        // TODO: error handling
      });
       */
      $scope.assetAccountOptions = [];
      for(var i=0; $scope.product.accountingMappingOptions.assetAccountOptions && i<$scope.product.accountingMappingOptions.assetAccountOptions.length; i++) {
        var opt = $scope.product.accountingMappingOptions.assetAccountOptions[i];
        if(opt.currencyCode==='UGX') {
          $scope.assetAccountOptions.push(opt);
        }
      }
      $scope.assetAccountOptionsGlobal = $scope.assetAccountOptions || [];
      $scope.incomeAccountOptions = $scope.product.accountingMappingOptions.incomeAccountOptions || [];
      $scope.expenseAccountOptions = $scope.product.accountingMappingOptions.expenseAccountOptions || [];
      $scope.liabilityAccountOptions = $scope.product.accountingMappingOptions.liabilityAccountOptions || [];
      $scope.mapAccountingForm.accountingRule = '4';
      $scope.mapAccountingForm = {
        accountingRule: $scope.product.accountingRule.id
      };
      if (parseInt($scope.mapAccountingForm.accountingRule) === 2 || parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
        $scope.mapAccountingForm.fundSourceAccountId = $scope.product.accountingMappings.fundSourceAccount.id;
        $scope.mapAccountingForm.loanPortfolioAccountId = $scope.product.accountingMappings.loanPortfolioAccount.id;
        if (parseInt($scope.mapAccountingForm.accountingRule) === 3 || parseInt($scope.mapAccountingForm.accountingRule) === 4) {
          $scope.mapAccountingForm.receivableInterestAccountId = $scope.product.accountingMappings.receivableInterestAccount.id;
          $scope.mapAccountingForm.receivableFeeAccountId = $scope.product.accountingMappings.receivableFeeAccount.id;
          $scope.mapAccountingForm.receivablePenaltyAccountId = $scope.product.accountingMappings.receivablePenaltyAccount.id;
        }
        $scope.mapAccountingForm.interestOnLoanAccountId = $scope.product.accountingMappings.interestOnLoanAccount.id;
        $scope.mapAccountingForm.incomeFromFeeAccountId = $scope.product.accountingMappings.incomeFromFeeAccount.id;
        $scope.mapAccountingForm.incomeFromPenaltyAccountId = $scope.product.accountingMappings.incomeFromPenaltyAccount.id;
        $scope.mapAccountingForm.principalWriteOffAccountId = $scope.product.accountingMappings.principalWriteOffAccount.id;
        $scope.mapAccountingForm.LPIWriteOffAccountId = $scope.product.accountingMappings.LPIWriteOffAccount.id;
        $scope.mapAccountingForm.interestWriteOffAccountId = $scope.product.accountingMappings.interestWriteOffAccount.id;
        $scope.mapAccountingForm.feeWriteOffAccountId = $scope.product.accountingMappings.feeWriteOffAccount.id;
      }
      $scope.mapAccountingForm.unidentifiedDepositsAccountId = $scope.product.accountingMappings.unidentifiedDepositsAccount.id;
      $scope.mapAccountingForm.unidentifiedProfitAccountId = $scope.product.accountingMappings.unidentifiedProfitAccount.id;
      //Todo Set accountin rule default
      $scope.mapAccountingForm.accountingRule = '4';
      $rootScope.message = '';
      $rootScope.type = '';
    } catch (e) {
      console.error(e);
    }
    $scope.changeAssetsOptions();
    $scope.changeIncomeOptions();
    $scope.changeExpenseOptions();
    $scope.changeLiabilityOptions();
    $scope.isLoading = false;
  };

  //failure callback : Map Accounting Template
  var mapAccountingTemplateFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from loanProducts service.');
  };
  if ($scope.id) {
    var $url = REST_URL.LOANS_PRODUCTS + '/' + $scope.id + '?template=true';
    LoanProductService.getData($url).then(mapAccountingTemplateSuccess, mapAccountingTemplateFail);
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

    var updateloanProductSuccess = function() {
      console.log('Success : Return from loanProducts service.');
      $scope.type = 'alert-success';
      $scope.message = 'Loan product Updated successfully';
      $scope.errors = '';
      $location.url('/loanProducts');
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
    delete this.mapAccountingForm.feesWrittenOff;
//    this.mapAccountingForm.transfersInSuspenseAccountId = $scope.product.accountingMappingOptions.assetAccountOptions[0].id;
//    this.mapAccountingForm.incomeFromRecoveryAccountId = $scope.product.accountingMappingOptions.incomeAccountOptions[0].id;
//    this.mapAccountingForm.overpaymentLiabilityAccountId = $scope.product.accountingMappingOptions.liabilityAccountOptions[0].id;
    console.log(angular.toJson(this.mapAccountingForm));
    var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id;
    LoanProductService.updateProduct($url, angular.toJson(this.mapAccountingForm)).then(updateloanProductSuccess, updateloanProductFail);
  };
});