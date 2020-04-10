// template

const express = require('express')
const bodyParser = require('body-parser')
const Users = require('../models/users')

const router = express.Router()
router.use(bodyParser.json())

router.route('/')
.get((req, res, next) => {
    Users.find({})
    .then((users) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(users)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post((req, res, next) => {
    Users.create(req.body)
    .then((user) => {
        console.log('User Created ', user)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(user)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put((req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /users')
})
.delete((req, res, next) => {
    Users.remove({})
    .then((resp) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
    }, (err) => next(err))
    .catch((err) => next(err))    
})

// router.route('/:dishId')
// .get((req,res,next) => {
//     Users.findById(req.params.dishId)
//     .then((dish) => {
//         res.statusCode = 200
//         res.setHeader('Content-Type', 'application/json')
//         res.json(dish)
//     }, (err) => next(err))
//     .catch((err) => next(err))
// })
// .post((req, res, next) => {
//     res.statusCode = 403
//     res.end('POST operation not supported on /dishes/'+ req.params.dishId)
// })
// .put((req, res, next) => {
//     Users.findByIdAndUpdate(req.params.dishId, {
//         $set: req.body
//     }, { new: true })
//     .then((dish) => {
//         res.statusCode = 200
//         res.setHeader('Content-Type', 'application/json')
//         res.json(dish)
//     }, (err) => next(err))
//     .catch((err) => next(err))
// })
// .delete((req, res, next) => {
//     Users.findByIdAndRemove(req.params.dishId)
//     .then((resp) => {
//         res.statusCode = 200
//         res.setHeader('Content-Type', 'application/json')
//         res.json(resp)
//     }, (err) => next(err))
//     .catch((err) => next(err))
// })

module.exports = router
