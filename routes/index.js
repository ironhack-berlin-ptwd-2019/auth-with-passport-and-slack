var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { myCurrentUser: req.user });
});


// middleware
let isAuthenticated = (req, res, next) => {
  if (!req.user) {
    res.redirect('/auth/login')
  } else {
    next()
  }
}

// DRY code (because we use middleware)
router.get('/profile', isAuthenticated, function (req, res, next) {
  res.render('index', { myCurrentUser: req.user });
});

module.exports = router;
