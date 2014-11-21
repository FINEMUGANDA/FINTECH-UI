'use strict';


var app = angular.module('Constants', []);

app.constant('APPLICATION', {    
    'host' : 'https://ec2-54-148-52-34.us-west-2.compute.amazonaws.com/mifosng-provider/',
    'sessionName': 'ang_session',
    'authToken': 'token',
    'username' : 'username',
    'role' : 'role',
    'PAGE_SIZE' : 5,
    'DISPLAYED_PAGES' : 5
});

app.constant('REST_URL', {
    'AUTHENTICATION': 'api/v1/authentication',
    'DASHBOARD_HEADER_STATISTIC': 'api/v1/runreports/Home page header statistic',
    'ALL_CLIENTS': 'api/v1/runreports/PageClientsScreenClients',
    'LOANS': 'api/v1/runreports/PageClientsScreenLoans',
    'LOANS_PENDING_APPROVALS': 'api/v1/runreports/PageClientsScreenLoansPA',
    'LOANS_AWAITING_DISBURSEMENT': 'api/v1/runreports/PageClientsScreenLoansAD',
    'LOANS_REJECTED': 'api/v1/runreports/PageClientsScreenLoansRejected',
    'LOANS_WRITTEN_OFF': 'api/v1/runreports/PageClientsScreenLoansWritten',
    'LOANS_PRODUCTS_LIST': 'api/v1/loanproducts',
    'CHARGES': 'api/v1/charges',
    'LOAN_PRODUCTS_TEMPLATE':'api/v1/loanproducts/template'
});

app.constant('PAGE_URL', {
    'ROOT': '/',
    'DASHBOARD': '/dashboard',
    'CLIENTS': '/clients',
    'LOANS': '/loans',
    'LOANSAWAITINGDISBURSEMENT': '/loansAwaitingDisbursement',
    'LOANSPENDINGAPPROVAL': '/loansPendingApproval',
    'LOANSREJECTED': '/loansRejected',
    'LOANSWRITTENOFF': '/loansWrittenOff',
    'LOANPRODUCTS': '/loanProducts',
    'CHARGES': '/charges',
    'ACCOUNTING': '/accounting',
    'CREATELOANPRODUCT':'/createloanproduct',
    'CREATECHARGE':'/createCharge',
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  user: 'user',
  guest: 'guest'
});


app.constant('CHART_TYPE', {
    'ACTIVE_BORROWERS': 'activeBorrowers',
    'PAR_PER_LOAN': 'parPerLoan',
    'LOANPORTFOLIO_UPDATES': 'changesInLoanPortfolio'
});
