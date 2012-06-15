module.exports = function(grunt) {        
    var path = require('path');
    
    // ## jasmine task
    // Run headless jasmine tests using jasmine-dom.
    grunt.registerTask('jasmine', 'Run headless jasmine tests using jasmine-dom.', function() {
        var done = this.async();
        var exec = require('child_process').exec;

        grunt.log.writeln('Running jasmine tests...'.green);

        var jasmineBin = path.join(__dirname, 'node_modules', 'jasmine-dom', 'bin', 'jasmine-dom');
        var configFile = this.configFile;
        var reportFormat = ' --format detailed';

        var cmd = [jasmineBin, '--config', configFile, reportFormat].join(' ');
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                grunt.warn('Could not execute tests.'.red);
            }
            grunt.log(stdout);
            grunt.log(stderr);
            if (stdout.indexOf('FAILED') !== -1) {
                grunt.warn('There were test failure(s).'.red);
            }
            done();
        });       
    });
};