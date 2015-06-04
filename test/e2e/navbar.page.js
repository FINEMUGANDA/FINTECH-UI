'use strict';

module.exports = Object.create({}, {
    navMenu: {
        value: Object.create({}, {
            home: {
                value: function () {
                    return element(by.css('.navbar')).element(by.linkText('Home'));
                }
            },
            clients: {
                value: function () {
                    return element(by.css('.navbar')).element(by.linkText('Clients'));                    
                }
            }
        })
    },
//    TODO: Add access to Search and Notification functionality 
//    search: {
//    },
//    notifications: {
//    },
    userMenu: {
        value: Object.create({}, {
            logout: {
                value: function () {
                    element(by.binding('username')).click();
                    element(by.linkText('Logout')).click();
                }
            }
        })
    }
});
