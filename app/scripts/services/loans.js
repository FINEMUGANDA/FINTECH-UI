'use strict';

var loanProductService = angular.module('loanProductService', ['delegatorServices']);

loanProductService.factory('LoanProductService', function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using configurationService...');
                var promise = Remote.get(url);
                return promise;
            }
	}
});