var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require("connect-mongo")(session);

const User = require('./models/userfile')

const mongoose = require('mongoose');
const dbName = 'auth-test-2';
mongoose.connect(`mongodb://localhost/${dbName}`);


var app = express();

app.use(session({
  secret: "abc",
  store: new MongoStore({ // this is going to create the `sessions` collection in the db
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// passport config

// happens once for each login
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

// happens on every request
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect username or password" });
    }

    return next(null, user);
  });
}));

const SlackStrategy = require("passport-slack").Strategy;

passport.use(
  new SlackStrategy(
    {
      clientID: "PUT YOUR OWN ID",
      clientSecret: "PUT YOUR OWN SECRET",
      callbackURL: "/auth/slack/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Slack account details:", profile);

      User.findOne({ slackID: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          User.create({
            slackID: profile.id,
            username: profile.displayName,
            image: profile.user.image_1024
          })
            .then(newUser => {
              done(null, newUser);
            })
        })
    }
  )
);

// END: passport config

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
