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
	list: function(filter, callback) {
		var cond, cmp, info, offset = 0, count = 20;
		cmp = 'S.sid DESC';
		info = ['S.uid = U.uid', 'S.pid = P.pid'];
		for (var key in filter) {
			var value = parseInt(filter[key]);
			if (key == 'uid') {
				info.push('S.uid = ' + value);
			} else if (key == 'pid') {
				info.push('S.pid = ' + value);
			} else if (key == 'cid') {
				info.push('S.cid = ' + value);
			} else if (key == 'res') {
				info.push('S.res = ' + value);
			} else if (key == 'page') {
				offset = (Math.max(value, 1) - 1) * count;
			} else if (key == 'limit') {
				count = Math.min(count, value);
			} else {
				cmp = 'S.scr DESC, S.cpu, S.mem, S.len, S.sid DESC';
			}
		}
		cond = info.join(' AND ') + ' ORDER BY ' + cmp;
		var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip FROM submissions S, users U, problems P WHERE ' + cond + ' LIMIT ?, ?';
		connection.query(cmd, [offset, count], function(err, result) {
			if (err) {
			}
			callback(result);
		});
	},
	result: function(sid, callback) {
		var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip FROM submissions S, users U, problems P WHERE S.uid = U.uid AND S.pid = P.pid AND S.sid = ? ORDER BY S.sid DESC LIMIT ?';
		var limit = 1;
		connection.query(cmd, [sid, limit], function(err, result) {
			callback(result);
		});
	},
	rejudge: function(filter, callback) {
		var info, cond, hasPid = false;
		info = [];
		for (var key in filter) {
			var value = parseInt(filter[key]);
			if (key == 'uid') {
				info.push('uid = ' + value);
			} else if (key == 'pid') {
				info.push('pid = ' + value);
				hasPid = true;
			} else if (key == 'cid') {
				info.push('cid = ' + value);
			} else if (key == 'sid') {
				info.push('sid = ' + value);
			}
		}
		if (info.length > 0 && hasPid == true) {
			cond = info.join(' AND ');
			var cmd = 'UPDATE submissions SET res = 0 WHERE ' + cond;
			connection.query(cmd, [], function(err, result) {
				if (err)	console.log(err);
				return callback();
			});
		} else
			return callback();
	}
};
