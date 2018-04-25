const express = require("express");

const app = express();
const bodyParser = require("body-parser");
// const passport = require("./helpers/passport");
const session = require("express-session");
// const models = require("./helpers/models");
// const modelsHelper = require("./helpers/readModels");
const debug = require("debug")("lava");
const { pascalCase, snakeCase } = require("change-case");
const bcrypt = require("bcrypt-nodejs");
var UserModels = {};
var sessionValue;
const orm = require("orm");
const passport = require("passport");

app.use(session({ secret: "secret" }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
  debug(user,'user in deserailize');
  UserModels.find({ username: user.name }, function(err, user) {
    debug(user, "user in deserializeUser");
    cb(err, user);
  });
});

const sqlConnection = "mysql://lava:password@localhost/demo";
app.use(
  orm.express(sqlConnection, {
    define: function(db, models, next) {
      require("./helpers/models");
      debug(db.models);
      next();
    }
  })
);
app.set("view engine", "ejs");
app.set("views");
app.use(bodyParser.urlencoded({ extended: true }));
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, name, password, done) {
      req.models.User.find({ username: name }, function(err, user) {
        if (err) {
          console.log(err);
          req.userError = err;
          debug(err, "error in passport");
          return done(err, null);
        } else if (!user[0]) {
          req.userError = { message: "user not found" };
          return done(null, [user[0]]);
        } else if (!validPassword(password, user[0].password)) {
          req.userError = { message: "Incorrect password" };
          return done(null, user[0]);
        } else {
          req.newuser = user[0];
          debug("json user", user[0]);
          return done(null, user[0]);
        }
      });
    }
  )
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", passport.authenticate("local-login"), function(req, res) {
  if (!req.userError) {
    sessionValue = req.session;
    sessionValue.email = req.user.email;
    debug(sessionValue,'session in post login');
    res.send("Welcome to you " + req.user.email);
  } else {
    console.log(req.userError);
    res.redirect("/login");
  }
});

app.get("/error",isAuthenticated, (req, res) => {
  res.send("error");
});

app.get("/success",isAuthenticated, (req, res) => {
  res.send("success");
});

app.get("/login", (req, res) => {
  sessionValue = req.session;
  debug(sessionValue,'session in get login');
  if(sessionValue.email){
    debug(req.user,'user in get login');
    res.send("Welcome to you " + sessionValue.email);
  } else {
    UserModels = req.models.User;
    res.render("index");
  }
});

app.post("/register", (req, res) => {
  if (req.body.username && req.body.password && req.body.email) {
    debug(req.body.username, "username");
    var person = {
      username: req.body.username,
      password: generateHash(req.body.password),
      email: req.body.email
    };
    debug(person);
    var Person = req.models.User;
    Person.create(person, (err, resp) => {
      if (!err) res.send("success");
      else res.redirect('/register');
      console.log("done");
    });
  }
});

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(newpassword, dbpassword) {
  return bcrypt.compareSync(newpassword, dbpassword);
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
}

// function isLoggedIn(req,res,next){
//   debug(sessionValue,'sess in islOgged IN');
//   if(sessionValue.email){
//     res.send("Welcome to you " + sessionValue.email);
//   } else{
//     return next();
//   }
// }
app.listen(3000, () => {
  console.log("listening at port 3000...");
});
