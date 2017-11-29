/* global moment */

'use strict';

angular.module('angularjsApp').controller('JournalEntriesCtrl', function ($scope, REST_URL, PAGE_URL, JournalService, SearchService, $timeout, $location, APPLICATION, $route, dialogs) {
    console.log('JournalEntriesCtrl');
    $scope.isLoading = false;
    $scope.itemsByPage = 10;
    $scope.allJournalEntries = [];


//  $scope.rowCollection = [];
    $scope.displayed = [];
    $scope.pageSize = APPLICATION.PAGE_SIZE;
    $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
    $scope.pages = [];
    $scope.searchTerm = '';
    $scope.data = {};
    $scope.data.rowCollection = [];

    var params = $location.search();

    console.log('DEBUG: ' + angular.toJson(params));

    if (params && params.clear) {
        SearchService.clear('ids');
        SearchService.clear('search');
        console.log('DEBUG XX: ' + angular.toJson(SearchService.data('ids')));
        console.log('DEBUG XX: ' + SearchService.data('search'));
        $location.url(PAGE_URL.JOURNALENTRIES).replace();
    }

    $scope.goTo = function (p) {
        $scope.currentPage = p;
        loadJournalEntries();
    };

    $scope.goNext = function () {
        $scope.currentPage++;
        loadJournalEntries();
    };

    $scope.goPrevious = function () {
        $scope.currentPage--;
        loadJournalEntries();
    };

    $scope.goLast = function () {
        $scope.currentPage = $scope.pages.length;
        loadJournalEntries();
    };

    $scope.goFirst = function () {
        $scope.currentPage = 1;
        loadJournalEntries();
    };

    $scope.setPageSize = function (s) {
        $scope.pageSize = s;
        $scope.goFirst();
    };

    $scope.onSearch = function () {
        if (!$scope.searchTerm || $scope.searchTerm.trim() === '') {
            SearchService.clear('ids');
            SearchService.clear('search');
        }
        $scope.currentPage = 1;
        loadJournalEntries();
    };
    $scope.removeJournal = function(journal) {
        $scope.title = "Remove Journal Entry";
        var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: 'You are about to remove the journal entry: <strong>' + journal.description + '</strong>. This operation is irreversible. Do you want to proceed?'}, {size: 'md', keyboard: true, backdrop: true});
        dialog.result.then(function (result) {
            if (result) {
                JournalService.getAssignments(REST_URL.JOURNALENTRIES + '/' + journal.id + '/assignments').then(function(result) {
                    if (result.data && result.data.length) {
                        $scope.alertNonRemovableEntry(result.data);
                    } else {
                        JournalService.deleteJournalEntry(REST_URL.JOURNALENTRIES_DELETE + '/' + journal.id).then(function () {
                            $scope.showSuccess('Journal entry deleted successfully');
                            loadJournalEntries();
                        }, function (r) {
                            $scope.showErrors(r);
                        });
                    }
                });
            }
        });
    };

    $scope.alertNonRemovableEntry = function(data) {
        var assignment = data[0];
        var title = "Cannot Remove Journal Entry";
        var message = "Sorry, you can not delete this Journaly Entry because it has been assigned to <b>";
        message += assignment.clientName + " [FileNo: " + assignment.clientFileNumber + "][Loan Acc: ";
        message += assignment.loanAccountNumber + "][" + assignment.loanStatus + "]</b>";
        dialogs.notify(title, message, {size: 'md', keyboard: true, backdrop: true, animation: true, windowClass: "custom-notify"});
    };

    $scope.showSuccess = function (message) {
        $scope.type = 'alert-success';
        $scope.message = message;
        $scope.errors = [];
    };

    $scope.showError = function (message, errors) {
        $scope.type = 'error';
        $scope.message = message;
        $scope.errors = errors ? errors : [];
    };

    //Success callback
    var loadJournalEntriesSuccess = function (result) {

		var searchTerm = $scope.searchTerm && $scope.searchTerm.length > 0 ? '%25' + $scope.searchTerm + '%25' : '%25';
		var filterBy = $scope.selectedFilter;
		JournalService.getData(REST_URL.JOURNALENTRIES_COUNT + '?filter=' + filterBy + '&search=' + searchTerm).then(function(res) {
			$scope.isLoading = false;
			try {
				$scope.data.rowCollection = [];
				$scope.pages = [];

				if (res.data) {
					for (var j = 1; j <= Math.ceil(res.data / $scope.pageSize); j++) {
						$scope.pages.push({page: j, link: '#/journalentries/p/' + j});
					}
				}
				$scope.data.rowCollection = result.data;

			} catch (e) {
				console.log(e);
			}
		}, loadJournalEntriesFail);
    };

    $scope.$watch('selectedFilter', function () {
        $scope.currentPage = 1;
        loadJournalEntries();
    });

    //Failure callback
    var loadJournalEntriesFail = function (result) {
        $scope.isLoading = false;
        console.log('Error : Return from JournalService service.' + result);
    };

    var loadJournalEntries = function getData() {
        $scope.isLoading = true;
        $timeout(function () {
            var offset = $scope.pageSize * ($scope.currentPage - 1);

            SearchService.data('search', $scope.searchTerm);

            if (SearchService.data('ids')) {
                $scope.searchTerm = SearchService.data('ids')[0] + '';
            } else if (SearchService.data('search')) {
                $scope.searchTerm = SearchService.data('search');
            }
            var searchTerm = $scope.searchTerm && $scope.searchTerm.length > 0 ? '%25' + $scope.searchTerm + '%25' : '%25';
            var filterBy = $scope.selectedFilter;
            var orderBy = _.get($scope.stTable, 'sort.predicate', 'entry_date');
            var sortOrder = _.get($scope.stTable, 'sort.reverse', false) ? 'ASC' : 'DESC';


            //service to get journalentries from server
			if (parseInt(sessionStorage.viewJEDetails) === 1 && sessionStorage.pagination) {
				sessionStorage.viewJEDetails = 0;
				var pagination = JSON.parse(sessionStorage.pagination);
				offset = pagination.offset;
				orderBy = pagination.orderBy;
				filterBy = pagination.filterBy;
				sortOrder = pagination.sortOrder;
				searchTerm = pagination.searchTerm;
				$scope.pageSize = pagination.pageSize;
				$scope.currentPage = pagination.currentPage;
			} else {
				$scope.persistPaginationData();
			}
            JournalService.getData(REST_URL.JOURNALENTRIES_LIST + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_filterBy=' + filterBy + '&R_search=' + searchTerm + '&R_orderBy=' + orderBy + '&R_sortOrder=' + sortOrder).then(loadJournalEntriesSuccess, loadJournalEntriesFail);
        });
    };
	$scope.persistPaginationData = function() {
		var searchTerm = $scope.searchTerm && $scope.searchTerm.length > 0 ? '%25' + $scope.searchTerm + '%25' : '%25';
		var filterBy = $scope.selectedFilter;
		var orderBy = _.get($scope.stTable, 'sort.predicate', 'entry_date');
		var sortOrder = _.get($scope.stTable, 'sort.reverse', false) ? 'ASC' : 'DESC';
		var pagination = {
			orderBy: orderBy,
			filterBy: filterBy,
			sortOrder: sortOrder,
			searchTerm: searchTerm,
			pageSize: $scope.pageSize,
			currentPage: $scope.currentPage,
			offset: $scope.pageSize * ($scope.currentPage - 1)
		};
		sessionStorage.pagination = JSON.stringify(pagination);
	};
    $scope.data.updateTable = function (tableState) {
        $scope.stTable = tableState;
        loadJournalEntries();
    };

    //Forward to view details
    $scope.viewDetail = function (journal) {
        $location.path(PAGE_URL.JOURNALENTRIES_DETAILS + '/' + journal.transaction_id);
    };
});

//View Journal Entry in Details
angular.module('angularjsApp').controller('JournalEntriesDetailsCtrl', function ($route, $scope, APPLICATION, REST_URL, JournalService, $timeout, $location, dialogs, Utility, PAGE_URL) {
    console.log('JournalEntriesDetailsCtrl');
    $scope.isLoading = false;
    $scope.itemsByPage = 10;
    $scope.id = $route.current.params.id;

    var loadReversalEntrySuccess = function (result) {
        try {
            for (var i in result.data) {
                if (result.data[i].journalentry === $scope.id) {
                    $scope.reversenote = result.data[i].reversenote;
                    break;
                }
            }
        } catch (e) {
            console.log(e);
        }
        $scope.isLoading = false;
    };
    //Success callback
    var loadJournalEntriesDetailsSuccess = function (result) {
        $scope.isLoading = true;
        $scope.canMoveToProfit = false;
        $scope.canBeReversed = false;
        try {
            $scope.rowCollection = result.data.pageItems;
            if (!Utility.isUndefinedOrNull(result.data.pageItems)) {
                var url = REST_URL.JOURANAL_ENTRY_REVERSE_NOTE + '1';
                JournalService.getData(url).then(loadReversalEntrySuccess, loadJournalEntriesDetailsFail);
                $scope.officeName = $scope.rowCollection[0].officeName;
                $scope.officeId = $scope.rowCollection[0].officeId;
                $scope.transactionDate = Utility.toLocalDate($scope.rowCollection[0].transactionDate);
                $scope.createdByUserName = $scope.rowCollection[0].createdByUserName;
                $scope.createdDate = Utility.toLocalDate($scope.rowCollection[0].createdDate);
            }
            for (var i in result.data.pageItems) {
                if (!result.data.pageItems[i].reversed && !result.data.pageItems[i].usedInLoan && !result.data.pageItems[i].profitTransactionId && !result.data.pageItems[i].isReversalEntry) {
                    $scope.canBeReversed = true;
                }
                if (result.data.pageItems[i].unidentifiedEntry && !result.data.pageItems[i].isProfit && !result.data.pageItems[i].usedInLoan) {
                    $scope.canMoveToProfit = true;
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    //Failure callback
    var loadJournalEntriesDetailsFail = function (result) {
        $scope.isLoading = false;
        console.log('Error : Return from JournalService service.' + result);
    };

    var loadJournalEntriesDetails = function getData() {
        $scope.isLoading = true;
        $timeout(
            function () {
                $scope.rowCollection = [];
                var url = REST_URL.JOURNALENTRIES + '?transactionId=';
                if ($scope.id) {
                    url = url + $scope.id;
                } else {
                    $location.path(PAGE_URL.JOURNALENTRIES);
                }
                //service to get journal entries from server
                JournalService.getData(url).then(loadJournalEntriesDetailsSuccess, loadJournalEntriesDetailsFail);
            }, 2000);
		sessionStorage.viewJEDetails = 1;
    };

    loadJournalEntriesDetails();

    //Success callback : Reverse Transaction
    var reverseTransactionSuccess = function (result) {
        console.log('reverseTransactionSuccess : ' + result);
        var form = {};
        form.journalentry = $scope.id;
        form.reversenote = $scope.note;
        form.createdDate = moment().tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
        form.locale = 'en';
        form.dateFormat = APPLICATION.DF_MIFOS;
        var json = angular.toJson(form);
        console.log(json);
        var url = REST_URL.JOURANAL_ENTRY_REVERSE_NOTE + $scope.officeId;
        JournalService.saveJournalEntry(url, json).then(function (result) {
            $scope.saveInProgress = false;
            console.log('JOURNAL_ENTRY_REVERSE_NOTE : ' + result);
            $route.reload();
        }, function (result) {
            $scope.saveInProgress = false;
            $scope.spin = false;
            $scope.type = 'error';
            $scope.message = 'Entries are reversed but note can not be saved: ' + result.data.defaultUserMessage;
            $scope.errors = result.data.errors;
            $('html, body').animate({scrollTop: 0}, 800);
        });
    };
    //Failure callback : Reverse Transaction
    var reverseTransactionFail = function (result) {
        $scope.spin = false;
        $scope.saveInProgress = false;
        console.log('Error : Return from JournalService service.');
        $scope.type = 'error';
        $scope.message = 'Journal Entry not reversed: ' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
        if (result.data.errors && result.data.errors.length) {
            for (var i = 0; i < result.data.errors.length; i++) {
                $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
        }
        $('html, body').animate({scrollTop: 0}, 800);
    };

    //Reverse Transaction
    $scope.spin = false;
    $scope.reverseTransaction = function (transactionId) {
        $scope.spin = true;
        console.log(transactionId);
        var url = REST_URL.JOURNALENTRIES + '/' + transactionId + '?command=reverse';
        var json = {
            'transactionId': transactionId
        };
        $scope.saveInProgress = true;
        JournalService.saveJournalEntry(url, json).then(reverseTransactionSuccess, reverseTransactionFail);
    };

    // Reverse entry
    $scope.reverseJournalEntry = function () {
        $scope.spin = true;
        var msg = 'Please Enter Notes : ';
        var dialog = dialogs.create('/views/Journalentries/reversal-note.html', 'ReverseNoteController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
        dialog.result.then(function (result) {
            if (result) {
                $scope.note = result;
                $scope.reverseTransaction($scope.id);
            }
        });
    };

    $scope.moveToProfits = function () {
		var dialog = dialogs.create('/views/Journalentries/move.to.profit.dialog.html', 'MoveToProfitDialogController', {}, {size: 'sm', keyboard: true, backdrop: true});
        dialog.result.then(function (result) {
            if (result) {
                var url = REST_URL.JOURNALENTRIES + '/' + $scope.id + '?command=moveToProfit';
                var json = {
                    transactionId: $scope.id,
                    glAccount: result.glAccount
                };
                $scope.saveInProgress = true;
                JournalService.saveJournalEntry(url, json).then(function (res) {
                    $scope.saveInProgress = false;
                    $route.updateParams({id: res.data.transactionId});
					$scope.note = result.note;
					$scope.id = res.data.transactionId;
					reverseTransactionSuccess(result);
                }, reverseTransactionFail);
            }
        });
    };
});

//Create Journal Entry
angular.module('angularjsApp').controller('CreateJournalEntriesCtrl', function ($scope, APPLICATION, REST_URL, JournalService, $location, PAGE_URL, Utility) {
    console.log('CreateJournalEntriesCtrl');
    $scope.isLoading = false;
    $scope.journalEntryForm = {};
    $scope.journalEntryForm.crAccounts = [
        {}
    ];
    $scope.journalEntryForm.dbAccounts = [
        {}
    ];
    $scope.showPaymentDetails = false;
    $scope.openingBalanceTypes = [
        {type: 'debit', name: 'Debit Opening Balance'},
        {type: 'credit', name: 'Credit Opening Balance'}
    ];

    //For date of transaction calendar
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };

    $scope.getDebitOptions = function () {
        if ($scope.debitOptions) {
            return $scope.debitOptions.filter(function (item) {
                if ($scope.journalEntryForm.opening && !$scope.openingBalanceType) {
                    return false;
                }
                return !$scope.journalEntryForm.opening || $scope.openingBalanceType === 'debit' || item.glCode.indexOf('2') === 0;
            });
        }

        return [];
    };

    $scope.getCreditOptions = function () {
        if ($scope.creditOptions) {
            return $scope.creditOptions.filter(function (item) {
                if ($scope.journalEntryForm.opening && !$scope.openingBalanceType) {
                    return false;
                }
                return !$scope.journalEntryForm.opening || $scope.openingBalanceType === 'credit' || item.glCode.indexOf('2') === 0;
            });
        }

        return [];
    };

    //Filter debit options
    $scope.changeCreditOptions = function () {
        var selectedCreditOptions = [];
        for (var i = 0; i < $scope.journalEntryForm.crAccounts.length; i++) {
            if ($scope.journalEntryForm.crAccounts[i].select) {
                Utility.setSelectedOptions(selectedCreditOptions, $scope.journalEntryForm.crAccounts[i].select.id);
                //selectedCreditOptions.push($scope.journalEntryForm.crAccounts[i].select.id);
            }
        }
        $scope.debitOptions = Utility.filterOptions($scope.glAccounts, null, selectedCreditOptions);
    };
    //Filter credit options
    $scope.changeDebitOptions = function () {
        var selectedDebitOptions = [];
        for (var i = 0; i < $scope.journalEntryForm.dbAccounts.length; i++) {
            if ($scope.journalEntryForm.dbAccounts[i].select) {
                Utility.setSelectedOptions(selectedDebitOptions, $scope.journalEntryForm.dbAccounts[i].select.id);
                //selectedDebitOptions.push($scope.journalEntryForm.dbAccounts[i].select.id);
            }
        }
        $scope.creditOptions = Utility.filterOptions($scope.glAccounts, null, selectedDebitOptions);
    };
    //Get all acounts
    JournalService.getData(REST_URL.GLACCOUNTS + '?disabled=false&manualEntriesAllowed=true&usage=1').then(function (data) {
        $scope.glAccounts = data.data;
        $scope.changeCreditOptions();
        $scope.changeDebitOptions();
    });
    //Get all currency
    JournalService.getData(REST_URL.CURRENCY_LIST + '?fields=selectedCurrencyOptions,base').then(function (result) {
        $scope.currencyOptions = result.data.selectedCurrencyOptions;
        $scope.journalEntryForm.currencyCode = result.data.base;
    });
    //Get all code values
    JournalService.getData(REST_URL.CODE_LIST + '/12/codevalues').then(function (result) {
        if (result.data.length > 0) {
            $scope.journalEntryForm.paymentTypeId = result.data[0].id;
        }
        $scope.paymentTypes = result.data;
    });
    JournalService.getData(REST_URL.OFFICE_LIST).then(function (result) {
        $scope.offices = result.data;
        $scope.journalEntryForm.officeId = $scope.offices[0].id;
    });

    //events for credits
    $scope.addCrAccount = function () {
        $scope.journalEntryForm.crAccounts.push({});
    };

    $scope.removeCrAccount = function (index) {
        if (1 < $scope.journalEntryForm.crAccounts.length) {
            $scope.journalEntryForm.crAccounts.splice(index, 1);
        }
        $scope.changeCreditOptions();
    };

    //events for debits
    $scope.addDebitAccount = function () {
        $scope.journalEntryForm.dbAccounts.push({});
    };

    $scope.removeDebitAccount = function (index) {
        if (1 < $scope.journalEntryForm.dbAccounts.length) {
            $scope.journalEntryForm.dbAccounts.splice(index, 1);
        }
        $scope.changeDebitOptions();
    };

    //Validate create journalentry
    $scope.validateJournalEntry = function () {
        $scope.type = '';
        $scope.message = '';
        $scope.errors = '';
        console.log('CreateJournalEntriesCtrl : validateJournalEntry');
        if ($scope.createjournalentryForm.$valid) {
            $scope.saveJournalEntry();
        } else {
            $scope.invalidateForm();
            $scope.type = 'error';
            $scope.message = 'Highlighted fields are required';
            $('html, body').animate({scrollTop: 0}, 800);
        }
    };
    //invalidate login form
    $scope.invalidateForm = function () {
        $scope.createjournalentryForm.invalidate = false;
    };

    //Start - Save Journal Entry
    $scope.saveJournalEntry = function () {
        console.log('CreateJournalEntriesCtrl : saveJournalEntry');
        $scope.saveInProgress = true;
        var jeTransaction = new Object({});
        //jeTransaction.transactionDate = moment(this.journalEntryForm.transationDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
        jeTransaction.transactionDate = Utility.toServerDate(this.journalEntryForm.transationDate);
        jeTransaction.locale = 'en';
        jeTransaction.opening = this.journalEntryForm.opening;
        jeTransaction.dateFormat = APPLICATION.DF_MIFOS;
        jeTransaction.officeId = this.journalEntryForm.officeId;
        //jeTransaction.transactionDate = this.journalEntryForm.transactionDate ;
        jeTransaction.referenceNumber = this.journalEntryForm.referenceNumber;
        jeTransaction.comments = this.journalEntryForm.comments;
        jeTransaction.currencyCode = this.journalEntryForm.currencyCode;
        jeTransaction.paymentTypeId = this.journalEntryForm.paymentTypeId;
        jeTransaction.accountNumber = this.journalEntryForm.accountNumber;
        jeTransaction.checkNumber = this.journalEntryForm.checkNumber;
        jeTransaction.routingCode = this.journalEntryForm.routingCode;
        jeTransaction.receiptNumber = this.journalEntryForm.receiptNumber;
        jeTransaction.bankNumber = this.journalEntryForm.bankNumber;
        jeTransaction.unidentifiedEntry = this.journalEntryForm.unidentifiedEntry;

        //Construct credits array
        jeTransaction.credits = [];
        for (var i = 0; i < this.journalEntryForm.crAccounts.length; i++) {
            var temp1 = new Object({});
            if (this.journalEntryForm.crAccounts[i].select) {
                temp1.glAccountId = this.journalEntryForm.crAccounts[i].select.id;
            }
            temp1.amount = this.journalEntryForm.crAccounts[i].crAmount;
            if (temp1.glAccountId) {
                jeTransaction.credits.push(temp1);
            }
        }
        //construct debits array
        jeTransaction.debits = [];
        for (var j = 0; j < this.journalEntryForm.dbAccounts.length; j++) {
            var temp2 = new Object({});
            if (this.journalEntryForm.dbAccounts[j].select) {
                temp2.glAccountId = this.journalEntryForm.dbAccounts[j].select.id;
            }
            temp2.amount = this.journalEntryForm.dbAccounts[j].debitAmount;
            if (temp2.glAccountId) {
                jeTransaction.debits.push(temp2);
            }
        }

        var saveJournalEntrySuccess = function () {
            console.log('Success : Return from JournalService service.');
            $scope.saveInProgress = false;
            $scope.type = 'alert-success';
            $scope.message = 'Journal Entry saved successfully';
            $location.path(PAGE_URL.JOURNALENTRIES);
        };

        var saveJournalEntryFail = function (result) {
            console.log('Error : Return from JournalService service.');
            $scope.saveInProgress = false;
            $scope.type = 'error';
            $scope.message = 'Journal Entry not saved: ' + result.data.defaultUserMessage;
            $scope.errors = result.data.errors;
            if (result.data.errors && result.data.errors.length) {
                for (var i = 0; i < result.data.errors.length; i++) {
                    $('#' + $scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
                }
            }
            $('html, body').animate({scrollTop: 0}, 800);
        };
        var json = angular.toJson(jeTransaction);
        console.log(json);
        var url = REST_URL.JOURNALENTRIES;
        JournalService.saveJournalEntry(url, json).then(saveJournalEntrySuccess, saveJournalEntryFail);
    };
    //Finish - Save Journal Entry
});


angular.module('angularjsApp').controller('MoveToProfitDialogController', function ($scope, APPLICATION, REST_URL, JournalService, $location, PAGE_URL, Utility, $modalInstance) {
    console.log('MoveToProfitDialogController');
    $scope.isLoading = false;
    $scope.formData = {};

    //For date of transaction calendar
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
    };

    //Get all acounts
    JournalService.getData(REST_URL.GLACCOUNTS + '?disabled=false&manualEntriesAllowed=true&usage=1').then(function (data) {
        $scope.glAccounts = data.data;
    });
    //Get all currency
    JournalService.getData(REST_URL.CURRENCY_LIST + '?fields=selectedCurrencyOptions,base').then(function (result) {
        $scope.currencyOptions = result.data.selectedCurrencyOptions;
        $scope.formData.currencyCode = result.data.base;
    });

    $scope.submit = function () {
        if ($scope.formData && $scope.formData.creditAccount && $scope.formData.creditAccount.id && $scope.formData.note) {
			$modalInstance.close({glAccount: $scope.formData.creditAccount.id, note: $scope.formData.note});
		}
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    //Finish - Save Journal Entry
});

