/**
	$ nodejs adduser.js <username> <password> <class> <email>
		<class> 0 : admin, 1: class Mon, 2: class Tue
	example:
		nodejs adduser.js pangfeng 
*/
var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var assert = require('assert');

var connection = require('../../lib/mysql').connection;

var args = process.argv.slice(2);

assert(args.length == 4, 'Usage: $ nodejs adduser.js <username> <password> <class> <email>');

var username = args[0], password = args[1], classv = parseInt(args[2]), email = args[3];


var cmd;

if (classv == 0) {
	cmd = 'INSERT INTO users (lgn, pwd, email, class) VALUES (?, ?, ?, NULL)';
} else {
	cmd = 'INSERT INTO users (lgn, pwd, email, class) VALUES (?, ?, ?, ?)';
}

connection.query(cmd, [	username, crypto.createHash('sha1').update(password).digest('hex'), 
		email, classv ]
	, function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log('Create ' + username + ' Success');
		}
		connection.end(function(err) {
        		if (err)
	                	console.log(err);
		        else
        		        console.log('Close MySQL Success');
		});
});
