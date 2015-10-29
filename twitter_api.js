'use strict';

var Twitter = require('twitter');

var client = Twitter({
    consumer_key: 'rVvmYRU3uXDolM5NWds2n95lc',
    consumer_secret: 'mnxKK0M5MCQp3RgaYEraAATcMH0IG8g07nWh4hWBS3BW1ACK4G',
    access_token_key: '134278090-QVZKrJYuSV0dvDZgJPaY6HseTPrOe59zIVihqmnQ',
    access_token_secret: 'py1dD3fB3ugiH2YacfUxSnDqmP4WKT7IX6RSI2agcQSPF'
});

var stream = function (busqueda, callback, callback2) {
    client.stream('statuses/filter', {track: busqueda}, function(stream) {
        stream.on('data', function(tweet) {
            callback(tweet)
        });

        callback2(stream);

        stream.on('error', function(error) {
            throw error;
        });

        stream.on('end', function(data){
            console.log('stop')
        })
    });
};

module.exports = stream;