'use strict';

var holidayService = angular.module('holidayService', ['delegatorServices']);

holidayService.factory('HolidayService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using holidayService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveHoliday: function(url, jsondata) {
      console.log('Get Data using holidayService...'); 
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateHoliday: function(url, jsondata) {
      console.log('Put Data using holidayService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    removeHoliday: function(url, jsondata) {
      console.log('Remove Data using holidayService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});