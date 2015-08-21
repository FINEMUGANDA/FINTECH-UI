/* global moment */

'use strict';

angular.module('angularjsApp').controller('AuditCtrl', function($route, $scope, SearchService, REST_URL,
  AuditService, Utility, PAGE_URL, $location) {
  console.log('AuditCtrl');
  $scope.formData = {};
  $scope.formDate = {};
  $scope.itemsByPage = 10;

  $scope.url = REST_URL.AUDIT + '?genericResultSet=true';

  $scope.$watch('tableSearch', function() {
    SearchService.data('audit', $scope.tableSearch);
  });

  //Function to load audit list
  var getAuditList = function(url) {
    $scope.isCollapsed = false;
    $scope.isLoading = true;

    //Success callback
    var loadAuditSuccess = function(result) {
      $scope.isLoading = false;
      $scope.url = REST_URL.AUDIT + '?genericResultSet=true';
      try {
        $scope.rowCollection = result.data;
        $scope.tableSearch = SearchService.data('audit');
      } catch (e) {
        console.log(e);
      }
    };

    //failur callback
    var loadAuditFail = function(result) {
      $scope.isLoading = false;
      $scope.url = REST_URL.AUDIT + '?genericResultSet=true';
      console.log('Error : Return from AuditService service.' + result);
    };

    console.log('search url > ' + url);
    //service to get accounts from server    
    AuditService.getData(url).then(loadAuditSuccess, loadAuditFail);
  };

  //Default load for audit list
  getAuditList($scope.url);

  //Set template for search
  AuditService.getData(REST_URL.AUDIT + '/searchtemplate').then(function(result){
    $scope.template = result.data;
  });

  $scope.viewUser = function (item) {
      $scope.userTypeahead = true;
      $scope.formData.makerId = item.id;
  };

  $scope.reset = function () {
      $scope.isCollapsed = false;
      $scope.formData = {};
      $scope.formDate = {};
      $scope.search();
  };

  $scope.search = function (){
    if($scope.formDate.makerDateTimeFrom){
      $scope.formData.makerDateTimeFrom = moment($scope.formDate.makerDateTimeFrom).format('YYYY-MM-DD');
    }
    if($scope.formDate.makerDateTimeTo){
      $scope.formData.makerDateTimeTo = moment($scope.formDate.makerDateTimeTo).format('YYYY-MM-DD');
    }
    if($scope.formDate.checkerDateTimeFrom){
      $scope.formData.checkerDateTimeFrom = moment($scope.formDate.checkerDateTimeFrom).format('YYYY-MM-DD');
    }
    if($scope.formDate.checkerDateTimeTo){
      $scope.formData.checkerDateTimeTo = moment($scope.formDate.checkerDateTimeTo).format('YYYY-MM-DD');
    }
    angular.forEach($scope.formData, function(value, key) {
        $scope.url += '&' + key + '=' + value ; 
    });
    getAuditList($scope.url);    
  };

  $scope.viewAudit = function (audit) {
      $location.path(PAGE_URL.AUDIT_DETAILS + audit.id);
  };
  
});

// View audit in detail
angular.module('angularjsApp').controller('ViewAuditCtrl', function($route, $scope, REST_URL, 
  PAGE_URL, AuditService, $location) {
  console.log('ViewAuditCtrl');
  $scope.isLoading = false;
  $scope.id = $route.current.params.id;

  //Success callback
  var loadAuditDetailSuccess = function(result) {
    $scope.isLoading = true;
    try {
      $scope.details = result.data;
      $scope.commandAsJson = result.data.commandAsJson;
      var obj = JSON.parse($scope.commandAsJson);
      $scope.jsondata = [];      
      angular.forEach(obj, function (value, key) {
          $scope.jsondata.push({name: key, property: value});
      });
    } catch (e) {
      console.log(e);
    }
  };

  //failur callback
  var loadAuditDetailFail = function(result) {
    $scope.isLoading = true;    
    console.log('Error : Return from AuditService service.' + result);
    $location.path(PAGE_URL.AUDIT);
  };
  
  var url = REST_URL.AUDIT;
  if ($scope.id) {
    url = url + '/' + $scope.id; 
  } else {
    $location.path(PAGE_URL.AUDIT);
  }
  //service to get accounts from server    
  AuditService.getData(url).then(loadAuditDetailSuccess, loadAuditDetailFail);
});