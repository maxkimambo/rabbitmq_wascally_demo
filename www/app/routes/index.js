var express = require('express');
var router = express.Router();
var publisher = require('./../../../publisher/publisher');

console.log(publisher);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Foodie' });
});

/* process the sign up */
router.post('/signup', function(req, res, next){

  // send the message to teh publisher service
  console.log(req.body);
  // return the user to the front page



  res.json('OK');
});
module.exports = router;
