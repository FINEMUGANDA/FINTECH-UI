'use strict';

var currencyService = angular.module('currencyService', ['delegatorServices']);

currencyService.factory('CurrencyService', function($http, Remote) {
  return {
    getData: function(url) {
      var promise = Remote.get(url);
      return promise;
    },
    updateCurrency: function(url, jsondata) {
      var promise = Remote.put(url, jsondata);
      return promise;
    }
  };
});