/**
	$ node uploadcsv
*/
var fs = require('fs'),
	colors = require('colors');
var parse = require('csv-parse');

var connection = require('../../../lib/mysql').connection;

var upload = function(gid, uid, score, callback) {
	var cmd = 'DELETE FROM exam_scores WHERE eid = ? AND uid = ?';
	connection.query(cmd, [gid, uid], function(err, result) {
		if (err)
			console.log(err);
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
var uploadtable = function(i, gid, table) {
	if (i == table.length) {
		console.log('[' + 'INFO'.green + ']' + ' All informations have been updated.');
		process.exit(0);
		return ;
	}
	var uid = table[i][0], score = table[i][2];
	upload(gid, uid, score, function() {
		uploadtable(i+1, gid, table);
	});
};

const config = require("./config");
const gid = config.gradeId;
const filename = config.path + "/" + config.scaledResult.filename;

parse(fs.readFileSync(filename).toString(), {comment: '#'}, function(err, output) {
	var table = output.slice(1);
	if (!err) {
		console.log('[' + 'INFO'.green + ']' + ' parse ' + (filename).cyan + ' success');
	} else {
		console.log('[' + 'Error'.red + ']' + ' parse ' + (filename).cyan + ' failed');
		process.exit(1);
	}
	uploadtable(0, gid, table);
});
