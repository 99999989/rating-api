'use strict';

/**
 * Controller dependencies
 */
var Rating = require('../models/rating'),
    Resource = require('../models/resource'),
    User = require('../models/user'),
    Config = require('../models/config'),
    Coefficient = require('../models/coefficient'),
    Util = require('../util/util'),
    Combination = require('../util/combination'),
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
        function (err, config) {
            if (req.body.phase === '1') {
                Rating.remove({}) // Delete ratings
                    .exec(function (err, ratings) {
                        Resource.remove({}) // Delete resources
                            .exec(function (err, resources) {

                                res.jsonp({all: 'right'});
                                getNewResourceAsyncLoop(0, parseInt(req.body.resourcesCount), [], function (resources) {
                                    Resource.insertMany(resources);

                                    User.remove({}) // Delete users
                                        .exec(function (err, deletedUsers) {
                                            var users = [];
                                            for (var i = 0; i < req.body.userCount; i++) {
                                                var user = new User();
                                                user.username = 'user' + (i + 1);
                                                user.password = user.username;
                                                users.push(user);
                                            }

                                            User.insertMany(users);
                                        });
                                });
                            });

                    });
            } else if (req.body.phase === '2') {
                res.jsonp({all: 'right'});

            }
        });

};

/**
 * Get live results
 */
exports.getLiveResults = function (req, res, next) {
    Coefficient.remove({}) // Delete coefficients
        .exec(function (err, deletedCoefficients) {
            User.find()
                .exec(function (err, users) {
                    var combinations = Combination.k_combinations(users, 2);

                    for (var i = 0; i < combinations.length; i++) {
                        (function (index) {
                            Rating.find({user: {$in: [combinations[index][0]._id, combinations[index][1]._id]}})
                                .populate('user resource')
                                .exec(function (err, ratings) {

                                    processRatingsAsyncLoop(0, ratings, [], function(matchings) {
                                        var relationCoefficient = matchings.length > 0 ? 0 : -1;
                                        var matchingCounter = 0;
                                        var weightCounter = 0;
                                        var weightScore = matchings.length > 0 ? 0 : -1;
                                        _.forEach(matchings, function(matching) {
                                            if (matching.rating2) {
                                                var delta = matching.rating1 - matching.rating2;
                                                console.log('Svendroid: ' + matching.avgScore);
                                                delta = delta < 0 ? delta * (-1) : delta; // Get positive value
                                                var weight = matching.avgScore - (matching.rating1 + matching.rating2) / 2;
                                                weight = weight < 0 ? weight * (-1) : weight; // Get positive value

                                                weightScore += weight * delta;
                                                weightCounter += weight;

                                                relationCoefficient += delta;
                                                matchingCounter++;
                                            }
                                        });
                                        var coefficient = new Coefficient();
                                        coefficient.user1 = combinations[index][0];
                                        coefficient.user2 = combinations[index][1];
                                        coefficient.coefficient = relationCoefficient / (matchingCounter > 0 ? matchingCounter : 1);
                                        coefficient.precision = matchingCounter;
                                        coefficient.weightedCoefficient = weightScore / (weightCounter > 0 ? weightCounter : 1);
                                        coefficient.save(function (err) {
                                            if (err) {
                                                return res.status(400).send(Util.easifyErrors(err));
                                            }

                                        });
                                    });


                                });
                        }(i));
                    }

                    var config = {
                        key: 'phase',
                        value: '3',
                        group: 'phase'
                    };
                    Config.findOneAndUpdate({key: 'phase'},
                        config,
                        {upsert: true},
                        function (err, config) {
                            res.jsonp({phase: '2'});
                        });
                });
        });
};
function processRatingsAsyncLoop(i, ratings, matchings, callback) {
    if (i < ratings.length) {
        var matching = _.find(matchings, {resource: ratings[i].resource.id});
        if (matching) {
            matching.rating2 = ratings[i].score;
            Rating.aggregate([
                {$match: {resource: matching.resourceObject._id}},
                {
                    $group: {
                        _id: null,
                        average: {$avg: '$score'},
                        count: {$sum: 1}
                    }
                }])
                .exec(function (err, avgScore) {
                    if (err) return next(err);
                    matching.avgScore = avgScore[0].average;
                    processRatingsAsyncLoop(++i, ratings, matchings, callback);
                });
        } else {

            matching = {
                resource: ratings[i].resource.id,
                resourceObject: ratings[i].resource,
                rating1: ratings[i].score
            };
            matchings.push(matching);
            processRatingsAsyncLoop(++i, ratings, matchings, callback);
        }
    } else {
        callback(matchings);
    }

}
/**
 * Get phase info
 */
exports.getPhaseInfo = function (req, res, next) {
    Config.findOne({key: 'phase'})
        .exec(function (err, config) {
            res.jsonp({phase: config.value});
        });
};

function getNewResourceAsyncLoop(i, limit, resources, callback) {
    if (i < limit) {
        client.get('http://www.splashbase.co/api/v1/images/random?images_only=true' /*?videos_only=true, */, function (data, response) {
            Resource.find({url: data.url}).exec(function (err, duplicateResources) {
                // Prevent duplicate resources
                if (duplicateResources.length > 0) {
                    getNewResourceAsyncLoop(i, limit, resources, callback);
                } else {
                    var resource = new Resource();
                    resource.url = data.url;
                    resource.htmlCode = '<img src="' + resource.url + '" id="content-image" class="materialboxed" />';
                    resources.push(resource);

                    console.log(resource.url);

                    getNewResourceAsyncLoop(++i, limit, resources, callback);
                }
            });

        });
    } else {
        callback(resources);
    }
}


/**
 * Request new resource
 */
exports.requestResource = function (req, res, next) {
    var that = this;
    if (req.params.username === null) {
        return res.jsonp({});
    }

    Config.findOne({key: 'phase'})
        .exec(function (err, config) {
            // Phase 1
            if (config.value === '1') {
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
                            User.findOne({username: req.params.username})
                                .exec(function (err, user) {
                                    if (!user) return res.jsonp({completed: 'Phase 1'});
                                    if (user.ratings && user.ratings.length >= (resources.length / 2)) {
                                        return res.jsonp({completed: 'Phase 1'});
                                    } else {
                                        while (true) {
                                            var random = Math.random();
                                            var resource = resources[Math.floor(resources.length * random)];
                                            var rated = false;
                                            _.forEach(resource.ratings, function (rating) {
                                                if (rating.user && rating.user.username === req.params.username) {
                                                    rated = true;
                                                }
                                            });
                                            if (!rated) {
                                                return res.jsonp(resource);
                                            }
                                        }
                                    }
                                });
                        }
                    });
                // recommended resource
            } else {
                User.findOne({username: req.params.username})
                    .populate('ratings')
                    .exec(function (err, user) {
                        if (!user) return res.jsonp({completed: 'Phase 1'});
                        Coefficient.findOne({$or: [{user1: user}, {user2: user}]})
                            .populate('user1 user2')
                            .sort('coefficient -precision')
                            .exec(function (err, coefficient) {
                                var matchingUser = coefficient.user1.id === user.id ? coefficient.user2 : coefficient.user1;

                                Coefficient.findOne({$or: [{user1: user}, {user2: user}]})
                                    .populate('user1 user2')
                                    .sort('weightedCoefficient -precision')
                                    .exec(function (err, coefficient2) {
                                        var matchingUser2 = coefficient2.user1.id === user.id ? coefficient2.user2 : coefficient2.user1;
                                        console.log('Svendroid: ' + matchingUser2);
                                        Resource.find()
                                            .populate({
                                                path: 'ratings',
                                                populate: {
                                                    path: 'user'

                                                }
                                            })
                                            .exec(function (err, resources) {
                                                for (var i = 0; i < resources.length; i++) {
                                                    var resource = resources[i];
                                                    var selfRated = false;
                                                    var rated = false;
                                                    _.forEach(resource.ratings, function (rating) {
                                                        if (rating.user && rating.user.username === matchingUser.username) {
                                                            rated = true;
                                                        }
                                                        else if (rating.user && rating.user.username === user.username) {
                                                            selfRated = true;
                                                        }
                                                    });
                                                    if (!selfRated && rated) {
                                                        var weightedScore = _.find(resource.ratings, function(rating) {
                                                            return rating.user.id === matchingUser2.id;
                                                        });
                                                        return res.jsonp({
                                                            _id: resource.id,
                                                            url: resource.url,
                                                            estimatedScore: _.find(resource.ratings, function(rating) {
                                                                return rating.user.id === matchingUser.id;
                                                            }).score,
                                                            estimatedWeightedScore: weightedScore ? weightedScore.score : -10
                                                        });
                                                    }
                                                }
                                                return res.jsonp({completed: 'Phase 3'});
                                            });
                                    });

                            });
                    });

            }
        });


};
/**
 * Request new recommended resource
 */
exports.requestRecommendedResource = function (req, res, next) {

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
 * Get coefficients
 */
exports.getCoefficients = function (req, res, next) {
    Coefficient.find().populate('user1 user2').sort('coefficient -precision')
        .exec(function (err, coefficients) {
            res.jsonp(coefficients);
        });
};

/**
 * Get final results
 */
exports.getFinalResults = function (req, res, next) {
    User.find()
        .exec(function (err, users) {
            var ratings = [];
            getUserRatingsAsyncLoop(0, users, ratings, function(scores) {
                res.jsonp(scores);
            });
        });
};

/**
 *
 * @param i
 * @param users
 * @param ratings
 * @param callback
 */
function getUserRatingsAsyncLoop(i, users, ratings, callback) {
    if (i < users.length) {
         Rating.find({user: users[i]._id, $not: {estimatedWeightedScore: null}})
             .exec(function (err, ratingList) {
                 var score = 0;
                 var weightedScore = 0;
                 _.forEach(ratingList, function (rating) {
                     var delta = rating.score - rating.estimatedScore;
                     delta = delta < 0 ? delta * (-1) : delta; // Get positive value

                     var weightDelta = rating.score - rating.estimatedWeightedScore;
                     weightDelta = weightDelta < 0 ? weightDelta * (-1) : weightDelta; // Get positive value

                     score += delta;
                     weightedScore += weightDelta;
                 });
                 score = score / ratingList.length;
                 weightedScore = weightedScore / ratingList.length;
                 ratings.push({
                     username: users[i].username,
                     scoreDeviation: score,
                     weightedScoreDeviation: weightedScore
                 });

                 getUserRatingsAsyncLoop(++i, users, ratings, callback);
             });
    } else {
        callback(ratings);
    }
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
            rating.estimatedScore = req.body.estimatedScore ? req.body.estimatedScore : -10;
            rating.estimatedWeightedScore = req.body.estimatedWeightedScore ? req.body.estimatedWeightedScore : -10;
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
                    currUser)
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
                                                count: {$sum: 1}
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
                                                        count: {$sum: 1}
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

