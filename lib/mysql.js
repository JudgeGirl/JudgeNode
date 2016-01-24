var mysql  = require('mysql'),
	config = require("./config").config;

var connection = mysql.createPool(config.DATABASE);

connection.getConnection(function(err,connection) {
	if (err) {
		console.log(err);
		connection.release();
  		console.info('Error: Could not connect to MySQL.'.red);
  		return;
	}
});

exports.connection = connection;