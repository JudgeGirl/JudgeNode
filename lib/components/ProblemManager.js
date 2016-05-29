var mysql = require('mysql'),
    fs = require('fs'),
    path = require("path"),
    config = require('../config').config;

var connection = require('../mysql').connection;

var sourceList = function(pid, callback) {
    var source_list_path = config.JUDGE.path + "testdata/" + pid + "/source.lst";
    fs.readFile(source_list_path, 'utf8', function(err, buf_data) {
        var source_list = [];
        if (!err)
            source_list = buf_data.toString().split('\n');
        for (var i = 0; i < source_list.length; i++) {
            if (source_list[i].trim().length == 0) {
                source_list.splice(i, 1);
                i--;
            }
        }
        callback(source_list);
    });
};
var testdataList = function(pid, callback) {
    var source_list_path = config.JUDGE.path + "testdata/" + pid + "/subtasks.py";
    fs.readFile(source_list_path, 'utf8', function(err, buf_data) {
        var testdata_list = [];
        if (!err)
            testdata_list = eval('(' + buf_data.toString() + ')');
        callback(testdata_list);
    });
};
var downloadList = function(pid, callback) {
    var source_list_path = "./public/downloads/testdata/" + pid;
    console.log(source_list_path);
    var walk = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results);
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function(err, res) {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        results.push(file.substr(source_list_path.length+1));
                        next();
                    }
                });
            })();
        });
    };
    walk(source_list_path, function(err, result) {
        console.log(err);
        if (err) return callback([]);
        return callback(result);
    });
};
var publicList = function(callback) {
    var cmd = 'SELECT * FROM problems WHERE pub != 0 ORDER BY level ASC, porder ASC';
    connection.query(cmd, [], function(err, result) {
        callback(result);
    });
};
var levelList = function(callback) {
    var cmd = 'SELECT * FROM levels ORDER BY lorder ASC';
    connection.query(cmd, [], function(err, result) {
        callback(result);
    });
};
var domainLevelList = function(did, callback) {
    var cmd = 'SELECT L.level, L.ttl FROM levels AS L JOIN level_domain AS D ON D.level = L.level WHERE D.did = ? ORDER BY lorder ASC;';
    connection.query(cmd, [did], function(err, result) {
        callback(result);
    });
};
var scoreboard = function(uid, callback) {
    if (uid == undefined || uid < 0)
        return callback([]);
    var cmd = 'SELECT pid, MAX(scr) as score FROM submissions WHERE uid = ? GROUP BY uid, pid ORDER BY pid';
    connection.query(cmd, [uid], function(err, result) {
        if (err)
            return callback([]);
        callback(result);
    });
};
var levelProgress = function(uid, did, callback) {
    var level_progress = {};
    var cmd = 'SELECT D.level, count(*) AS count FROM level_domain AS D JOIN problems AS P ON (P.level = D.level AND D.did = ? AND P.pub = 1) GROUP BY D.level;';
    connection.query(cmd, [did], function(err, result) {
        if (err)
            return callback(level_progress);
        level_progress['db'] = result;
        if (uid == undefined || uid < 0)
            return callback(level_progress);
        var cmd = 'SELECT D.level, count(*) AS count FROM level_domain AS D JOIN (SELECT S.pid, level, S.res AS res FROM submissions AS S JOIN problems AS P ON (S.pid = P.pid AND S.res = 7) WHERE uid = ? GROUP BY uid, pid) AS P ON (P.level = D.level AND D.did = ?) GROUP BY D.level;';
        connection.query(cmd, [uid, did], function(err, result) {
            if (err)
                return callback(level_progress);
            level_progress['ac'] = result;
            return callback(level_progress);
        });
    });
};
var dependencyGraph = function(callback) {
    var cmd = 'SELECT * FROM problem_dependency';
    connection.query(cmd, [], function(err, result) {
        callback(result);
    });
};
var problemContent = function(pid, callback) {
    var prob_path = config.JUDGE.path + 'source/problem/' + pid + '.html';
    fs.readFile(prob_path, 'utf8', function(err, buf_data) {
        var data = err ? 'Loading Error 1' : buf_data.toString();
        sourceList(pid, function(source_list) {
            var cmd = 'SELECT * FROM problems WHERE pid = ?';
            connection.query(cmd, [pid], function(err, result) {
                if (err)
                    return callback('Loading Error 2');
                callback(data, result, source_list);
            });
        });
    });
};
var problemSolution = function(pid, callback) {
    var sol_path = config.JUDGE.path + 'source/solution/' + pid + '.html';
    var sconfig = {};
    var cmd = 'SELECT * FROM problems WHERE pid = ?';
    connection.query(cmd, [pid], function(err, result) {
        if (err || result.length == 0)
            return callback(null);
        sconfig.config = result[0];
        fs.readFile(sol_path, 'utf8', function(err, buf_data) {
            if (err) return callback(sconfig);
            sconfig.content = buf_data.toString();
            return callback(sconfig);
        });
    });
};
var recentUpdate = function(callback) {
    var cmd = 'SELECT * FROM problems ORDER BY ts DESC LIMIT 10';
    connection.query(cmd, function(err, result) {
        callback(result);
    });
};
var problemSubmissionCount = function(callback) {
    var cmd = 'SELECT pid, COUNT(*) as submissions_count FROM submissions GROUP BY pid';
    connection.query(cmd, [], function(err, result) {
        callback(result);
    });
};

module.exports = {
    dependencyGraph: dependencyGraph,
    domainLevelList: domainLevelList,
    downloadList: downloadList,
    levelList: levelList,
    levelProgress: levelProgress, 
    recentUpdate: recentUpdate,
    scoreboard: scoreboard,
    sourceList: sourceList,
    problemContent: problemContent,
    problemSolution: problemSolution,
    problemSubmissionCount: problemSubmissionCount,
    publicList: publicList,
    testdataList: testdataList,
};
