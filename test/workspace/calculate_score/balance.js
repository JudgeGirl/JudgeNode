/**
.CSV file format `uid,lgn,pid,score`

	$ node balance
*/
var fs = require('fs'),
	colors = require('colors');
var parse = require('csv-parse');

const { colorConsole, toRawScoreFilename} = require("../tool");

var connection = require('../../../lib/mysql').connection;

const config = require("./config");
const class1file = toRawScoreFilename(config.path, config.weekNumber, "tue") + "_0.csv";
const class2file = toRawScoreFilename(config.path, config.weekNumber, "mon") + "_0.csv";
const class1StudentNumber = config.studentNumber.Tue;
const class2StudentNumber = config.studentNumber.Mon;
const outfilename = config.path + "/" + config.result.filename;

function calculateScore(scoreStr, factor) {
    let score = parseInt(scoreStr)
    score = Math.ceil(score * factor);
    score = Math.max(Math.min(score, 100), 0);

    return score
}

var balance = function(table1, table2) {
	// calcuate factor
	var sum1 = 0, sum2 = 0;
	for (var i in table1)
		sum1 += parseInt(table1[i][3])
	for (var i in table2)
		sum2 += parseInt(table2[i][3])
	var avg1 = 0, avg2 = 0;
	var factor1 = 1, factor2 = 1;

    colorConsole("INFO", `class 1: total -> ${sum1}, student number -> ${class1StudentNumber}`, "green");
    colorConsole("INFO", `class 2: total -> ${sum2}, student number -> ${class2StudentNumber}`, "green");

	avg1 = sum1 / class1StudentNumber;
	avg2 = sum2 / class2StudentNumber;
	if (avg1 > avg2) {
		factor1 = 1;
		factor2 = avg1 / avg2;
	} else {
		factor2 = 1;
		factor1 = avg2 / avg1;
	}
    colorConsole("INFO", `${class1file} average = ${avg1}, factor = ${factor1}`, "green");
    colorConsole("INFO", `${class2file} average = ${avg2}, factor = ${factor2}`, "green");

    let uidList = [];

	// save file
	var text = '',
		header = ['uid', 'lgn', 'score'],
	text = header.join(',');
	for (var i in table1) {
        let rawScore = table1[i][3];
        let resultScore = calculateScore(rawScore, factor1);
        let uid = table1[i][0];
        let lgn = table1[i][1];

		let row = [uid, lgn, resultScore];
		text += '\n' + row.join(',');

        if (uidList.includes(uid)) {
            colorConsole('WARN', `table 1, duplicated user score: (${uid}, ${lgn}, ${rawScore})`, 'red');
        } else {
            uidList.push(uid);
        }
	}

	for (var i in table2) {
        let rawScore = table2[i][3];
        let resultScore = calculateScore(rawScore, factor2);
        let uid = table2[i][0];
        let lgn = table2[i][1];

		let row = [table2[i][0], table2[i][1], resultScore];
		text += '\n' + row.join(',');

        if (uidList.includes(uid)) {
            colorConsole('WARN', `table 2, duplicated user score: (${uid}, ${lgn}, ${rawScore})`, 'red');
        } else {
            uidList.push(uid);
        }
	}

    colorConsole("Save", 'result store into ' + outfilename, "yellow");
	fs.writeFileSync(outfilename, text);
	process.exit(0);
};

parse(fs.readFileSync(class1file).toString(), {comment: '#'}, function(err, output) {
	var table1 = output.slice(1);
	if (!err) {
        colorConsole("INFO", 'parse ' + class1file + ' success', "green");
	} else {
        colorConsole("Error", 'parse ' + class1file + ' failed', "red");
		process.exit(1);
	}

	parse(fs.readFileSync(class2file).toString(), {comment: '#'}, function(err, output) {
		var table2 = output.slice(1);
		if (!err) {
            colorConsole("INFO", 'parse ' + class2file + ' success', "green");
		} else {
            colorConsole("Error", 'parse ' + class2file + ' failed', "red");
			process.exit(1);
		}
		balance(table1, table2);
	});
});
