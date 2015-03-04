'use strict';
 
  // Here we attach this controller to our testApp module
var dashboardCtrl = angular.module('dashboardController',['dashboardService','Constants', 'GraphUtils']);
  
dashboardCtrl.controller('DashboardCtrl', function ($scope, $location, DashboardService, REST_URL, PAGE_URL, CHART_TYPE, APPLICATION, Session, Graph, dialogs) {
  // To load the dashboard page
  $scope.isBorrowerReady = false;
  $scope.isDueReady = false;
  $scope.isParReady = false;

  $scope.showRepaymentsDueThisWeek = function() {
    $scope.payments = undefined;
    $scope.paymentTotal = 0;
    var dialog = dialogs.create('views/loans/details/dialogs/loans.details.repayment.week.dialog.tpl.html', 'LoanDeatilsRepaymentWeekDialog', {msg: 'Repayments Due This Week'}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      //$scope.payments = result.data;
    });
  };

  $scope.showNewRepayment = function() {
    $scope.payments = undefined;
    $scope.paymentTotal = 0;
    var dialog = dialogs.create('views/Client/dialogs/repayment.tpl.html', 'ClientsRepaymentDialogCtrl', {msg: 'Loan Repayment'}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      //$scope.payments = result.data;
    });
  };

  $scope.showUploadDocuments = function() {
    $scope.payments = undefined;
    $scope.paymentTotal = 0;
    var dialog = dialogs.create('views/Client/dialogs/upload.tpl.html', 'ClientsUploadDialogCtrl', {msg: 'Upload Documents'}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      //$scope.payments = result.data;
    });
  };

  $scope.showClientSelect = function() {
    var dialog = dialogs.create('views/Client/clients.select.dialog.tpl.html', 'ClientSelectCtrl', {msg: 'Select Client for new Loan', action: 'New Loan', loanStatus: ''}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      console.log('CLIENT: ' + angular.toJson(result));
      $location.path( '/loans/' + result + '/form' );
    });
  };

  $scope.loadDashboard = function(){
    console.log('DashboardCtrl : loadDashboard');
    $scope.username = Session.getValue(APPLICATION.username);
    // Get header values 
    $scope.getHeaderStatistics();
    // Get borrowers per loan officer
    $scope.getBorrowerPerLoanOfficer();
    // Get Due vs. Collected previous week
    $scope.getDueCollectedpreWeek();
    // Get PAR per Loan Officer
    $scope.getPARperLoanOfficer();
    // Dummy Charts
    $scope.loanPortfolioCurrentMonth = Graph.getColumnChart(CHART_TYPE.LOANPORTFOLIO_UPDATES);
    //$scope.dueVsCollectedLastWeek = Graph.getPieChart();
  };

  // Get header statistic values
  $scope.getHeaderStatistics = function(){
    console.log('DashboardCtrl : getHomePageHeaderStatic');
     // Success callback
    var headerStatisticsSuccess = function(result){
      console.log('Success : Return from headerStatistics service.');
      $scope.totalActiveClient = result.data[0].totalActiveClient;
      $scope.totalBorrowers = result.data[0].totalBorrowers;
      $scope.loansInBadStanding = result.data[0].loansInBadStanding;      
      $scope.repaymentsDueThisWeek = result.data[0].repaymentsDueThisWeek;
    };
    // failur callback
    var headerStatisticsFail = function(result){
      console.log('Error : Return from headerStatistics service.' + result);
      $scope.totalActiveClient = 0;
      $scope.totalBorrowers = 0;
      $scope.loansInBadStanding = 0;      
      $scope.repaymentsDueThisWeek = 0;
    };
    //service to get Statistics value from server
    DashboardService.headerStatistics(REST_URL.DASHBOARD_HEADER_STATISTIC).then(headerStatisticsSuccess,headerStatisticsFail);
  };

  // Get borrowers per loan officer
  $scope.getBorrowerPerLoanOfficer = function(){
    console.log('DashboardCtrl : getBorrowerPerLoanOfficer');
     var data = {};
     data.maxValue = 500;
     data.cols = [
      {
        'id': 'name',
        'label': 'Name',
        'type': 'string'
      },
      {
        'id': 'borrowers',
        'label': 'Borrowers',
        'type': 'number'
      },
      {
        'id': 'barHeaders',
        'role': 'annotation',
        'type': 'string',
        'p': {
          'role': 'annotation',
          'html': true
        }
      }
    ];
    data.rows = [];
    // Success callback
    var borrowerPerLoanOfficerSuccess = function(result){
      console.log('Success : Return from dashboardService service.');
      $scope.isBorrowerReady = true;
      var temp = '';
      for (var i in result.data) {
        temp = {
          'c': [
            {
                'v': result.data[i].loanOfficer
            },
            {
                'v': result.data[i].borrowers
            },
            {
                'v': result.data[i].borrowers
            }
          ]
        };
        data.rows.push(temp);
      }
      $scope.borrowerPerLoanOfficer = Graph.getColumnChart(data);
    };
    // failur callback
    var borrowerPerLoanOfficerFail = function(result){
      console.log('Error : Return from dashboardService service.' + result);
      $scope.isBorrowerReady = true;
      $scope.borrowerPerLoanOfficer = Graph.getColumnChart(data);
    };
    //service to get Active Borrowers per Loan Officer
    DashboardService.getData(REST_URL.ACTIVE_BORROWERS_PER_LOAN_OFFICER).then(borrowerPerLoanOfficerSuccess, borrowerPerLoanOfficerFail);   
  };

  // Get Due vs. Collected previous week
  $scope.getDueCollectedpreWeek = function() {
    console.log('DashboardCtrl : getDueCollectedpreWeek');
     var data = {};
     data.cols = [
      {
        'id': 'status',
        'label': 'Status',
        'type': 'string',
        'p': {}
      },
      {
        'id': 'total',
        'label': 'Total',
        'type': 'number',
        'p': {}
      }
    ];
    data.rows = [];
    // Success callback
    var dueCollectedpreWeekSuccess = function(result){
      console.log('Success : Return from dashboardService service.' + result);
      $scope.isDueReady = true;
      var collected = parseFloat(result.data[0].collected);
      var due = parseFloat(result.data[0].due);
      if(due > 0 || collected > 0){
        data.rows = [
          {
            'c': [
              {
                'v': 'Collected'
              },
              {
                'v': collected
              }
            ]
          },
          {
            'c': [
              {
                'v': 'Due'
              },
              {
                'v': due
              }
            ]
          }
        ];
      }      
      $scope.dueVsCollectedLastWeek = Graph.getPieChart(data);
    };
    // failur callback
    var dueCollectedpreWeekFail = function(result){
      $scope.isDueReady = true;
      console.log('Error : Return from dashboardService service.'+result);
      $scope.dueVsCollectedLastWeek = Graph.getPieChart(data);
    };
    //service to get Active Borrowers per Loan Officer
    DashboardService.getData(REST_URL.DUEVSCOLLECTED).then(dueCollectedpreWeekSuccess, dueCollectedpreWeekFail);   
  };

  // Get PAR per Loan Officer
  $scope.getPARperLoanOfficer = function() {
    console.log('DashboardCtrl : getPARperLoanOfficer');
     var data = {};
     data.maxValue = 5;
     data.cols = [
      {
        'id': 'name',
        'label': 'Name',
        'type': 'string'
      },
      {
        'id': 'borrowers',
        'label': 'Borrowers',
        'type': 'number'
      },
      {
        'id': 'barHeaders',
        'role': 'annotation',
        'type': 'string'
      }
    ];
    data.rows = [];
    // Success callback
    var PARperLoanOfficerSuccess = function(result){
      console.log('Success : Return from dashboardService service.' + result);
      $scope.isParReady = true;
      var temp = '';
      for (var i in result.data) {
        temp = {
          'c': [
            {
                'v': result.data[i].loanOfficerFirstName + ' ' + result.data[i].loanOfficerLastName
            },
            {
                'v': result.data[i].par
            },
            {
                'v': result.data[i].par
            }
          ]
        };
        data.rows.push(temp);
      }
      $scope.PARPerLoanOfficer = Graph.getColumnChart(data);
    };
    // failur callback
    var PARperLoanOfficerFail = function(result){
      $scope.isParReady = true;
      console.log('Error : Return from dashboardService service.' + result);
      $scope.PARPerLoanOfficer = Graph.getColumnChart(data);
    };
    //service to get Active Borrowers per Loan Officer
    DashboardService.getData(REST_URL.PAR_PER_LOAN_OFFICER).then(PARperLoanOfficerSuccess, PARperLoanOfficerFail);   
  };

  //will fire on every page load
  $scope.loadDashboard();
});