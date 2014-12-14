'use strict';

var accountService = angular.module('loanService', ['delegatorServices']);

accountService.factory('LoanService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using LoanService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveLoan: function(url, jsondata) {
      console.log('Post Data using LoanService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateLoan: function(url, jsondata) {
      console.log('Put Data using LoanService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    removeLoan: function(url, jsondata) {
      console.log('Remove Data using LoanService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});
