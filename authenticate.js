const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Users = require('./models/users')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const config = require('./config')

// passport-local-mongoose includes functions, e.g., authenticate(), (de)serializeUser()
passport.use(new LocalStrategy(Users.authenticate()))
// needed for sessions
passport.serializeUser(Users.serializeUser())
passport.deserializeUser(Users.deserializeUser())

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 86400}) // 1 hour
}

// options
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        Users.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false)
            } else if (user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
    }))

// sessions is false bc using tokens > sessions
// authenticates on token
exports.verifyUser = passport.authenticate('jwt', {session: false})

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next()
    } else {
        res.status(401) // unauthorized
        res.setHeader('Content-Type', 'application/json')
        res.send({name: 'AuthError', message: 'Admin rights needed'})
    }
}
