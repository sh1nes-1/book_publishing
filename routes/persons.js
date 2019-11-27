var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk('localhost:27017/book_publishing');

router.get('/', function(req, res, next) {
    var personsCollection = db.get('person');
    personsCollection.find({}, function(err, persons) {
        if (err) throw err;
        res.json(persons);
    });
    
});

router.get('/:id', function(req, res, next) {        
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({ error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var personsCollection = db.get('person');

    personsCollection.find({'_id':req.params.id}, function(err, persons) {
        if (err) throw err;
        res.json(persons);
    });    
});

module.exports = router;
