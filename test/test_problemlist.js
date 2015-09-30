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

var cmd = [
	'INSERT INTO problems VALUES(271, 1, 0, "Original", "Multiply Polynomials", 5, 12)'
	,'INSERT INTO problem_dependency values (271,17)'
	,'INSERT INTO problem_dependency values (271,18)'
	,'INSERT INTO problem_dependency values (271,33)'
	//,'INSERT INTO levels values (3,"if-then-else switch",3)'
	];

for( var i = 0 ; i < cmd.length ; i++ ){
connection.query(cmd[i], [], function(err, result) {
	console.log(err);
	console.log(result);
});

}
