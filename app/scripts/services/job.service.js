'use strict';

var JobService = angular.module('jobService', ['delegatorServices']);

JobService.factory('JobService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using JobService...');
      var promise = Remote.get(url);
      return promise;
    },
    save: function(url, jsondata) {
      console.log('Post Data using JobService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    update: function(url, jsondata) {
      console.log('Put Data using JobService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    remove: function(url, jsondata) {
      console.log('Remove Data using JobService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});
