var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

module.exports = {
	insert_message: function(username, message, date, status, callback) {
		message = escape(message);
		var cmd = 'SELECT uid FROM users WHERE lgn = ?';
		connection.query(cmd, [username], function(err, result) {
			if (err || !result || result.length == 0)	
				return callback();
			var uid = result[0].uid;
			var cmd = 'INSERT INTO chats (uid, msg, status, ts) VALUES (?, ?, ?, ?)';
			connection.query(cmd, [uid, message, status, date], function(err, result) {
				if (err)
					console.log(err);
				return callback();
			});
		});
	},
	loadrecent: function(callback) {
		var cmd = 'SELECT * FROM chats JOIN users ON chats.uid = users.uid ORDER BY ts DESC LIMIT 20;';
		connection.query(cmd, [], function(err, result) {
			if (err)
				console.log(err);
			return callback(result);
		});
	}
};
