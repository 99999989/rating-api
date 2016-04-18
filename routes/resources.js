var express = require('express');
var router = express.Router();
var resourcesController = require('../controllers/resources');

/**
 * Get all
 */
router.get('/', resourcesController.all);

/**
 * Get by id
 */
router.get('/:resourceId', resourcesController.resource);

/**
 * Create
 */
router.post('/', resourcesController.create);

/**
 * Update
 */
router.put('/', resourcesController.update);

/**
 * Delete
 */
router.delete('/:resourceId', resourcesController.destroy);

module.exports = router;
