// INSERT INTO problems VALUES(1006, 1, 0, 'NPSC 2003 高中組初賽', '名偵探蚵男');

var mysql = require('mysql'),
	config = require('../lib/const');

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

var cmd = [ "SELECT lgn, COALESCE(s, 0) as s from ( select uid, lgn from users where class = 1 ) as A LEFT OUTER JOIN ( select uid, pid, MAX(scr) as s from submissions where pid = 10004 GROUP BY uid, pid) as B ON A.uid = B.uid ORDER BY lgn"];


for( var i = 0 ; i < cmd.length ; i++ ){
connection.query(cmd[i], [], function(err, result) {
	for( var j = 0 ; j < result.length ; j++ ){
		console.log(result[j].lgn + "," + result[j].s);
	}
});

}
