var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

// MongoDB
const mongoose = require('mongoose')
const Users = require('./models/users')
const Interactions = require('./models/interactions')
const url = 'mongodb://localhost:27017/contact'
const connect = mongoose.connect(url)
connect.then(() => {
    console.log('Connected successfully to MongoDB server')
}, (err) => { console.log(err) })

// routes
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
// var interactionsRouter = require('./routes/interactions')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

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
