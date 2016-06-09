var express = require('express');
var router = express.Router();
var matchingController = require('../controllers/matching');

router.get('/resource/:username', matchingController.requestResource);

router.get('/recommended/:username', matchingController.requestRecommendedResource);

router.get('/phase', matchingController.getPhaseInfo);

router.get('/results', matchingController.getLiveResults);

router.post('/rating', matchingController.rateResource);

router.post('/phase', matchingController.startPhase);

module.exports = router;