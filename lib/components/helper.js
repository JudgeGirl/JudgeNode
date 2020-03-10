var mysql = require('mysql'),
	fs = require('graceful-fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;

var connection = require('../mysql').connection;

module.exports = {
	isAdmin: function(uid, callback) {
		var cmd = 'SELECT uid, class FROM users WHERE uid = ?';
		connection.query(cmd, [uid], function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				return callback(false);
			}
			return callback(result[0]["class"] == null);
		});
	},
    getIsAdminPromise: uid => {
        let cmd = 'SELECT uid, class FROM users WHERE uid = ?';

        return new Promise((resolve, reject) => {
            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    resolve(false);
                else if (result[0]["class"] != null)
                    resolve(false);
                else
                    resolve(true);
            });
        });
    },
	cansubmit: function(cid, pid, uid, callback) {
		if (config.CONTEST.MODE == true && cid == 0) {
			callback(false);
			return 0;
		}
		if (uid < 0 || uid === undefined ) {
			callback(false);
			return 0;
		}
		if (cid == 0) {
			var cmd = 'SELECT pub FROM problems WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				if (err || result.length == 0) {
					console.log(err);
					callback(false);
					return 0;
				}
				callback(result[0].pub != 0);
			});
		} else {
			var cmd = 'SELECT pub, ts1, ts2 FROM contests WHERE cid = ?';
			var nowtime = Date.now();
			connection.query(cmd, [cid], function(err, result) {
				if (err || result.length == 0) {
					console.log(err);
					callback(false);
					return 0;
				}
				var st, ed;
				st = result[0].ts1, ed = result[0].ts2;
				if (nowtime < st || nowtime >= ed) {
					callback(false);
					return 0;
				}
				if (result[0].pub != 0) {
					callback(true);
					return 0;
				}
				var cmd = 'SELECT uid FROM contest_user WHERE cid = ? AND uid = ?';
				connection.query(cmd, [cid, uid], function(err, result) {
					if (err) {
						console.log(err);
						callback(false);
						return 0;
					}
					callback(result.legnth != 0);
				});
			});
		}
	},
	canread: function(cid, pid, uid, callback) {
		if (cid != 0 && (uid < 0 || uid === undefined))
			return callback(false);
		if (cid == 0) {
			var cmd = 'SELECT pub FROM problems WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				if (err || result.length == 0)
					return callback(false);
				return callback(result[0].pub != 0);
			});
		} else {
			var cmd = 'SELECT pid FROM contest_problem WHERE cid = ? AND pid = ?';
			connection.query(cmd, [cid, pid], function(err, result) {
				var contest_problem = false;
				if (err || result.length == 0)
					contest_problem = false;
				else
					contest_problem = true;
				if (contest_problem == false)
					return callback(false);
				var cmd = 'SELECT pub, ts1 FROM contests WHERE cid = ?';
				connection.query(cmd, [cid], function(err, result) {
					if (err || result.length == 0 || Date.now() < result[0].ts1)
						return callback(false);
					if (result[0].pub != 0)
						return callback(true);
					var cmd = 'SELECT * FROM contest_user WHERE cid = ? AND uid = ?';
					connection.query(cmd, [cid, uid], function(err, result) {
						if (err || result.length == 0) {
							return callback(false);
						} else {
							console.log('can read !!!!!!!');
							return callback(true);
						}
						return callback(true);
					});
				});
			});
		}
	}
};
