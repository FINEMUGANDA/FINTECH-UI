'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function($scope, REST_URL, JournalService, $timeout, $location, dialogs) {
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
});