/*
 * grunt-barkeep
 * https://github.com/flite/barkeep
 *
 * Copyright (c) 2012 Flite, Inc.
 * Licensed under the MIT license.
 */
 
module.exports = function(grunt) {    
    var peking = require('peking');
    var fs = require('fs');
    
    // ## helper filesize
    // Get the combined filesize of a collection of files.
    grunt.registerHelper('filesize', function (files, cb) {
        var totalSize = 0;
        grunt.utils.async.forEach(files, function(file, callback) {
            fs.stat(file, function(err, stat) {
                if (err) {
                    callback(err);
                } 
                totalSize += stat.size;
                callback();                               
            });
        }, function(err) {
            if (err) {
                cb(err, null);
            }
            cb(null, totalSize);
        });
    });
    
    // # multitask ducksboard
    // Send file size data of a collection of files to ducksboard
    grunt.registerMultiTask('ducksboard', 'Send file size data to ducksboard.', function() {
        var done = this.async(), task = this;
        this.requiresConfig('meta.ducksboard_api_key');
        var endpoint = this.data.endpoint;  
        if (!endpoint) {
            grunt.warn('Every target must specify an endpoint.');
        }
        
        var js = grunt.file.expandFiles(this.file.src);        
        grunt.helper('filesize', js, function(err, totalSize) {
            if (err) {
                grunt.warn(err);
            }
            grunt.log.writeln('[' + task.target + '] total size (bytes): ' + totalSize);
            peking.pushValue({value: totalSize, endpoint: endpoint, api_key: grunt.config('meta.ducksboard_api_key')}, function (err) {
                if (err) {
                    grunt.warn('Could not send data to ducksboard. Code ' + err + '.');
                }
                done();    
            });
        });
    });
};