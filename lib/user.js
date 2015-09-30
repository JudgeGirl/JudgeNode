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
	info: function(uid, callback) {	// show user page
		var cmd = 'SELECT uid, lgn, ip, ts2, motto, nname, class FROM users WHERE uid = ?';
		var user = {};
		connection.query(cmd, [uid], function(err, result) {
			if (err) {
				callback(null)
			}
			user.info = result[0];
			var cmd = 'SELECT pid FROM users NATURAL JOIN submissions WHERE uid = ? AND res = 7 GROUP BY uid, pid ORDER BY pid';
			connection.query(cmd, [uid], function(err, result) {
				user.solve = result;
				callback(user);
			});
		});
	}, 
	update_login: function(uid, ip, callback) {	// update login date & ip
		var time = new Date().getTime();
		var cmd = 'UPDATE users SET ip = ?, ts2 = ? WHERE uid = ?';
		connection.query(cmd, [ip, time, uid], function(err, result) {
			if (err) {
				callback(null)
			}
			callback();
		});
	}, 
	add_user: function(user, callback) {	// register page
		var cmd = 'SELECT uid FROM users WHERE lgn = ?';
		connection.query(cmd, [user.lgn], function(err, result) {
			if (err) {
				callback(0);
				return 0;
			} 
			var val = {
				ts1 : Date.now(),
				ts2 : Date.now(),
				lgn : user.lgn,
				pwd : crypto.createHash('sha1').update(user.pwd).digest('hex'),
				motto : escape(''),
				email : user.email,
				nname : user.nname,
				ename : ''
			};
			var cmd = 'INSERT INTO users SET ?';
			console.log(val);
			connection.query(cmd, [val], function(err, result) {
				if (err) {
					console.log(err);
					callback(0);
					return 0;
				}
				callback(1);
			});
		});
	},
	update_info: function(user, callback) {	// profile modify
		var cmd = 'UPDATE users SET motto = ? WHERE uid = ?';
		connection.query(cmd, [user.motto, user.uid], function(err, result) {
			if (err) {
				callback('Motto Update Fail');
				return 0;
			}
			if (user.pwd == '') {
				callback('Update success');
				return 0;
			}
			var cmd = 'UPDATE users SET pwd = ? WHERE uid = ?';
			user.pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
			connection.query(cmd, [user.pwd, user.uid], function(err, result) {
				if (err) {
					callback('Password Change Fail');
					return 0;
				}
				callback('Password has been changed');
			});
		});
	},
	login: function(user, session, callback) {	// login verify
		var pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
		var cmd = 'SELECT uid, class FROM users WHERE lgn = ? AND pwd = ?';
		connection.query(cmd, [user.lgn, pwd], function(err, result) {
			if (err || result.length == 0) {
				console.log(err);
				callback(0);
				return 0;
			}
			console.log(result);
			session.uid = result[0].uid;
			session.lgn = user.lgn;
			session["class"] = result[0]["class"];
			callback(1);
		});
	}
};
