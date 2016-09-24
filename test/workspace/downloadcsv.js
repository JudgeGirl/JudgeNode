/**
	$ node downloadcsv __cid __outputfile_postfix
*/
var mysql = require('mysql'),
	fs = require('fs'),
	colors = require('colors');

var connection = require('../../lib/mysql').connection;

var scoreboard = function(cid, callback) {
	var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
	var table_config = {};
	table_config.cid = cid;
	connection.query(cmd, [cid], function(err, result) {
		if (!err) {
			table_config.header = result;
			console.log('[' + 'INFO'.green + ']' + ' fetch contest problem ' + result[0].pid + '. ' + result[0].ttl);
		} else {
			console.log('[' + 'Error'.red + ']');
			console.log(err);
		}
		var cmd = 'SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)';
		connection.query(cmd, [cid], function(err, result) {
			if (!err)
			 	table_config.user = result || [];	
			console.log('[' + 'INFO'.green + ']' + ' #Participants = ' + table_config.user.length);
			console.log('[' + 'INFO'.green + ']' + ' Download scoreboard');
			var cmd = 'SELECT uid, lgn, pid, COUNT(*), MAX(scr) FROM submissions S NATURAL JOIN (SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)) Z WHERE S.uid = Z.uid AND S.cid = ? GROUP BY pid, uid ORDER BY uid, pid;';
			connection.query(cmd, [cid, cid], function(err, result) {
				if (!err) {
			 		table_config.grade = result || [];
				} else {
					console.log('[' + 'Error'.red + ']');
			 		console.log(err);
				}
			 	callback(table_config);
			});
		});
	});
};

var writecsvfile = function(table, filename) {
	var grade = table.grade;
	for (var i in table.header) {
		var pid = table.header[i].pid,
			header = ['uid', 'lgn', ''+pid, 'score'], 
			text = '',
			partfilename = filename + '_' + i + '.csv',
			hasSubmit = [];

		var ptable = grade.filter(function(obj) {
			return obj.pid == pid;
		})
		text += header.join(',');
		for (var key in ptable) {
			var entry = ptable[key];
			var row = [entry.uid, entry.lgn, entry.pid, entry['MAX(scr)']];
			text += '\n' + row.join(',');
			hasSubmit[entry.uid] = 1;
		}
		for (var key in table.user) {
			var entry = table.user[key];
			if (hasSubmit[table.user[key].uid] != 1) {
				var row = [entry.uid, entry.lgn, pid, 0];
				text += '\n' + row.join(',');
			}
		}
		console.log('[' + 'Save'.yellow + '] ' + table.header[i].pid + '. ' + table.header[i].ttl + ', save into ' + partfilename.cyan);
		fs.writeFileSync(partfilename, text);
	}
	process.exit(0);
};


var args = process.argv.slice(2);
var cid = parseInt(args[0]), filename = args[1];

console.log('[' + 'INFO'.green + ']' + ' Read contest id ' + cid + ' and path prefix ' + filename.cyan);
scoreboard(cid, function(result) {
	writecsvfile(result, filename);
});
