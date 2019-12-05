var app = angular.module('book_publishing', ['ngResource','ngRoute'])

//TODO: button to delete item from cart
//TODO: forms to add/edit author,book,publisher

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
        var Authors = $resource('/api/authors/:id');     
        var Books = $resource('/api/authors/:id/books');   
        Authors.get({id:$routeParams.id}, function(author) {
            $scope.author = author;
            Books.query({id:$routeParams.id}, function(books) {
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

app.controller('BookCtrl', ['$scope', '$resource', '$routeParams', '$location',
    function($scope, $resource, $routeParams, $location) {
        var Books = $resource('/api/books/:id');
        var Authors = $resource('/api/books/:id/authors');
        var Publishers = $resource('/api/publishers');        

        Books.get({id:$routeParams.id}, function(book) {
            $scope.book = book;
            Authors.query({id:$routeParams.id}, function(authors) {
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

        $scope.new_order_item = function() {
            var CartItems = $resource('/api/cart_items/');
            CartItems.save({
                book_id: $scope.book._id,
                publisher_id: $scope.book.publisher._id,
                quantity: $scope.book_quantity,
                price: 100
            });
            $location.path('/orders/');
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
        var Publishers = $resource('/api/publishers/:id');        
        Publishers.get({id:$routeParams.id}, function(publisher) {
            $scope.publisher = publisher;
            
            var Publications = $resource('/api/publishers/:id/publications');   
            Publications.query({id:$routeParams.id}, function(publications) {
                $scope.publisher.publications = publications;
            }); 
        });
    }
]);

app.controller('CartCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var CartItems = $resource('/api/cart_items/:id');

        CartItems.query(function(cart_items) {
            if (cart_items.length > 0) {
                cart_items.forEach(cart_item => {
                    var Books = $resource('/api/books/:id');
                    Books.get({id:cart_item.book_id}, function(book) {
                        cart_item.book = book;
                    });

                    var Publishers = $resource('/api/publishers/:id');
                    Publishers.get({id:cart_item.publisher_id}, function(publisher) {
                        cart_item.publisher = publisher;
                    });
                });
                
                $scope.cart_items = cart_items;
            }
        });

        $scope.delete_order_item = function(or_it_id) {
            CartItems.delete({id:or_it_id});
            $scope.cart_items = $scope.cart_items.filter(item => item.id != or_it_id);
        }

        $scope.create_order = function() {            
            CartItems.query(function(cart_items) {
                var Orders = $resource('/api/orders');                    
                Orders.save({
                    order_date: new Date(),
                    order_items: cart_items
                });

                CartItems.delete();
            });
        }        
    }
]);

app.controller('OrdersCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Orders = $resource('/api/orders');                            
        Orders.query(function(orders) {   
            if (orders.length > 0) {         
                orders.forEach(order => order.order_items.forEach(oi => {
                    var Books = $resource('/api/books/:id');
                    Books.get({id:oi.book_id}, function(book) {
                        oi.book = book;
                    });

                    var Publishers = $resource('/api/publishers/:id');
                    Publishers.get({id:oi.publisher_id},function(publisher) {
                        oi.publisher = publisher;
                    });
                }));            
              
                orders = orders.sort((a, b) => {
                    if (a.order_date < b.order_date) return 1;
                    if (a.order_date > b.order_date) return -1;
                    return 0;
                });

                $scope.orders = orders;  
            }   
        });
    }
]);