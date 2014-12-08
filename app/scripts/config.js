'use strict';


var app = angular.module('Constants', []);

app.constant('APPLICATION', {    
    'host' : 'https://ec2-54-148-52-34.us-west-2.compute.amazonaws.com/mifosng-provider/',
//    'host' : 'https://192.168.1.11:8443/mifosng-provider/',
    'sessionName': 'ang_session',
    'authToken': 'token',
    'username' : 'username',
    'role' : 'role',
    'PAGE_SIZE' : 5,
    'DISPLAYED_PAGES' : 5,
    'NO_IMAGE_THUMB' : 'images/noPhoto.jpg'
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
    'LOAN_PRODUCTS_TEMPLATE':'api/v1/loanproducts/template',
    'CHARGE_TEMPLATE':'api/v1/charges/template',
    'CREATE_CHARGE':'api/v1/charges',
    'LOANS_PRODUCTS_LIST_BY_ID':'api/v1/loanproducts/',
    'RETRIVE_CHARGE_BY_ID':'api/v1/charges/',
    'CREATE_CLIENT_TEMPLATE':'api/v1/clients/template',
    'CREATE_CLIENT':'api/v1/clients',
    'CREATE_CLIENT_EXTRA_INFORMATION':'api/v1/datatables/client_extra_information/',
    'CREATE_ADDITIONAL_CLIENT_INFO':'api/v1/datatables/client_additional_details/',
    'GROUP_TEMPLATE_RESOURCE':'api/v1/groups/template',
    'CREATE_CLIENT_BUSINESS_ACTIVITY':'api/v1/datatables/business_details/',
    'CREATE_CLIENT_IDENTIFICATION':'api/v1/datatables/client_identification_details/',
    'CREATE_CLIENT_NEXT_TO_KEEN':'api/v1/datatables/client_next_to_keen_details/',
    'CLIENT_IDENTIFICATION_TEMPLATE_REPORT':'api/v1/runreports/ClientIdentification',    
    ACCOUNT_LIST: 'api/v1/glaccounts',
    ACCOUNT_BY_ID: 'api/v1/glaccounts/',
    ACCOUNT_TEMPLATE: 'api/v1/glaccounts/template',
    ACCOUNT_UPDATE_BY_ID: 'api/v1/glaccounts/',
    ACCOUNT_CREATE: 'api/v1/glaccounts',    
    JOURNALENTRIES:'api/v1/journalentries',
    JOURNALENTRIES_LIST:'api/v1/runreports/JournalEntryList',
    GLACCOUNTS:'api/v1/glaccounts',
    CURRENCY_LIST:'api/v1/currencies',
    CODE_LIST:'api/v1/codes',
    OFFICE_LIST:'api/v1/offices'
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
    'EDITLOANPRODUCT':'/editloanproduct',
    'EDITCHARGE':'/editCharge',
    'CREATE_CLIENT':'/createClient',
    'EDIT_BASIC_CLIENT_INFORMATION':'/editbasicclientinfo',
    'EDIT_CLIENT_ADDITIONAL_INFO':'/editadditionalclientinfo',
    'EDIT_CLIENT_IDENTIFICATION':'/editclientidentification',
    'EDIT_CLIENT_NEXT_OF_KEEN':'/editnextofkeen',
    'EDIT_CLIENT_BUSINESS_DETAILS':'/editbusinessdetails',
    'JOURNALENTRIES':'/journalentries',
    'JOURNALENTRIES_DETAILS':'/journalentries/details',
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
