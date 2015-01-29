'use strict';

angular.module('angularjsApp').controller('ViewReportsController', function($location, $route, $scope, 
  REST_URL, ReportService, $routeParams) {
  console.log('ViewReportsController');
  $scope.isLoading = true;
  $scope.itemsByPage = 10;
  $scope.isTreeview = false;
  $scope.type = $routeParams.type;

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
  var typeReport = $routeParams.type.replace($routeParams.type[0], $routeParams.type[0].toUpperCase()) + ' ' + 'Reports';
  $scope.type = typeReport;
  var url = REST_URL.RUN_REPORTS + '/';
  if ($routeParams.type === 'all') {
    url += 'FullReportList?parameterType=true';
  } else if ($routeParams.type === 'clients') {
    url += 'reportCategoryList?R_reportCategory=Client&parameterType=true';
  } else if ($routeParams.type === 'loans') {
    url += 'reportCategoryList?R_reportCategory=Loan&parameterType=true';
  } else if ($routeParams.type === 'savings') {
    url += 'reportCategoryList?R_reportCategory=Savings&parameterType=true';
  } else if ($routeParams.type === 'funds') {
    url += 'reportCategoryList?R_reportCategory=Fund&parameterType=true';
  } else if ($routeParams.type === 'accounting') {
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
  $scope.routeTo = function (report) {
      url = '/run_reports/' + report.report_name;
      url += '/' + report.report_id;
      url += '/' + report.report_type;
      $location.path(url);
  };
});

//Run report
angular.module('angularjsApp').controller('RunReportsController', function($sce, $route, $scope, 
  REST_URL, ReportService, $rootScope, APPLICATION, $routeParams, dateFilter) {
  console.log('RunReportsController');
  var colorArrayPie = ['#008000', '#ff4500'];
  $scope.isCollapsed = false; //displays options div on startup
  $scope.hideTable = true; //hides the results div on startup
  $scope.hidePentahoReport = true; //hides the results div on startup
  $scope.hideChart = true;
  $scope.piechart = false;
  $scope.barchart = false;
  $scope.formData = {};
  $scope.reportParams = [];
  $scope.reportDateParams = [];
  $scope.reqFields = [];
  $scope.reportTextParams = [];
  $scope.reportData = {};
  $scope.reportData.columnHeaders = [];
  $scope.reportData.data = [];
  $scope.baseURL = '';
  $scope.csvData = [];
  $scope.row = [];
  $scope.reportName = $routeParams.name;
  $scope.reportType = $routeParams.type;
  $scope.reportId = $routeParams.reportId;
  $scope.pentahoReportParameters = [];
  $scope.type = 'pie';

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $($event.currentTarget).attr('is-open', 'true');
    //$scope.opened = true;
  };

  $scope.highlight = function (id) {
      var i = document.getElementById(id);
      if (i.className === 'selected-row') {
          i.className = 'text-pointer';
      } else {
          i.className = 'selected-row';
      }
  };
  if ($scope.reportType === 'Pentaho') {
      $scope.formData.outputType = 'HTML';
  }

  //Success callback
  var loadReportsSuccess = function(result) {
    console.log('RunReportsController : loadReportsSuccess');
    try {
      var data = result.data;
      for (var i in data.data) {
          var temp = {
              name: data.data[i].row[0],
              variable: data.data[i].row[1],
              label: data.data[i].row[2],
              displayType: data.data[i].row[3],
              formatType: data.data[i].row[4],
              defaultVal: data.data[i].row[5],
              selectOne: data.data[i].row[6],
              selectAll: data.data[i].row[7],
              parentParameterName: data.data[i].row[8],
              inputName: 'R_' + data.data[i].row[1] //model name
          };
          $scope.reqFields.push(temp);
          if (temp.displayType === 'select' && temp.parentParameterName === null) {
              intializeParams(temp, {});
          } else if (temp.displayType === 'date') {
              $scope.reportDateParams.push(temp);
          } else if (temp.displayType === 'text') {
              $scope.reportTextParams.push(temp);
          }
      }      
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadReportsFail = function(result) {
    console.log('Error : Return from ReportsService service.' + result);
  };
  var url = REST_URL.RUN_REPORTS + '/';
  url += 'FullParameterList?genericResultSet=true&parameterType=true&R_reportListing=\'' + $routeParams.name + '\'';
  ReportService.getData(url).then(loadReportsSuccess, loadReportsFail);

  if ($scope.reportType === 'Pentaho') {
    url = REST_URL.REPORTS + '/' + $scope.reportId;
    url += '?fields=reportParameters';
    ReportService.getData(url).then(function (result) {
        $scope.pentahoReportParameters = result.data.reportParameters || [];
    });
  }

  function getSuccuessFunction(paramData) {
    //var tempDataObj = {};
    var successFunction = function (result) {
        var data = result.data;
        var selectData = [];
        var isExistedRecord = false;
        for (var j in data.data) {
            selectData.push({id: data.data[j].row[0], name: data.data[j].row[1]});
        }
        for (var i in $scope.reportParams) {
            if ($scope.reportParams[i].name === paramData.name) {
                $scope.reportParams[i].selectOptions = selectData;
                isExistedRecord = true;
            }
        }
        if (!isExistedRecord) {
            paramData.selectOptions = selectData;
            $scope.reportParams.push(paramData);
        }
    };
    return successFunction;
  }
  function intializeParams(paramData, params) {
    $scope.errorStatus = undefined;
    $scope.errorDetails = [];
    //params.reportSource = paramData.name;
    //params.parameterType = true;
    var url = REST_URL.RUN_REPORTS + '/';
    url += paramData.name + '?parameterType=true&genericResultSet=true';
    url += '&' + params;
    var successFunction = getSuccuessFunction(paramData);
    ReportService.getData(url).then(successFunction);
  }
  $scope.getDependencies = function (paramData) {
    for (var i = 0; i < $scope.reqFields.length; i++) {
        var temp = $scope.reqFields[i];
        if (temp.parentParameterName === paramData.name) {
            if (temp.displayType === 'select') {
                var parentParamValue = this.formData[paramData.inputName];
                if (parentParamValue !== undefined) {
                    var params = paramData.inputName + '=' + parentParamValue;
                    intializeParams(temp, params);
                }
            } else if (temp.displayType === 'date') {
                $scope.reportDateParams.push(temp);
            }
        }
    }
  };

  $scope.checkStatus = function () {
    var collapsed = false;
    if ($scope.isCollapsed) {
        collapsed = true;
    }
    return collapsed;
  };

  function invalidDate(checkDate) {
      // validates for yyyy-mm-dd returns true if invalid, false is valid
      var dateformat = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
      if (!(dateformat.test(checkDate))) {
          return true;
      } 
      // TODO validate date
      /*else {
          var dyear = checkDate.substring(0, 4);
          var dmonth = checkDate.substring(5, 7) - 1;
          var dday = checkDate.substring(8);

          var newDate = new Date(dyear, dmonth, dday);
          return !((dday == newDate.getDate()) && (dmonth == newDate.getMonth()) && (dyear == newDate.getFullYear()));
      }*/
  }

  function removeErrors() {
      var $inputs = $(':input');
      $inputs.each(function () {
          //$(this).removeClass('validationerror');
          $(this).parent().removeClass('has-error');
      });
  }

  function parameterValidationErrors() {
      var tmpStartDate = '';
      var tmpEndDate = '';
      var errorObj;
      var paramDetails;
      $scope.errorDetails = [];
      for (var i in $scope.reqFields) {
          paramDetails = $scope.reqFields[i];
          var fieldId = '';            
          var selectedVal;
          switch (paramDetails.displayType) {
              case 'select':
                  selectedVal = $scope.formData[paramDetails.inputName];
                  if (selectedVal === undefined || selectedVal === 0) {
                      fieldId = '#' + paramDetails.inputName;
                      //Chnage class name
                      //$(fieldId).addClass('validationerror');
                      $(fieldId).parent().addClass('has-error');
                      errorObj = {};
                      errorObj.field = paramDetails.inputName;
                      errorObj.code = 'The parameter '+paramDetails.inputName+' is required';
                      errorObj.args = {params: []};
                      errorObj.args.params.push({value: paramDetails.label});
                      $scope.errorDetails.push(errorObj);
                  }
                  break;
              case 'date':
                  var tmpDate = $scope.formData[paramDetails.inputName];
                  if (tmpDate === undefined || tmpDate === '') {
                      fieldId = '#' + paramDetails.inputName;
                      //$(fieldId).addClass('validationerror');
                      $(fieldId).parent().addClass('has-error');
                      errorObj = {};
                      errorObj.field = paramDetails.inputName;
                      errorObj.code = 'The parameter ' + paramDetails.inputName + ' is required';
                      errorObj.args = {params: []};
                      errorObj.args.params.push({value: paramDetails.label});
                      $scope.errorDetails.push(errorObj);
                  }
                  if (tmpDate && invalidDate(tmpDate) === true) {
                      fieldId = '#' + paramDetails.inputName;
                      //$(fieldId).addClass('validationerror');
                      $(fieldId).parent().addClass('has-error');
                      errorObj = {};
                      errorObj.field = paramDetails.inputName;
                      errorObj.code = 'Invalid value for the field' + paramDetails.inputName;
                      errorObj.args = {params: []};
                      errorObj.args.params.push({value: paramDetails.label});
                      $scope.errorDetails.push(errorObj);
                  }

                  if (paramDetails.variable === 'startDate') {
                    tmpStartDate = tmpDate;
                  }
                  if (paramDetails.variable === 'endDate') {
                    tmpEndDate = tmpDate;
                  }
                  break;
              case 'text':
                  selectedVal = $scope.formData[paramDetails.inputName];
                  if (selectedVal === undefined || selectedVal === 0) {
                      fieldId = '#' + paramDetails.inputName;
                      //$(fieldId).addClass('validationerror');
                      $(fieldId).parent().addClass('has-error');
                      errorObj = {};
                      errorObj.field = paramDetails.inputName;
                      errorObj.code = 'The parameter ' + paramDetails.inputName + ' is required';
                      errorObj.args = {params: []};
                      errorObj.args.params.push({value: paramDetails.label});
                      $scope.errorDetails.push(errorObj);
                  }
                  break;
              default:
                  console.log(paramDetails.displayType);
                  errorObj = {};
                  errorObj.field = paramDetails.inputName;
                  errorObj.code = 'The parameter ' + paramDetails.inputName +' is not supported';
                  errorObj.args = {params: []};
                  errorObj.args.params.push({value: paramDetails.label});
                  $scope.errorDetails.push(errorObj);
                  break;
          }
      }

      if (tmpStartDate > '' && tmpEndDate > '') {
          if (tmpStartDate > tmpEndDate) {
              errorObj = {};
              errorObj.field = paramDetails.inputName;
              errorObj.code = 'The values entered for dates are invalid';
              errorObj.args = {params: []};
              errorObj.args.params.push({value: paramDetails.label});
              $scope.errorDetails.push(errorObj);
          }
      }      
  }

  function buildReportParms() {
      var paramCount = 1;
      var reportParams = '';
      for (var i = 0; i < $scope.reqFields.length; i++) {
          var reqField = $scope.reqFields[i];
          for (var j = 0; j < $scope.pentahoReportParameters.length; j++) {
              var tempParam = $scope.pentahoReportParameters[j];
              if (reqField.name === tempParam.parameterName) {
                  var paramName = 'R_' + tempParam.reportParameterName;
                  if (paramCount > 1) {
                    reportParams += '&';
                  } 
                  reportParams += encodeURIComponent(paramName) + '=' + encodeURIComponent($scope.formData[$scope.reqFields[i].inputName]);
                  paramCount = paramCount + 1;
              }
          }
      }
      return reportParams;
  }

  $scope.xFunction = function () {
      return function (d) {
          return d.key;
      };
  };
  $scope.yFunction = function () {
      return function (d) {
          return d.values;
      };
  };
  $scope.setTypePie = function () {
      if ($scope.type === 'bar') {
          $scope.type = 'pie';
      }
  };
  $scope.setTypeBar = function () {
      if ($scope.type === 'pie') {
          $scope.type = 'bar';
      }
  };
  $scope.colorFunctionPie = function () {
      return function (d, i) {
          return colorArrayPie[i];
      };
  };
  $scope.runReport = function () {
      //clear the previous errors
      $scope.errorDetails = [];
      removeErrors();

      //update date fields with proper dateformat
      for (var i in $scope.reportDateParams) {
          if ($scope.formData[$scope.reportDateParams[i].inputName]) {
              // TODO change datefilter
              console.log('change dateFilter.....................');
              $scope.formData[$scope.reportDateParams[i].inputName] = dateFilter($scope.formData[$scope.reportDateParams[i].inputName], 'yyyy-MM-dd');
          }
      }

      //Custom validation for report parameters
      parameterValidationErrors();

      if ($scope.errorDetails.length === 0) {
          $scope.isCollapsed = true;
          var url = '';
          switch ($scope.reportType) {
              case 'Table':
                  $scope.isLoading = true;
                  $scope.itemsByPage = 10;
                  $scope.hideTable = false;
                  $scope.hidePentahoReport = true;
                  $scope.hideChart = true;
                  //$scope.formData.reportSource = $scope.reportName;
                  url = REST_URL.RUN_REPORTS + '/' + $scope.reportName + '?genericResultSet=true';
                  angular.forEach($scope.formData, function(value, key) {
                      url += '&' + key + '=' + value ; 
                  });
                  ReportService.getData(url).then(function(result){
                      //clear the csvData array for each request
                      var data = result.data;
                      $scope.isLoading = false;                      
                      $scope.rowCollection = data;
                      $scope.colspan = $scope.rowCollection.columnHeaders.length;
                      $scope.csvData = [];
                      $scope.reportData.columnHeaders = data.columnHeaders;
                      $scope.reportData.data = data.data;
                      for (var i in data.columnHeaders) {
                          $scope.row.push(data.columnHeaders[i].columnName);
                      }
                      $scope.csvData.push($scope.row);
                      for (var k in data.data) {
                          $scope.csvData.push(data.data[k].row);
                      }
                  }, function(result){
                    console.log('This is in error' + result);
                  });
                  break;

              case 'Pentaho':
                  $scope.hideTable = true;
                  $scope.hidePentahoReport = false;
                  $scope.hideChart = true;
                  $scope.baseURL = APPLICATION.host + APPLICATION.API_VERSION + '/runreports/' + encodeURIComponent($scope.reportName);
                  $scope.baseURL += '?output-type=' + encodeURIComponent($scope.formData.outputType) + '&tenantIdentifier=default&locale=en&dateFormat=dd/MMMM/yyyy';

                  var inQueryParameters = buildReportParms();
                  if (inQueryParameters > '') {
                    $scope.baseURL += '&' + inQueryParameters;
                  }
                  // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                  $scope.baseURL = $sce.trustAsResourceUrl($scope.baseURL);
                  break;
              case 'Chart':
                  $scope.hideTable = true;
                  $scope.hidePentahoReport = true;
                  $scope.hideChart = false;
                  //$scope.formData.reportSource = $scope.reportName;
                  url = REST_URL.RUN_REPORTS + '/' + $scope.reportName + '?genericResultSet=true';
                  angular.forEach($scope.formData, function(value, key) {
                      url += '&' + key + '=' + value ; 
                  });
                  ReportService.getData(url).then(function(result){
                      //clear the csvData array for each request
                      var data = result.data;
                      $scope.reportData.columnHeaders = data.columnHeaders;
                      $scope.reportData.data = data.data;
                      $scope.chartData = [];
                      $scope.barData = [];
                      var l = data.data.length;
                      for (var i = 0; i < l; i++) {
                          $scope.row = {};
                          $scope.row.key = data.data[i].row[0];
                          $scope.row.values = data.data[i].row[1];
                          $scope.chartData.push($scope.row);
                      }
                      var x = {};
                      x.key = 'summary';
                      x.values = [];
                      for (var m = 0; m < l; m++) {
                          var inner = [data.data[m].row[0], data.data[m].row[1]];
                          x.values.push(inner);
                      }
                      $scope.barData.push(x);
                      console.log($scope.barData);
                  }, function(result){
                    console.log('This is in error' + result);
                  });
                  break;
              default:
                  var errorObj = {};
                  errorObj.field = $scope.reportType;
                  errorObj.code = 'The report type ' + $scope.reportType + ' is not supported';
                  errorObj.args = {params: []};
                  errorObj.args.params.push({value: $scope.reportType});
                  $scope.errorDetails.push(errorObj);
                  break;
          }
      }
  };
});