'use strict';

// Proof of concept: Sharing of the Header functionality via inheritance.
// So far it looks like it might not worth it because of cumbersome way of replicating traditional inheritance in JS

var util = require('util');

var BasePage = require('./base.page.js');

var DashboardPage = function () {
    BasePage.call(this);
};

// instead of hardcoding URLs, page objects can have one attached to them
DashboardPage.URL = '/dashboard';

// In contrast to LoginPage, DashboardPage's prototype is not created using `Object.create`, but inherited from BasePage and than extended.
util.inherits(DashboardPage, BasePage);

// Define additional properties on the prototype inherited from 
Object.defineProperties(DashboardPage.prototype, {
    shortcuts: {
        value: Object.create({}, {
            newClient: {
                value: function () {
                    return element(by.css('.shortcuts'))
                           .element(by.linkText('New Client'))
                }
            },
            newLoan: {
                value: function () {
                    return element(by.css('.shortcuts'))
                           .element(by.linkText('New Loan'))
                }
            },
            newRepayment: {
                value: function () {
                    return element(by.css('.shortcuts'))
                           .element(by.linkText('New Repayment'))
                }
            },
            newNote: {
                value: function () {
                    return element(by.css('.shortcuts'))
                           .element(by.linkText('New Note'))
                }
            }
        })
    }
});

module.exports = DashboardPage;
