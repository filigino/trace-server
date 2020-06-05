var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')

router.use(bodyParser.json())

router.route('/')

/* GET home page. */
.get((req, res, next) => {
    res.render('index', { title: 'Express' });
});

module.exports = router;
