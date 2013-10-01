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
        when('/account/sent/:id',{
            controller: 'sentAlertController',
            templateUrl: '/partials/sentalert.html'
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

alertModule.factory('AlertGetter', ['$http', '$location', function ($http, $location) {
    var AlertGetter = {
        getActiveAlerts: function(){
            var promise = $http.get('/alerts').then(function(response) {
                return response.data;
            });
            return promise;
        },
        getSentAlerts: function(){
            var promise = $http.get('/sentalerts').then(function(response){
                return response.data;
            });
            return promise;
            }
        }
    return AlertGetter
}]);

alertModule
    .controller('authController', ['$http', '$rootScope', '$location',
            function($http, $rootScope, $location){
                if (!$rootScope.user) {
                $http.get('/currentuser').success(function(response){
                        $rootScope.user = response;
                    })
                }

                $rootScope.isSignedIn = function(){
                    return !!$rootScope.user;
                }
            }])

alertModule
    .controller('listController', ['$scope', '$http', '$location', 'AlertGetter', '$rootScope',
        function ($scope, $http, $location, AlertGetter, $rootScope) {

        if (!$rootScope.isSignedIn()){
            $location.path('/login')
        }

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
    .controller('sentAlertsController', ['$scope', 'AlertGetter', '$location', '$rootScope',
        function ($scope, AlertGetter, $location, $rootScope) {
        
            if (!$rootScope.isSignedIn()){
            $location.path('/login')
            }


            AlertGetter.getSentAlerts().then(function(alerts){
                $scope.alerts = alerts;
            })
        }])


alertModule
    .controller('addController', ['$scope', '$http', '$rootScope',
        function($scope, $http, $rootScope){

            $scope.message = "";

            if (!$rootScope.isSignedIn()){
                $location.path('/login')
            }

            $scope.location = $rootScope.user.location;
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
    .controller('viewController', ['$scope', '$http', '$routeParams', '$rootScope',
        function ($scope, $http, $routeParams, $rootScope) {
            
            $scope.message = "";

            if (!$rootScope.isSignedIn()){
                $location.path('/login')
            }
            
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
    .controller('editAccountController', ['$scope', '$http', '$rootScope',
        function ($scope, $http, $rootScope) {
      
            $scope.message = "";

            if (!$rootScope.isSignedIn()){
                 $location.path('/login')
            }

            $scope.location = $rootScope.user.location;

            $scope.editAccount = function(){
                var putData = {
                    location: $scope.location
                };
                $rootScope.user.location = $scope.location;
                
                $http.put('/user', putData).then(function(){
                    
                });
              $scope.message = "Account updated";  
            }
}])


    alertModule
    .controller('sentAlertController', ['$scope', '$http', '$routeParams', '$rootScope',
        function ($scope, $http, $routeParams, $rootScope) {
            
            $scope.message = "";

            if (!$rootScope.isSignedIn()){
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