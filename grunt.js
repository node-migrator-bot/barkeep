module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    docco: {
      files: ['tasks/*.js']
    },
    snockets: {
      test: {
          src: ['tasks/*.js']
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    deploy: {
        aws_key: 'key',
        aws_secret: 'secret',
        aws_bucket: 'bucket',
        bucketDir: 'scripts',
        srcDir: 'tasks',
        src: ['tasks/*.js']
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    },
    combiner: {
        options: {
            concat: {
               destExtension: "debug.js",
               destDir: "target"
            },
            min: {
               destExtension: "min.js"
            }
        }
    }
  });
  // Load S3 (0.0.4 doesn't have the correct loadTasks way of doing things)
  require('grunt-s3')(grunt);
  
  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'lint');
};
