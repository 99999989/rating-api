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
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    user2: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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
