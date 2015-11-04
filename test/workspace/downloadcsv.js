/**
	$ node downloadcsv __cid __outputfile_postfix
*/
var mysql = require('mysql'),
    fs = require('fs'),
    config = require('./const'),
    crypto = require('crypto'),
    randomstring = require("randomstring");

var connection = mysql.createPool({  
    host     : config.DATABASE.host, // config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
    port     : config.DATABASE.port
});

var scoreboard = function(cid, callback) {
	var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
	var table_config = {};
	table_config.cid = cid;
	connection.query(cmd, [cid], function(err, result) {
		if (!err)
			table_config.header = result;
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
};

var godfilter = function(table, callback) {
	var godlist = fs.readFileSync('godlist.lst').toString().replace(/(\r)/gm, '').split('\n');
	var grade = table.grade.filter(function(obj) {
		for (var key in godlist) {
			var name = godlist[key];
			if (obj.lgn == name)
				return false;
		}
		return true;
	});
	table.grade = grade;
	var user = table.user.filter(function(obj) {
		for (var key in godlist) {
			var name = godlist[key];
			if (obj.lgn == name)
				return false;
		}
		return true;
	});
	table.user = user;
	callback(table);
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
		fs.writeFileSync(partfilename, text);
	}
};


var args = process.argv.slice(2);
var cid = parseInt(args[0]), filename = args[1];

scoreboard(cid, function(result) {
	godfilter(result, function(table) {
		writecsvfile(table, filename);
	});
});