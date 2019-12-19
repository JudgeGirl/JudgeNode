/**
	$ nodejs adduserlist.js <list file> <class>
		<class> 0 : admin, 1: class Mon, 2: class Tue
	example:
		nodejs adduserlist.js students.lst 1
*/
var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var assert = require('assert');

var connection = require('../../lib/mysql').connection;

var args = process.argv.slice(2);

assert(args.length == 2, 'Usage: $ nodejs adduserlist.js <list file> <class>');

var listfile = args[0], classv = parseInt(args[1]);

var userlist = (fs.readFileSync(listfile).toString()).split("\n");

var adduser = function(i) {
	if (i == userlist.length) {
		process.exit(0);
		return 0;
	}
	var lgn = userlist[i],
		plain_pwd = randomstring.generate(8),
		email = lgn.toLowerCase() + '@ntu.edu.tw';
	if (lgn && lgn.length > 0) {
		var createuser = function(lgn, plain_pwd, email, classv) {
			var pwd = crypto.createHash('sha1').update(plain_pwd).digest('hex');
/*
			var cmd = 'INSERT INTO users (lgn, pwd, email, class) VALUES (?, ?, ?, ?)';
			connection.query(cmd, [lgn, pwd, email, classv], function(err, result) {
				if (err) {
					console.log('[Fail] ' + lgn + ' ' + plain_pwd);
				} else {
					console.log('[Create] ' + lgn + ' ' + plain_pwd);
				}
				adduser(i+1);
			});
*/
			console.log('[INFO] ' + lgn);

			var cmd = 'UPDATE users SET pwd = ?, class = ? WHERE lgn = ?';
			connection.query(cmd, [pwd, classv, lgn], function(err, result) {
				if (err) {
					console.log('[Fail] ' + lgn + ' ' + plain_pwd);
				} else {
					console.log('[Create] ' + lgn + ' ' + plain_pwd);
				}
				adduser(i+1);
			});
		};
		createuser(lgn, plain_pwd, email, classv);
	}
};
adduser(0);
/*
for (var i = 0; i < userlist.length; i++) {
	var lgn = userlist[i],
		plain_pwd = randomstring.generate(8),
		email = lgn.toLowerCase() + '@ntu.edu.tw';
	if (lgn && lgn.length > 0) {
		var createuser = function(lgn, plain_pwd, email, classv) {
			var pwd = crypto.createHash('sha1').update(plain_pwd).digest('hex');
			var cmd = 'INSERT INTO users (lgn, pwd, email, class) VALUES (?, ?, ?, ?)';
			connection.query(cmd, [lgn, pwd, email, classv], function(err, result) {
				if (err) {
					console.log('[Fail] ' + lgn + ' ' + plain_pwd);
				} else {
					console.log('[Create] ' + lgn + ' ' + plain_pwd);
				}
			});

	}
}

priocess.exit(0);
*/
