/*
 * grunt-barkeep
 * https://github.com/flite/barkeep
 *
 * Copyright (c) 2012 Flite, Inc.
 * Licensed under the MIT license.
 */
 
module.exports = function(grunt) {        
    var path = require('path');
    
    // ## jasmine task
    // Run headless jasmine tests using jasmine-dom.
    grunt.registerTask('jasmine', 'Test jasmine specs using phantomjs.', function() {
        var done = this.async(), path = require('path');
        this.requiresConfig('phantom.config','phantom.config.specs', 'phantom.testDir');

        var config = grunt.config('phantom.config'), testDir = grunt.config('phantom.testDir');
        var phantomBootstrap = path.join(testDir, 'run_jasmine_test.js');
        var exec = require('child_process').exec;
        grunt.helper('commandExists', 'phantomjs', function (exists) {
            if (!exists) {
                return grunt.fatal('Could not find phantomjs binary. Did you install it?');
            }
            
            // Execute each spec.
            grunt.utils.async.forEach(Object.keys(config.specs), function(spec, cb) {
                // Spawn the phantom process.
                var cmd = ['phantomjs', '--cookies-file=/tmp/cookies.txt', phantomBootstrap, path.join(testDir, spec)].join(' ');
                exec(cmd, function (err, stdout, stderr) {
                    grunt.log.writeln();
                    grunt.log.subhead((config.specs[spec].name).underline);
                    grunt.log.write(stdout);
                    grunt.log.write(stderr);
                    grunt.log.writeln();
                    if (err) {
                        return cb(err);
                    }
                    cb();
                });
            }, function (err) {
                if (err) {
                    grunt.fatal('Test failure.');
                }
                done();
            });            
        });

    });
};