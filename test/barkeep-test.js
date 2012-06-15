var grunt = require('grunt'),
    assert = require('assert'),
    path = require('path'),
    vows = require('vows');

if (grunt.task.searchDirs.length === 0) {
  grunt.task.init([]);
  grunt.config.init({});
}

grunt.loadTasks(path.join(__dirname, '/../tasks'));

vows.describe('barkeep').addBatch({
    'files': {
        'should create a directory': function () {
           assert.throws(function () {
               grunt.helper('directory');
           }, 'You must specify a directory');
        },
        'should list files': function () {
            assert.throws(function () {
                grunt.helper('fileListSync');
            }, 'must provide pattern');
            assert.equal(grunt.helper('fileListSync', '*.txt').length, 0);
            assert.equal(grunt.helper('fileListSync', '*.js').length, 1);
        }
    }
}).export(module);