module.exports = function(grunt) {        
    var path = require('path');
    
    // ## jasmine task
    // Run headless jasmine tests using jasmine-dom.
    grunt.registerTask('jasmine', 'Run headless jasmine tests using jasmine-dom.', function() {
        var done = this.async();
        var exec = require('child_process').exec;
        
        this.requiresConfig('jasmine.configFile');
        
        grunt.log.writeln('Running jasmine tests...'.green);

        var jasmineBin = path.join(__dirname, '../', 'node_modules', 'jasmine-dom', 'bin', 'jasmine-dom');
        var configFile = grunt.config('jasmine.configFile');
        var reportFormat = ' --format detailed';
        var cmd = [jasmineBin, '--config', configFile, reportFormat].join(' ');
        console.log(cmd);
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                grunt.warn('Could not execute tests.'.red);
            }
            grunt.log.writeln(stdout);
            grunt.log.writeln(stderr);
            if (stdout.indexOf('FAILED') !== -1) {
                grunt.warn('There were test failure(s).'.red);
            }
            done();
        });       
    });
};