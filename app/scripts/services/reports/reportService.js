'use strict';

var holidayService = angular.module('reportService', ['delegatorServices']);

holidayService.factory('ReportService', function($http, Remote) {
  return {
    getData: function(url, responseType) {
      console.log('Get Data using reportService...');
      var promise = Remote.get(url, responseType);
      return promise;
    },
    saveReport: function(url, jsondata) {
      console.log('Get Data using reportService...'); 
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateReport: function(url, jsondata) {
      console.log('Put Data using reportService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    removeReport: function(url, jsondata) {
      console.log('Remove Data using reportService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});