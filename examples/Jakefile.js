var Barkeep = require('../lib/barkeep');

var barkeep = new Barkeep();

desc('default task');
task('default', function () {
    console.log('run jake -T to see available tasks.');
});

desc('create docs');
task('docs', function () {
    var files = barkeep.fileListRecursive('./lib', '*.js');
    
    Barkeep.doc.generateDocco(files, function (err) {
        if (err) {
            return console.error('Could not generate documentation.');
        }  
        complete();
    });
}, {async: true});