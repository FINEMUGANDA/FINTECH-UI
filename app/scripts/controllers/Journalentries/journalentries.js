'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function($scope, REST_URL, PAGE_URL, JournalService, $timeout, $location) {
  console.log('JournalEntriesCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 10;

  //Success callback
  var loadJournalEntriesSuccess = function(result) {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = '';
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

  var loadReversalEntrySuccess = function(result) {
    try {
      for (var i in result.data) {
        if(result.data[i].journalentry === $scope.id) {
          $scope.reversenote = result.data[i].reversenote;
          break;
        }
      }
    } catch (e) {
      console.log(e);
    }
    $scope.isLoading = false;
  };
  //Success callback
  var loadJournalEntriesDetailsSuccess = function(result) {
    $scope.isLoading = true;
    try {
      $scope.rowCollection = result.data.pageItems;
      if(!Utility.isUndefinedOrNull(result.data.pageItems)){
        var url = REST_URL.JOURANAL_ENTRY_REVERSE_NOTE + '1';
        JournalService.getData(url).then(loadReversalEntrySuccess, loadJournalEntriesDetailsFail);
        $scope.officeName = $scope.rowCollection[0].officeName;
        $scope.officeId = $scope.rowCollection[0].officeId;
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

  //Success callback : Reverse Transaction
  var reverseTransactionSuccess = function(result) {
    console.log('reverseTransactionSuccess : ' + result);
    var form = {};
    var d = new  Date();
    form.journalentry = $scope.id;
    form.reversenote = $scope.note;        
    form.createdDate = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    form.locale = 'en';
    form.dateFormat = 'dd/MM/yyyy';
    var json = angular.toJson(form);
    console.log(json);
    var url = REST_URL.JOURANAL_ENTRY_REVERSE_NOTE + $scope.officeId;
    JournalService.saveJournalEntry(url, json).then(function(result) {
      console.log('JOURANAL_ENTRY_REVERSE_NOTE : ' + result);
      $route.reload();
    }, function(result) {
      $scope.spin = false;
      $scope.type = 'error';
      $scope.message = 'Entries are reversed but note can not be saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $('html, body').animate({scrollTop: 0}, 800);
    });
  };
  //Failure callback : Reverse Transaction
  var reverseTransactionFail = function(result) {
    $scope.spin = false;
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

  //Reverse Transaction
  $scope.spin = false;
  $scope.reverseTransaction = function (transactionId) {
    $scope.spin = true;
    console.log(transactionId);
    var url = REST_URL.JOURNALENTRIES + '/'+ transactionId +'?command=reverse';
    var json = {      
      'transactionId': transactionId
    };
    JournalService.saveJournalEntry(url,json).then(reverseTransactionSuccess, reverseTransactionFail);
  };

  // Reverse entry
  $scope.reverseJournalEntry = function() {
    $scope.spin = true;
    var msg = 'Please Enter Notes : ';
    var dialog = dialogs.create('/views/Journalentries/reversal-note.html', 'ReverseNoteController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        $scope.note = result;
        $scope.reverseTransaction($scope.id);        
      }
    });
  };
});

//Create Journal Entry
angular.module('angularjsApp').controller('CreateJournalEntriesCtrl', function($scope, REST_URL, JournalService, $location, PAGE_URL, Utility) {
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
  //Filter debit options
  $scope.changeCreditOptions = function() {
    var selectedCreditOptions = [];
    for (var i = 0; i < $scope.journalEntryForm.crAccounts.length; i++) {        
        if($scope.journalEntryForm.crAccounts[i].select){
          Utility.setSelectedOptions(selectedCreditOptions, $scope.journalEntryForm.crAccounts[i].select.id);
          //selectedCreditOptions.push($scope.journalEntryForm.crAccounts[i].select.id);
        }
    }
    $scope.debitOptions = Utility.filterOptions($scope.glAccounts, null, selectedCreditOptions);
  };
  //Filter credit options
  $scope.changeDebitOptions = function() {
    var selectedDebitOptions = [];
    for (var i = 0; i < $scope.journalEntryForm.dbAccounts.length; i++) {        
        if($scope.journalEntryForm.dbAccounts[i].select){
          Utility.setSelectedOptions(selectedDebitOptions, $scope.journalEntryForm.dbAccounts[i].select.id);
          //selectedDebitOptions.push($scope.journalEntryForm.dbAccounts[i].select.id);
        }
    }
    $scope.creditOptions = Utility.filterOptions($scope.glAccounts, null, selectedDebitOptions);
  };  
  //Get all acounts
  JournalService.getData(REST_URL.GLACCOUNTS + '?disabled=false&manualEntriesAllowed=true&usage=1').then(function(data){
    $scope.glAccounts = data.data;
    $scope.changeCreditOptions();
    $scope.changeDebitOptions();
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
      if(1 < $scope.journalEntryForm.crAccounts.length) {
          $scope.journalEntryForm.crAccounts.splice(index, 1);
      }
      $scope.changeCreditOptions();
  };

  //events for debits
  $scope.addDebitAccount = function () {
      $scope.journalEntryForm.dbAccounts.push({});
  };

  $scope.removeDebitAccount = function (index) {
      if(1 < $scope.journalEntryForm.dbAccounts.length) {
          $scope.journalEntryForm.dbAccounts.splice(index, 1);
      }
      $scope.changeDebitOptions();
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
    //jeTransaction.transactionDate = this.journalEntryForm.transactionDate ;
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
      $scope.type = 'alert-success';
      $scope.message = 'Journal Entry saved successfully';      
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