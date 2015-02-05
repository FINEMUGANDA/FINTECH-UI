'use strict';

var loanProductService = angular.module('loanProductService', ['delegatorServices']);

loanProductService.factory('LoanProductService', function($http, Remote) {
  var editStep;
  return {
    getData: function(url) {
      console.log('Get Data using loanProductService...');
      var promise = Remote.get(url);
      return promise;
    },
    saveProduct: function(url, jsondata) {
      console.log('Post Data using loanProductService...');
      var promise = Remote.post(url, jsondata);
      return promise;
    },
    updateProduct: function(url, jsondata) {
      console.log('Put Data using loanProductService...');
      var promise = Remote.put(url, jsondata);
      return promise;
    },
    getEditStep: function() {      
      return editStep;
    },
    setEditStep: function(step) {
      editStep = step;
    }
  };
});