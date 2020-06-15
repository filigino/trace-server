const express = require('express')
const bodyParser = require('body-parser')
const cron = require('node-cron')
const Infections = require('../models/infections')

const router = express.Router()
router.use(bodyParser.json())

const buffer = 1209600000 // 14 days in milliseconds

const clean = () => {
    const now = Date.now()
    Infections.findOne()
    .then((infections) => {
        infections.infections = infections.infections.filter((infection) => (now - infection.createdAt < buffer))
        infections.save()
    })
}

cron.schedule('* */24 * * *', () => { // every 24 hours
    clean()
})

router.route('/')
.get((req, res, next) => {
    Infections.findOne()
    .then((infections) => {
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
        res.json(infections.infections)
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post((req, res, next) => {
    Infections.findOne()
    .then((infections) => {
        for (const id of req.body.ids) {
            infections.infections.push(id)
        }
        infections.save()
        .then(() => {
            res.status(200)
            res.setHeader('Content-Type', 'application/json')
            res.json({
                success: true,
                message: 'Success'
            })
        })
    })
})

// .delete((req, res, next) => {
//     Infections.findOne()
//     .then((infections) => {
//         infections.infections = []
//         infections.save()
//         .then(() => {
//             res.status(200)
//             res.setHeader('Content-Type', 'application/json')
//             res.json({
//                 success: true,
//                 message: 'Deleted infections'
//             })
//         })
//     })
// })
// 
// router.post('/new', (req, res, next) => {
//     Infections.create({infections: []})
//     res.status(200)
//     res.setHeader('Content-Type', 'application/json')
//     res.json({
//         success: true,
//         message: 'Success'
//     })
// })
// 
// router.delete('/kill', (req, res, next) => {
//     Infections.deleteMany()
//     .then(() => {
//         res.status(200)
//         res.setHeader('Content-Type', 'application/json')
//         res.json({
//             success: true,
//             message: 'Deleted all'
//         })
//     })
// })

module.exports = router
