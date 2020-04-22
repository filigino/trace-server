const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const Users = require('../models/users')
const authenticate = require('../authenticate')

const router = express.Router()
router.use(bodyParser.json())

router.route('/')
// get user info
.get(authenticate.verifyUser, (req, res, next) => {
    if (req.user.admin && !req.body.username) {
        Users.find({})
            .then((users) => {
                res.status(200)
                res.setHeader('Content-Type', 'application/json')
                res.json(users)
            }, (err) => next(err))
            .catch((err) => next(err))
    } else {
        let username
        if (req.user.admin) {
            username = req.body.username
        } else {
            username = req.user.username
        }
        Users.findByUsername(username.toLowerCase())
            .then((user) => {
                if (user !== null) {
                    const info = {
                        username: user.usernameStylized,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        birthDate: user.birthDate,
                        sex: user.sex,
                        ethnicity: user.ethnicity
                    }
                    if (user.birthDate) info.age = getAge(user.birthDate)
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json')
                    res.json(info)
                } else {
                    res.status(404) // not found
                    res.setHeader('Content-Type', 'application/json')
                    res.json({
                        name: 'NoUserFoundError',
                        message: 'User ' + username + ' not found!'
                    })
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    }
})

// update user info
.put(authenticate.verifyUser, (req, res, next) => {
    let username
    if (req.user.admin) {
        username = req.body.username
    } else {
        username = req.user.username
    }

    Users.findByUsername(username.toLowerCase())
        .then((user) => {
            if (user !== null) {
                if (req.body.firstName) {
                    user.firstName = req.body.firstName
                }
                if (req.body.lastName) {
                    user.lastName = req.body.lastName
                }
                if (req.body.birthDate) {
                    user.birthDate = new Date(req.body.birthDate)
                }
                if (req.body.sex) {
                    user.sex = req.body.sex
                }
                if (req.body.ethnicity) {
                    user.ethnicity = req.body.ethnicity
                }
                user.save()
                    .then(() => {
                        res.status(200)
                        res.json({
                            success: true,
                            message: 'Updated user info!'
                        })
                    }, (err) => next(err))
            } else {
                res.status(404) // not found
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    name: 'NoUserFoundError',
                    message: 'User ' + username + ' not found!'
                })
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

// delete user
.delete(authenticate.verifyUser, (req, res, next) => {
    let username
    if (req.user.admin) {
        username = req.body.username
    } else {
        username = req.user.username
    }
    Users.findByUsername(req.body.username.toLowerCase())
        .then((user) => {
            if (user !== null) {
                Users.findByIdAndDelete(user._id)
                    .then(() => {
                        res.status(200)
                        res.json({
                            success: true,
                            message: 'Account for user ' + user.usernameStylized + ' deleted!'
                        })
                    })
            } else {
                res.status(404) // not found
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    name: 'NoUserFoundError',
                    message: 'User ' + username + ' not found!'
                })
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

// custom middleware
// doesn't need to include email since it's already lowercased automatically
const usernameToLowerCase = (req, res, next) => {
    req.body.username = req.body.username.toLowerCase()
    next()
}

router.post('/signup', (req, res, next) => {
    Users.register(new Users({
        username: req.body.username.toLowerCase(),
        usernameStylized: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDate: new Date(req.body.birthDate),
        sex: req.body.sex,
        ethnicity: req.body.ethnicity
    }), req.body.password, (err, user) => {
        if (err) {
            if (err.errmsg && err.errmsg.includes('E11000 duplicate key error') && err.keyValue.email) {
                err = {
                    name: 'EmailExistsError',
                    message: 'A user with the given email address is already registered'
                }
            }
            if (err.name === 'UserExistsError' || err.name === 'EmailExistsError') {
                res.status(409) // conflict
            } else {
                res.status(500)
            }
            res.setHeader('Content-Type', 'application/json')
            res.json(err)
        } else {
            usernameToLowerCase(req, res, () => {
                passport.authenticate('local')(req, res, () => {
                    const token = authenticate.getToken({_id: req.user._id})
                    res.status(200)
                    res.setHeader('Content-Type', 'application/json')
                    res.json({
                        success: true,
                        token: token,
                        message: 'Registration complete!'
                    })
                })
            })
        }
    })
})

router.post('/signup/username_availability', (req, res, next) => {
    Users.findByUsername(req.body.username.toLowerCase())
        .then((user) => {
            if (user === null) {
                res.status(200)
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    success: true,
                    message: 'Username ' + req.body.username + ' is available!'
                })
            } else {
                res.status(409) // conflict
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    message: 'Username ' + req.body.username + ' is unavailable!'
                })
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

router.post('/signup/email_availability', (req, res, next) => {
    Users.findOne({email: req.body.email.toLowerCase()})
        .then((user) => {
            if (user === null) {
                res.status(200)
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    success: true,
                    message: 'Email ' + req.body.email + ' can be used!'
                })
            } else {
                res.status(409) // conflict
                res.setHeader('Content-Type', 'application/json')
                res.json({
                    message: 'Email ' + req.body.email + ' is already in use!'
                })
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})

router.post('/login', usernameToLowerCase, passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({_id: req.user._id})
    res.status(200)
    res.setHeader('Content-Type', 'application/json')
    res.json({success: true, token: token, message: 'Logged in!'})
})

router.put('/password', usernameToLowerCase, passport.authenticate('local'), (req, res, next) => {
    Users.findByUsername(req.body.username)
        .then((user) => {
            user.setPassword(req.body.password_new, () => {
                user.save()
                res.status(200)
                res.send('Password changed!')
            })
        }, (err) => next(err))
        .catch((err) => next(err))
})

const getAge = (birthDate) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    if ((today.getMonth() < birthDate.getMonth())
        || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

module.exports = router
