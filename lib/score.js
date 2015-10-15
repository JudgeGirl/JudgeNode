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
		var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams ORDER BY lgn';
		var res = {};
		connection.query(cmd, [], function(err, result) {
			if (err)	return callback(res);
			res.tbody = result;
			var cmd = 'SELECT * FROM exams';
			connection.query(cmd, [], function(err, result) {
				res.thead = result;
				callback(res);
			});
		});
	}
	,
	getOne: function(uid, callback) {
		var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams WHERE uid = ?';
		var res = {};
        connection.query(cmd, [uid], function(err, result) {
            if (err)	return callback(res);
            res.tbody = result;
            var cmd = 'SELECT * FROM exams';
            connection.query(cmd, [], function(err, result) {
            	res.thead = result;
            	callback(res);
            });
        });
	}
};
