var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../lib/const');

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

module.exports = {
	list: function(callback) {
		var cmd = 'SELECT U.uid, U.lgn, U.motto, U.nname, (SELECT COUNT(*) FROM (SELECT DISTINCT s.uid, s.pid FROM submissions s JOIN problems p WHERE s.pid = p.pid and s.res = 7 and p.pub = 1) Z WHERE Z.uid = U.uid) AS slv, U.class FROM users U ORDER BY slv DESC;';
		connection.query(cmd, function(err, result) {
			callback(result);
		});
	}, 
	progress: function(callback) {
		var cmd = 'SELECT U.uid, U.lgn, U.motto, U.nname, (SELECT COUNT(*) FROM (SELECT DISTINCT s.uid, s.pid FROM submissions s JOIN problems p WHERE s.pid = p.pid and s.res = 7 and p.pub = 1) Z WHERE Z.uid = U.uid) AS slv, U.class FROM users U WHERE (U.class = 1 OR U.class = 2) ORDER BY slv DESC;';
		connection.query(cmd, function(err, result) {
			callback(result);
		});
	}
};
