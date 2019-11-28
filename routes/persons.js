var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk('localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
    var personsCollection = db.get('person');
    personsCollection.find({}, function(err, persons) {
        if (err) throw err;
        res.json(persons);
    });
    
});

// Insert One/Many
router.post('/', function(req, res, next) {
    var personsCollection = db.get('person');

    /*
    if (typeof req.body.f_name === 'undefined' 
    || typeof req.body.l_name === 'undefined'
    || typeof req.body.address === 'undefined'
    || typeof req.body.contact === 'undefined') {
        res.status(400).send({ error: 'BAD_FORMAT', message: 'Some parameters are missing!'});
        return;
    }
    */

    personsCollection.insert({
        f_name: req.body.f_name,
        l_name: req.body.l_name,
        address: req.body.address,
        contact: req.body.contact
    }, function(err, persons) {
        if (err) throw err;
        res.json(persons);
    });
});

// Get One
router.get('/:id', function(req, res, next) {        
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var personsCollection = db.get('person');

    personsCollection.findOne({'_id': req.params.id}, function(err, person) {
        if (err) throw err;
        res.json(person);
    });
});

// Update One
router.put('/:id', function(req, res, next) {
    var personsCollection = db.get('person');
    personsCollection.findOneAndUpdate({'_id': req.params.id}, {$set: req.body}).then(person => res.json(person));
});

// Delete One
router.delete('/:id', function(req, res, next) {
    var personsCollection = db.get('person');
    personsCollection.remove({'_id': req.params.id}, function(err, result) {
        if (err) throw err;
        res.json(result);
    })
});

module.exports = router;
