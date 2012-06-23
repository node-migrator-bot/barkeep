var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    glob = require('glob');
    
module.exports = function(grunt) {    
    // ## directory helper
    // Creates a directory if one doesn't already exist, with optional callback.
    grunt.registerHelper('directory', function (dir, callback) {
        if (!dir) {
            throw 'You must specify a directory name.';
        }
        
        if (!path.existsSync(dir)){
            fs.mkdirSync(dir);
            if (callback){
                callback(dir);
            }
        }    
        return this;
    });
    
    // # deleteDirectory
    // Deletes a directory using rimraf.
    grunt.registerHelper('deleteDirectory', function(directory, cb) {
        rimraf(directory, function(err) {
            if (err) {
                return cb(err);
            }
            cb();
        });
    });
    
    // # fileListSync helper
    // From a glob pattern, gets a listing of files. Optionally excludes some files.
   grunt.registerHelper('fileListSync', function (globPattern, excludes) {
        var allFiles = glob.sync(globPattern);

        if (allFiles.length === 0) {
            return [];
        }

        if (excludes && excludes.length > 0) {
            allFiles = allFiles.filter(function (file) {
                return excludes.every(function (exclude) { 
                        return file.indexOf(exclude) === -1;
                    });
            });
        }
        return allFiles;
    });  
    
    // ## multitask clean
    // Deletes specific files or directories.
    grunt.registerMultiTask('clean', 'delete specific files or directories', function () {
        var done = this.async();
        var files = grunt.file.expandFiles(this.file.src).map(function(f) {
            return {type: 'file', name: f};
        });
        var dirs = grunt.file.expandDirs(this.file.src).map(function(f) {
            return {type: 'dir', name: f};
        });
        
        grunt.utils.async.forEach(files.concat(dirs), function(file, cb) {
           grunt.verbose.writeln('Deleting: ' + file.name);
           if (file.type === 'file') {
               fs.unlink(file.name, function(err) {
                   if (err) {
                       cb(err);
                   }
                   cb();
               });
           } else if (file.type === 'dir') {
               grunt.helper('deleteDirectory', file.name, function(err) {
                   if (err) {
                       cb(err);
                   }
                   cb();                  
               });
           }
        }, function (err) {
            if (err) {
                grunt.warn('Could not delete files: ' + err);
            }
            grunt.verbose.writeln('Deleted all...');
            done();
        });
    });
};
