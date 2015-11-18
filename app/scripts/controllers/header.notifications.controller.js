'use strict';

angular.module('angularjsApp').controller('HeaderNotifictaionsCtrl', function($scope, $rootScope, REST_URL, AuthService, RoleService, AUTH_EVENTS, $interval, dialogs) {

  var url = '';

  $('html').click(function() {
    var wrapper = $('#loans_info_wrapper');
    if (wrapper && wrapper.length) {
      $('#loans_info_wrapper').hide();
    }
  });

  $scope.loans_info_show = function() {
    var offset = $('#loans_info_button').offset();
    offset.top = offset.top + 100;
    $('#loans_info_wrapper').css(offset).toggle();
  };

  function total_loans_info() {
    if (!AuthService.isAuthenticated()) {
      return;
    }
    var loadHeaderStatisticSuccess = function(result) {

      $scope.stats = {};
      if (!result.data || !result.data.length) {
        return;
      }
      var data = result.data[0];

      if (AuthService.hasPermission('APPROVE_LOAN')) {
        $scope.stats.loansPACount = data.loansPACount || 0;
      }
      if (AuthService.hasPermission('DISBURSE_LOAN')) {
        $scope.stats.loansADCount = data.loansADCount || 0;
      }
      if (AuthService.hasPermission('READ_LOAN')) {
        $scope.stats.followUpNotesCount = data.followUpNotesCount || 0;
      }
      $scope.statsSum = _.sum($scope.stats);
    };

    var loadHeaderStatisticFail = function(err) {
      console.log('Error : erorr req.', err);
    };
    RoleService.getData(REST_URL.BASE + 'runreports/HeaderMenuStatistic').then(loadHeaderStatisticSuccess, loadHeaderStatisticFail);
  }

  total_loans_info();
  $rootScope.$on('updateNotificationsCount', function() {
    total_loans_info();
  });
  $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
    total_loans_info();
  });

  $interval(function() {
    total_loans_info();
  }, 60000);

  $scope.openFollowUpNotesDialog = function() {
    var dialog = dialogs.create('views/common/header.follow.up.notes.dialog.tpl.html', 'HeaderFollowUpDialogCtrl', {}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
    });
  };
});

angular.module('angularjsApp').controller('HeaderFollowUpDialogCtrl', function(AuthService, LoanService, $scope, $modalInstance, dateFilter) {

  $scope.formData = {};
  $scope.formData.startDate = new Date();
  $scope.formData.endDate = new Date();
  $scope.formData.officerId = -1;


  $scope.getData = function() {
    $scope.isLoading = true;
    var startDate = dateFilter($scope.formData.startDate, 'yyyy-MM-dd');
    var endDate = dateFilter($scope.formData.endDate, 'yyyy-MM-dd');
    LoanService.getData('api/v1/runreports/HeaderFollowUpNotes?R_startDate=' + startDate + '&R_endDate=' + endDate).then(function(result) {
      $scope.data = result.data;
      $scope.totalDue = 0;
      $scope.totalCollected = 0;
      $scope.totalDiff = 0;
      $scope.totalDiffPercent = 0;
      _.each($scope.data, function(row) {
        $scope.totalDue += row['P+I+F due'];
        $scope.totalCollected += row['P+I+F collected'];
      });
      $scope.totalDiff += $scope.totalDue - $scope.totalCollected;
      $scope.totalDiffPercent += ($scope.totalCollected / $scope.totalDue) * 100;
      $scope.isLoading = false;
    });
  };
  $scope.getData();

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});