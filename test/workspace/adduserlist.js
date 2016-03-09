/**
	$ nodejs adduserlist.js <list file> <class>
		<class> 0 : admin, 1: class Mon, 2: class Tue
	example:
		nodejs adduserlist.js students.lst 
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

for (var i = 0; i < userlist.length; i++) {
	var lgn = userlist[i],
		pwd = 'pp2016', 
		email = lgn.toLowerCase() + '@ntu.edu.tw';
	if (lgn && lgn.length > 0) {
		pwd = crypto.createHash('sha1').update(pwd).digest('hex');
		var cmd = 'INSERT INTO users (lgn, pwd, email, class) VALUES (?, ?, ?, ?)';
		connection.query(cmd, [lgn, pwd, email, classv], function(err, result) {
			if (err) {
				return console.log(err);
			} else {
				console.log('Create User');
			}
		});
	}
}

