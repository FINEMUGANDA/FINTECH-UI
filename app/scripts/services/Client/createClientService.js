'use strict';

var createClientsService = angular.module('createClientsService', ['delegatorServices']);

createClientsService.factory('CreateClientsService', function($http, Remote) {
  return {
    getData: function(url) {
      console.log('Get Data using createClientsService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveClient: function(url, jsondata) {
      console.log('Post Data using createClientsService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateClient: function(url, jsondata) {
      console.log('Put Data using createClientsService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    deleteClient: function(url, jsondata) {
      console.log('Delete Data using createClientsService...');
      var promise = Remote.delete(url, jsondata);
      return promise;
    },
    uploadFileToUrl: function(file, uploadUrl, data) {
      var fd = new FormData();
      fd.append('file', file);
      $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        data: data,
        headers: {'Content-Type': undefined}
      }).success(function() {
        console.log('hooray');
      }).error(function() {
        console.log('hooray yar');
      });
    }
  };
});