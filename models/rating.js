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
var RatingSchema = new Schema({
    score: {
        type: Number,
        required: true
    },
    estimatedScore: {
        type: Number
    },
    estimatedWeightedScore: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    resource: {
        type: Schema.Types.ObjectId,
        ref: 'Resource'
    }
});

/**
 * Virtuals
 */


/**
 * Methods
 */

module.exports = mongoose.model('Rating', RatingSchema);
