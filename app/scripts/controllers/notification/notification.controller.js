'use strict';

angular.module('angularjsApp').controller('NotificationSmsCtrl', function($scope, ReportService, SearchService, REST_URL) {
    // TODO: implement this
    $scope.isLoading = true;

    $scope.$watch('tableSearch', function() {
        SearchService.data('notification_sms', $scope.tableSearch);
    });

    $scope.toDate = function(date) {
        var d = new Date();
        d.setDate(date[2]);
        d.setMonth(date[1]-1);
        d.setYear(date[0]);
        return d;
    };

    ReportService.getData(REST_URL.SMS_NOTIFICATION_LOG).then(function(result) {
        $scope.logs = result.data;
        $scope.isLoading = false;
        $scope.tableSearch = SearchService.data('notification_sms');
    });
});
