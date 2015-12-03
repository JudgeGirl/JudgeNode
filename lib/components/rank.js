var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

module.exports = {
	list: function(filter, callback) {
		var offset = 0, count = 50;
		for (var key in filter) {
			var value = parseInt(filter[key]);
			if (key == 'page') {
				offset = (Math.max(value, 1) - 1) * count;
			}
		}
		var cmd = 'SELECT U.uid, U.lgn, U.motto, U.nname, (SELECT COUNT(*) FROM (SELECT DISTINCT s.uid, s.pid FROM submissions s JOIN problems p WHERE s.pid = p.pid and s.res = 7 and p.pub = 1) Z WHERE Z.uid = U.uid) AS slv, U.class FROM users U ORDER BY slv DESC LIMIT ?, ?';
		connection.query(cmd, [offset, count], function(err, result) {
			callback(result);
		});
	}, 
	listsize: function(callback) {
		var cmd = 'SELECT COUNT(*) as count FROM users';
		connection.query(cmd, [], function(err, result) {
			if (err)	console.log(err);
			callback(result[0].count);
		});	
	},
	progress: function(callback) {
		var cmd = 'SELECT U.uid, U.lgn, U.motto, U.nname, (SELECT COUNT(*) FROM (SELECT DISTINCT s.uid, s.pid FROM submissions s JOIN problems p WHERE s.pid = p.pid and s.res = 7 and p.pub = 1) Z WHERE Z.uid = U.uid) AS slv, U.class FROM users U WHERE (U.class = 1 OR U.class = 2) ORDER BY slv DESC;';
		connection.query(cmd, function(err, result) {
			callback(result);
		});
	}
};
