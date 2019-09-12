var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt')
const bcryptSalt = 10;

const User = require('../models/userfile')
const passport = require('passport')

// shows our form
router.get('/signup', function (req, res, next) {
  res.render('auth/signup')
});

router.get('/login', function (req, res, next) {
  res.render('auth/login')
});

// actually creates user in the database
router.post('/signup', (req, res, next) => {
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  User.create({
    username: req.body.username,
    password: hashPass
  }).then((user) => {
    req.login(user, function (err) {
      if (!err) {
        res.redirect('/');
      } else {
        //handle error --> NOPE.
      }
    })
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

// /auth/slack
router.get("/slack", passport.authenticate("slack"));

router.get("/slack/callback", passport.authenticate("slack", {
  successRedirect: "/",
  failureRedirect: "/" // not handling errors ;)
}));

module.exports = router;
