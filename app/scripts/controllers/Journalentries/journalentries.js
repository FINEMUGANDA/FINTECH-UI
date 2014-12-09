'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function($rootScope, $scope, REST_URL, PAGE_URL, JournalService, $timeout, $location) {
  console.log('JournalEntriesCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 5;

  //Success callback
  var loadJournalEntriesSuccess = function(result) {
    $rootScope.type = '';
    $rootScope.message = '';
    $rootScope.errors = '';
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
      console.log(e);
    }
  };

  //Failure callback
  var loadJournalEntriesFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from JournalService service.' + result);
  };

  var loadJournalEntries = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        //service to get journalentries from server
        JournalService.getData(REST_URL.JOURNALENTRIES_LIST + '?orderBy=transactionDate&sortOrder=DESC').then(loadJournalEntriesSuccess, loadJournalEntriesFail);
      }, 2000);
  };

  loadJournalEntries();

  //Forward to view details
  $scope.viewDetail = function(journal) {
    $location.path(PAGE_URL.JOURNALENTRIES_DETAILS + '/' + journal.transaction_id);
  };
});

//View Journal Entry in Details
angular.module('angularjsApp').controller('JournalEntriesDetailsCtrl', function($route, $scope, REST_URL, JournalService, $timeout, $location, dialogs, Utility, PAGE_URL) {
  console.log('JournalEntriesDetailsCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 5;
  $scope.id = $route.current.params.id;

  //Success callback
  var loadJournalEntriesDetailsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data.pageItems;
      if(!Utility.isUndefinedOrNull(result.data.pageItems)){
        $scope.officeName = $scope.rowCollection[0].officeName;
        $scope.transactionDate = $scope.rowCollection[0].transactionDate[2] + '/';
        $scope.transactionDate +=$scope.rowCollection[0].transactionDate[1] + '/';
        $scope.transactionDate +=$scope.rowCollection[0].transactionDate[0];
        $scope.createdByUserName=$scope.rowCollection[0].createdByUserName;
        $scope.createdDate = $scope.rowCollection[0].createdDate[2] + '/';
        $scope.createdDate +=$scope.rowCollection[0].createdDate[1] + '/';
        $scope.createdDate +=$scope.rowCollection[0].createdDate[0];
      }
      for (var i in result.data.pageItems) {          
        if (result.data.pageItems[i].reversed === false) {
            $scope.flag = true;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  //Failure callback
  var loadJournalEntriesDetailsFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from JournalService service.' + result);
  };

  var loadJournalEntriesDetails = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        var url = REST_URL.JOURNALENTRIES + '?transactionId=';
        if ($scope.id) {
          url = url + $scope.id;
        } else {
          $location.path(PAGE_URL.JOURNALENTRIES);
        }
        //service to get journalentries from server
        JournalService.getData(url).then(loadJournalEntriesDetailsSuccess, loadJournalEntriesDetailsFail);
      }, 2000);
  };

  loadJournalEntriesDetails();

  //Failure callback : Reverse Entry
  var reverseJournalEntryFail = function(result) {
    console.log('Error : Return from JournalService service.');
    $scope.type = 'error';
    $scope.message = 'Journal Entry not reversed: ' + result.data.defaultUserMessage;
    $scope.errors = result.data.errors;
    if (result.data.errors && result.data.errors.length) {
      for (var i = 0; i < result.data.errors.length; i++) {
        $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
      }
    }
    $('html, body').animate({scrollTop: 0}, 800);
  };

  //Reverse Entry
  $scope.spin = false;
  $scope.reverseTransaction = function (transactionId) {
    $scope.spin = true;
    console.log(transactionId);
    var url = REST_URL.JOURNALENTRIES + '/'+ transactionId +'?command=reverse';
    JournalService.saveJournalEntry(url).then(function (data) {
      console.log(data);
      $route.reload();
    }, reverseJournalEntryFail);
  };
});

//Create Journal Entry
angular.module('angularjsApp').controller('CreateJournalEntriesCtrl', function($rootScope, $scope, REST_URL, JournalService, $timeout, $location, dialogs, Utility, PAGE_URL) {
  console.log('CreateJournalEntriesCtrl');
  $scope.isLoading = false;
  $scope.journalEntryForm = {};
  $scope.journalEntryForm.crAccounts = [{}];
  $scope.journalEntryForm.dbAccounts = [{}];
  $scope.showPaymentDetails = false;
  //For date of transaction calendar  
  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };
  //Get all acounts
  JournalService.getData(REST_URL.GLACCOUNTS + '?disabled=false&manualEntriesAllowed=true&usage=1').then(function(data){
    $scope.glAccounts = data.data;
  });
  //Get all currency
  JournalService.getData(REST_URL.CURRENCY_LIST + '?fields=selectedCurrencyOptions').then(function(result){
    $scope.currencyOptions = result.data.selectedCurrencyOptions;
    $scope.journalEntryForm.currencyCode = $scope.currencyOptions[0].code;
  });
  //Get all code values
  JournalService.getData(REST_URL.CODE_LIST + '/12/codevalues').then(function(result){
    if (result.data.length > 0) {
        $scope.journalEntryForm.paymentTypeId = result.data[0].id;
    }
    $scope.paymentTypes = result.data;
  });
  JournalService.getData(REST_URL.OFFICE_LIST).then(function(result){
    $scope.offices = result.data;
    $scope.journalEntryForm.officeId = $scope.offices[0].id;    
  });

  //events for credits
  $scope.addCrAccount = function () {
      $scope.journalEntryForm.crAccounts.push({});
  };

  $scope.removeCrAccount = function (index) {
      $scope.journalEntryForm.crAccounts.splice(index, 1);
  };

  //events for debits
  $scope.addDebitAccount = function () {
      $scope.journalEntryForm.dbAccounts.push({});
  };

  $scope.removeDebitAccount = function (index) {
      $scope.journalEntryForm.dbAccounts.splice(index, 1);
  };

  //Validate create journalentry
  $scope.validateJournalEntry = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = '';
    console.log('CreateJournalEntriesCtrl : validateJournalEntry');
    if ($scope.createjournalentryForm.$valid) {
      $scope.saveJournalEntry();
    } else {
      $scope.invalidateForm();
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';      
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };
  //invalidate login form
  $scope.invalidateForm = function() {
    $scope.createjournalentryForm.invalidate = false;
  };

  //Start - Save Journal Entry
  $scope.saveJournalEntry = function() {
    console.log('CreateJournalEntriesCtrl : saveJournalEntry');
    var jeTransaction = new Object({});
    var d = new Date(this.journalEntryForm.transationDate);
    jeTransaction.transactionDate = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();    
    jeTransaction.locale = 'en';
    jeTransaction.dateFormat = 'dd/MM/yyyy';
    jeTransaction.officeId = this.journalEntryForm.officeId;
    jeTransaction.transactionDate = jeTransaction.transactionDate ;
    jeTransaction.referenceNumber = this.journalEntryForm.referenceNumber;
    jeTransaction.comments = this.journalEntryForm.comments;
    jeTransaction.currencyCode = this.journalEntryForm.currencyCode;
    jeTransaction.paymentTypeId = this.journalEntryForm.paymentTypeId;
    jeTransaction.accountNumber = this.journalEntryForm.accountNumber;
    jeTransaction.checkNumber = this.journalEntryForm.checkNumber;
    jeTransaction.routingCode = this.journalEntryForm.routingCode;
    jeTransaction.receiptNumber = this.journalEntryForm.receiptNumber;
    jeTransaction.bankNumber = this.journalEntryForm.bankNumber;

    //Construct credits array
    jeTransaction.credits = [];
    for (var i = 0; i < this.journalEntryForm.crAccounts.length; i++) {
        var temp1 = new Object({});
        if(this.journalEntryForm.crAccounts[i].select){
          temp1.glAccountId = this.journalEntryForm.crAccounts[i].select.id;
        }
        temp1.amount = this.journalEntryForm.crAccounts[i].crAmount;
        jeTransaction.credits.push(temp1);
    }
    //construct debits array
    jeTransaction.debits = [];
    for (var j = 0; j < this.journalEntryForm.dbAccounts.length; j++) {
        var temp2 = new Object({});
        if(this.journalEntryForm.dbAccounts[j].select){
          temp2.glAccountId = this.journalEntryForm.dbAccounts[j].select.id;
        }
        temp2.amount = this.journalEntryForm.dbAccounts[j].debitAmount;
        jeTransaction.debits.push(temp2);
    }

    var saveJournalEntrySuccess = function() {
      console.log('Success : Return from JournalService service.');
      $rootScope.type = 'alert-success';
      $rootScope.message = 'Journal Entry saved successfully';      
      $location.path(PAGE_URL.JOURNALENTRIES);
    };

    var saveJournalEntryFail = function(result) {
      console.log('Error : Return from JournalService service.');
      $scope.type = 'error';
      $scope.message = 'Journal Entry not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      if (result.data.errors && result.data.errors.length) {
        for (var i = 0; i < result.data.errors.length; i++) {
          $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
        }
      }
      $('html, body').animate({scrollTop: 0}, 800);
    };
    var json = angular.toJson(jeTransaction);
    console.log(json);
    var url = REST_URL.JOURNALENTRIES;        
    JournalService.saveJournalEntry(url, json).then(saveJournalEntrySuccess, saveJournalEntryFail);
  };
  //Finish - Save Journal Entry
});