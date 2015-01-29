'use strict';

angular.module('angularjsApp').controller('ReportsController', function($route, $scope, 
  REST_URL, ReportService, $timeout, $location, dialogs) {
  console.log('ReportsController');
  $scope.isLoading = true;
  $scope.itemsByPage = 10;
  $scope.isTreeview = false;

  //Success callback
  var loadReportsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
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
  ReportService.getData(REST_URL.REPORTS).then(loadReportsSuccess, loadReportsFail);

  $scope.editReport = function(report) {    
      $location.path('/reports/edit/' + report.id);    
  };

  $scope.removeReport = function(report) {
    var msg = 'You are about to remove Report <strong>' + report.reportName + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {      
      if (result) {
        $scope.isLoading = true;
        ReportService.removeReport(REST_URL.REPORTS + '/' + report.id).then(function() {
          $scope.isLoading = false;
          $route.reload();
        }, function(result) {
          $scope.isLoading = false;
          $scope.type = 'error';
          $scope.message = 'Report not deleted: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          $('html, body').animate({scrollTop: 0}, 800);
        });
      }
    });
  };
});

// Create Report
angular.module('angularjsApp').controller('CreateReportsController', function($location, $scope, 
  REST_URL, ReportService) {
  console.log('CreateReportsController');
  $scope.isLoading = true;
  $scope.reportParameters = [];
  $scope.reportDetails = {};
  $scope.flag = false;
  $scope.parameterSelected = function (allowedParameterId) {
      $scope.flag = true;
      for (var i in $scope.reportdetail.allowedParameters) {
          if ($scope.reportdetail.allowedParameters[i].id === parseInt(allowedParameterId)) {
              $scope.reportParameters.push({parameterId: allowedParameterId,
                  id: '',
                  allowedParameterName: $scope.reportdetail.allowedParameters[i].parameterName
              });
          }
      }
      $scope.allowedParameterId = '';
  };
  function deepCopy(obj) {
      if (Object.prototype.toString.call(obj) === '[object Array]') {
          var out1 = [], i = 0;
          var len = obj.length;
          for (; i < len; i++) {
              out1[i] = deepCopy(obj[i]);
          }
          return out1;
      }
      if (typeof obj === 'object') {
          var out2 = {}, j;
          for (j in obj) {
              out2[j] = deepCopy(obj[j]);
          }
          return out2;
      }
      return obj;
  }
  $scope.deleteParameter = function (index) {
      $scope.reportParameters.splice(index, 1);
  };
  //Success callback
  var loadReportsSuccess = function(result) { 
    $scope.isLoading = false;   
    try {
      $scope.reportdetail = result.data;
      $scope.reportDetails.reportCategory = 'Client';
      $scope.reportDetails.reportType = result.data.allowedReportTypes[0];
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadReportsFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from ReportService service.' + result);
  };
  ReportService.getData(REST_URL.REPORTS +'/template').then(loadReportsSuccess, loadReportsFail);
  // Save report
  $scope.saveReport = function() {    
    console.log('saveReport`');
    var saveReportSuccess = function(result) {
      console.log('saveReportSuccess' + result);
      $scope.type = 'alert-success';
      $scope.message = 'Saved successfully';
      $scope.errors = [];
      $location.url('/reports');
    };
    var saveReportFail = function(result) {
      console.log('saveReportFail');
      $scope.type = 'error';
      $scope.message = 'Report not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $('html, body').animate({scrollTop: 0}, 800);
    };
    $scope.temp = deepCopy($scope.reportParameters);
    for (var i in $scope.temp) {
        delete $scope.temp[i].allowedParameterName;
    }
    this.reportDetails.reportParameters = $scope.temp;
    var json = angular.toJson($scope.reportDetails);
    console.log('json > ' + json);
    ReportService.saveReport(REST_URL.REPORTS, json).then(saveReportSuccess, saveReportFail);
  };
  //Validate form and save
  $scope.validate = function() {
    console.log('validate');
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.createReportForm.$valid) {
      $scope.saveReport();
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };
});

// Edit Report
angular.module('angularjsApp').controller('EditReportsController', function($route, $location, $scope, 
  REST_URL, ReportService) {
  console.log('EditReportsController');
  $scope.isLoading = true;
  $scope.reportDetails = {};
  $scope.id = $route.current.params.id;
  $scope.parameterSelected = function (allowedParameterId) {
      for (var i in $scope.reportdetail.allowedParameters) {
          if ($scope.reportdetail.allowedParameters[i].id === parseInt(allowedParameterId)) {
              $scope.reportdetail.reportParameters.push({parameterId: allowedParameterId,
                  id: '',
                  parameterName: $scope.reportdetail.allowedParameters[i].parameterName
              });
          }
      }
      $scope.allowedParameterId = '';
    };

  function deepCopy(obj) {
      if (Object.prototype.toString.call(obj) === '[object Array]') {
          var out1 = [], i = 0, len = obj.length;
          for (; i < len; i++) {
              out1[i] = deepCopy(obj[i]);
          }
          return out1;
      }
      if (typeof obj === 'object') {
          var out2 = {}, j;
          for (j in obj) {
              out2[j] = deepCopy(obj[j]);
          }
          return out2;
      }
      return obj;
  }

  $scope.deleteParameter = function (index) {
      $scope.reportdetail.reportParameters.splice(index, 1);
  };

  //Success callback
  var loadReportSuccess = function(result) {
    console.log('loadReportSuccess');
    $scope.isLoading = false;
    try {
      $scope.reportdetail = result.data;
      $scope.reportdetail.reportParameters = result.data.reportParameters || [];
      $scope.reportDetails.useReport = result.data.useReport ? 'true' : 'false';
      $scope.reportDetails.reportType = result.data.reportType;
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadReportFail = function(result) {
    console.log('Error : Return from ReportService service.' + result);
  };
  ReportService.getData(REST_URL.REPORTS + '/' + $scope.id + '?template=true').then(loadReportSuccess, loadReportFail);
  // Update report
  $scope.updateReport = function() {
    var saveReportSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'Saved successfully';
      $scope.errors = [];
      $location.url('/reports');
    };
    var saveReportFail = function(result) {
      $scope.type = 'error';
      $scope.message = 'Report not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $('html, body').animate({scrollTop: 0}, 800);
    };
    if ($scope.reportdetail.coreReport === true) {
        this.reportDetails.reportParameters = $scope.temp;
    } else {
        $scope.temp = deepCopy($scope.reportdetail.reportParameters);
        //$scope.reportdetail.reportParameters = $scope.temp;
        for (var i in $scope.temp) {
            delete $scope.temp[i].parameterName;
        }
        this.reportDetails = {
            reportName: $scope.reportdetail.reportName,
            reportType: $scope.reportdetail.reportType,
            reportSubType: $scope.reportdetail.reportSubType,
            reportCategory: $scope.reportdetail.reportCategory,
            useReport: $scope.reportDetails.useReport,
            description: $scope.reportdetail.description,
            reportSql: $scope.reportdetail.reportSql,
            reportParameters: $scope.temp
        };
    }
    var json = angular.toJson($scope.reportDetails);
    console.log('json > ' + json);
    ReportService.updateReport(REST_URL.REPORTS + '/' + $scope.id, json).then(saveReportSuccess, saveReportFail);
  };
  //Validate form and save
  $scope.validate = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.editReportForm.$valid) {
      $scope.updateReport();
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };
});