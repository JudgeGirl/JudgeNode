/**
 *	.csv file format `學號, 姓名, 成績, 成績註記`
 *
 * $ node reportgrade xxx.csv
 */

var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var parse = require('csv-parse');

var connection = require('../../lib/mysql').connection;

/**
 *	download grade board
 */
var gradeboard = function(callback) {
	var cmd = 'SELECT uid, lgn, sum(score) final FROM exam_scores NATURAL JOIN users NATURAL JOIN exams WHERE class = 1 OR class = 2 GROUP BY uid;';
	connection.query(cmd, [], function(err, result) {
		if (err) {
			console.log(err);
			return callback([]);
		}
		return callback(result);
	});
}

/**
 *	god's score = fullscore
 */
var godfilter = function(table, callback) {
	var godlist = fs.readFileSync('godlist.lst').toString().replace(/(\r)/gm, '').split('\n');
	var fullscore = 1800;
	function god(single) {
		for (var key in godlist) {
			var name = godlist[key];
			if (single['lgn'] == name)
				single['final'] = fullscore;
		}
		return single;
	}
	table = table.map(god);
	callback(table);
};

/**
 *
 */
var toGPA = function(score) {
	score = Math.ceil(score);
	if (score >= 90)
		return 'A+';
	if (score >= 85)
		return 'A';
	if (score >= 80)
		return 'A-';
	if (score >= 77)
		return 'B+';
	if (score >= 73)
		return 'B';
	if (score >= 70)
		return 'B-';
	if (score >= 67)
		return 'C+';
	if (score >= 63)
		return 'C';
	if (score >= 60)
		return 'C-';
	return 'F';
}

/**
 *  match school final grade table
 */
var fillout = function(filename, mtable) {
	function store(table, filename) {
		var text = '';
		for (var key in table) {
			var row = table[key];
			text += row.join(',') + '\n';
		}
		fs.writeFileSync(filename, text);
	};
	parse(fs.readFileSync(filename).toString(), {comment: '#'}, function(err, stable) {
		if (err) {
			return console.log(err);
		}
		function joinTable(single) {
			for (var key in mtable) {
				var obj = mtable[key];
				if (obj['lgn'] == single[0]) {
					single[2] = toGPA(obj['final'] / 100 * 6);
				}
			}
			return single;
		}
		stable = stable.map(joinTable);
		store(stable, 'fin-' + filename);
	});
}

/**
 * main function
 */
var run = function() {
	var args = process.argv.slice(2);
	var file = args[0];
	gradeboard(function(otable) {
		godfilter(otable, function(mtable) {
			fillout(file, mtable);
			console.log()
		});
	});
}
run();