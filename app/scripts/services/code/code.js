'use strict';

var codeService = angular.module('codeService', ['delegatorServices']);

codeService.factory('CodeService', function($http, Remote) {
  return {
    getData: function(url) {
      var promise = Remote.get(url);
      return promise;
    },
    saveCode: function(url, jsondata) {
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateCode: function(url, jsondata) {
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    deleteCode: function(url, jsondata) {
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});