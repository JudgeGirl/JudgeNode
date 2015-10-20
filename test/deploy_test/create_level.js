
var mysql = require('mysql'),
    fs = require('fs'),
    config = require('./const'),
    crypto = require('crypto'),
    randomstring = require("randomstring");

var connection = mysql.createPool({  
    host     : '127.0.0.1', // config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
    port     : config.DATABASE.port
});

var cmd = 'INSERT INTO levels (level, ttl, lorder) VALUES(?, ?, ?)';

connection.query(cmd, [0, 'Welcome', 0], function(err, result) {
    console.log(err);
    console.log(result);
});
