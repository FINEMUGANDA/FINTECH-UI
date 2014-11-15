'use strict';
 
  // Here we attach this controller to our testApp module
var dashboardCtrl = angular.module('dashboardController',['dashboardService','Constants', 'GraphUtils']);
  
dashboardCtrl.controller('DashboardCtrl', function ($scope, $rootScope, $location, DashboardService, REST_URL, PAGE_URL, CHART_TYPE, APPLICATION, Session, Graph) {
  //To load the dashboard page
  $scope.loadDashboard = function(){
    console.log('DashboardCtrl : loadDashboard');
    $scope.username = Session.getValue(APPLICATION.username);
    //Set header values 
    $scope.getHeaderStatistics();    
    //Dummy Charts
    $scope.borrowerPerLoanOfficer = Graph.getColumnChart(CHART_TYPE.ACTIVE_BORROWERS);
    $scope.PARPerLoanOfficer = Graph.getColumnChart(CHART_TYPE.PAR_PER_LOAN);
    $scope.loanPortfolioCurrentMonth = Graph.getColumnChart(CHART_TYPE.LOANPORTFOLIO_UPDATES);
    $scope.dueVsCollectedLastWeek = Graph.getPieChart();
  };

  $scope.getHeaderStatistics = function(){
    console.log('DashboardCtrl : getHomePageHeaderStatic');
     //Success callback
    var headerStatisticsSuccess = function(result){
      console.log('Success : Return from headerStatistics service.');
      $scope.totalActiveClient = result.data[0].totalActiveClient;
      $scope.totalBorrowers = result.data[0].totalBorrowers;
      $scope.loansInBadStanding = result.data[0].loansInBadStanding;      
      $scope.repaymentsDueThisWeek = result.data[0].repaymentsDueThisWeek;
    } 
    //failur callback
    var headerStatisticsFail = function(result){
      console.log('Error : Return from headerStatistics service.');
      $scope.totalActiveClient = 0;
      $scope.totalBorrowers = 0;
      $scope.loansInBadStanding = 0;      
      $scope.repaymentsDueThisWeek = 0;
    }
    //service to get Statistics value from server
    DashboardService.headerStatistics(REST_URL.DASHBOARD_HEADER_STATISTIC).then(headerStatisticsSuccess,headerStatisticsFail);
   
  };

  //will fire on every page load
  $scope.loadDashboard();
});