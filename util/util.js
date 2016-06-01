
/**
 * Creates a string array from mongoose validation errors
 * @param err
 * @returns {Array}
 */
exports.easifyErrors = function(err) {
    var errors = [];
    if (!err || !err.errors) {
        return errors;
    }
    for (var error in err.errors) {
        if (err.errors.hasOwnProperty(error)) {
            errors.push(err.errors[error].message);
        }
    }
    return errors;
};


