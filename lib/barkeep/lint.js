// Lint.js - Helper for linting javascript files.

var command = require('./command'),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    JSHINT = require('jshint').JSHINT;

var lint = exports;

// # getErrorCount
// Returns the total jshint error count of all files in the files array.
lint.getErrorCount = function(files, options, cb) {
    var config = options.config || {};
    
    var errorCount = 0;
    async.forEach(files, function (file, cb) {
        fs.readFile(file, 'utf8', function (err, src) {
            if (err) {
                return cb(err, null);
            }
            if(!JSHINT(src, config)) {
                errorCount = errorCount + JSHINT.errors.length;
            }
            cb(null);
        });
    }, function (err) {
        if (err) {
            return cb(err, null);
        }
        cb(null, errorCount);
    });
};

// # jsHint
// jshint command-line wrapper.
lint.jsHint = function (files, options, callback) {
    var jshintPath = path.resolve(require.resolve('jshint'), '../../../bin');
    var baseOptions = options.configFile ? ["--config", options.configFile] : [];
    command.spawn(path.join(jshintPath, 'hint'), files.concat(baseOptions), function (code) {
        if (code) {
            return callback(code);
        }
        callback();    
    });    
};
