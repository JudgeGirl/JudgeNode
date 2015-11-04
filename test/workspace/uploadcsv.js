/**
	$ node uploadcsv __gradeid _filename
*/
var mysql = require('mysql'),
    fs = require('fs'),
    config = require('./const'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var parse = require('csv-parse');

var connection = mysql.createPool({  
    host     : config.DATABASE.host, // config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
    port     : config.DATABASE.port
});

var upload = function(gid, uid, score, callback) {
	var cmd = 'DELETE FROM exam_scores WHERE eid = ? AND uid = ?';
	connection.query(cmd, [gid, uid], function(err, result) {
		if (score >= 0) {
			var cmd = 'INSERT INTO exam_scores (uid, eid, score) VALUES (?, ?, ?)';
			connection.query(cmd, [uid, gid, score], function(err, result) {
				if (err)
					console.log(err);
				callback();
			});
		}
	});
};
var uploadtable = function(gid, table) {
	for (var i in table) {
		var uid = table[i][0];
		var score = table[i][2];
		upload(gid, uid, score, function() {

		});
	}
};

var args = process.argv.slice(2);
var gid = parseInt(args[0]), filename = args[1];

parse(fs.readFileSync(filename).toString(), {comment: '#'}, function(err, output) {
	var table = output.slice(1);
	uploadtable(gid, table);
});