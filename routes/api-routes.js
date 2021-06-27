const express = require('express');
const router = express.Router();
const passport = require('passport');

const { ensureAuthenticated } = require('../config/auth')

//Getting User Model
const User = require('../models/User');

//
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
    res.redirect('/register');
});

//Get Login Page
router.get('/login', (req, res) => {
    res.render("../views/login.ejs");
});

//Get Register Page
router.get('/register', (req, res) => {
    res.render("../views/register.ejs");
});

// Get Dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render("../views/dashboard.ejs", {
        name: req.user.name,
        layout: false
    });
});

// Register Handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body;

    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: "Please fill out all fields"
        });
    }

    //check both passwords are same or not
    if(password !== password2) {
        errors.push({
            msg: "Passwords do not match"
        });
    }

    //check passwords have at least 6 characters
    if(password.length < 6) {
        errors.push({
            msg: "Passwords should be at least 6 characters"
        });
    }

    // First will check errors 
    if(errors.length > 0) {
        res.render('../views/register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        // No errors found
        User.findOne({email: email}, (err, foundUser) => {
            if(err) {
                console.log(err);
                console.log('Found Error while searching a particular error...!!');
            }
            if(foundUser) {
                // User Exists

                console.log(foundUser);
                errors.push({
                    msg: "Email already Registered!!"
                });

                res.render('../views/register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });

            } else {
                // creating  new User
                const newUser = new User({
                    name, 
                    email,
                    password
                });

                // storing Hash Password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) {
                        throw err;
                    } else {
                        //set password to hash
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now Registered and can login');
                            res.render("../views/login.ejs");
                        })
                        .catch(err => console.log(err));
                    }
                }));
            }
        });
    }
});

//Login Handle

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

module.exports = router;