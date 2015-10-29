"use strict";

var router = require('express').Router();
var r = require('rethinkdb');

module.exports = function (app, db) {
    var tweet_i = 0;

    app.get('/tweets/:cantidad(\\+\\d+)', function (req, res) {
        let cantidad = Number(req.params.cantidad);
        r.db(db).table('Tweets', {readMode: 'outdated'}).orderBy('created_at').slice(tweet_i, tweet_i+cantidad).run(req._dbConn)
            .then(function(cursor){
                cursor.toArray()
                    .then(function (result) {
                        res.json(result);
                        if (result) tweet_i += result.length;
                    })
                    .catch(function (err) {
                        res.status(500).json({message: err.message})
                    })
            })
            .catch(function (err) {
                res.status(500).json({message: err.message})
            });
    });

    app.get('/tweets/:num(\\d+)', function (req, res) {
        let num = Number(req.params.num) - 1;
        num = num > 0 ? num : 0;
        r.db(db).table('Tweets', {readMode: 'outdated'}).orderBy('created_at').slice(num, num+1).run(req._dbConn)
            .then(function(cursor){
                cursor.toArray()
                    .then(function (result) {
                        res.json(result);
                        if (result) tweet_i = num + 1;
                    })
                    .catch(function (err) {
                        res.status(500).json({message: err.message})
                    })
            })
            .catch(function (err) {
                res.status(500).json({message: err.message})
            });
    });
};