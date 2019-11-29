var app = angular.module('book_publishing', ['ngResource','ngRoute'])

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/authors', {
            templateUrl: 'partials/authors.html',
            controller: 'AuthorsCtrl'
        })
        .when('/books', {
            templateUrl: 'partials/books.html',
            controller: 'BooksCtrl'
        })
        .when('/books/:id', {
            templateUrl: 'partials/book.html',
            controller: 'BookCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('AuthorsCtrl', ['$scope', '$resource', 
    function($scope, $resource) {
        var Authors = $resource('/api/authors');        
        Authors.query(function(authors) {
            $scope.authors = authors;
        });
    }
]);

app.controller('BooksCtrl', ['$scope', '$resource', 
    function($scope, $resource) {
        var Books = $resource('/api/books');
        Books.query(function(books) {
            $scope.books = books;
        });
    }
]);

app.controller('BookCtrl', ['$scope', '$resource', '$routeParams',
    function($scope, $resource, $routeParams) {
        var Book = $resource('/api/books/' + $routeParams.id);
        var Authors = $resource('/api/books/' + $routeParams.id + "/authors");
        Book.get(function(book) {
            $scope.book = book;
            Authors.query(function(authors) {
                $scope.book.authors = authors;
            });            
        });
    }
]);