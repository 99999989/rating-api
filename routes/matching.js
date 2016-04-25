var express = require('express');
var router = express.Router();
var matchingController = require('../controllers/matching');

router.get('/resource/:username', matchingController.requestResource);

router.post('/rating', matchingController.rateResource);

module.exports = router;