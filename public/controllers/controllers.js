var alertModule = angular.module('alertModule', []);

alertModule.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: '/partials/home.html'
        }).
        when('/account', {
            controller: 'listController',
            templateUrl: '/partials/account.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
                }
            }
        }).
        when('/account/add', {
            controller: 'addController',
            templateUrl: '/partials/add.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/edit', {
            controller: 'editAccountController',
            templateUrl: '/partials/editaccount.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/sent', {
            controller: 'sentAlertsController',
            templateUrl: '/partials/sent.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/sent/:id',{
            controller: 'sentAlertController',
            templateUrl: '/partials/sentalert.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/:id', {
            controller: 'editAlertController',
            templateUrl: '/partials/editalert.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/template/add', {
            controller: 'templateAddController',
            templateUrl: '/partials/templateadd.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/account/template/:id', {
            controller: 'templateEditController',
            templateUrl: '/partials/templateedit.html',
            resolve: {
                user: function(userGetter){
                    return userGetter.currentUser();
            }}
        }).
        when('/login/', {
             templateUrl:'/partials/login.html'
        }).
        otherwise({
            redirectTo: '/'
    });
}]);

alertModule.factory('userGetter', ['$http', '$location', function ($http, $location) {
    var userGetter = {
        currentUser: function(){
            return $http.get('/currentuser')
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

alertModule
    .controller('authController', ['$scope', '$rootScope', '$location', 'userGetter',
        function($scope, $rootScope, $location, userGetter){
            userGetter.currentUser().then(function(response){
                $scope.user = response.data;
            })

             $rootScope.$on('$routeChangeError', function(){
                $location.path('/login')
            });

            $scope.isSignedIn = function(){
                return !!$scope.user;
            }
        }])

alertModule
    .controller('listController', ['$scope', '$http', '$location', 'alertsGetter',
        function ($scope, $http, $location, alertsGetter) {

        alertsGetter.getActiveAlerts().then(function(response){
            $scope.alerts = response.data;
        })

        $scope.removeAlert = function(alert){
            $scope.alerts.forEach(function (item, i) {
                    if (alert.id === item.id && $scope.alerts.length > 0) {
                        $http.delete('/alerts/' + item.id);
                        $scope.alerts.splice(i, 1);
                    }
                })
            }

        $scope.sendAlert = function(alert){
            $scope.alerts.forEach(function (item, i) {
                    if (alert.id === item.id && $scope.alerts.length > 0) {
                        $http.post('sendalert/' + alert.id)
                        $scope.alerts.splice(i, 1);
                    }
                })
            }
        }])

alertModule
    .controller('sentAlertsController', ['$scope', 'alertsGetter', '$location', 
        function ($scope, alertsGetter, $location, $rootScope) {
            alertsGetter.getSentAlerts().then(function(response){
                $scope.alerts = response.data;
            })
        }])


alertModule
    .controller('addController', ['$scope', '$http', 
        function($scope, $http, $rootScope){

            $scope.message = "";
                          
            $http.get('/templates').success(function(data){
                $scope.templates = data.templates;
                $scope.activetemplate = data.templates[0]
            })

            $scope.changeActiveTemplate = function(template){
                $scope.activetemplate = template;
            }

            $scope.location = $scope.user.location;
            $scope.addAlert = function () {
                
                var postData = {
                    item: $scope.item,
                    location: $scope.location,
                    number: $scope.number,
                    id: Math.guid(),
                    template: $scope.activetemplate._id
                }
                $http.post('/alerts/' + postData.id, postData)
                $scope.message = "Alert added"
                $scope.item = "";
                $scope.number = "";
            }

        }])


alertModule
    .controller('editAlertController', ['$scope', '$http', '$routeParams', 
        function ($scope, $http, $routeParams) {
            
            $scope.message = "";
            
            $http.get('/alerts/' + $routeParams.id).success(function(data){
                $scope.alert = data;
                $scope.activetemplate = data.template[0];
            })

            $http.get('/templates').success(function(data){
                $scope.templates = data.templates;
            })

            $scope.changeActiveTemplate = function(template){
                $scope.activetemplate = template;
            }

            $scope.editAlert = function (alert) {
                var putData = {
                    item: alert.item,
                    location: alert.location,
                    number: alert.number,
                    template: $scope.activetemplate._id
                }
                $http.put('/alerts/' + alert.id, putData);
                $scope.message ="Alert updated";
            }
        }])

alertModule
    .controller('editAccountController', ['$scope', '$http', 'user',
        function ($scope, $http, user) {
            
            $http.get('/templates').success(function(data){
                $scope.templates = data.templates;
            })

            $scope.message = "";
            $scope.user = user.data;

            $scope.editAccount = function(){
                var putData = {
                    location: $scope.user.location
                };
                $http.put('/user', putData);
                $scope.message = "Account updated";  
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
                $http.post('/alerts/' + postData.id, postData);
                $scope.message ="Alert saved";
            }
        }])

    alertModule
    .controller('templateAddController', ['$scope', '$http', 
        function($scope, $http){

            $scope.message = "";
            $scope.title = "";
            $scope.template = "";
            
            $scope.addTemplate = function () {
                
                var postData = {
                    title: $scope.title,
                    content: $scope.content,
                    id: Math.guid()
                }
                $http.post('/templates', postData)
                $scope.message = "Template added"
                $scope.template = "";
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
                $http.put('/templates/' + $routeParams.id, putData);
                $scope.message = "Template updated";
            }
        }])

Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}