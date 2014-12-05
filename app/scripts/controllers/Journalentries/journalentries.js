'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function($scope, REST_URL, PAGE_URL, JournalService, $timeout, $location) {
  console.log('JournalEntriesCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 5;

  //Success callback
  var loadJournalEntriesSuccess = function(result) {
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
angular.module('angularjsApp').controller('JournalEntriesDetailsCtrl', function($route,$scope, REST_URL, JournalService, $timeout, $location, dialogs, Utility) {
  console.log('JournalEntriesDetailsCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 2;
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
    } catch (e) {
      console.log(e);
    }
  };

  //Failure callback
  var loadJournalEntriesDetailsFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from JournalService service.' + result);
  };

  var loadJournalDetailsEntries = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        var url = REST_URL.JOURNALENTRIES + '?transactionId=';
        if ($scope.id) {
          url = url + $scope.id;
        } else {
          //TODO
        }
        //service to get journalentries from server
        JournalService.getData(url).then(loadJournalEntriesDetailsSuccess, loadJournalEntriesDetailsFail);
      }, 2000);
  };

  loadJournalDetailsEntries();
});