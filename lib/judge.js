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
	insert_submission: function(subinfo, callback) {
		var cmd = 'INSERT INTO submissions SET ?';
		connection.query( cmd, subinfo, function(err, result) {
			callback(result.insertId);
		});
	},
	update_waiting_submission: function(sid, callback){
		var cmd = 'UPDATE submissions SET res = ? WHERE sid = ?';
		connection.query( cmd, [config.WT, sid], function(err, result) {
			callback(err);
		});
	}
};
