'use strict';

var exchangeRateService = angular.module('exchangeRateService', ['delegatorServices']);

exchangeRateService.factory('ExchangeRateService', function($http, Remote) {
  return {
    getData: function(url) {
      var promise = Remote.get(url);
      return promise;
    },
    saveRate: function(url, jsondata) {
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateRate: function(url, jsondata) {
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    deleteRate: function(url, jsondata) {
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});