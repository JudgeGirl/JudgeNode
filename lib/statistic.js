var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../lib/const');
var message = require('../lib/message');
var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

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
		var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip FROM submissions S, users U, problems P WHERE S.uid = U.uid AND S.pid = P.pid AND S.pid = ? AND S.cid = ? AND S.res = 7 ORDER BY S.cpu, S.mem, S.len LIMIT 20';
		connection.query(cmd, [pid, cid], function(err, result) {
			console.log(err);
			callback(result);
		});
	}
};
