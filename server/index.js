const express = require("express");

var bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
var passporLocal = require("passport-local");
const cors = require("cors");
const db = require("../DB/index");

const app = express();
const port = 3000;
var passport = require("passport");
var auth = require("./routers/auth.js");
var user = require("./routers/user");
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
  })
);
app.use(
  cors({
    origin: "http://localhost:4200", // <-- location of the angular app were connecting to
    credentials: true
  })
);

app.use(cookieParser("secretcode"));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./routers/passportConfig")(passport);

app.use("/auth", auth);
////////////
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const { userModel } = require("../DB/models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1045411814561-j7e9giknpj6b8a458kojr1foc2dnpame.apps.googleusercontent.com",
      clientSecret: "vkgpSPqtFAewhsFc2xlz7trB",
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);


app.use("/user", user);
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
