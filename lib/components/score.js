var mysql = require('mysql'),
	fs = require('graceful-fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

module.exports = {
	getAll: function(callback) {
		var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams WHERE class = 1 OR class = 2 ORDER BY lgn, eid';
		var res = {};
		connection.query(cmd, [], function(err, result) {
			if (err)	return callback(res);
			res.tbody = result;
			var cmd = 'SELECT * FROM exams ORDER BY eid';
			connection.query(cmd, [], function(err, result) {
				res.thead = result;
				callback(res);
			});
		});
	},
	getOne: function(uid, callback) {
		var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams WHERE uid = ? ORDER BY eid';
		var res = {};
        connection.query(cmd, [uid], function(err, result) {
            if (err)	return callback(res);
            res.tbody = result;
            var cmd = 'SELECT * FROM exams ORDER BY eid';
            connection.query(cmd, [], function(err, result) {
            	res.thead = result;
            	callback(res);
            });
        });
	},
	statistic: function(callback) {
		var cmd = 'SELECT sum, COUNT(*) AS count FROM (SELECT uid, SUM(score) AS sum FROM exam_scores NATURAL JOIN users WHERE (class = 1 OR class = 2) GROUP BY uid) AS Z GROUP BY Z.sum';
		var donut = {};
		connection.query(cmd, [], function(err, result) {
			donut.score = result;
			var cmd = 'SELECT COUNT(*) AS count FROM exams';
			connection.query(cmd, [], function(err, result) {
				donut.exams_cnt = 1;
				if (!err && result.length > 0)
					donut.exams_cnt = result[0].count;
				callback(donut);
			});
		});
	}
};
