var express = require('express');
var router = express.Router();

var mongodb = require("mongodb")

var monk = require('monk');
var db = monk('localhost:27017/book_publishing');

// Get All
router.get('/', function(req, res, next) {
    var ordersCollection = db.get('order');
    ordersCollection.find({}, function(err, orders) {
        if (err) throw err;
        res.json(orders);
    });
});

// Get One
router.get('/:id', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var ordersCollection = db.get('order');
    ordersCollection.findOne({'_id':req.params.id}, function(err, order) {
        if (err) throw err;
        res.json(order);
    });
});

// Insert One
router.post('/', function(req, res, next) {
    var ordersCollection = db.get('order');
    ordersCollection.insert({
        order_date: req.body.order_date,
        order_items: req.body.order_items
    }, function(err, order) {
        if (err) throw err;
        res.json(order);
    });
});

// Delete One
router.delete('/:id', function(req, res, next) {
    if (!mongodb.ObjectID.isValid(req.params.id)) {
        res.status(400).send({error: 'BAD_FORMAT', message: req.params.id + ' is not in correct format!'});
        return;
    }

    var ordersCollection = db.get('order');
    ordersCollection.remove({'_id':req.params.id}, function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

module.exports = router;
