var alertModule = angular.module('alertModule', []);

alertModule.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: '/partials/home.html'
        }).
        when('/account', {
            controller: 'listController',
            templateUrl: '/partials/account.html'
        }).
        when('/account/add', {
            controller: 'addController',
            templateUrl: '/partials/add.html'
        }).
        when('/account/edit', {
            controller: 'editAccountController',
            templateUrl: '/partials/edit.html'
        }).
        when('/account/sent', {
            controller: 'sentAlertsController',
            templateUrl: '/partials/sent.html'
        }).
        when('/account/:id', {
            controller: 'viewController',
            templateUrl: '/partials/view.html'
        }).
        when('/login/', {
             templateUrl:'/partials/login.html'
        }).
        otherwise({
            redirectTo: '/'
    });
}]);

alertModule.factory('Authentication', function(){
    var current_user = window.user;
    return {
      currentUser: function() {
        return current_user;
      },
      isSignedIn: function() {
        return !!current_user;
      },
      updateCurrentUserLocation: function(location){
        current_user.location = location;
      }
    };
  });


alertModule.factory('AlertGetter', ['$http', 'Authentication', '$location', function ($http, Authentication, $location) {
    var AlertGetter = {
        getActiveAlerts: function(){
            if (Authentication.isSignedIn()){
                var promise = $http.get('/alerts').then(function(response) {
                    return response.data;
                });
                return promise;
            }
            else { $location.path('/login')}
        },
        getSentAlerts: function(){
            if (Authentication.isSignedIn()) {
                var promise = $http.get('/sentalerts').then(function(response){
                    return response.data;
                });
                return promise;
            }
            else { $location.path('/login')} 
            }
        }
    return AlertGetter
}]);


alertModule
    .controller('authController', ['$scope', '$http', 'Authentication',
        function($scope, $http, Authentication){
            $scope.Authentication = Authentication;
        }])

alertModule
    .controller('listController', ['$scope', '$http', '$location', 'Authentication', 'AlertGetter',
        function ($scope, $http, $location, Authentication, AlertGetter) {
            
            AlertGetter.getActiveAlerts().then(function(alerts){
                $scope.alerts = alerts;
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
    .controller('sentAlertsController', ['$scope', 'Authentication', 'AlertGetter', '$location',
        function ($scope, Authentication, AlertGetter, $location) {
        
             AlertGetter.getSentAlerts().then(function(alerts){
                $scope.alerts = alerts;
             })
        
    }])


alertModule
    .controller('addController', ['$scope', 'Authentication', '$http', '$location',
        function($scope, Authentication, $http, $location){

            $scope.message = "";

            if (!Authentication.isSignedIn()){
                $location.path('/login') 
            }
            
            $scope.location = Authentication.currentUser().location;
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
    .controller('viewController', ['$scope', '$http', 'Authentication', '$routeParams', 
        function ($scope, $http, Authentication, $routeParams) {
            
            $scope.message = "";

             if (!Authentication.isSignedIn()){
                $location.path('/login') 
            }
            
            $http.get('/alerts/' + $routeParams.id).then(function(data){
                console.log(data);
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
    .controller('editAccountController', ['$scope', '$http', 'Authentication', 
        function ($scope, $http, Authentication) {
      
            $scope.message = "";

            if (!Authentication.isSignedIn()){
                $location.path('/login') 
            }

            $scope.location = Authentication.currentUser().location;

            $scope.editAccount = function(){
                var putData = {
                    location: $scope.location
                };
                Authentication.updateCurrentUserLocation($scope.location)
                $http.put('/user', putData).then(function(){
                    
                });
              $scope.message = "Account updated";  
            }
}])

Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}