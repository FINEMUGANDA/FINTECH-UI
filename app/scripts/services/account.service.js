'use strict';

var accountService = angular.module('accountService', ['delegatorServices']);

accountService.factory('AccountService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using AccountService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveAccount: function(url, jsondata) {
      console.log('Post Data using AccountService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateAccount: function(url, jsondata) {
      console.log('Put Data using AccountService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    removeAccount: function(url, jsondata) {
      console.log('Remove Data using AccountService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});
