# grunt-barkeep

<img src="http://bit.ly/wAqCqY" alt="Barkeep" title="Barkeep" height="336" width="535"/>

a simple collection of common javascript build tasks for grunt.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-barkeep`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-barkeep');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

grunt-barkeep is bundled with the following additonal tasks:

### docco
*Generate docco documentation from JavaScript files. This is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md#multi-tasks-%E2%9A%91).*

### jasmine
*Run headless jasmine tests on the command line using [jasmine-dom](https://github.com/andrewpmckenzie/node-jasmine-dom)*.

### snockets
*Build a dependency tree of source files for the `concat` and `min` grunt tasks using [snockets](https://github.com/TrevorBurnham/snockets). Snockets is a JavaScript dependency parser similar to Ruby's sprockets. This is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md#multi-tasks-%E2%9A%91).*

### prepare-deploy
*An experimental task that determines what files to upload or delete from an Amazon S3 buckets when mirroring a local directory. It is meant to be run before the `s3` task in the [grunt-s3](https://github.com/pifantastic/grunt-s3) project.*

### ducksboard
*Sends file size data to ducksboard for reporting purposes. Useful for tracking the size of your JavaScript web applications over time. This is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md#multi-tasks-%E2%9A%91).*

### clean
*Delete the files and/or directories of your choice. This is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md#multi-tasks-%E2%9A%91).*

## Examples

See grunt.js in the barkeep directory.

## Contributing
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Flite, Inc.  
Licensed under the MIT license.