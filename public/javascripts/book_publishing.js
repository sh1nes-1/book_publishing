var app = angular.module('book_publishing', ['ngResource','ngRoute','ngCookies'])

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/authors', {
            templateUrl: 'partials/authors.html',
            controller: 'AuthorsCtrl'
        })
        .when('/authors/:id', {
            templateUrl: 'partials/author.html',
            controller: 'AuthorCtrl'
        })
        .when('/books', {
            templateUrl: 'partials/books.html',
            controller: 'BooksCtrl'
        })
        .when('/books/:id', {
            templateUrl: 'partials/book.html',
            controller: 'BookCtrl'
        })
        .when('/publishers', {
            templateUrl: 'partials/publishers.html',
            controller: 'PublishersCtrl'
        })
        .when('/publishers/:id', {
            templateUrl: 'partials/publisher.html',
            controller: 'PublisherCtrl'
        })
        .when('/cart/', {
            templateUrl: 'partials/cart.html',
            controller: 'CartCtrl'
        })
        .when('/orders/', {
            templateUrl: 'partials/orders.html',
            controller: 'OrdersCtrl'
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

app.controller('AuthorCtrl', ['$scope', '$resource', '$routeParams',
    function($scope, $resource, $routeParams) {
        var Author = $resource('/api/authors/' + $routeParams.id);     
        var Books = $resource('/api/authors/' + $routeParams.id + "/books");   
        Author.get(function(author) {
            $scope.author = author;
            Books.query(function(books) {
                $scope.author.books = books;
            })
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

app.controller('BookCtrl', ['$scope', '$resource', '$routeParams', '$cookies',
    function($scope, $resource, $routeParams, $cookies) {
        var Book = $resource('/api/books/' + $routeParams.id);
        var Authors = $resource('/api/books/' + $routeParams.id + "/authors");
        var Publishers = $resource('/api/publishers');
        Book.get(function(book) {
            $scope.book = book;
            Authors.query(function(authors) {
                $scope.book.authors = authors;
            });       
            Publishers.query(function(publishers) {
                $scope.book.publisher = publishers.find(pbr => {
                    return pbr.publications.some(pbn => {
                        if (pbn.book_id == book._id) {
                            $scope.book.publication = pbn;
                            return true;
                        }
                    });
                });
            });               
        });
        $scope.book_quantity = 1;
        $scope.new_order = function() {
            var order_items = $cookies.getObject("order_items");
            if (order_items == undefined) {
                order_items = []
            }

            var flag = false;
            order_items.forEach(order_item => {
                if (order_item.book == $scope.book._id) {
                    flag = true;
                    order_item.quantity += $scope.book_quantity;
                }
            })

            if (!flag) order_items.push({"book":$scope.book._id,"publisher":$scope.book.publisher._id,"quantity":$scope.book_quantity});
            $cookies.putObject("order_items", order_items);
        }
    }
]);

app.controller('PublishersCtrl', ['$scope', '$resource', 
    function($scope, $resource) {
        var Publishers = $resource('/api/publishers');
        Publishers.query(function(publishers) {
            $scope.publishers = publishers;
        });
    }
]);

app.controller('PublisherCtrl', ['$scope', '$resource', '$routeParams',
    function($scope, $resource, $routeParams) {
        var Publisher = $resource('/api/publishers/' + $routeParams.id);        
        Publisher.get(function(publisher) {
            $scope.publisher = publisher;
            
            var Publications = $resource('/api/publishers/' + $routeParams.id + '/publications');   
            Publications.query(function(publications) {
                $scope.publisher.publications = publications;
            }); 
        });
    }
]);

app.controller('CartCtrl', ['$scope', '$resource', '$cookies',
    function($scope, $resource, $cookies) {
        $scope.order_items = $cookies.getObject("order_items");
        if ($scope.order_items != undefined) {            
            $scope.order_items.forEach(order_item => {
                var Book = $resource('/api/books/' + order_item.book);
                Book.get(function(book) {
                    order_item.book = book;
                });

                var Publisher = $resource('/api/publishers/' + order_item.publisher);
                Publisher.get(function(publisher) {
                    order_item.publisher = publisher;
                });

                $scope.create_order = function() {
                    var order_items = $cookies.getObject("order_items");
                    if (order_items == undefined) {
                        order_items = []
                    }

                    order_items.forEach(oi => {
                        oi.price = 100;
                    });

                    var Orders = $resource('/api/orders');                    
                    Orders.save({
                        order_date: new Date(),
                        order_items: order_items
                    });

                    $cookies.remove("order_items");
                }
            });
        }
    }
]);

app.controller('OrdersCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Orders = $resource('/api/orders');                            
        Orders.query(function(orders) {            
            orders.forEach(o => {
                o.order_items.forEach(oi => {
                    var Books = $resource('/api/books/' + oi.book);
                    Books.get(function(book) {
                        oi.book = book;
                    });

                    var Publisher = $resource('/api/publishers/' + oi.publisher);
                    Publisher.get(function(publisher) {
                        oi.publisher = publisher;
                    });
                });
            });

            $scope.orders = orders;     
        });
    }
]);