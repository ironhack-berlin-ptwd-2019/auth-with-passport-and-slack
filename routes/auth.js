var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt')
const bcryptSalt = 10;

const User = require('../models/userfile')
const passport = require('passport')

// shows our form
router.get('/signup', function (req, res, next) {
  res.render('auth/signup', { message: req.flash('message') })
});

router.get('/login', function (req, res, next) {
  res.render('auth/login')
});

// actually creates user in the database
router.post('/signup', (req, res, next) => {
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  let username = req.body.username

  // if (username.length < 4) {
  //   // don't do this -> POST requests should always redirect
  //   res.render('auth/signup', { message: "username too short" })
  //   return
  // }

  if (username.length < 4) {
    req.flash('message', 'username is too short (flash)')
    res.redirect('/auth/signup')
  }

  User.create({
    username: username,
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
