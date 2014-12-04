'use strict';

var dashboardService = angular.module('dashboardService', ['delegatorServices']);

dashboardService.factory('DashboardService', function($http, Remote) {
    return {
            headerStatistics: function(url){
                console.log('Get total active clients...');
                var promise = Remote.get(url);
                return promise;
            }
	};
});