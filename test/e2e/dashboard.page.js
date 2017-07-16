'use strict';


var DashboardPage = function () {
};

// instead of hardcoding URLs, page objects can have one attached to them
DashboardPage.URL = '/dashboard';

DashboardPage.prototype = Object.create({}, {
    shortcuts: {
        value: Object.create({}, {
            newClient: {
                value: function () {
                    return element(by.css('.shortcuts'))
                        .element(by.linkText('New Client'));
                }
            },
            newLoan: {
                value: function () {
                    return element(by.css('.shortcuts'))
                        .element(by.linkText('New Loan'));
                }
            },
            newRepayment: {
                value: function () {
                    return element(by.css('.shortcuts'))
                        .element(by.linkText('New Repayment'));
                }
            },
            newNote: {
                value: function () {
                    return element(by.css('.shortcuts'))
                        .element(by.linkText('New Note'));
                }
            }
        })
    }
});

module.exports = DashboardPage;
