"use strict";

var r = require('rethinkdb');

function tweetFilt (io, client, connection, event) {
    let ti = 0;
    let delay = 5000;
    let db = null;
    let interval = null;

    event.on('configChange', function (config) {
        db = config.eventName.replace(' ', '_');
        if (config.refreshTimeTweetFiltered) {
            delay = config.refreshTimeTweetFiltered * 1000;
            if (interval) {
                clearInterval(interval);
                interval = setInterval(task, delay)
            }
        }
    });

    client.on('tweetFilteredShow', function () {
        if (!interval) {
            interval = setInterval(task, delay)
        }
    });
    client.on('tweetFilteredStop', function () {
        clearInterval(interval)
    });

    function task() {
        r.db(db).table('TweetsFiltered', {
            readMode: 'outdated'
        }).orderBy('created_at').slice(ti, ti + 1).run(connection)
            .then(function (cursor) {
                cursor.toArray()
                    .then(function (result) {
                        if (result.length !== 0) {
                            ti += result.length;
                            io.emit('tweetFiltered', result[0]);
                        } else {
                            io.emit('tweetFiltered', result[0]);
                        }
                    })
                    .catch(function (err) {
                        console.log(err.message)
                    })
            })
            .catch(function (err) {
                console.log(err)
            });
    }
}

function tweet (io, client, connection, event) {
    let tweet_i = 0;
    let delay = 5000;
    let interval = null;
    let db = null;

    event.on('configChange', function (config) {
        db = config.eventName.replace(' ', '_');
        if (config.refreshTimeTweet) {
            delay = config.refreshTimeTweet * 1000;
            if (interval) {
                clearInterval(interval);
                interval = setInterval(task, delay)
            }
        }
    });

    client.on('tweetShow', function () {
        if (!interval) {
            interval = setInterval(task, delay);
        }
    });
    client.on('tweetStop', function () {
        clearInterval(interval)
    });
    function task() {
        r.db(db).table('Tweets', {readMode: 'outdated'}).orderBy('created_at').slice(tweet_i, tweet_i + 1).run(connection)
            .then(function (cursor) {
                cursor.toArray()
                    .then(function (result) {
                        if (result.length !== 0) {
                            tweet_i += result.length;
                            io.emit('tweet', result[0]);
                        } else {
                            io.emit('tweet', result[0]);
                        }
                    })
                    .catch(function (err) {
                        console.log(err.message)
                    })
            })
            .catch(function (err) {
                console.log(err.message)
            });
    }
}

module.exports = function (io, client, connection, event) {
    tweetFilt(io, client, connection, event);
    tweet(io, client, connection, event)
};