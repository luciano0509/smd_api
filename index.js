"use strict";

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var config = require('./config');
var r = require('rethinkdb');
var twitter = require('./twitter_api');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Event = require('events');
var event = new Event.EventEmitter();
event.setMaxListeners(20);

app.use(cors());
app.use(bodyParser.json());
app.use(function (req, res, next) {
    req._dbConn = connection;
    next()
});

var connection = null;
var db = null;

event.on('configChange', function (config) {
    if (config.eventName) {
        db = config.eventName.replace(' ', '_');
    }
    if (config.tweetFilter) {
        filter = config.tweetFilter;
    }
});

require('./routes/config')(app, event);
require('./routes/tweets')(app);
require('./routes/tweetsFiltered')(app, event);

app.get('/', function (req, res) {
    res.send('Welcome SMD api')
});

var filter = null;
var twitterStream = null;

app.get('/empezar', function (req, res) {
    if (!filter) {
        return res.json({message: 'No se especifico el filtro'})
    } else {
        if (!twitterStream) {
            twitter(filter, function (tweet) {
                r.db(db).table('Tweets').insert(tweet).run(connection)
            }, function (stream) {
                twitterStream = stream
            });
            res.json({message: 'Capturando Tweets'})
        } else {
            res.json('Proceso ya iniciado')
        }
    }
});

app.get('/terminar', function (req, res) {
    if (!filter) {
        return res.json({message: 'No se especifico el filtro'})
    } else {
        if (twitterStream) {
            twitterStream.destroy();
            res.json({message: 'Detenida la captura de Tweets'})
        } else {
            res.json({message: 'Ya se detuvo la captura'})
        }
    }
});

/* run server */
r.connect(config.database, function(err, conn){
    if (err) throw err;
    connection = conn;
    r.dbList().run(conn, function (err, dbList) {
        if (!dbList.find(function (x) { if (x == 'Main') return x })) {
            r.dbCreate('Main').run(conn)
                .then(function(result){
                    r.db('Main').tableCreate('configs').run(conn)
                        .catch(function (err) { throw err })
                })
                .catch(function (err) { throw err })
        }
    });
    io.on('connection', function(socket){
        require('./sockets')(io, socket, connection, event, db);
    });
    server.listen(config.web.port);
});


