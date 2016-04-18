'use strict';

/**
 * Controller dependencies
 */
var Resource = require('../models/resource'),
    Util = require('../util');

/**
 * Create resource
 */
exports.create = function (req, res, next) {
    var resource = new Resource(req.body);

    resource.save(function (err) {
        if (err) {
            return res.status(400).send(Util.easifyErrors(err));
        }
        res.jsonp(resource);
    });
};

/**
 * Find resource by id
 */
exports.resource = function (req, res, next) {
    Resource.findById(req.params.resourceId)
        .exec(function (err, resource) {
            if (err) return next(err);
            if (!resource) return next(new Error('Failed to load Resource ' + req.params.resourceId));
            res.jsonp(resource);
        });
};

/**
 * Update a resource
 */
exports.update = function (req, res, next) {
    Resource.findOneAndUpdate({
            _id: req.body._id
        },
        req.body)
        .exec(function (err, resource) {
            if (err) return next(err);
            if (!resource) return next(new Error('Failed to update Resource ' + req.body._id));
            res.jsonp(resource);
        });
};

/**
 * Delete a resource
 */
exports.destroy = function (req, res, next) {
    Resource.findByIdAndRemove(req.params.resourceId)
        .exec(function (err, resource) {
            if (err) return next(err);
            if (!resource) return next(new Error('Failed to delete Resource ' + req.params.resourceId));
            res.jsonp(resource);
        })
};

/**
 * List of resources
 */
exports.all = function (req, res) {
    Resource.find().sort('-created')
        .exec(function (err, resources) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(resources);
        }
    });
};
