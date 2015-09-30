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
CREATE TABLE contests(
	cid INTEGER PRIMARY KEY,
	pub INTEGER NOT NULL,    -- 是否公開 (零/非零)
	ts1 INTEGER NOT NULL,    -- 開始時間
	ts2 INTEGER NOT NULL,    -- 結束時間
	ttl TEXT    NOT NULL     -- 比賽名稱
);
new Date(year, month, day, hours, minutes, seconds, milliseconds) 
*/
var cmd = 'INSERT INTO contests SET ?';
// var cmd = 'UPDATE contests SET ts2 = ? where cid = 8';
var val = {
	pub : 0,
	ts1 : new Date(2015, 9-1, 28, 16, 0, 0, 0).getTime(),
	ts2 : new Date(2015, 9-1, 29, 16, 0, 0, 0).getTime(),
	ttl : 'Week 3, TA Exam'
};
connection.query(cmd, [val], function(err, result) {
	console.log(err);
	console.log(result);
});
