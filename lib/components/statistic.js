var mysql = require('mysql'),
	fs = require('graceful-fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;
var message = require('./message');

var connection = require('../mysql').connection;

module.exports = {
	statistic_donut: function(cid, pid, callback) {	// draw donut grpah used
		var cmd = 'SELECT res, COUNT(*) AS count FROM submissions WHERE pid = ? AND cid = ? GROUP BY res';
		var statistic = {};
		connection.query(cmd, [pid, cid], function(err, result) {
			if (err) {
				console.log(err);
			}
			statistic.donut = result;
			callback(statistic);
		});
	},
	submissions_count: function(callback) {	// print the total submissions.
		var cmd = 'SELECT pid, COUNT(*) as submissions_count FROM submissions GROUP BY pid';
		connection.query(cmd, [], function(err, result){
			callback(result);
		});
	},
	submission_table: function(cid, pid, callback) {	// Total Submissions, Users that tried it, Uses that solved it
		var cmd = 'SELECT pid, COUNT(*) AS count FROM submissions WHERE pid = ? AND cid = ? GROUP BY pid';
		var config = {};
		connection.query(cmd, [pid, cid], function(err, result){
			if (result.length > 0)
				config.count = result[0].count;
			var cmd = 'SELECT score, COUNT(*) AS count FROM (SELECT pid, MAX(scr) as score FROM submissions WHERE pid = ? AND cid = ? GROUP BY uid, pid ORDER BY pid) Z GROUP BY Z.score';
			connection.query(cmd, [pid, cid], function(err, result) {
				config.user = result;
				callback(config);
			});
		});
	},
	best_submission: function(cid, pid, callback) {	// show top 20 submission
		var cmd = 'SELECT S.*, U.lgn FROM submissions S JOIN (SELECT pid, uid, MIN(cpu) minVal FROM submissions WHERE pid = ? AND cid = ? AND res = 7 GROUP BY uid ) S2 ON S.cpu = S2.minVal AND S.res = 7 AND S.pid = S2.pid AND S.uid = S2.uid JOIN users U on U.uid = S.uid GROUP BY U.lgn ORDER BY S.cpu, S.mem, S.len LIMIT 20';
		connection.query(cmd, [pid, cid], function(err, result) {
			console.log(err);
			callback(result);
		});
	},
	grade_problem: function(cid, pid, callback) {
		var table_config = {};
		var cmd = 'SELECT Z.uid, lgn, pid, COUNT(*), MAX(scr) FROM submissions S JOIN (SELECT uid, lgn FROM users WHERE (class = 1 OR class = 2)) Z WHERE S.uid = Z.uid AND S.cid = ? AND S.pid = ? GROUP BY pid, uid ORDER BY uid, pid;';
		connection.query(cmd, [cid, pid], function(err, result) {
			if (!err)
		 		table_config.grade = result || [];
		 	else
		 		console.log(err);
		 	callback(table_config);
		});
	}
};
