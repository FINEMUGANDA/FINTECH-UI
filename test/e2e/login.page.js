'use strict';

var LoginPage = function () {
    browser.get('/');
};

LoginPage.prototype = Object.create({}, {
    username: {
        get: function () {
            return element(by.model('loginDetails.username'));
        }
    },
    password: {
        get: function () {
            return element(by.model('loginDetails.password'));
        }
    },
    loginButton: {
        get: function () {
            return element(by.buttonText('Login'));
        }
    },
    login: {
        value: function (username, password) {
            this.username.sendKeys(username);
            this.password.sendKeys(password);
            this.loginButton.click();
        }
    },
    defaultLogin: {
        value: function () {
            this.login(browser.params.login.username, browser.params.login.password);
        }
    }
});

module.exports = LoginPage;
