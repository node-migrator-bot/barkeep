var vows = require('vows'),
assert = require('assert'),
path = require('path');

var Barkeep = require('../lib/barkeep');

var barkeep = new Barkeep();

vows.describe('barkeep').addBatch({
    "An instance of barkeep": {
        "should be an event emitter": function () {
            assert.instanceOf(barkeep, require('events').EventEmitter);
        }
    }
}).addBatch({
    "Barkeep S3": {
        "should be able to create a client": function () {
            Barkeep.s3.createClient({accessKeyId: 'fake', 
                secretAccessKey: 'fake'});
            Barkeep.s3.setBucket('fake');
            
            assert.isNotNull(Barkeep.s3.client);
            assert.isNotNull(Barkeep.s3.bucket);
        },
        "requires access keys" : function () {
            assert.throws(function () {
                Barkeep.s3.createClient()
                }, /Error: Must specify/);
        },
        "can detect changed files" : {
            topic: function () {
                Barkeep.s3.changedFiles(['test/a.js'], 
                    [{Key: 'scripts/test/a.js', ETag: 'aa123123asd'}],
                    {prefix : 'scripts'}, this.callback);
            },
            "requires a directory" : function (err, result) {
                assert.instanceOf(err, Error);
            }
        },
        "identifies changes" : {
            topic: function () {
                Barkeep.s3.changedFiles(['/a.js', '/b.js'], 
                    [{Key: 'scripts/a.js', ETag: 'bad_etag'}, {Key: 'scripts/b.js', ETag: '312f7709414eabcf6d523745ec01c89a'}],
                    {prefix : 'scripts', enableCompression: true, directory: path.join(__dirname, 'files')}, this.callback);    
            },
            "results in a change detected" : function (err, result) {
                assert.isNull(err);
                assert.equal(result.length, 1);
                assert.equal(result[0], '/a.js');
            }              
        },
        "identifies unchanged files" : {
            topic: function () {
                Barkeep.s3.changedFiles(['/a.js', '/b.js'], 
                    [{Key: 'scripts/a.js', ETag: 'de5e607cf34117077df1dfcff20d6be7'}, {Key: 'scripts/b.js', ETag: '312f7709414eabcf6d523745ec01c89a'}],
                    {prefix : 'scripts', enableCompression: true, directory: path.join(__dirname, 'files')}, this.callback);    
            },
            "results in no changes detected" : function (err, result) {
                assert.isNull(err);
                assert.equal(result.length, 0);
            }            
        }
    }
}).export(module);

