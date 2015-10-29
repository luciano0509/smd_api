"use strict";

var twitter = require('../twitter_api');
var r = require('rethinkdb');

/* store stream twitter */

module.exports = function (app, event) {
    let tweet_filtered = 0;
    let db = null;

    event.on('configChange', function (config) {
        db = config.eventName.replace(' ', '_');
    });

    app.get('/tweets/filtered/:cantidad(\\+\\d+)', function (req, res) {
        let cantidad = Number(req.params.cantidad);
        r.db(db).table('TweetsFiltered', {
            readMode: 'outdated'
        }).orderBy('created_at').slice(tweet_filtered, tweet_filtered + cantidad).run(req._dbConn)
            .then(function (cursor) {
                cursor.toArray()
                    .then(function (result) {
                        res.json(result);
                        if (result) tweet_filtered += result.length
                    })
                    .catch(function (err) {
                        res.status(500).json({message: err.message})
                    })
            })
            .catch(function (err) {
                res.status(500).json({message: err.message})
            });
    });

    app.get('/tweets/filtered/:num(\\d+)', function (req, res) {
        let num = Number(req.params.num) - 1;
        num = num > 0 ? num : 0;
        r.db(db).table('TweetsFiltered', {
            readMode: 'outdated'
        }).orderBy(r.desc('created_at')).slice(num, num + 1).run(req._dbConn)
            .then(function (cursor) {
                cursor.toArray()
                    .then(function (result) {
                        res.json(result);
                        if (result) tweet_filtered = num + 1;
                    })
                    .catch(function (err) {
                        res.status(500).json({message: err.message})
                    })
            })
            .catch(function (err) {
                res.status(500).json({message: err.message})
            });

    });

    app.post('/tweets/filtered', function (req, res) {
        if (Object.keys(req.body).length) {
            r.db(db).table('TweetsFiltered').insert(req.body, {conflict: "replace"}).run(req._dbConn)
                .then(function (result) {
                    console.log(result);
                    res.json({message: 'Success Created', data:result})
                })
                .catch(function (err) {
                    res.status(500).json({message: err.message})
                })
        } else {
            res.send('No data')
        }
    });

    app.delete('/tweets/filtered/:id', function (req, res) {
        let id = req.params.id;
        r.db(db).table('TweetsFiltered').get(id).delete().run(req._dbConn)
            .then(function () {
                res.json({message: 'Success Deleted'})
            })
            .catch(function (err) {
                res.status(500).json({message: err.message})
            })
    });

};