var fs = require('graceful-fs'),
    config = require('../config').config;

var connection = require('../mysql').connection;
const problemResource = require('./resource/ProblemResource');
const solutionResource = require('./resource/SolutionResource');

var sourceList = function(pid, callback) {
    var source_list_path = config.RESOURCE.testdata + "/" + pid + "/source.lst";
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
    var source_list_path = config.RESOURCE.testdata + "/" + pid + "/subtasks.py";
    fs.readFile(source_list_path, 'utf8', function(err, buf_data) {
        var testdata_list = [];
        if (!err)
            testdata_list = eval('(' + buf_data.toString() + ')');
        callback(testdata_list);
    });
};

function isDirectory(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err)
                reject(err);

            resolve(stat && stat.isDirectory());
        });
    });
}

function listDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, fileList) => {
            if (err)
                reject(err);

            resolve(fileList);
        });
    })
}

async function traverseDirectory(dir, skipLength) {
    let result = [];

    let fileList = await listDirectory(dir);

    for (const file of fileList) {
        let currentFile = dir + '/' + file;

        if (await isDirectory(currentFile)) {
            await traverseDirectory(currentFile, function(err, res) {
                result = result.concat(res);
            });

            continue;
        }

        currentFile = currentFile.substr(skipLength); // remove source list path
        result.push(currentFile);
    }

    return result;
}

/**
 * The function find all the files under the testdata directory of given pid.
 */
var downloadList = async function(pid, callback) {
    let sourceListPath = config.RESOURCE.public.testdata + '/' + pid;

    try {
        let result = await traverseDirectory(sourceListPath, sourceListPath.length + 1);
        callback(result);
    } catch (err) {
        console.log(err);
        callback([]);
    }
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

var problemContent = async function(pid, callback) {
    let problemHtml;

    try {
        let problemHtmlStream = await problemResource.getHTML(pid);
        if (problemHtmlStream === null)
            throw new Error('problem not found');

        problemHtml = problemHtmlStream.toString();
    } catch (err) {
        callback(err);
        return;
    }

    sourceList(pid, function(source_list) {
        var cmd = 'SELECT * FROM problems WHERE pid = ?';
        connection.query(cmd, [pid], function(err, result) {
            if (err)
                return callback('Loading Error 2');
            callback(problemHtml, result, source_list);
        });
    });
};

var problemSolution = function(pid, callback) {
    var sconfig = {};
    var cmd = 'SELECT * FROM problems WHERE pid = ?';
    connection.query(cmd, [pid], async function(err, result) {
        if (err || result.length == 0)
            return callback(null);
        sconfig.config = result[0];

        let htmlContent = await solutionResource.getHTML(pid);
        if (htmlContent !== null)
            sconfig.content = htmlContent.toString();

        callback(sconfig);
    });
};
var recentUpdate = function(callback) {
    var cmd = 'SELECT P.pid, P.ttl, L.ttl AS level_name, D.did FROM problems AS P JOIN level_domain AS D ON P.level = D.level JOIN levels AS L ON P.level = L.level WHERE pub = 1 ORDER BY ts DESC LIMIT 10';
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
