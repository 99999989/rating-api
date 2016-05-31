'use strict';

/**
 * Controller dependencies
 */
var Rating = require('../models/rating'),
    Resource = require('../models/resource'),
    User = require('../models/user'),
    Config = require('../models/config'),
    Util = require('../util'),
    _ = require('lodash');

// REST client
var Client = require('node-rest-client').Client;
var client = new Client();

/**
 * Request new resource
 */
exports.startPhase = function (req, res, next) {
    var config = {
        key: 'phase',
        value: req.body.phase,
        group: 'phase'
    };
    Config.findOneAndUpdate({key: 'phase'},
        config,
        {upsert: true},
        function(err, config) {
            if (req.body.phase === '1') {
                Rating.remove({}) // Delete ratings
                    .exec(function(err, ratings) {
                        Resource.remove({}) // Delete resources
                            .exec(function (err, resources) {


                                res.jsonp({all: 'right'});
                                getNewResourceAsyncLoop(0, parseInt(req.body.resourcesCount), [], function (resources) {
                                    Resource.insertMany(resources);
                                });
                            });

                    });
            }
        });

};

function getNewResourceAsyncLoop(i, limit, resources, callback) {
    if (i < limit) {
        client.get('http://www.splashbase.co/api/v1/images/random?images_only=true' /*?videos_only=true, */, function (data, response) {
            var resource = new Resource();
            resource.url = data.url;
            resource.htmlCode = '<img src="' + resource.url + '" id="content-image" class="materialboxed" />';
            resources.push(resource);

            console.log(resource.url);

            getNewResourceAsyncLoop(++i, limit, resources, callback);
        });
    } else {
        callback(resources);
    }
}

/**
 * Request new resource
 */
exports.requestResource = function (req, res, next) {
    Resource.find()
        .populate({
            path: 'ratings',
            populate: {path: 'user'}
        })
        .exec(function (err, resources) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                while ()
                var random = Math.random();
                var resource = resources[Math.floor(resources.length * random)];
                for (var i = 0; i < resources.length; i++) {
                    var rated = false;
                    _.forEach(resources[i].ratings, function (rating) {
                        if (rating.user && rating.user.username === req.params.username) {
                            rated = true;
                        }
                    });
                    if (!rated) {

                        return res.jsonp();
                    }

                }
                res.jsonp({});
            }
        });
};

function getNewResource(res) {
    // direct way
    client.get('http://www.splashbase.co/api/v1/images/random' /*?videos_only=true, images_only=true*/, function (data, response) {
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
                                    Rating.aggregate([
                                            {$match: {resource: resource._id}},
                                            {
                                                $group: {
                                                    _id: rating._id,
                                                    average: {$avg: '$score'},
                                                    count: { $sum: 1 }
                                                }
                                            }
                                        ])
                                        .exec(function (err, avgScore) {
                                            if (err) return next(err);
                                            var resObject = {
                                                resourceAverage: avgScore[0].average,
                                                resourceCount: avgScore[0].count
                                            };
                                            Rating.aggregate([
                                                    {$match: {user: currUser._id}},
                                                    {
                                                        $group: {
                                                            _id: currUser._id,
                                                            average: {$avg: '$score'},
                                                            count: { $sum: 1 }
                                                        }
                                                    }
                                                ])
                                                .exec(function (err, avgScore) {
                                                    if (err) return next(err);
                                                    resObject.userAverage = avgScore[0].average;
                                                    resObject.userCount = avgScore[0].count;
                                                    res.jsonp(resObject);
                                                });
                                        });
                                });
                            });
                    });
            });
        });
};

