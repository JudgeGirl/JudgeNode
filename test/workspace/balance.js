/**
.CSV file format `uid,lgn,pid,score`

	$ node balance _csvfile_1 _csvfile_2 _outputfile
*/
var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var parse = require('csv-parse');

var connection = require('../../lib/mysql').connection;

var args = process.argv.slice(2);
var class1file = args[0], class2file = args[1], outfilename = args[2];

var balance = function(table1, table2) {
	// calcuate factor
	var sum1 = 0, sum2 = 0;
	for (var i in table1)
		sum1 += parseInt(table1[i][3])
	for (var i in table2)
		sum2 += parseInt(table2[i][3])
	var avg1 = 0, avg2 = 0;
	var factor1 = 1, factor2 = 1;
	avg1 = sum1 / table1.length;
	avg2 = sum2 / table2.length;
	if (avg1 > avg2) {
		factor1 = 1;
		factor2 = avg1 / avg2;
	} else {
		factor2 = 1;
		factor1 = avg2 / avg1;
	}

	// save file
	var text = '',
		header = ['uid', 'lgn', 'score'], 
	text = header.join(',');
	for (var i in table1) {
		var score = Math.ceil(parseInt(table1[i][3]) * factor1);
		score = Math.max(Math.min(score, 100), 0);
		var row = [table1[i][0], table1[i][1], score];
		text += '\n' + row.join(',');
	}

	for (var i in table2) {
		var score = Math.ceil(parseInt(table2[i][3]) * factor2);
		score = Math.max(Math.min(score, 100), 0);
		var row = [table2[i][0], table2[i][1], score];
		text += '\n' + row.join(',');
	}

	fs.writeFileSync(outfilename, text);
};

parse(fs.readFileSync(class1file).toString(), {comment: '#'}, function(err, output) {
	var table1 = output.slice(1);
	parse(fs.readFileSync(class2file).toString(), {comment: '#'}, function(err, output) {
		var table2 = output.slice(1);
		balance(table1, table2);
	});
});
