var express = require('express');
var router = express.Router();
var ratingsController = require('../controllers/ratings');

/**
 * Get all
 */
router.get('/', ratingsController.all);

/**
 * Get by id
 */
router.get('/:ratingId', ratingsController.rating);

/**
 * Create
 */
router.post('/', ratingsController.create);

/**
 * Update
 */
router.put('/', ratingsController.update);

/**
 * Delete
 */
router.delete('/:ratingId', ratingsController.destroy);

module.exports = router;
