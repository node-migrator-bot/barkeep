// ducksboard.js - simple wrapper for pushing data to ducksboard.

var https = require('https');

var ducksboard = exports;

// # pushData
// Returns the total jshint error count of all files in the files array.
ducksboard.pushData = function (value, options, cb) {
    options = options || {};
    
    if (!options.endpoint) {
        return cb(new Error('Must specify an endpoint property on options.'))
    }
    
    var api_key = options.api_key || process.env.API_KEY;

    var report = {"value" : value};
    var body = JSON.stringify(report);
    var options = {
        host: 'push.ducksboard.com',
        port: 443,
        path: '/v/' + options.endpoint,
        method: 'POST',
        auth: api_key + ':x',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': body.length
        }
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('end', function () {
            cb(res.statusCode !== 200 ? res.statusCode : null, res.statusCode);
        });
    });
    req.write(body);
    req.end();        
};

ducksboard.pushData(0, {endpoint: 'foo'}, function (err, result) {
    if (err) {
        return console.log(err)
    }
    console.log(result);     
});
