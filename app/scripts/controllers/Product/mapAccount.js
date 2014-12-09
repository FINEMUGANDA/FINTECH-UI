'use strict';

angular.module('angularjsApp').controller('MapAccountingCtrl', function($route, $scope, $rootScope, $location, $timeout, LoanProductService, REST_URL, APPLICATION, PAGE_URL) {
  console.log('MapAccountingCtrl');
  $scope.isLoading = true;
  $scope.mapAccountingForm = {};
  $scope.id = $route.current.params.id;
  //To move on edit loan product page
  $scope.setStep = function(step) {
    $rootScope.editStep = step;
    $location.url(PAGE_URL.EDITLOANPRODUCT + '/' + $scope.id);
  };
  $scope.isAccountingEnabled = function () {
    if ($scope.mapAccountingForm.accountingRule === 2 || $scope.mapAccountingForm.accountingRule === 3 || $scope.mapAccountingForm.accountingRule === 4) {
        return true;
    }
    return false;
  };
  $scope.isAccrualAccountingEnabled = function () {
    if ($scope.mapAccountingForm.accountingRule === 3 || $scope.mapAccountingForm.accountingRule === 4) {
        return true;
    }
    return false;
  };
  //Success callback : Map Accounting Template;
  var mapAccountingTemplateSuccess = function(result) {    
    console.log('Success : Return from loanProducts service.');
    $scope.isLoading = false;
    try {
      $scope.product = result.data;
      $scope.assetAccountOptions = $scope.product.accountingMappingOptions.assetAccountOptions || [];
      $scope.incomeAccountOptions = $scope.product.accountingMappingOptions.incomeAccountOptions || [];
      $scope.expenseAccountOptions = $scope.product.accountingMappingOptions.expenseAccountOptions || [];
      $scope.liabilityAccountOptions = $scope.product.accountingMappingOptions.liabilityAccountOptions || [];
      $scope.mapAccountingForm.accountingRule = '1';
      $scope.mapAccountingForm = {
        accountingRule: $scope.product.accountingRule.id,
      };
      if ($scope.mapAccountingForm.accountingRule === 2 || $scope.mapAccountingForm.accountingRule === 3 || $scope.mapAccountingForm.accountingRule === 4) {
        $scope.mapAccountingForm.fundSourceAccountId = $scope.product.accountingMappings.fundSourceAccount.id;
        $scope.mapAccountingForm.loanPortfolioAccountId = $scope.product.accountingMappings.loanPortfolioAccount.id;
        if ($scope.mapAccountingForm.accountingRule === 3 || $scope.mapAccountingForm.accountingRule === 4) {
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
      $rootScope.message = '';
      $rootScope.type = '';
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
  } else {
    $location.path(PAGE_URL.LOANPRODUCTS);
  }
  //Map accounting with loan product and save
  $scope.updateLoanProduct = function() {
    console.log('MapAccountingCtrl : updateLoanProduct');
    $rootScope.message = '';
    $rootScope.type = '';
    this.mapAccountingForm.locale = 'en';

    var updateloanProductSuccess = function() {
      console.log('Success : Return from loanProducts service.');
      $rootScope.type = 'alert-success';
      $rootScope.message = 'Loan product Updated successfully';
      $scope.errors = '';
      $route.reload();
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
    console.log(angular.toJson(this.mapAccountingForm) > +angular.toJson(this.mapAccountingForm));
    var $url = REST_URL.LOANS_PRODUCTS_LIST_BY_ID + $route.current.params.id;
    LoanProductService.updateProduct($url, angular.toJson(this.mapAccountingForm)).then(updateloanProductSuccess, updateloanProductFail);
  };
});