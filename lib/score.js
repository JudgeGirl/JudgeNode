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
	getAll: function(callback) {
		var cmd = 'SELECT * FROM exam_score NATURAL JOIN users ORDER BY lgn';
		connection.query(cmd, [], function(err, result) {
			if (err) {
				return callback(result);
			}
			callback(result);	
		});
	}
	,getOne: function(uid, callback) {
		var cmd = 'SELECT * FROM exam_score NATURAL JOIN users WHERE uid = ?';
                connection.query(cmd, [uid], function(err, result) {
                        if (err) {
                                return callback(result);
                        }
                        callback(result);
                });
	}
};
