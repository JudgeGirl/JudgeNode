/**
.CSV file format `uid,lgn,pid,score`
	$ node balance -W [_csvfile_]+ -B [_csvfile_]+ -o _outputfile
*/
var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var parse = require('csv-parse');

var connection = require('../../lib/mysql').connection;

var args = process.argv.slice(2);
// var class1file = args[0], class2file = args[1], outfilename = args[2];
var class1file = [], class2file = [], outfilename = 'default.csv';

var parseArgs = function(args) {
	for (var i = 0; i < args.length; i++) {
		if (args[i] == "-W") {
			for (i++; i < args.length; i++) {
				if (args[i].charAt(0) == '-')
					break;
				class1file.push(args[i]);
			}
			i--;
		} else if (args[i] == "-B") {
			for (i++; i < args.length; i++) {
				if (args[i].charAt(0) == '-')
					break;
				class2file.push(args[i]);
			}
			i--;
		} else if (args[i] == '-o') {
			i++;
			outfilename = args[i];
		}
	}
};
parseArgs(args);

var multibalance = function(table1, table2, totalscore) {
	// calcuate factor
	var sum1 = 0, sum2 = 0, size1 = 0, size2 = 0;
	for (var i in table1) {
		sum1 += parseInt(table1[i].score);
		size1++;
	}
	for (var i in table2) {
		sum2 += parseInt(table2[i].score);
		size2++;
	}

	var avg1 = 0, avg2 = 0;
	var factor1 = 1, factor2 = 1;
	avg1 = sum1 / size1;
	avg2 = sum2 / size2;
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
		var score = Math.ceil(parseInt(table1[i].score) * factor1);
		score = Math.max(Math.min(score, 200), 0);
		var row = [i, table1[i].lgn, score];
		text += '\n' + row.join(',');
	}

	for (var i in table2) {
		var score = Math.ceil(parseInt(table2[i].score) * factor2);
		score = Math.max(Math.min(score, 200), 0);
		var row = [i, table2[i].lgn, score];
		text += '\n' + row.join(',');
	}

	fs.writeFileSync(outfilename, text);
};

var readmultifile = function(tables, tablesname, callback) {
	if (tablesname.length == 0)
		return callback(tables);
	console.log(tablesname[0]);
	parse(fs.readFileSync(tablesname[0]).toString(), {comment: '#'}, function(err, output) {
		tables.push(output.slice(1));
		readmultifile(tables, tablesname.slice(1), callback);
	});
};
var mergeTable = function(tables) {
	var result = {};
	for (var i = 0; i < tables.length; i++) {
		var table = tables[i];
		for (var j = 0; j < table.length; j++) {
			var uid = table[j][0],
				lgn = table[j][1],
				pid = table[j][2],
				score = parseInt(table[j][3]);
			result[table[j][0]] = {lgn: lgn, score: 0};
		}
	}
	for (var i = 0; i < tables.length; i++) {
		var table = tables[i];
		for (var j = 0; j < table.length; j++) {
			var uid = table[j][0],
				lgn = table[j][1],
				pid = table[j][2],
				score = parseInt(table[j][3]);
			result[table[j][0]].score += score;
		}
	}
	return result;
};

readmultifile([], class1file, function(tableW) {
	readmultifile([], class2file, function(tableB) {
		tableW = mergeTable(tableW);
		tableB = mergeTable(tableB);
		multibalance(tableW, tableB, class1file.length * 100);
	});
});
// parse(fs.readFileSync(class1file).toString(), {comment: '#'}, function(err, output) {
// 	var table1 = output.slice(1);
// 	parse(fs.readFileSync(class2file).toString(), {comment: '#'}, function(err, output) {
// 		var table2 = output.slice(1);
// 		balance(table1, table2);
// 	});
// });