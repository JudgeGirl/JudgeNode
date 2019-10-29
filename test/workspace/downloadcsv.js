/**
	$ node downloadcsv
*/
const mysql = require('mysql');

const connection = require('../../lib/mysql').connection;

const { 
    colorConsole,  
    cidTag, 
    makeSurePathExist, 
    finish,
    writeFileSync,
    toRawScoreFilename,
    logErr
} = require("./tool");

const createScoreBoardTask = (cid, callback, filename) => {

	var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
	var table_config = {};
	table_config.cid = cid;

    return () => {
        colorConsole(cidTag(cid), 'Read contest id ' + cid + ' and path prefix ' + filename.cyan, "green");
        connection.query(cmd, [cid], createAskProblemListCallback(table_config, cid, callback));
    };
};

const writeCsvFileForProblemI = (grade, pid, header, partfilename, table, i) => {
    let text = '';
    let hasSubmit = [];

    var ptable = grade.filter(function(obj) {
        return obj.pid == pid;
    })
    text += header.join(',');
    for (var key in ptable) {
        var entry = ptable[key];

        if (entry.count > 15)
            colorConsole("WARN", `${entry.lgn} has submitted ${entry.count} times.`, "red");

        var row = [entry.uid, entry.lgn, entry.pid, entry['MAX(scr)']];
        text += '\n' + row.join(',');
        hasSubmit[entry.uid] = 1;
    }
    for (var key in table.user) {
        var entry = table.user[key];
        if (hasSubmit[table.user[key].uid] != 1) {
            var row = [entry.uid, entry.lgn, pid, 0];
            text += '\n' + row.join(',');
        }
    }
    colorConsole("SAVE", table.header[i].pid + '. ' + table.header[i].ttl + ', save into ' + partfilename.cyan, "yellow");
    writeFileSync(partfilename, text);
};

const writecsvfile = function(table, filename, callback) {
	var grade = table.grade;

    makeSurePathExist(filename);
        
	for (var i in table.header) {
		const pid = table.header[i].pid;
        const header = ['uid', 'lgn', ''+pid, 'score'];
        const partfilename = filename + '_' + i + '.csv';

        writeCsvFileForProblemI(grade, pid, header, partfilename, table, i);
	}
    callback(null, "success");
};

const createAskProblemListCallback = (table_config, cid, callback) => function(err, result) {
    if (!err) {
        table_config.header = result;
        colorConsole(cidTag(cid), 'fetch contest problem ' + result[0].pid + '. ' + result[0].ttl, "green");
    } else {
        logErr(err);
        process.exit(1);
    }

    var cmd = 'SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)';
    connection.query(cmd, [cid], createUserListCallback(table_config, cid, callback));
};

const createUserListCallback = (table_config, cid, callback) => function(err, result) {
    if (err) {
        logError(err);
        process.exit(1);
    }
        table_config.user = result || [];	
    colorConsole(cidTag(cid), '#Participants = ' + table_config.user.length, "green");
    colorConsole(cidTag(cid), 'Download scoreboard', "green");
    var cmd = 'SELECT uid, lgn, pid, COUNT(*) as count, MAX(scr) FROM submissions S NATURAL JOIN (SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class = 1 OR class = 2)) Z WHERE S.uid = Z.uid AND S.cid = ? GROUP BY pid, uid ORDER BY uid, pid;';
    
    connection.query(cmd, [cid, cid], createMaxScoreCallback(table_config, callback));
};

const createMaxScoreCallback = (table_config, callback) => {
    return function(err, result) {
        if (!err) {
            table_config.grade = result || [];
        } else {
            logErr(err);
            process.exit(1);
        }
        callback(table_config);
    };
};

const createWriteCsvFileCallback = (filename, callback) => result => {
    writecsvfile(result, filename, callback);
}

// main
(function() {
    const config = require("./config.js");

    // Tuesday score
    let cid = config.cid.Tue;
    let filename = toRawScoreFilename(config.path, config.weekNumber, "tue");
    const task2 = createScoreBoardTask(cid, createWriteCsvFileCallback(filename, finish), filename);


    // Monday score
    cid = config.cid.Mon;
    filename = toRawScoreFilename(config.path, config.weekNumber, "mon");
    const task1 = createScoreBoardTask(cid, createWriteCsvFileCallback(filename, task2), filename);

    task1();
})();
