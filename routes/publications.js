var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk(process.env.MONGOLAB_URI || 'localhost:27017/book_publishing');

router.get('/', function(req, res) {
    var publishersCollection = db.get('publisher');
    publishersCollection.distinct('publications', function(err, publications) {
        if (err) throw err;
        res.json(publications);
    });
});

module.exports = router