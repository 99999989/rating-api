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
var ConfigSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    group: {
        type: String
    }
});

/**
 * Virtuals
 */


/**
 * Methods
 */

module.exports = mongoose.model('Config', ConfigSchema);
