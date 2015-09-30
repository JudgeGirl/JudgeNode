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

function result_html(str) {
	var lines = str.split("\n");
	if (lines[0].indexOf("Subtask") == 0) {
		var chunk = 7;
		var html = '', tbody = '';
		html += '<table class="pure-table" style="width: 100%"><thead><tr>';
		html += '<th>Testdata</th>';
		html += '<th>Result</th>';
		html += '</tr></thead>';
		tbody += '<tbody>';
		for (var i = 0; i < lines.length; i += chunk) {
			var testpt = lines.slice(i, i+chunk);
			if (testpt[0].indexOf("Subtask") == 0) {
				tbody += '<tr>';
				tbody += '<th>' + testpt[0] + " " + testpt[2] + '</th>';
				var cpu = parseInt(testpt[3].split(" ")[1]);
				var mem = parseInt(testpt[4].split(" ")[1]);
				tbody += '<td>' + testpt[5] + " (" + config.unitConvert('cpu', cpu) + "," + config.unitConvert('mem', mem) + ')</td>';
				tbody += '</tr>';
			}
		}
		tbody += '</tbody>';
		html += tbody;
		html += '</table>';
		return html;
	} else {
		return '<pre>' + str + '</pre>';
	}
	return '';
}
module.exports = {
	list: function(filter, callback) {
		var cond, cmp, info, offset = 0, count = 25;
		cmp = 'S.sid DESC';
		info = ['S.uid = U.uid', 'S.pid = P.pid'];
		for (var key in filter) {
			var value = filter[key];
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
	statistic: function(cid, pid, callback) {
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
	source_code: function(sid, uid, type, callback) {
		if (uid == undefined || uid < 0) {
			callback(message.source_code);
			return 0;
		}
		if (type !== null && config.CONTEST_MODE == true) {
			callback(message.source_code);
			return 0;
		}
		var cmd = 'SELECT NULL FROM submissions WHERE sid = ? AND uid = ?';
		connection.query(cmd, [sid, uid], function(err, result) {
			if (err) {
				callback('');
				return 0;
			}
			if (type === null || result.length != 0) {
				var spath = config.JUDGE_PATH + "submission/" + sid + "-0";
				fs.readFile(spath, 'utf8', function(err, buf_data){
					if (err) {
						callback('');
						return 0;
					}
					callback(buf_data.toString());	
				});
			}
		});
	},
	source_result: function(sid, uid, type, callback) {
		if (uid == undefined || uid < 0) {
			callback(message.source_result);
			return 0;
		}
		var cmd = 'SELECT NULL FROM submissions WHERE sid = ? AND uid = ?';
		connection.query(cmd, [sid, uid], function(err, result) {
			if (err) {
				callback(message.source_result);
				return 0;
			}
			if (type === null || result.length != 0) {
				var spath = config.JUDGE_PATH + "submission/" + sid + "-z";
				fs.readFile(spath, 'utf8', function(err, buf_data){
					if (err) {
						callback('err');
						return 0;
					}
					result_html(buf_data.toString());
					callback(buf_data.toString());	
				});
			}
		});
	},
	source_result_html: function(sid, uid, type, callback) {
		if (uid == undefined || uid < 0) {
			callback(message.source_result);
			return 0;
		}
		var cmd = 'SELECT NULL FROM submissions WHERE sid = ? AND uid = ?';
		connection.query(cmd, [sid, uid], function(err, result) {
			if (err) {
				callback(message.source_result);
				return 0;
			}
			if (type === null || result.length != 0) {
				var spath = config.JUDGE_PATH + "submission/" + sid + "-z";
				fs.readFile(spath, 'utf8', function(err, buf_data){
					if (err) {
						callback('err');
						return 0;
					}
					callback(result_html(buf_data.toString()));
				});
			}
		});
	}
};
