var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk('localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
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

// Get One
router.get('/:id', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var personsCollection = db.get('person');
    personsCollection.findOne({'_id':req.params.id}, function(err, author) {
        if (err) throw err;
        res.json(author);
    });        
});

// Get books of author
router.get('/:id/books', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var booksCollection = db.get('book');
    booksCollection.find({'authors':{$all:[req.params.id]}}, function(err, books) {
        if (err) throw err;
        var personsCollection = db.get('person');
        personsCollection.findOne({'_id':req.params.id}, function(err, author) {
            if (err) throw err;
            res.json(books);
        });        
    })
});

module.exports = router