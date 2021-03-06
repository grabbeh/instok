var alertModule = angular.module('alertModule', ['angularPayments']);

alertModule.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: '/partials/home.html',
            controller: 'signupController'
        }).
        when('/account', {
            controller: 'accountController',
            templateUrl: '/partials/account.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
                },
                alerts: function(alertsGetter){
                    return alertsGetter.getActiveAlerts();
                }
            }
        }).
        when('/account/add', {
            controller: 'addController',
            templateUrl: '/partials/add.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
                },
                templates: function(templatesGetter){
                    return templatesGetter.getTemplates();
                }
         }
        }).
        when('/account/edit', {
            controller: 'editAccountController',
            templateUrl: '/partials/editaccount.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
                },
                templates: function(templatesGetter){
                    return templatesGetter.getTemplates();
                }
        }
        }).
        when('/account/sent', {
            controller: 'sentAlertsController',
            templateUrl: '/partials/sent.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
                },
                alerts: function(alertsGetter){
                    return alertsGetter.getSentAlerts();
                }
            },
        }).
        when('/account/sent/:id',{
            controller: 'sentAlertController',
            templateUrl: '/partials/sentalert.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
            }}
        }).
        when('/account/:id', {
            controller: 'editAlertController',
            templateUrl: '/partials/editalert.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
                },
                templates: function(templatesGetter){
                    return templatesGetter.getTemplates();
                }
         }
        }).
        when('/account/template/add', {
            controller: 'templateAddController',
            templateUrl: '/partials/templateadd.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
            }}
        }).
        when('/account/template/:id', {
            controller: 'templateEditController',
            templateUrl: '/partials/templateedit.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
            }}
        }).
        when('/account/credit/add', {
            controller: 'creditAddController',
            templateUrl: '/partials/addcredit.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.signedIn();
            }}
        }).
        when('/login/', {
             templateUrl:'/partials/login.html',
             controller: 'loginController'
        }).
        when('/signup/', {
            templateUrl:'/partials/signup.html',
            controller: 'signupController'
        }).
        when('/terms', {
            templateUrl:'/partials/terms.html'
        }).
        otherwise({
            redirectTo: '/'
    });
}]);

alertModule.factory('userGetter', ['$http', function ($http) {
    var userGetter = {
        currentUser: function(){
            return $http.get('/currentuser')
        },
        signedIn: function(){
            return $http.get('/signedin')
        }
    }
    return userGetter
}]);

alertModule.factory('alertsGetter', ['$http', function ($http) {
    var alertsGetter = {
        getActiveAlerts: function(){
            return $http.get('/alerts');
        },
        getSentAlerts: function(){
            return $http.get('/sentalerts');
        }
    }
    return alertsGetter;
}]);

alertModule.factory('templatesGetter', ['$http', function ($http) {
    var templatesGetter = {
        getTemplates: function(){
            return $http.get('/templates');
        }
    }
    return templatesGetter;
}]);

alertModule
    .controller('authController', ['$scope', '$rootScope', '$http', '$location', 'userGetter',
        function($scope, $rootScope, $http, $location, userGetter){
            userGetter.currentUser().then(function(response){
                $rootScope.user = response.data;
            })

             $rootScope.$on('$routeChangeError', function(){
                $location.path('/login')
            });

            $scope.isSignedIn = function(){
                return !!$scope.user;
            }

            $scope.logout = function(){
                $http.get('/logout').success(function(){
                    $rootScope.user = null;
                    $location.path('/');
                })
                }
        }])

alertModule
    .controller('loginController', ['$scope', '$http', '$location', '$rootScope', 'userGetter',
        function($scope, $http, $location, $rootScope, userGetter){
            $scope.message = "";

            $scope.login = function(){
                var postData = {
                    username: $scope.username,
                    password: $scope.password
                }

                $http.post('/login', postData)
                    .success(function(){
                       userGetter.currentUser().then(function(response){
                            $rootScope.user = response.data;
                            $location.path('/account');
                        })
                    })
                    .error(function(data){
                        $scope.message = data.message;
                    });
                }
            }])

alertModule
    .controller('signupController', ['$scope', '$http', '$location', '$rootScope', 'userGetter',
        function($scope, $http, $location, $rootScope, userGetter){
            $scope.message = "";

            $scope.signup = function(){
                $scope.message = "";
                if (!$scope.username || !$scope.password ){
                    $scope.message = "Please provide both a username and password";
                    return;
                }
                var postData = {
                    username: $scope.username,
                    password: $scope.password,
                    location: $scope.location
                }

                $http.post('/signup', postData)
                .success(function(){
                    userGetter.currentUser().then(function(response){
                        $rootScope.user = response.data;
                        $location.path('/account');
                    })
                })
                .error(function(data){
                    $scope.message = data.message;
                });
            }

        }])


alertModule
    .controller('accountController', ['$scope', '$http', '$location', 'alerts', '$rootScope',
        function ($scope, $http, $location, alerts, $rootScope) {

        $scope.message = false;
        $scope.alerts = alerts.data;

        $scope.removeAlert = function(alert){
            $scope.alerts.forEach(function (item, i) {
                    if (alert.id === item.id && $scope.alerts.length > 0) {
                        $http.delete('/alerts/' + item.id);
                        $scope.alerts.splice(i, 1);
                    }
                })
            }

        $scope.sendAlert = function(alert){

            if ($scope.user.credits === 0){
                $scope.message = "You'll need to add credits to send any alerts";
                return;
            }

            $scope.alerts.forEach(function (item, i) {
                $scope.message = false;
                    if (alert.id === item.id && $scope.alerts.length > 0) {
                        var postData = { creditsremaining: $scope.user.credits - 1 };

                        $http.post('sendalert/' + alert.id, postData)
                            .success(function(data){
                                $scope.message = data.message;
                                $rootScope.user.credits = data.creditsremaining;
                                $scope.alerts.splice(i, 1);
                            })
                            .error(function(data){
                                $scope.message = data.error;
                                $rootScope.user.credits = data.creditsremaining;
                            })
                        }
                    })
                }

        $scope.removeMessage = function(){
            $scope.message = false;
        }
        }])

alertModule
    .controller('sentAlertsController', ['$scope', 'alerts', '$location', 
        function ($scope, alerts, $location) {
          $scope.alerts = alerts.data;
        }])


alertModule
    .controller('addController', ['$scope', 'templates', '$http', '$rootScope',
        function($scope, templates, $http, $rootScope){

            $scope.message = "";
  
            $scope.templates = templates.data;  

            $scope.changeActiveTemplate = function(template){
               $scope.content = template.content;
            }

            $scope.location = $rootScope.user.location;
            
            $scope.addAlert = function () {
                if (!$scope.item || !$scope.location || !$scope.number || !$scope.content){
                    $scope.message = "Please complete all fields";
                    return;
                }
                var postData = {
                    item: $scope.item,
                    location: $scope.location,
                    number: $scope.number,
                    id: Math.guid(),
                    content: $scope.content
                }

                $http.post('/alerts/' + postData.id, postData).success(function(data){
                    $scope.message = data.message;
                    $scope.item = "";
                    $scope.number = "";
                })
            }

            $scope.removeTemplate = function(template){
                $scope.templates.forEach(function (item, i) {
                        if (template.id === item.id && $scope.templates.length > 0) {
                            $http.delete('/templates/' + template.id);
                            $scope.templates.splice(i, 1);
                        }
                    })
            }

        }])


alertModule
    .controller('editAlertController', ['$scope', 'templates', '$http', '$routeParams', 
        function ($scope, templates, $http, $routeParams) {
            
            $scope.message = "";
            
            $http.get('/alerts/' + $routeParams.id).success(function(data){
                $scope.alert = data;
            })

            $scope.templates = templates.data

            $scope.changeActiveTemplate = function(template){
                $scope.alert.content = template.content;
            }

            $scope.editAlert = function (alert) {
                var putData = {
                    item: alert.item,
                    location: alert.location,
                    number: alert.number,
                    content: alert.content
                }
                $http.put('/alerts/' + alert.id, putData).success(function(data){
                    $scope.message = data.message;
                });
            }
        }])

alertModule
    .controller('editAccountController', ['$scope', 'templates', '$http', '$rootScope',
        function ($scope, templates, $http, $rootScope) {

            $scope.templates = templates.data;
            $scope.message = "";
            $scope.user = $rootScope.user;

            $scope.editAccount = function(){
                var putData = {
                    location: $scope.user.location
                };
                $http.put('/user', putData).success(function(data){
                    $scope.message = data.message; 
                });
            }

            $scope.removeTemplate = function(template){
                $scope.templates.forEach(function (item, i) {
                        if (template.id === item.id && $scope.templates.length > 0) {
                            $http.delete('/templates/' + template.id);
                            $scope.templates.splice(i, 1);
                        }
                    })
            }
        }])


    alertModule
    .controller('sentAlertController', ['$scope', '$http', '$routeParams', 
        function ($scope, $http, $routeParams) {
            
            $scope.message = "";
            $http.get('/alerts/' + $routeParams.id).success(function(data){
                $scope.alert = data;
            })

            $scope.addAlert = function (alert) {
                var postData = {
                    item: alert.item,
                    location: alert.location,
                    number: alert.number,
                    id: Math.guid()
                }
                $http.post('/alerts/' + postData.id, postData).success(function(data){
                    $scope.message = data.message;
                });
            }
        }])

    alertModule
    .controller('templateAddController', ['$scope', '$http', 
        function($scope, $http){

            $scope.message = "";
            $scope.title = "";
            $scope.template = "";
            
            $scope.addTemplate = function () {
                if (!$scope.title || !$scope.content){
                    $scope.message = "Please complete all fields";
                    return;
                }
                var postData = {
                    title: $scope.title,
                    content: $scope.content,
                    id: Math.guid()
                }
                $http.post('/templates', postData).success(function(data){
                    $scope.message = data.message;
                    $scope.template = "";
                })
            }
        }])

    alertModule
    .controller('templateEditController', ['$scope', '$http', '$routeParams',
        function($scope, $http, $routeParams){
            $scope.message = "";

            $http.get('/templates/' + $routeParams.id).success(function(template){
                $scope.template = template;
            })

            $scope.editTemplate = function () {
                var putData = {
                    title: $scope.template.title,
                    content: $scope.template.content
                }
                $http.put('/templates/' + $routeParams.id, putData).success(function(data){
                    $scope.message = data.message;
                });
            }
        }])

    alertModule
    .controller('creditAddController', ['$scope', '$http',
        function($scope, $http){
            $scope.credits = 20;
            $scope.$watch('credits', function(){
                $scope.GBP = $scope.credits * 0.1;
            })

            $scope.message = "";
            $scope.handleStripe = function(status, response){

                if ($scope.credits < 20){
                    $scope.message = "We're afraid the minimum purchase is 20 credits";
                    return;
                }
                $scope.message = "Payment process started";
                $scope.hidebutton = true;

                if(response.error) {
                    $scope.message = response.error.message;

                } else {
                  $scope.number = "";
                  $scope.expiry = "";
                  $scope.cvc = "";

                  var token = response.id;
                  var amount = $scope.GBP * 100;

                  var postData = {
                      token: token,
                      amount: amount,
                      credits: $scope.credits
                  }
                  $http.post('/addcredit', postData).success(function(data){
                        $scope.message = data;
                  })
                }
            }
        }])

Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}
