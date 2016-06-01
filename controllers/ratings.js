'use strict';

/**
 * Controller dependencies
 */
var Rating = require('../models/rating'),
    Util = require('../util/util');

/**
 * Create rating
 */
exports.create = function (req, res, next) {
    var rating = new Rating(req.body);

    rating.save(function (err) {
        if (err) {
            return res.status(400).send(Util.easifyErrors(err));
        }
        res.jsonp(rating);
    });
};

/**
 * Find rating by id
 */
exports.rating = function (req, res, next) {
    Rating.findById(req.params.ratingId)
        .exec(function (err, rating) {
            if (err) return next(err);
            if (!rating) return next(new Error('Failed to load Rating ' + req.params.ratingId));
            res.jsonp(rating);
        });
};

/**
 * Update a rating
 */
exports.update = function (req, res, next) {
    Rating.findOneAndUpdate({
            _id: req.body._id
        },
        req.body)
        .exec(function (err, rating) {
            if (err) return next(err);
            if (!rating) return next(new Error('Failed to update Rating ' + req.body._id));
            res.jsonp(rating);
        });
};

/**
 * Delete a rating
 */
exports.destroy = function (req, res, next) {
    Rating.findByIdAndRemove(req.params.ratingId)
        .exec(function (err, rating) {
            if (err) return next(err);
            if (!rating) return next(new Error('Failed to delete Rating ' + req.params.ratingId));
            res.jsonp(rating);
        })
};

/**
 * List of ratings
 */
exports.all = function (req, res) {
    Rating.find().sort('-created')
        .exec(function (err, ratings) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(ratings);
        }
    });
};
