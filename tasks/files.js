var util = require('util'),
    path = require('path'),
    fs = require('fs'),
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
};
