'use strict';

angular.module('angularjsApp').controller('AuditCtrl', function($route, $scope, REST_URL, 
  AuditService, Utility) {
  console.log('AuditCtrl');
  $scope.formData = {};
  $scope.formDate = {};
  $scope.itemsByPage = 10;

  $scope.url = REST_URL.AUDIT + '?genericResultSet=true';

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
  };

  $scope.search = function (){
    if($scope.formDate.makerDateTimeFrom){
      $scope.formData.makerDateTimeFrom = Utility.dataFormat($scope.formDate.makerDateTimeFrom);
    }
    if($scope.formDate.makerDateTimeTo){
      $scope.formData.makerDateTimeTo = Utility.dataFormat($scope.formDate.makerDateTimeTo);  
    }
    if($scope.formDate.checkerDateTimeFrom){
      $scope.formData.checkerDateTimeFrom = Utility.dataFormat($scope.formDate.checkerDateTimeFrom);
    }
    if($scope.formDate.checkerDateTimeTo){
      $scope.formData.checkerDateTimeTo = Utility.dataFormat($scope.formDate.checkerDateTimeTo);
    }
    angular.forEach($scope.formData, function(value, key) {
        $scope.url += '&' + key + '=' + value ; 
    });
    getAuditList($scope.url);    
  };

});
