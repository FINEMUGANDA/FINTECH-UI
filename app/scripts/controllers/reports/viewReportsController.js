'use strict';

angular.module('angularjsApp').controller('ViewReportsController', function($route, $scope, 
  REST_URL, ReportService) {
  console.log('ViewReportsController');
  $scope.isLoading = true;
  $scope.itemsByPage = 10;
  $scope.isTreeview = false;
  var routeParams = $route.current.params;
  $scope.type = $route.current.params.type;

  //Success callback
  var loadReportsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = getReports(result.data);
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadReportsFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from ReportsService service.' + result);
  };
  //Make request for list of reports
  var typeReport = routeParams.type.replace(routeParams.type[0], routeParams.type[0].toUpperCase()) + ' ' + 'Reports';
  $scope.type = typeReport;
  var url = REST_URL.RUN_REPORTS + '/';
  if (routeParams.type === 'all') {
    url += 'FullReportList?parameterType=true';
  } else if (routeParams.type === 'clients') {
    url += 'reportCategoryList?R_reportCategory=Client&parameterType=true';
  } else if (routeParams.type === 'loans') {
    url += 'reportCategoryList?R_reportCategory=Loan&parameterType=true';
  } else if (routeParams.type === 'savings') {
    url += 'reportCategoryList?R_reportCategory=Savings&parameterType=true';
  } else if (routeParams.type === 'funds') {
    url += 'reportCategoryList?R_reportCategory=Fund&parameterType=true';
  } else if (routeParams.type === 'accounting') {
    url += 'reportCategoryList?R_reportCategory=Accounting&parameterType=true';
  }

  // Remove the duplicate entries from the array. The reports api returns same report multiple times if it have more than one parameter.
  var getReports = function (data) {
      var prevId = -1;
      var currId;
      var reports = [];
      for (var i = 0; i < data.length; i++) {
          currId = data[i].report_id;
          if (currId !== prevId) {
              reports.push(data[i]);
          }
          prevId = currId;
      }
      return reports;
  };
  ReportService.getData(url).then(loadReportsSuccess, loadReportsFail);
});