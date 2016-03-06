var express = require('express');
var router = express.Router();
var p = require('./../../../publisher/publisher');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Foodie'});
});

/* process the sign up */
router.post('/signup', function (req, res, next) {

    var publisher = new p();

    // send the message to teh publisher service
    //console.log(req.body);
    // return the user to the front page
    try {
        publisher.publish(req.body);
    } catch (err) {
        console.trace(err);
    }
    res.json('OK');
});

module.exports = router;
