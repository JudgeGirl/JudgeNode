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
CREATE TABLE contest_problem(
	cid INTEGER NOT NULL,
	pid INTEGER NOT NULL,
	PRIMARY KEY(cid, pid)
);
new Date(year, month, day, hours, minutes, seconds, milliseconds) 
*/
var contest_cid = 14, 
	pid = [10013],
	pttl = ["TA --- Week 3, Mon."];

for (var p in pid) {
	var val = {
		cid : contest_cid,
		pid : pid[p]
	};
	connection.query('INSERT INTO contest_problem SET ?', [val], function(err, result) {
		console.log(err);
		console.log(result);
	});
	connection.query('INSERT INTO problems VALUES(?, 0, 0, "Contest", ?, ?, 1)', [pid[p], pttl[p], pid[p]], function(err, result) {
		console.log(err);
		console.log(result);
	});
}
