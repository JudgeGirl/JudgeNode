var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

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
