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
var ResourceSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    htmlCode: String,
    ratings: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Rating'
        }]
    }
});

/**
 * Virtuals
 */


/**
 * Methods
 */

module.exports = mongoose.model('Resource', ResourceSchema);
