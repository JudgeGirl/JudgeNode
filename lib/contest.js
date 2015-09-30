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
	list: function(uid, callback) {
		var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 UNION SELECT cid, pub, ts1, ts2, ttl FROM contests NATURAL JOIN contest_user WHERE uid = ' + uid + ' ORDER BY ts2 DESC';
		if (uid == undefined || uid == -1) {
			cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 ORDER BY ts2 DESC';
		}
		connection.query(cmd, function(err, result) {
			if (err) {
				callback(null);
				return 0;
			}
			callback(result);
		});
	},
	problemlist: function(cid, uid, callback) {
		var cmd = 'SELECT pid, MAX(scr) as score, COUNT(*) as submits FROM submissions WHERE cid = ? and uid = ? GROUP BY uid, pid ORDER BY pid';
		var problem_config = {};
		connection.query(cmd, [cid, uid], function(err, result) {
			if (err) {
				callback(0, problem_config);
				return 0;
			}
			problem_config.score = result;
			var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
			connection.query(cmd, [cid], function(err, result) {
				if (err) {
					callback(0, problem_config);
					return 0;
				}
				problem_config.list = result;
				callback(1, problem_config);
			});
		});
	},
	scoreboard: function(cid, uid, callback) {
		var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
		var table_config = {};
		table_config.cid = cid;
		connection.query(cmd, [cid], function(err, result) {
			if (!err)
				table_config.header = result;
			var cmd = 'SELECT DISTINCT MAX(scr) AS max_res FROM submissions WHERE cid = ? GROUP BY uid, pid ORDER BY max_res DESC';
			connection.query(cmd, [cid], function(err, result) {
				if (!err)
					table_config.scorekind = result;
				var cmd = 'SELECT uid, pid, MAX(scr) FROM submissions NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2 ) GROUP BY uid, pid';
				connection.query(cmd, [cid], function(err, result) {
					if (!err)
						table_config.stats = result;
					var cmd = 'SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)';
					connection.query(cmd, [cid], function(err, result) {
						if (!err)
						 	table_config.user = result || [];
						var cmd = 'SELECT uid, lgn, pid, COUNT(*), MAX(scr) FROM submissions S NATURAL JOIN (SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)) Z WHERE S.uid = Z.uid AND S.cid = ? GROUP BY pid, uid ORDER BY uid, pid;';
						connection.query(cmd, [cid, cid], function(err, result) {
							if (!err)
						 		table_config.grade = result || [];
						 	else
						 		console.log(err);
						 	callback(table_config);
						});
					});
				});
			});
		});
	},
	enable: function(cid, uid, callback) {
		var cmd = 'SELECT * FROM contests WHERE cid = ?';
		var nowtime = new Date().getTime();
		connection.query(cmd, [cid], function(err, result) {
			if (err || result.length == 0) {
				callback(0, contest, "You are not allowed to see the contest !");
				return 0;
			}
			var contest = result[0];
			if (nowtime < contest.ts1) {
				callback(0, contest, "The contest hasn\'t started yet !");
				return 0;
			}
			var isContestMember = false,
				isPublicContest = false,
				isFinished = false;
			if (contest.pub != 0) {
				isPublicContest = true;
				isContestMember = true;
			}
			var cmd = 'SELECT NULL FROM contest_user WHERE cid = ? AND uid = ?';
			connection.query(cmd, [cid, uid], function(err, result) {
				if (result && result.length != 0)
					isContestMember = true;
				if (nowtime > contest.ts2) 
					isFinished = true;
				else
					isFinished = false;
				if (isContestMember == false) {
					callback(0, contest, "You are not allowed to see the contest !");
					return 0;
				}
				callback(1, contest, "");
			});
		});
	}
};
