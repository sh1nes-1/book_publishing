var express = require('express');
var router = express.Router();

// Get All
router.get('/', function(req, res) {
    if (!req.session.cart_items) req.session.cart_items = [];
    res.json(req.session.cart_items);
});

// Insert One
router.post('/', function(req, res) {
    if (!req.session.cart_items) req.session.cart_items = [];
    if (!req.session.last_cart_item_id) req.session.last_cart_item_id = 0;
    var cart_item = {
        id:req.session.last_cart_item_id++,
        book_id:req.body.book_id,
        publisher_id:req.body.publisher_id,
        quantity:req.body.quantity,
        price:req.body.price
    }
    req.session.cart_items.push(cart_item);
    res.json(cart_item);
});

// Delete All
router.delete('/', function(req, res) {
    req.session.cart_items = null;    
    res.json({success:1});
})

// Delete One
router.delete('/:id', function(req, res) {
    if (req.session.cart_items) {
        var cart_item = req.session.cart_items.find(item => item.id == req.params.id);
        if (cart_item) {
            req.session.cart_items = req.session.cart_items.filter(item => item != cart_item);
            res.json(cart_item);
        }
    }
});

module.exports = router