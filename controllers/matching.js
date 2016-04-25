'use strict';

/**
 * Controller dependencies
 */
var Rating = require('../models/rating'),
    Resource = require('../models/resource'),
    User = require('../models/user'),
    Util = require('../util');

// REST client
var Client = require('node-rest-client').Client;
var client = new Client();

/**
 * Create rating
 */
exports.requestResource = function (req, res, next) {
    Resource.find({ 'ratings.user': {username: {$ne: req.params.username } }})
        .populate({
            path: 'ratings',
            populate: { path: 'user' }
        })
        .exec(function (err, resources) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                if (resources.length > 0) {
                    res.jsonp(resources[0]);
                } else {
                    getNewResource(res);
                }

            }
        });
};

function getNewResource(res) {
    // direct way
    client.get('http://www.splashbase.co/api/v1/images/random', function (data, response) {
        var resource = new Resource();
        resource.url = data.url;
        resource.htmlCode = '<img src="' + resource.url + '" id="content-image" class="materialboxed" />';

        resource.save(function (err) {
            if (err) {
                return res.status(400).send(Util.easifyErrors(err));
            }
            res.jsonp(resource);
        });
        //{"id":679,"url":"https://splashbase.s3.amazonaws.com/gratisography/regular/10H.jpg",
        // "large_url":"https://splashbase.s3.amazonaws.com/gratisography/large/10H.jpg",
        // "source_id":266,"copyright":"CC0","site":"gratisography"}
    });
}

/**
 * Create rating
 */
exports.rateResource = function (req, res, next) {

    User.find({username: req.body.username})
        .exec(function (err, user) {
            if (err) return next(err);
            if (!user || user.length === 0) return next(new Error('Failed to load User ' + req.params.username));

            var rating = new Rating();
            rating.score = req.body.score;
            rating.resource = req.body.resourceId;
            rating.user = user[0]._id;
            var currUser = user[0];
            rating.save(function (err) {
                if (err) {
                    return res.status(400).send(Util.easifyErrors(err));
                }
                currUser.ratings = currUser.ratings || [];
                currUser.ratings.push(rating);
                User.findOneAndUpdate({
                        _id: currUser._id
                    },
                    user)
                    .exec(function (err, savedUser) {
                        if (err) return next(err);
                        if (!savedUser) return next(new Error('Failed to update User ' + currUser._id));

                        Resource.findById(req.body.resourceId)
                            .populate('ratings')
                            .exec(function (err, resource) {
                                if (err) return next(err);
                                if (!resource) return next(new Error('Failed to load Resource ' + req.body.resourceId));
                                resource.ratings = resource.ratings || [];
                                resource.ratings.push(rating);

                                resource.save(function (err) {
                                    if (err) {
                                        return res.status(400).send(Util.easifyErrors(err));
                                    }
                                    res.jsonp(rating);
                                });
                            });
                    });
            });
        });
};

