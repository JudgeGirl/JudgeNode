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
	list: function(callback) {
		var prob_path = './source/archive/archive.html';
		fs.readFile( prob_path, 'utf8', function(err, buf_data) {
			if (err) {
				callback('err');
				return 0;
			}
			var data = buf_data.toString();
			callback(data);
		});
	}
};
