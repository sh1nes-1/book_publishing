var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk(process.env.MONGOLAB_URI || 'localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
    var publishersCollection = db.get('publisher');
    publishersCollection.find({}, function(err, publishers) {
        if (err) throw err;
        res.json(publishers);
    });
});

// Get One
router.get('/:id', function(req, res, next) {        
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var publishersCollection = db.get('publisher');
    publishersCollection.findOne({'_id':req.params.id}, function(err, publisher) {
        if (err) throw err;
        res.json(publisher);
    });
});

// Update One
router.put('/:id', function(req, res) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var publishersCollection = db.get('publisher');
    publishersCollection.findOneAndUpdate({'_id': req.params.id}, {$set: req.body}).then(publisher => res.json(publisher));
});

// Get Publications
router.get('/:id/publications', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var publishersCollection = db.get('publisher');
    var booksCollection = db.get('book');

    publishersCollection.findOne({'_id':req.params.id}, function(err, publisher) {
        if (err) throw err;      

        var publicationsPromise = publisher.publications.map(
            // Calls this function for each publication and changes each value to return result
            function(publication) {     
                var bookPromise = booksCollection.findOne({'_id':publication.book_id});

                var modifiedPublicationPromise = bookPromise.then(book => {
                    var modifiedPublication = {"book":book, "pbn_date":publication.pbn_date, "amount":publication.amount};
                    return modifiedPublication;
                });
                
                return modifiedPublicationPromise;
            }
        );

        Promise.all(publicationsPromise).then(function(publications) {
            res.json(publications);
        });   
    });
});

router.post('/:id/publications', function(req, res) {
    var publishersCollection = db.get('publisher');

    publishersCollection.findOne({'_id':req.params.id}, function(err, publisher) {
        if (err) throw err;
        publisher.publications.push(req.body);
        publishersCollection.update({'_id': req.params.id}, 
            { 
                $set: { 
                    publications: publisher.publications 
                } 
            },
            function(err, p) {
                if (err) throw err;
                res.json(p);
            }
        );
    });
});

module.exports = router;