module.exports = function(grunt) {    
    var Snockets = require('snockets');
    var path = require('path');
    
    grunt.registerMultiTask('snockets', 'Create snockets dependency tree for concat.', function() {
        var done = this.async(), task = this;
        var config = { concat: {}, min: {} };
        var snock = new Snockets();

        // Use snockets to get the dependency chain of all *-main.js files.
        var js = grunt.file.expandFiles(task.file.src);        
        grunt.utils.async.forEach(js, function (fn, callback) {
            snock.getCompiledChain(fn, function (fileName, jsList) {
                if (!jsList) {
                    callback(null);
                }
                // Add to config.concat object.
                config.concat[fn] = {
                    src: grunt.utils._.pluck(jsList, 'filename'),
                    dest: task.file.dest
                };
                callback(null);
            });
        }, function(err) {
            if (err) {
                return done(err);
            }
            // Refresh concat and min config
            grunt.config.set('concat', config.concat);
            done();
        });
    });
};