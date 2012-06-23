/*
 * grunt-barkeep
 * https://github.com/flite/barkeep
 *
 * Copyright (c) 2012 Flite, Inc.
 * Licensed under the MIT license.
 */
 
module.exports = function(grunt) {    
    var Snockets = require('snockets');
    var path = require('path');
    
    grunt.registerHelper('output-filename', function(filename, config) {
        var extension = path.extname(filename);
        var newFilename = filename.replace(extension, '.' + config.destExtension); 
        // Place in a different directory.
        if (config.destDir) {
            return path.join(config.destDir, path.basename(newFilename));
        }
        return newFilename;
    });
    
    grunt.registerHelper('header-footer', function(sources, config) {
        if (config.header) {
           sources.unshift(config.header);
        }
        if (config.footer) {
           sources.push(config.footer);
        }
    });
    
    // ## snockets task
    // Generate a dependency tree using snockets for the concat and min tasks.
    grunt.registerMultiTask('snockets', 'Create snockets dependency tree for concat and min.', function() {
        var done = this.async(), task = this;
        var snock = new Snockets();
        
        // If no destination exists, we will create one from the config.
        if (!task.file.dest) {
            this.requiresConfig('combiner.options', 'combiner.options.concat', 'combiner.options.min');
        }
        
        // Get options
        var options = grunt.config('combiner.options'), 
            config = {concat: {}, min: {}};
        var enableMinification = options.min.enabled !== false;
        
        // Use snockets to get the dependency chain files.
        var js = grunt.file.expandFiles(task.file.src);        
        grunt.utils.async.forEach(js, function (fn, callback) {
            snock.getCompiledChain(fn, function (fileName, jsList) {
                if (!jsList) {
                    callback(null);
                }
                // Add to config.concat object.
                config.concat[fn] = {
                    src: grunt.utils._.pluck(jsList, 'filename'),
                    dest: task.file.dest || grunt.helper('output-filename', fn, options.concat)
                };
                grunt.helper('header-footer', config.concat[fn].src, options.concat);
                
                // Add to config.min object (if enabled)
                if (enableMinification) {
                    config.min[fn] = {
                        src: config.concat[fn].dest,
                        dest: grunt.helper('output-filename', fn, options.min)
                    };
                    grunt.helper('header-footer', config.min[fn].src, options.min);
                }
                callback(null);
            });
        }, function(err) {
            if (err) {
                return done(err);
            }
            console.log(config.concat);
            console.log(config.min);
            // Refresh concat and min config
            grunt.config.set('concat', config.concat);
            grunt.config.set('min', config.min);
            done();
        });
    });
};