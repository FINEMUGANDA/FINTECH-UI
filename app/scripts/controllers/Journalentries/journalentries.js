'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function($scope, REST_URL, PAGE_URL, JournalService, $timeout, $location, dialogs) {
  console.log('JournalEntriesCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 5;

  //Success callback
  var loadJournalEntriesSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data.pageItems;
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
  $scope.viewDetail = function(journal){
    $location.path(PAGE_URL.JOURNALENTRIES_DETAILS + '/' + journal.transactionId);
  }
});

//View Journal Entry in Details
angular.module('angularjsApp').controller('JournalEntriesDetailsCtrl', function($route,$scope, REST_URL, JournalService, $timeout, $location, dialogs) {
  console.log('JournalEntriesDetailsCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 5;
  $scope.id = $route.current.params.id;

  //Success callback
  var loadJournalEntriesDetailsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data.pageItems;
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
        var url = REST_URL.JOURNALENTRIES_LIST + '?transactionId=';
        if ($scope.id) {
          url = url + $scope.id;
        }else{
          //TODO
        }
        //service to get journalentries from server
        JournalService.getData(url).then(loadJournalEntriesDetailsSuccess, loadJournalEntriesDetailsFail);
      }, 2000);
  };

  loadJournalDetailsEntries();
});