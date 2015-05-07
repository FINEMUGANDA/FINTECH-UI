'use strict';

// One possible way to abstract a header into a re-usable component (more of a traditional Object Oriented one).
// "Abstract" Page Object wich declares all the header elements and from which every other Page Object inherits.
// Inheritence can be ditched and this constructor function can be rewritten as a "singleton" object with all the same functions. 

var BasePage = function () {
};

BasePage.prototype = Object.create({}, {
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

module.exports = BasePage;
