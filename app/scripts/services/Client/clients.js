'use strict';

var clientsService = angular.module('clientsService', ['delegatorServices']);

clientsService.factory('ClientsService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using clientsService...');
      var promise = Remote.get(url);
      return promise;
    },
    getClientImage: function(url) {
      console.log('Get Client Image using clientsService...');
      var promise = Remote.get(url);
      return promise;
    }
  };
});