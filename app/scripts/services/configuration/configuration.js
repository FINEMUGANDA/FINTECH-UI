'use strict';

var configurationService = angular.module('configurationService', ['delegatorServices']);

configurationService.factory('ConfigurationService', function($http, Remote) {
  return {
    getData: function(url) {
      var promise = Remote.get(url);
      return promise;
    },
    saveConfiguration: function(url, jsondata) {
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateConfiguration: function(url, jsondata) {
      var promise = Remote.put(url, jsondata);
      return promise;
    }
  };
});