var app = angular.module('book_publishing', ['ngResource','ngRoute'])

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/persons', {
            templateUrl: 'partials/persons.html',
            controller: 'PersonsCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('PersonsCtrl', ['$scope', '$resource', 
    function($scope, $resource) {
        var Persons = $resource('/api/persons');
        Persons.query(function(persons) {
            $scope.persons = persons;
        });
    }
]);
