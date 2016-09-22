var mysql = require('mysql'),
	fs = require('graceful-fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

var problem_config = function(pid, callback) {
	var source_list_path = config.JUDGE.path + "testdata/" + pid + "/source.lst";
	fs.readFile(source_list_path, 'utf8', function(err, buf_data) {
		var source_list = [];
		if (!err)
			source_list = buf_data.toString().split('\n');
		for (var i  = 0; i < source_list.length; i++) {
			if (source_list[i].trim().length == 0) {
				source_list.splice(i, 1);
				i--;
			}
		}
		callback(source_list);	
	});
};

module.exports = {
	problem_config: problem_config,
	testdata: function(pid, callback) {
		var source_list_path = config.JUDGE.path + "testdata/" + pid + "/subtasks.py";
		fs.readFile(source_list_path, 'utf8', function(err, buf_data) {
			var testdata_list = [];
			if (!err)
				testdata_list = eval('(' + buf_data.toString() + ')');
			callback(testdata_list);	
		});
	},
	list: function(callback) {			// problems
		var cmd = 'SELECT pid, ttl, src, level FROM problems WHERE pub != 0 ORDER BY level ASC, porder ASC';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	level: function(callback) {			// level of problems
		var cmd = 'SELECT * FROM levels ORDER BY lorder ASC';
		connection.query(cmd, [], function(err, result){
			callback(result);
		});
	},
	level_domain: function(did, callback) {			// level of problems
		var cmd = 'SELECT L.level, L.ttl FROM levels AS L JOIN level_domain AS D ON D.level = L.level WHERE D.did = ? ORDER BY lorder ASC;';
		connection.query(cmd, [did], function(err, result) {
			callback(result);
		});
	},
	domains: function(callback) {
		callback();
	},
	score: function(uid, callback) {	// score of problems
		if (uid == undefined || uid < 0)
			return callback([]);
		var cmd = 'SELECT pid, MAX(scr) as score FROM submissions WHERE uid = ? GROUP BY uid, pid ORDER BY pid';
		connection.query(cmd, [uid], function(err, result) {
			if (err)
				return callback([]);
			callback(result);
		});
	},
	level_progress: function(uid, did, callback) {
		var level_progress = {};
		var cmd = 'SELECT D.level, count(*) AS count FROM level_domain AS D JOIN problems AS P ON (P.level = D.level AND D.did = ?) GROUP BY D.level;';
		connection.query(cmd, [did], function(err, result) {
			if (err)
				return callback(level_progress);
			level_progress['db'] = result;
			if (uid == undefined || uid < 0)
				return callback(level_progress);
			var cmd = 'SELECT D.level, count(* ) AS count FROM level_domain AS D JOIN (SELECT S.pid, level, MAX(scr) as score FROM submissions AS S JOIN problems AS P ON (S.pid = P.pid) WHERE uid = ? GROUP BY uid, pid) AS P ON (P.level = D.level AND D.did = ? AND P.score >= 100) GROUP BY D.level;';
			connection.query(cmd, [uid, did], function(err, result) {
				if (err)
					return callback(level_progress);
				level_progress['ac'] = result;
				return callback(level_progress);
			});
		});
	},
	dependency: function(callback) {	// dependency of problems
		var cmd = 'SELECT * FROM problem_dependency';
		connection.query(cmd, [], function(err, result){
			callback(result);
		});
	},
	problem: function(cid, pid, callback) {
		var prob_path = config.JUDGE.path + 'source/problem/' + pid + '.html';
		fs.readFile( prob_path, 'utf8', function(err, buf_data) {
			if (err) {
				callback('err');
				return 0;
			}
			var data = buf_data.toString();
			problem_config(pid, function(source_list){	
				var cmd = 'SELECT * FROM problems WHERE pid = ?';
				connection.query(cmd, [pid], function(err, result){
					if (err) {
						callback(0);
						return 0;
					}
					callback(data, result, source_list);
				});
			});
		});
	},
	recent: function(callback) {
		var cmd = 'SELECT * FROM problems ORDER BY ts DESC LIMIT 10';
		connection.query(cmd, function(err, result) {
			callback(result);
		});
	},
	solution: function(cid, pid, callback) {
		var sol_path = config.JUDGE.path + 'source/solution/' + pid + '.html';
		var sconfig = {};
		var cmd = 'SELECT * FROM problems WHERE pid = ?';
		connection.query(cmd, [pid], function(err, result) {
			if (err || result.length == 0)
				return callback(null);
			sconfig.config = result[0];
			fs.readFile(sol_path, 'utf8', function(err, buf_data) {
				if (err) return callback(sconfig);
				sconfig.content = buf_data.toString();
				return callback(sconfig);
			});
		});
	},
	submissions_count: function(callback) {
		var cmd = 'SELECT pid, COUNT(*) as submissions_count FROM submissions GROUP BY pid';
		connection.query( cmd, [], function(err, result){
			callback(result);
		});
	}
};
