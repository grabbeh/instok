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
        when('/account/alert', {
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
                console.log(response.data)
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
                    if (alert.id === item.id && alerts.length > 0) {
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
    .controller('addController', ['$scope', '$http', 
        function($scope, $http){

            $scope.message = "";
            
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
                $scope.location = "";
                $scope.number = "";
            }

        }])


alertModule
    .controller('viewController', ['$scope', '$http', '$routeParams', 'AlertGetter',
        function ($scope, $http, $routeParams, AlertGetter) {
            $scope.alerts = [];
            $scope.message = "";
            $scope.newalert = "";
             $http.get('/alerts/' + $routeParams.id).success(function(data){
                $scope.alert = data;
            })

            $scope.removeAlert = function(alert) {
                $http.delete('/alerts/' + item.id).success(function () {});
            }

            $scope.addAlert = function () {
                var id = Math.guid();
                var name = $scope.newalert;
                var postData = {
                    name: name,
                    id: id
                }
                $scope.alerts.push(postData);
                $http.post('/alerts/' + postData.id, postData)
                $scope.newalert = "";
            }

            $scope.editAlert = function (alert) {
                $scope.editAlerty = alert;
            }

            $scope.doneEditing = function (alert) {
                $scope.editAlerty = null;
                var putData = {
                    name: alert.name,
                    id: alert.id
                }
                $http.put('/alerts/' + alert.id, putData).success(function () {})
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