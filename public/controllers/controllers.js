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
        when('/account/reminder', {
            controller: 'viewController',
            templateUrl: '/partials/view.html'
        }).
        when('/login/', {
            controller: 'loginController',
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


alertModule.factory('AlertGetter', ['$http',
    function ($http) {
        return {
            get: function (callback) {
                $http.get('/alerts').success(function (data, status, headers, config) {
                    callback(data)
                })
            }
        }
    }
])
alertModule
    .controller('authController', ['$scope', '$http', 'Authentication',
        function($scope, $http, Authentication){
            $scope.Authentication = Authentication;
        }])

alertModule
    .controller('listController', ['$scope', '$http', 'AlertGetter',
        function ($scope, $http, AlertGetter) {
            $scope.alerts = [];
            AlertGetter.get(function (data){
                alerts = $scope.alerts = data;
            })
        

        $scope.removeAlert = function(alert){

        }

        $scope.sendAlert = function(alert){

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
                $scope.message = "Item added"
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

                $scope.alert = [];
                $scope.message = item.name + " removed";
                
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