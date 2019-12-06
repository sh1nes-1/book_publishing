var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk(process.env.MONGOLAB_URI || 'localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
    var booksCollection = db.get('book');
    booksCollection.find({}, function(err, books) {
        if (err) throw err;
        res.json(books);
    });
});

// Get One
router.get('/:id', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var booksCollection = db.get('book');
    booksCollection.findOne({'_id':req.params.id}, function(err, book) {
        if (err) throw err;
        res.json(book);
    });
});

// Get authors of book
router.get('/:id/authors', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var booksCollection = db.get('book');
    booksCollection.findOne({'_id': req.params.id}, function(err, book) {
        if (err) throw err;
        var authorsCollection = db.get('person');
        authorsCollection.find({'_id':{$in:book.authors}}, function(err, authors) {
            if (err) throw err;
            res.json(authors);
        });
    });
});

module.exports = router