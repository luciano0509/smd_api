"use strict";

var router = require('express').Router();
var r = require('rethinkdb');

module.exports = function (app, event) {
    app.post('/config',function (req, res) {
        let config = req.body;
        let dbName = config.eventName;
        if (dbName) {
            dbName = dbName.replace(' ', '_');
            r.dbList().run(req._dbConn, function (err, dbList) {
                if (!dbList.find(function (x) { if(x == dbName) return x})) {
                    r.dbCreate(dbName).run(req._dbConn)
                        .then(function (result) {
                            let tableTweets = r.db(dbName).tableCreate('Tweets').run(req._dbConn);
                            let tableTweetsFiltered = r.db(dbName).tableCreate('TweetsFiltered').run(req._dbConn);
                            let createConfig = r.db('Main').table('configs').insert(config);
                            let process = Promise.all([tableTweets, tableTweetsFiltered, createConfig]);
                            process
                                .then(function (result) {
                                    res.json({message: 'Config Saved'});
                                    event.emit('configChange', config);
                                })
                                .catch(function (err) {
                                    res.status(500).json({message: err.message})
                                })
                        })
                        .catch(function (err) {
                            res.status(500).json({message: err.message})
                        })
                } else {
                    r.db('Main').table('configs').filter({eventName: dbName}).update(config).run(req._dbConn);
                    res.json({message: 'Config Saved'});
                    event.emit('configChange', config);
                }
            });
        } else {
            res.status(500).json({message: 'Event Name is required'})
        }
    })
};