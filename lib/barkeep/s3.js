// s3.js - Wrapper for s3 sync functions.
var s3 = exports,
    fs = require('fs'),
    crypto = require('crypto'),
    mkdirp = require('mkdirp'),
    mime = require('mime'),
    Barkeep = require('../barkeep'),
    _ = require('underscore'),
    async = require('async'),
    knox = require('knox'),
    path = require('path');

var barkeep = new Barkeep();

// ## connectToS3
// Establishes a connection to the Amazon S3 bucket.
var connectToS3 = function (options) {
    options = options || {};  
    var accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
        awssum = require('awssum');
        amazon = awssum.load('amazon/amazon');
        s3Service = awssum.load('amazon/s3');
        
    if (!accessKeyId || !secretAccessKey) {
        throw "Error: Must specify the env variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY";
    }
    return new s3Service(accessKeyId, secretAccessKey, "ops", amazon.US_EAST_1);    
};

// ## createClient
// Creates an S3 client.
s3.createClient = function (options) {
    s3.client = connectToS3(options);
    s3.bucket = options.bucket || '';
    return s3;
};

// ## setBucket
// Set the s3 bucket name.
s3.setBucket = function (bucketName) {
    s3.bucket = bucketName;
    return s3;
};

// ## getBucketObjects
// Gets a listing of objects in an S3 bucket, with an optional prefix. 
s3.getBucketObjects = function (prefix, callback) {
    if (!s3.client || !s3.bucket) {
        return callback(new Error("Error: No client or bucket name defined."), null);
    }
    // List all of the objects in the bucket starting with prefix.
    var options = {BucketName : s3.bucket, prefix: prefix || ''};
    s3.client.ListObjects(options, function(err, data) {
        if (err) {
            return callback(err);
        }
        var bucketContents = data.Body.ListBucketResult.Contents;
        
        callback(null, bucketContents);
    });    
};

// ## changedFiles
// Determines which local files are out of sync with their S3 version.
s3.changedFiles = function (files, bucketContents, options, callback) {
    options = options || {}, deployCompressed = (options.enableCompression === true);
    
    if (!options.directory) {
        return callback(new Error('Must specify a directory to search.'), null);
    }
        
    async.filter(files, function(file, cb) {
        var localFile = path.join(options.directory, localFileExtension(file, options));
        fs.readFile(localFile, null, function (err, data) {
            if (err) {
                 console.error('could not read file', localFile);
                 return cb(false);
            }
            var localHash = crypto.createHash('md5').update(data).digest("hex");
            
            // The file is unchanged if there are any buckets with
            // the same key and MD5 hash.
            var unchangedFile = _.any(bucketContents, function (bucket) {
                var eTag = bucket.ETag.replace(/"/g, '');
                var key = bucket.Key.replace(options.prefix, '');
                var mimeBucket = mime.lookup(key), localMime = mime.lookup(deployedFileExtension(localFile, options));                
                return key === file && eTag === localHash && mimeBucket === localMime;
            });
            return cb(unchangedFile === false);           
        });    
    }, function (updateFiles) {
        callback(null, updateFiles || []);
    });
};

var localFileExtension = function (file, options) {
    return (options.enableCompression === true) ? file + '.gz' : file;
};
var deployedFileExtension = function (file, options) {
    return (options.enableCompression === true) ? file.replace('.gz', '') : file;
};

// ## syncDirectory
// Sync a local directory and an S3 Bucket.
s3.syncDirectory = function (options, callback) {
    options = options || {}, deployCompressed = (options.enableCompression === true),
        uploadPattern = options.uploadPattern || '*.js';
    
    if (!s3.client || !s3.bucket) {
        return callback(new Error('Error: No client or bucket name defined.'), null);
    }
    
    if (!options.directory) {
        return callback(new Error('Must specify a directory to sync.'), null);
    }
    
    s3.getBucketObjects(options.prefix || '', function (err, bucketContents) {
        if (err) {
            return callback(err, null);
        }

        // Get all of the files in build.
        var debugFilesPath = barkeep.fileListRecursive(options.directory, 
            deployCompressed ? '*.gz' : uploadPattern);
        var debugFiles = debugFilesPath.map(function (file) {
            return deployedFileExtension(file.replace(options.directory, ''), options);
        });

        // Get all of the files pulled from S3.
        var bucketFiles = bucketContents.map(function (file) {
            return file.Key.replace(options.prefix || '', '');
        });

        var addFiles = _.difference(debugFiles, bucketFiles);
        var deleteFiles = _.difference(bucketFiles, debugFiles);
        var updateFiles = _.intersection(bucketFiles, debugFiles);
        
        s3.changedFiles(updateFiles, bucketContents, options, function (err, filesToUpdate) {         
            // Check if there's anything to sync.
            if (addFiles.length === 0 && filesToUpdate.length === 0 && deleteFiles.length === 0) {
                return callback(null, {add: addFiles, del: deleteFiles, update: filesToUpdate});
            }

            var objectKey = function (file) {
                return path.join(options.prefix || '', file);
            };
                        
            async.parallel([
                function (clb) {
                    if (deleteFiles.length === 0) {
                        return clb(null, []);
                    }
                    
                    var deleteKeys = deleteFiles.map(function (file) {
                        return objectKey(file);
                    });
                    s3.deleteObjects(deleteKeys, options, clb);
                },
                function (clb) {
                    if (addFiles.length === 0) {
                        return clb(null, []);
                    }
                    
                    async.forEach(addFiles, function (file, cb) {
                        var localFile = path.join(options.directory, localFileExtension(file, options));
                        var key = objectKey(file);
                        s3.putFile(localFile, key, options, cb); 
                    }, clb);
                },
                function (clb) {
                    if (updateFiles.length === 0) {
                        return clb(null, []);
                    }
                    async.forEach(updateFiles, function (file, cb) {
                        var localFile = path.join(options.directory, localFileExtension(file, options));
                        var key = objectKey(file);
                        s3.putFile(localFile, key, options, cb); 
                    }, clb);               
                }
            ], function (err, results) {
                if (err) {
                    callback(err, null);
                }
                callback(null, {add: addFiles, del: deleteFiles, update: filesToUpdate});    
            });
        });
    });
};

// ## deleteFiles
// Delete multiple files from S3.
s3.deleteObjects = function (keys, options, callback) {
    options = options || {};
    
    if (keys.length === 0) {
        callback(null, []);
    }
    
    if (!s3.client || !s3.bucket) {
        return callback(new Error("Error: No client, bucket name, or object name defined."), null);
    }    
    
    var deleteOptions = {
        BucketName: s3.bucket,
        Objects: keys };
        
    s3.client.DeleteMultipleObjects(deleteOptions, function(err, data) {
        if (err) {
            return callback(new Error('Could not delete objects from bucket'), null);
        }
        return callback(null, deleteOptions.Objects);
    });
};

// ## putFile
// Put a file on the filesystem in S3 (using knox).
s3.putFile = function (localFile, key, options, callback) {
    options = options || {};
        
    if (!s3.client || !s3.bucket) {
        return callback(new Error("Error: No client, bucket name, or object name defined."), null);
    }  
    
    var client = knox.createClient({
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: s3.bucket
    });
    
    fs.readFile(localFile, function (err, dataBuffer) {
        if (err) {
            return console.error('Could not read file', localFile);
        }
        
        var putOptions = {
            'Content-Length' : dataBuffer.length,
            'Content-Type': mime.lookup(options.enableCompression === true ? localFile.replace('.gz', '') : localFile) 
            };
            
        if (options.enableCompression === true) {
            putOptions['Content-Encoding'] = 'gzip';
        }   
         
        var req = client.put(key, putOptions);
        req.on('response', function (res) {
            console.log('  Uploaded object', localFile, 'to S3');
            callback(null, res);   
        });
        req.end(dataBuffer);        
    }); 
};

// ## writeObjectToFile
// Writes an object in an S3 bucket to disk.
s3.writeObjectToFile = function (options, callback) {
    options = options || {};
    
    var targetDirectory = options.targetDirectory || process.pwd;
    
    if (!s3.client || !s3.bucket || !options.objectName) {
        return callback(new Error("Error: No client, bucket name, or object name defined."), null);
    }
    
    s3.client.GetObject({BucketName: s3.bucket, ObjectName: options.objectName}, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        
        // Make directory for S3 Object.
        var dirForScript = path.join(targetDirectory, path.dirname(options.objectName));
        var filePath = path.join(targetDirectory, options.objectName);
        mkdirp(dirForScript, function (err) {
            if (err) {
                return callback(err);
            }
            fs.writeFile(filePath, data.Body, 'utf-8', function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });    
};
