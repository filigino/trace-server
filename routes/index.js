var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')

router.use(bodyParser.json())

router.route('/')

/* GET home page. */
.get(authenticate.verifyUser, (req, res, next) => {
    res.render('index', { title: 'Express' });
});

module.exports = router;
