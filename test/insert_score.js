// INSERT INTO problems VALUES(1006, 1, 0, 'NPSC 2003 高中組初賽', '名偵探蚵男');

var mysql = require('mysql'),
	fs = require('fs'),
	config = require('../lib/const'),
	crypto = require('crypto'),
	randomstring = require("randomstring");

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

var all_account = fs.readFileSync('score.csv').toString().toUpperCase();
var accounts = all_account.split('\n');

for(var i = 0 ; i < accounts.length ; i++ ){
	(function(i){
		if( accounts[i] === '' || accounts[i] === null || accounts[i] === undefined ){
			return;
		}
		var score = accounts[i].split(',');
		score[0] = score[0].trim();
		score[1] = score[1].trim();

		connection.query( 'SELECT * FROM users WHERE lgn = ?', [score[0]], function(err, uid){
		connection.query( 'INSERT INTO exam_score VALUES(?, ?)', [uid[0].uid, score[1]] , function(err, result) {
                	console.log(err);
                	console.log(result);
        	});
		});
	})(i);
}



