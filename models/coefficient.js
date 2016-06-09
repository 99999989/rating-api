'use strict';

/**
 * Model dependencies
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema;

/**
 * Validations
 */

/**
 * Getter
 */

/**
 * Schema
 */
var CoefficientSchema = new Schema({
    user1: {
        type: String
    },
    user2: {
        type: String
    },
    coefficient: {
        type: Number
    },
    precision: {
        type: Number
    }
});

/**
 * Virtuals
 */


/**
 * Methods
 */

module.exports = mongoose.model('Coefficient', CoefficientSchema);
