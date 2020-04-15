const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const Users = require('../models/users')
const authenticate = require('../authenticate')

const router = express.Router()
router.use(bodyParser.json())

router.route('/')
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
                        username: user.username_stylized,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        birth_date: user.birth_date,
                        sex: user.sex,
                        ethnicity: user.ethnicity
                    }
                    if (user.birth_date) info.age = getAge(user.birth_date)
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
                if (req.body.first_name) {
                    user.first_name = req.body.first_name
                }
                if (req.body.last_name) {
                    user.last_name = req.body.last_name
                }
                if (req.body.month) {
                    user.birth_date = new Date(req.body.year + '-' + req.body.month + '-' + req.body.day)
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
                            message: 'Account for user ' + user.username_stylized + ' deleted!'
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
const usernameToLowerCase = (req, res, next) => {
    req.body.username = req.body.username.toLowerCase()
    next()
}

router.post('/signup', (req, res, next) => {
    Users.register(new Users({
        username: req.body.username.toLowerCase(),
        username_stylized: req.body.username,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
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
            if (req.body.month) {
                user.birth_date = new Date(req.body.year + '-' + req.body.month + '-' + req.body.day)                
            }
            user.save((err) => {
                if (err) {
                    res.status(500)
                    res.setHeader('Content-Type', 'application/json')
                    res.json(err)
                }
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
            })
        }
    })
})

router.post('/login', usernameToLowerCase, passport.authenticate('local'), (req, res) => {
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

const getAge = (birth_date) => {
    const today = new Date()
    let age = today.getFullYear() - birth_date.getFullYear()
    if ((today.getMonth() < birth_date.getMonth())
        || (today.getMonth() === birth_date.getMonth() && today.getDate() < birth_date.getDate())) {
        age--
    }

    return age
}

module.exports = router
