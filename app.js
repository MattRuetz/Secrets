//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

//const encrypt = require("mongoose-encryption");

//const md5 = require("md5");

// const bcrypt = require("bcrypt");
// const saltRounds = 10; // for bcrypt


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// setup a session
app.use(session({
    secret: "this is a secret",
    resave: false,
    saveUninitialized: false
}));

// allow passport to be used for managing sessions
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");


//This is a true mongoose schema, which is needed for encryption
// otherwise, can just make it a JS object
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// then attach as a Plugin for our mongoose Schema
// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ['password'] //the field that will be encrypted in DB
// });
//

// use password for salt, hash, and database storage & retrieval
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {

    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })
        }
    })

});

app.post("/login", function (req, res) {

    const user = new User({
        username : req.body.username,
        password : req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            //Sends a cookie to browser to authenticate, and keep user session open
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })

    User.findOne({
        email: username
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser.password) {
                if (result === true) {
                    res.render("secrets");
                }
            }
        }
    })
})





app.listen(3000, function () {
    console.log("Server started on Port 3000");
})