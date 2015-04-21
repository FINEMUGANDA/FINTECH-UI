'use strict';


var app = angular.module('Constants', []);

app.constant('APPLICATION', {
    // NOTE: like this we never have to change this again; it automatically detects which backend to use (local or remote, if remote then with the correct domain)
    'host' : location.hostname.indexOf('0.0.0.0')>=0 ? 'https://localhost:8443/mifosng-provider/' :
        location.hostname.indexOf('localhost')>=0 ? 'https://test.finemfi.org/mifosng-provider/' :
            location.hostname.indexOf('test.finemfi.org')>=0 ? 'https://test.finemfi.org/mifosng-provider/' :
                location.hostname.indexOf('uat.finemfi.org')>=0 ? 'https://uat.finemfi.org/mifosng-provider/' :
                    location.hostname.indexOf('finem.finemfi.org')>=0 ? 'https://finem.finemfi.org/mifosng-provider/' :
                        'https://ec2-54-148-52-34.us-west-2.compute.amazonaws.com/mifosng-provider/',
//    'host' : 'https://ec2-54-148-52-34.us-west-2.compute.amazonaws.com/mifosng-provider/',
//    'host' : 'https://localhost:8443/mifosng-provider/',
//    'host' : 'https://demo.openmf.org/mifosng-provider/',

    'sessionName': 'ang_session',
    'authToken': 'token',
    'username' : 'username',
    'role' : 'role',
    'permissions' : 'permissions',
    'PAGE_SIZE' : 10,
    'DISPLAYED_PAGES' : 5,
    'NO_IMAGE_THUMB' : 'images/noPhoto.jpg',
    'API_VERSION' : 'api/v1',
    'TIMEZONE' : 'Africa/Kampala',
    'DF_MIFOS': 'dd/MM/yyyy',
    'DF_MOMENT': 'DD/MM/YYYY'
});

app.constant('REST_URL', {
    'AUTHENTICATION': 'api/v1/authentication',
    'DASHBOARD_HEADER_STATISTIC': 'api/v1/runreports/Home page header statistic',
    'ALL_CLIENTS': 'api/v1/runreports/PageClientsScreenClients',
    'SEARCH_CLIENTS': 'api/v1/runreports/Search Clients',
    'SMS_NOTIFICATION_LOG': 'api/v1/runreports/SmsNotificationLog',
    'CLIENTS_LOAN_REPAYMENT': 'api/v1/runreports/DialogClientsLoanRepayment',
    'LOANS': 'api/v1/runreports/PageClientsScreenLoans',
    'LOANS_CLOSED': 'api/v1/runreports/PageClientsScreenLoansClosed',
    'LOANS_PENDING_APPROVALS': 'api/v1/runreports/PageClientsScreenLoansPA',
    'LOANS_AWAITING_DISBURSEMENT': 'api/v1/runreports/PageClientsScreenLoansAD',
    'LOANS_REJECTED': 'api/v1/runreports/PageClientsScreenLoansRejected',
    'LOANS_WRITTEN_OFF': 'api/v1/runreports/PageClientsScreenLoansWritten',
    'LOANS_PRODUCTS': 'api/v1/loanproducts',
    'LOANS_TEMPLATES': 'api/v1/loans/template',
    'LOANS_CREATE': 'api/v1/loans',
    'LOANS_GUARANTOR_DETAILS': 'api/v1/datatables/extra_guarantor_details/',
    'LOANS_EXTRA_DETAILS': 'api/v1/datatables/extra_loan_details/',
    'CHARGES': 'api/v1/charges',
    'LOAN_PRODUCTS_TEMPLATE':'api/v1/loanproducts/template',
    LOAN_PRODUCTS_TEMPLATE_EXTRA:'api/v1/datatables/loanprodAccMap/',
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
    'CLIENT_NOTE_GENERAL':'api/v1/datatables/client_note_general/',
    'CLIENT_IDENTIFICATION_TEMPLATE_REPORT':'api/v1/runreports/ClientIdentification',
    'EXCHANGE_RATE':'api/v1/datatables/exchange_rate/',
    ACCOUNT_LIST: 'api/v1/glaccounts',
    ACCOUNT_BY_ID: 'api/v1/glaccounts/',
    JOBS: 'api/v1/jobs',
    CODES: 'api/v1/codes',
    FINANCIALYEARS: 'api/v1/financial_years',
    SCHEDULER: 'api/v1/scheduler',
    ACCOUNT_TEMPLATE: 'api/v1/glaccounts/template',
    ACCOUNT_UPDATE_BY_ID: 'api/v1/glaccounts/',
    ACCOUNT_CREATE: 'api/v1/glaccounts',
    JOURNALENTRIES:'api/v1/journalentries',
    JOURNALENTRIES_LIST:'api/v1/runreports/JournalEntryList',
    GLACCOUNTS:'api/v1/glaccounts',
    CURRENCY_LIST:'api/v1/currencies',
    CODE_LIST:'api/v1/codes',
    OFFICE_LIST:'api/v1/offices',
    DOCUMENTS : 'api/v1/documents/',
    USERS: 'api/v1/users/',
    PERMISSIONS_LIST:'api/v1/permissions',
    BASE : 'api/v1/',
    JOURANAL_ENTRY_REVERSE_NOTE:'api/v1/datatables/journal_entry_reverse_note/',
    NOTES:'api/v1/datatables/notes/',
    HOLIDAYS: 'api/v1/holidays',
    HOLIDAYS_LIST:'api/v1/runreports/HolidayList',
    REPORTS: 'api/v1/reports',
    RUN_REPORTS: 'api/v1/runreports',
    AUDIT: 'api/v1/audits',
    DUEVSCOLLECTED: 'api/v1/runreports/DueVsCollected',
    PAR_PER_LOAN_OFFICER: 'api/v1/runreports/PAR per Loan Officer',
    CHANGES_LOAN_PORTFOLIO: 'api/v1/runreports/ChangesLoanPortfolio',
    ACTIVE_BORROWERS_PER_LOAN_OFFICER: 'api/v1/runreports/Active Borrowers per Loan Officer'
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
    'MAPACCOUNTING':'/mapAccount',
    'EDITCHARGE':'/editCharge',
    'CREATE_CLIENT':'/createClient',
    'EDIT_BASIC_CLIENT_INFORMATION':'/editbasicclientinfo',
    'EDIT_CLIENT_ADDITIONAL_INFO':'/editadditionalclientinfo',
    'EDIT_CLIENT_IDENTIFICATION':'/editclientidentification',
    'EDIT_CLIENT_NEXT_OF_KEEN':'/editnextofkeen',
    'EDIT_CLIENT_BUSINESS_DETAILS':'/editbusinessdetails',
    'JOURNALENTRIES':'/journalentries',
    'JOURNALENTRIES_DETAILS':'/journalentries/details',
    ADMIN :'/admin',
    HOLIDAYS : '/holidays',
    REPORTS : '/reports',
    VIEW_REPORTS : '/vreports',
    RUN_REPORTS : '/run_reports',
    JOBS: '/jobs',
    AUDIT: '/audit',
    AUDIT_DETAILS : '/audit/details/' 
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized',
  permissionUpdate: 'auth-permission-update'
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

app.constant('PERMISSION_GROUP_LABELS', {
        fin_account: 'Chart of Accounts',
        fin_audit: 'Audit',
        fin_charge: 'Fees & Charges',
        fin_client: 'Client',
        fin_holiday: 'Holidays',
        fin_journal: 'Journal Entries',
        fin_loan: 'Loan',
        fin_loan_reschedule: 'Loan Reschedule',
        fin_loan_assign: 'Loan Reassign.',
        fin_loan_product: 'Loan Product',
        fin_permission: 'Permissions',
        fin_role: 'Roles',
        fin_user: 'User',
        fin_staff: 'Staff',
        fin_note_general: 'General Notes',
        fin_note_followup: 'Follow up Notes',
        fin_report: 'Manage Reports',
        fin_dashboard_document: 'Upload',
        fin_dashboard_shortcuts: 'Shortcuts',
        fin_dashboard_summary: 'Summary',
        fin_dashboard_charts: 'Graph/Charts',
        fin_job: 'Jobs',
        fin_notification: 'Notification Logs',
        fin_survey: 'Survey',
        fin_currency: 'Currencies',
        fin_exchange_rate: 'Exchange Rates',
        fin_dashboard_survey: 'Survey',
        fin_codevalue: 'Code Values',
        fin_financialyear: 'Financial Year'
    }
);

app.constant('PERMISSION_GROUPS_SORT_ORDER', {
        general: [
            'fin_loan',
            'fin_loan_assign',
            'fin_loan_product',
            'fin_loan_reschedule',
            'fin_client',
            'fin_note_general',
            'fin_note_followup',
            'fin_account',
            'fin_journal',
            'fin_charge',
            'fin_staff',
            'fin_user',
            'fin_role',
            'fin_permission',
            'fin_holiday',
            'fin_report',
            'fin_loan_reassignment',
            'fin_job',
            'fin_audit',
            'fin_notification',
            'fin_survey',
            'fin_currency',
            'fin_exchange_rate',
            'fin_codevalue',
            'fin_financialyear'
        ],
        dashboard: [
            'fin_dashboard_shortcuts',
            'fin_dashboard_summary',
            'fin_dashboard_charts'
        ]
    }
);

app.constant('PERMISSION_ACTIONS_SORT_ORDER', {
        READ: 1,
        CREATE: 2,
        UPDATE: 3,
        DELETE: 4,
        CLOSE: 5,
        DISBURSE: 10,
        APPROVALUNDO: 11,
        DISBURSALUNDO: 12,
        REPAYMENT: 13,
        ADJUST: 14,
        WRITEOFF: 15,
        UNDOWRITEOFF: 16,
        //RESCHEDULE: 17,
        APPROVE: 19,
        REJECT: 20,
        ACTIVATE: 21,
        REACTIVATE: 22,
        REVERSE: 23,
        EXECUTEJOB: 24,
        CLIENT: 30,
        LOAN: 31,
        UPLOAD: 32,
        SURVEY: 33,
        NOTE: 32,
        TAC: 40,
        TB: 41,
        LIBS: 42,
        RDTW: 43,
        ABPLO: 50,
        PPLO: 51,
        CILPCM: 52,
        DVCPW: 53,
        BULKREASSIGN: 60,
        BACKDATE: 70
    }
);

app.constant('PERMISSION_REPORT_CATEGORIES', {
        Loan: true,
        Client: true,
        Accounting: true,
        Home: false,
        UI: false
    }
);

app.constant('PERMISSION_MAPPING', {
        READ_CLIENT: [
            'READ_CLIENTIMAGE',
            'READ_CLIENTIDENTIFIER',
            'READ_GROUP',
            'READ_Search Clients',
            'READ_PageClientsScreenClients',
            'READ_PageClientsScreenLoans',
            'READ_PageClientsScreenLoansPA',
            'READ_PageClientsScreenLoansAD',
            'READ_PageClientsScreenLoansRejected',
            'READ_PageClientsScreenLoansWritten',
            'READ_PageClientsScreenLoansClosed',
            'READ_ClientIdentification',
            'READ_client_identification_details',
            'READ_client_extra_information',
            'READ_client_additional_details',
            'READ_client_next_to_keen_details',
            'READ_client_note_general',
            'READ_business_details'
        ],
        UPDATE_CLIENT: [
            'READ_CLIENTIMAGE',
            'CREATE_CLIENTIMAGE',
            'DELETE_CLIENTIMAGE',
            'READ_CLIENTIDENTIFIER',
            'CREATE_CLIENTIDENTIFIER',
            'UPDATE_CLIENTIDENTIFIER',
            'DELETE_CLIENTIDENTIFIER',
            'UPDATE_client_identification_details',
            'UPDATE_client_extra_information',
            'UPDATE_client_additional_details',
            'UPDATE_client_next_to_keen_details',
            'UPDATE_client_note_general',
            'UPDATE_business_details'
        ],
        CREATE_CLIENT: [
            'READ_CLIENTIMAGE',
            'CREATE_CLIENTIMAGE',
            'DELETE_CLIENTIMAGE',
            'READ_CLIENTIDENTIFIER',
            'CREATE_CLIENTIDENTIFIER',
            'UPDATE_CLIENTIDENTIFIER',
            'DELETE_CLIENTIDENTIFIER',
            'CREATE_client_identification_details',
            'CREATE_client_extra_information',
            'CREATE_client_additional_details',
            'CREATE_client_next_to_keen_details',
            'CREATE_client_note_general',
            'CREATE_business_details'
        ],
        DELETE_CLIENT: [
            'DELETE_CLIENTIMAGE',
            'DELETE_CLIENTIDENTIFIER',
            'DELETE_client_identification_details',
            'DELETE_client_extra_information',
            'DELETE_client_additional_details',
            'DELETE_client_next_to_keen_details',
            'DELETE_client_note_general',
            'DELETE_business_details'
        ],
        READ_JOURNALENTRY: [
            'READ_CURRENCY',
            'READ_CODE',
            'READ_CODEVALUE',
            'READ_JournalEntryList',
            'READ_journal_entry_reverse_note'
        ],
        REVERSE_JOURNALENTRY: [
            'CREATE_journal_entry_reverse_note'
        ],
        READ_HOLIDAY: [
            'READ_HolidayList'
        ],
        READ_LOAN: [
            'READ_TEMPLATE',
            'READ_OFFICE',
            'READ_GROUP',
            'READ_LOANNOTE',
            'READ_COLLATERAL',
            'READ_LOANPRODUCT',
            'READ_DialogClientsLoanRepayment',
            'READ_notes',
            'READ_extra_guarantor_details',
            'READ_extra_loan_details'
        ],
        UPDATE_LOAN: [
            'READ_LOANPRODUCT',
            'READ_COLLATERAL',
            'CREATE_COLLATERAL',
            'UPDATE_COLLATERAL',
            'DELETE_COLLATERAL',
            'READ_notes',
            'READ_extra_guarantor_details',
            'READ_extra_loan_details',
            'CREATE_notes',
            'CREATE_extra_guarantor_details',
            'CREATE_extra_loan_details',
            'UPDATE_notes',
            'UPDATE_extra_guarantor_details',
            'UPDATE_extra_loan_details',
            'DELETE_notes',
            'DELETE_extra_guarantor_details',
            'DELETE_extra_loan_details'
        ],
        CREATE_LOAN: [
            'READ_LOANPRODUCT',
            'READ_COLLATERAL',
            'CREATE_COLLATERAL',
            'UPDATE_COLLATERAL',
            'DELETE_COLLATERAL',
            'READ_notes',
            'READ_extra_guarantor_details',
            'READ_extra_loan_details',
            'CREATE_notes',
            'CREATE_extra_guarantor_details',
            'CREATE_extra_loan_details',
            'UPDATE_notes',
            'UPDATE_extra_guarantor_details',
            'UPDATE_extra_loan_details',
            'DELETE_notes',
            'DELETE_extra_guarantor_details',
            'DELETE_extra_loan_details'
        ],
        DELETE_LOAN: [
            'READ_COLLATERAL',
            'CREATE_COLLATERAL',
            'UPDATE_COLLATERAL',
            'DELETE_COLLATERAL',
            'READ_notes',
            'READ_extra_guarantor_details',
            'READ_extra_loan_details',
            'CREATE_notes',
            'CREATE_extra_guarantor_details',
            'CREATE_extra_loan_details',
            'UPDATE_notes',
            'UPDATE_extra_guarantor_details',
            'UPDATE_extra_loan_details',
            'DELETE_notes',
            'DELETE_extra_guarantor_details',
            'DELETE_extra_loan_details'
        ],
        READ_ROLE: [
            'READ_REPORT'
        ],
        CREATE_ROLE: [
            'PERMISSIONS_ROLE',
            'EXPRESSIONS_ROLE'
        ],
        UPDATE_ROLE: [
            'PERMISSIONS_ROLE',
            'EXPRESSIONS_ROLE'
        ],
        READ_exchange_rate: [
            'READ_CURRENCY'
        ],
        READ_UINOTIFICATION: [
            'READ_SmsNotificationLog'
        ],
        READ_UIREPORT: [
            'READ_REPORT'
        ],
        READ_UILOANPRODUCT: [
            'READ_LOANPRODUCT'
        ],
        TAC_UIDASHBOARD: [
            'READ_Home page header statistic'
        ],
        TB_UIDASHBOARD: [
            'READ_Home page header statistic'
        ],
        LIBS_UIDASHBOARD: [
            'READ_Home page header statistic'
        ],
        RDTW_UIDASHBOARD: [
            'READ_Repayments Due This Week',
            'READ_Home page header statistic'
        ],
        ABPLO_UIDASHBOARD: [
            'READ_Active Borrowers per Loan Officer'
        ],
        PPLO_UIDASHBOARD: [
            'READ_PAR per Loan Officer'
        ],
        DVCPW_UIDASHBOARD: [
            'READ_DueVsCollected'
        ],
        CILPCM_UIDASHBOARD: [
            'READ_ChangesLoanPortfolio'
        ],
        UPLOAD_UIDASHBOARD: [
            'CREATE_DOCUMENT'
        ],
        SURVEY_UIDASHBOARD: [
            'REGISTER_SURVEY'
        ]
    }
);

app.constant('PERMISSION_ROUTE_MAPPING', {
    '/clients': {
        check: 'any',
        permissions: [
            'READ_CLIENT'
        ]
    },
    '/loans': {
        check: 'any',
        permissions: [
            'READ_LOAN'
        ]
    },
    '/vreports/clients': {
        type: 'report',
        permissions: [
            'Client'
        ]
    }
});

app.constant('PERMISSION_EXPRESSIONS', {
        LOAN: [
            {
                code: 'CREATE_LOAN',
                label: 'Can Create Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'UPDATE_LOAN',
                label: 'Can Update Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'APPROVE_LOAN',
                label: 'Can Approve Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    },
                    selfAssign: function(expression) {
                        return expression===null || expression===undefined || /resource\.loan_officer_id!=appUser\.getStaffId\(\)/g.exec(expression)===null;
                    }
                }
            },
            {
                code: 'REJECT_LOAN',
                label: 'Can Reject Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'DISBURSE_LOAN',
                label: 'Can Disburse Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'WRITEOFF_LOAN',
                label: 'Can Write Off Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'APPROVALUNDO_LOAN',
                label: 'Can Undo Loan Approval',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'DISBURSALUNDO_LOAN',
                label: 'Can Undo Loan Disbursement',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'CLOSE_LOAN',
                label: 'Can Close Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            },
            {
                code: 'CREATE_RESCHEDULELOAN',
                label: 'Can Reschedule Loan',
                expression: 'resource.principal_amount >= {0} && resource.principal_amount <={1}',
                defaults: {
                    min: 0,
                    max: 10000
                },
                extractors: {
                    min: function(expression) {
                        return Number(/>=\s*(\d+)/g.exec(expression)[1]);
                    },
                    max: function(expression) {
                        return Number(/<=\s*(\d+)/g.exec(expression)[1]);
                    }
                }
            }
        ]
    }
);
