'use strict';

var financialYearService = angular.module('financialYearService', ['delegatorServices']);

financialYearService.factory('FinancialYearService', function($http, Remote) {
  return {
    getData: function(url) {
      var promise = Remote.get(url);
      return promise;
    },
    saveYear: function(url, jsondata) {
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateYear: function(url, jsondata) {
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    deleteYear: function(url, jsondata) {
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});