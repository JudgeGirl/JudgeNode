var mysql = require('mysql'),
	config = require('../lib/const');

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

/*
CREATE TABLE contest_user(
	cid INTEGER NOT NULL,
	uid INTEGER NOT NULL,
	PRIMARY KEY(cid, uid)
);
*/
var cmd = 'SELECT uid FROM users WHERE class IS NULL';
// var cmd = 'SELECT uid FROM users WHERE class = 2';
var contest_cid = 14;
connection.query(cmd, function(err, result) {
	if (err) {
		console.log(err);
	}
	console.log(result);
	var cmd = 'INSERT INTO contest_user SET ?';
	for (var i = 0; i < result.length; i++) {
		var val = {
			cid : contest_cid,
			uid : result[i].uid
		};
		connection.query(cmd, [val], function(err, result) {
			console.log(err);
			console.log(result);
		});
	}
});

