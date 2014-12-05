'use strict';

var journalService = angular.module('journalService', ['delegatorServices']);

journalService.factory('JournalService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using JournalService...');
      var promise = Remote.get(url);
      return promise;
    }
  };
});
