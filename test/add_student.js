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

var all_account = "aga"; //fs.readFileSync('account.txt').toString().toUpperCase();
var accounts = all_account.split('\n');

var students = {};

function add_user(i){
	if( i >= accounts.length ){
		fs.writeFile("user_temp.js", JSON.stringify(students), function(){} );
		return;
	}
	if( accounts[i] === '' ){
		add_user(i+1);
		return ;
	}
	var pwd = randomstring.generate(12);
 
	connection.query( 'INSERT INTO users(lgn, pwd, email, class) VALUES(?, ?, ?, 3)', [accounts[i], crypto.createHash('sha1').update(pwd).digest('hex'), accounts[i]+'@ntu.edu.tw'] , function(err, result) {
	/*connection.query( 'UPDATE users SET pwd = ? where lgn = ?', [crypto.createHash('sha1').update('1234').digest('hex'), accounts[i]], function(err, result) {*/
                console.log(err);
                console.log(result);
		students[accounts[i]] = pwd;
		add_user(i+1);
        });
}

add_user(0);


