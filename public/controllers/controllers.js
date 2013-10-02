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
            templateUrl: '/partials/edit.html',
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
            controller: 'viewController',
            templateUrl: '/partials/view.html',
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

            $scope.location = $scope.user.location;
            $scope.addAlert = function () {
                
                var postData = {
                    item: $scope.item,
                    location: $scope.location,
                    number: $scope.number,
                    id: Math.guid()
                }
                $http.post('/alerts/' + postData.id, postData)
                $scope.message = "Alert added"
                $scope.item = "";
                $scope.number = "";
            }

        }])


alertModule
    .controller('viewController', ['$scope', '$http', '$routeParams', 
        function ($scope, $http, $routeParams) {
            
            $scope.message = "";
            
            $http.get('/alerts/' + $routeParams.id).success(function(data){
                $scope.alert = data;
            })

            $scope.editAlert = function (alert) {
                var putData = {
                    item: alert.item,
                    location: alert.location,
                    number: alert.number
                }
                $http.put('/alerts/' + alert.id, putData).then(function() {
                    
                })
                $scope.message ="Alert updated";
            }
        }])

alertModule
    .controller('editAccountController', ['$scope', '$http', 'user',
        function ($scope, $http, user) {
      
            $scope.message = "";
            $scope.user = user.data;

            $scope.location = $scope.user.location;

            $scope.editAccount = function(){
                var putData = {
                    location: $scope.location
                };
                $scope.user.location = $scope.location;
                
                $http.put('/user', putData).then(function(){
                    
                });
              $scope.message = "Account updated";  
    }
}])


    alertModule
    .controller('sentAlertController', ['$scope', '$http', '$routeParams', 
        function ($scope, $http, $routeParams) {
            
            $scope.message = "";

            if (!$scope.user){
                $location.path('/login')
            }
            
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
                $http.post('/alerts/' + postData.id, postData).then(function() {
                    
                })
                $scope.message ="Alert saved";
            }
        }])

Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}