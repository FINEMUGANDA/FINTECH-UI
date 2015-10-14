'use strict';

var costCenterService = angular.module('costCenterService', ['delegatorServices']);

costCenterService.factory('CostCenterService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using CostCenterService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveCostCenter: function(url, jsondata) {
      console.log('Post Data using CostCenterService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateCostCenter: function(url, jsondata) {
      console.log('Put Data using CostCenterService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    removeCostCenter: function(url, jsondata) {
      console.log('Remove Data using CostCenterService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    }
  };
});
