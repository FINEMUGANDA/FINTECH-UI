'use strict';

var auditService = angular.module('auditService', ['delegatorServices']);

auditService.factory('AuditService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using auditService...');
      var promise = Remote.get(url);
      return promise;
    }
  };
});