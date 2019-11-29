var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
    var booksCollection = db.get('book');
    booksCollection.find({}, function(err, books) {
        if (err) throw err;
        res.json(books);
    });
});

// Get All Authors
router.get('/authors', function(req, res, next) {
    var booksCollection = db.get('book');
    booksCollection.distinct('authors', function(err, authorIds) {
        if (err) throw err;
        var personsCollection = db.get('person');
        personsCollection.find({'_id':{$in:authorIds}}, function(err, authors) {
            if (err) throw err;
            res.json(authors);
        });
    });
});

// Get Author By Id
router.get('/authors/:id', function(req, res, next) {
    var booksCollection = db.get('book');
    booksCollection.find({'authors':{$all:[req.params.id]}}, function(err, books) {
        if (err) throw err;
        var personsCollection = db.get('person');
        personsCollection.findOne({'_id':req.params.id}, function(err, authors) {
            if (err) throw err;
            res.json({'author':authors,'books':books});
        });        
    })
});

module.exports = router