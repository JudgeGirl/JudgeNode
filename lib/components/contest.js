var mysql = require('mysql'),
	fs = require('graceful-fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;
	message = require('./message');

var connection = require('../mysql').connection;

module.exports = {
	list: function(filter, uid, callback) {
		var offset = 0, count = 25;
		for (var key in filter) {
			var value = parseInt(filter[key]);
			if (key == 'page') {
				offset = (Math.max(value, 1) - 1) * count;
			}
		}
		var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 UNION SELECT cid, pub, ts1, ts2, ttl FROM contests NATURAL JOIN contest_user WHERE uid = ' + uid + ' ORDER BY ts2 DESC';
		if (uid == undefined || uid == -1)
			cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 ORDER BY ts2 DESC';
		cmd += ' LIMIT ?, ?';
		connection.query(cmd, [offset, count], function(err, result) {
			if (err) {
				callback(null);
				return 0;
			}
			callback(result);
		});
	},
	listsize: function(filter, uid, callback) {
		var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 UNION SELECT cid, pub, ts1, ts2, ttl FROM contests NATURAL JOIN contest_user WHERE uid = ' + uid;
		if (uid == undefined || uid == -1)
			cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0';
		cmd = 'SELECT COUNT(*) AS count FROM ( ' + cmd + ') AS Z';
		connection.query(cmd, [], function(err, result) {
			if (err) {
				console.log(err);
				callback(0);
				return 0;
			}
			callback(result[0].count);
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
	rule: function(cid, callback) {
		let rule_path = `${config.RESOURCE.public.contest}/${cid}.html`;
		fs.readFile(rule_path, 'utf8', function(err, buf_data) {
			if (!err) {
				var data = buf_data.toString();
				return callback(data);
			}

            // Fail over to the default rule.
            let rule_path = `${config.RESOURCE.public.contest}/default.html`;
			fs.readFile(rule_path, 'utf8', function(err, buf_data) {
				if (!err) {
					var data = buf_data.toString();
					return callback(data);
				}
				callback('RULE NOT FOUND');
			});
		});
	},
	scoreboard: function(cid, uid, callback) {
		var icpc = function(table_config, cid, callback) {
			var cmd = 'SELECT uid, Subs.pid, ts FROM (SELECT min(sid) AS mn_sid, pid AS mn_pid, uid AS mn_uid FROM submissions WHERE cid = ? AND res = 7 GROUP BY uid, pid) AC JOIN (SELECT * FROM submissions WHERE cid = ?) Subs ON AC.mn_sid = Subs.sid GROUP BY uid, pid';
			table_config.icpc = {};
			connection.query(cmd, [cid, cid], function(err, result) {
				table_config.icpc.ac = result;
				var cmd = 'SELECT COUNT(*) as wa, uid, Subs.pid FROM (SELECT min(sid) AS mn_sid, pid AS mn_pid, uid AS mn_uid FROM submissions WHERE cid = ? AND res = 7 GROUP BY uid, pid) AC JOIN (SELECT * FROM submissions WHERE cid = ? AND res != 7) Subs ON AC.mn_pid = Subs.pid AND AC.mn_uid = Subs.uid AND Subs.sid < AC.mn_sid GROUP BY uid, pid';
				connection.query(cmd, [cid, cid], function(err, result) {
					table_config.icpc.wa = result;
					var cmd = 'SELECT * FROM contests WHERE cid = ?';
					connection.query(cmd, [cid], function(err, result) {
						table_config.icpc.contest = result;
						callback(table_config);
					});
				});
			});
		};

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
				var cmd = 'SELECT uid, pid, MAX(scr) FROM submissions NATURAL JOIN users WHERE cid = ? AND (class IS NOT NULL) GROUP BY uid, pid';
				connection.query(cmd, [cid], function(err, result) {
					if (!err)
						table_config.stats = result;
					var cmd = 'SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class IS NOT NULL)';
					connection.query(cmd, [cid], function(err, result) {
						if (!err)
						 	table_config.user = result || [];
						var cmd = 'SELECT uid, lgn, pid, COUNT(*), MAX(scr) FROM submissions S NATURAL JOIN (SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class IS NOT NULL)) Z WHERE S.uid = Z.uid AND S.cid = ? GROUP BY pid, uid ORDER BY uid, pid;';
						connection.query(cmd, [cid, cid], function(err, result) {
							if (!err)
						 		table_config.grade = result || [];
						 	icpc(table_config, cid, callback);
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
				return callback(0, contest, "You are not allowed to see the contest !");
			}
			var contest = result[0];
			if (nowtime < contest.ts1) {
				return callback(0, contest, "The contest hasn\'t started yet !");
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
					return callback(0, contest, "You are not allowed to see the contest !");
				}
				return callback(1, contest, "");
			});
		});
	}
};
