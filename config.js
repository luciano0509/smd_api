"use strict";

module.exports = {
    web: {
        port: process.env.PORT || 3000
    },
    database: {
        host: process.env.RETHINKDB_1_PORT_28015_TCP_ADDR || "0.0.0.0",
        port: process.env.RETHINKDB_1_PORT_28015_TCP_PORT || 32769
    }
};