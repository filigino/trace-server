const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const passport = require('passport')
const config = require('./config')

// MongoDB
const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
const url = config.mongoUrl
const connect = mongoose.connect(url)
connect.then(() => {
    console.log('Connected to MongoDB server')
}, (err) => { console.log(err) })

// routes
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
// const interactionsRouter = require('./routes/interactions')

const app = express()

// // Redirects HTTP requests to HTTPS
// app.all('*', (req, res, next) => {
//     if (req.secure) {
//         return next()
//     } else {
//         // 301 - moved permanently
//         res.redirect(301, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
//     }
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// publicly accessible
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())

// routes
app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
