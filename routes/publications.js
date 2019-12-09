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

router.delete('/:id', function(req, res) {
    var publishersCollection = db.get('publisher');
    publishersCollection.find({}, function(err, publishers) {
        if (err) throw err;
        
        publishers.forEach(publisher => {
            var publications = publisher.publications.filter(publication => publication.book_id != req.params.id);
            if (publisher.publications.length != publications.length) {
                publishersCollection.update({'_id':publisher._id}, {
                    $set: {
                        publications: publications
                    }
                });
            }
        });
    });
});

module.exports = router