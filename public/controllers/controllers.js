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
      }
    };
  });


alertModule.factory('AlertGetter', ['$http', function ($http) {
    var AlertGetter = {
        get: function(){
            var promise = $http.get('/alerts').then(function(response) {
                return response.data;
            });
            return promise;
        }
    };
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
            if (Authentication.isSignedIn()){
                AlertGetter.get().then(function(alerts){
                $scope.alerts = alerts;
                })
            }
            else { $location.path('/login') }
            
        $scope.removeAlert = function(alert){

            $scope.alerts.forEach(function (item, i) {
                    if (alert.id === item.id && $scope.alerts.length > 0) {
                        $http.delete('/alerts/' + item.id);
                        $scope.alerts.splice(i, 1);
                    }
                })
        }

        $scope.sendAlert = function(alert){
            var postData = {}
            postData.id = alert.id;
            $http.post('sendalert/' + alert.id)
            $scope.alerts.splice(i, 1);
            }
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
            
            $http.get('/alerts/' + $routeParams.id).success(function(data){
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
        }
    ])

Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}