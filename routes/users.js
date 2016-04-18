var express = require('express');
var router = express.Router();
var usersController = require('../controllers/users');

/**
 * Authorize
 */
router.get('/authorize', usersController.authorize);

/**
 * Get all
 */
router.get('/', usersController.all);

/**
 * Logout
 */
router.get('/logout', usersController.logout);

/**
 * Get by id
 */
router.get('/:userId', usersController.user);

/**
 * Create
 */
router.post('/', usersController.create);

/**
 * Update
 */
router.put('/', usersController.update);

/**
 * Delete
 */
router.delete('/:userId', usersController.destroy);

/**
 * Login
 */
router.post('/login', usersController.login);


module.exports = router;
