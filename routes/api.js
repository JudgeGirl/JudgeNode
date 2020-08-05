var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var markdown = require('../lib/components/plugin/markdown');
var fs = require('fs');
var passwordGenerator = require('../lib/components/passwordGenerator');

let invalidAPIKey = (req, res) => {
    const api_key = req.header("Api-Key");
    if (!api_key || api_key != _config.Privilege.API_key) {
        res.status(401).json({});
        return true;
    }

    return false;
}

router.get('/submissions?', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        dblink.api.list(req.query, isadmin, function(result) {
            res.json(result);
        });
    });
});

router.get('/result?', function(req, res, next) {
    var sid = req.query.sid;
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (sid == undefined || sid == null) sid = 0;
        dblink.api.result(sid, isadmin, function(result) {
            res.json(result);
        });
    });
});

router.get('/problems?', function(req, res, next) {
    var did = req.query.did,
        lid = req.query.lid,
        uid = req.query.uid;
    dblink.api.problems(did, lid, uid, function(result) {
        res.json(result);
    });
});

router.get('/status', (req, res, next) => {
    const uid = req.session.uid || false;
    let serverStatus = {
        message: "alive",
        "test mode": _config.CONTEST.MODE,
        uid: uid || false
    };

    let taskList = [];
    taskList.push(dblink.api.waitingNumber());
    taskList.push(dblink.helper.getIsAdminPromise(uid));
    taskList.push(dblink.api.submissionWaitSecs());

    Promise.all(taskList).then(resArr => {
        serverStatus["waiting number"] = resArr[0];
        serverStatus["is admin"] = resArr[1];
        serverStatus["waiting seconds"] = resArr[2];
        res.json(serverStatus);
    }).catch(err => res.json(err));
});

router.post('/auth', (req, res, next) => {
    const uid = req.session.uid;
    const user = req.body.user;
    const password = req.body.password;

    if (invalidAPIKey(req, res))
        return;

    dblink.user.userExistsPromise(user)
        .then(existence => {
            if (!existence) {
                res.status(404).json("user does not exist");
            } else
                return dblink.user.verifyPasswordPromise(user, password);
        })
        .then(userData => {
            res.json(userData);
        })
        .catch(err => {
            if (err == "invalid user or password") {

                res.status(400).json("wrong password");
            } else {

                res.status(500).json(err);
            }
        });
});

router.get('/user/:uid', function(req, res, next) {
    let uid = req.params.uid;
    if (invalidAPIKey(req, res))
        return;

    dblink.user.getUserByUidPromise(uid)
        .then(userList => {
            if (userList.length == 0) {
                res.status(404).json({});
            } else if (userList.length > 1) {
                res.status(500).json("duplicated uid");
            } else {
                res.status(200).json(userList[0]);
            }
        }).catch(err => {
            res.status(500).json(err);
        })
});

router.post('/user', async function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    let name = req.body.name;
    let email = req.body.email;
    let type = req.body.type; // class
    let password;
    if (req.body.password)
        password = req.body.password;
    else
        password = passwordGenerator.generate();

    if (!name || !type) {
        res.status(400).send("invalid user info");
        return;
    }

    let userExists = await dblink.user.userExistsPromise(name);
    if (userExists) {
        res.status(409).send("user already exists");
        return;
    }

    let user = {
        name: name,
        email: email,
        'class': type,
        password: password,
    };

    try {
        let dbResult = await dblink.user.addUserPromise(user);
    } catch(e) {
        console.log(e);
        res.status(500).json(e);
    }

    res.status(201).json(user);
    return;
});

router.patch('/submission/:sid', async function(req, res, next) {
    let sid = req.params.sid;
    let result = req.body.result;
    let score = req.body.score;
    let cpu = req.body.cpu;
    let memory = req.body.memory;
    let language = req.body.language;
    let problemId = req.body.problemId;
    let userId = req.body.userId;
    let contestId = req.body.contestId;

    values = {};
    let valueLen = 0;
    if (result !== undefined) {
        values["res"] = result;
        valueLen++;
    }

    if (score !== undefined) {
        values["scr"] = score;
        valueLen++;
    }

    if (cpu !== undefined) {
        values["cpu"] = cpu;
        valueLen++;
    }

    if (memory !== undefined) {
        values["mem"] = memory;
        valueLen++;
    }

    if (language !== undefined) {
        values["lng"] = language;
        valueLen++;
    }

    if (problemId !== undefined) {
        values["pid"] = problemId;
        valueLen++;
    }

    if (userId !== undefined) {
        values["uid"] = userId;
        valueLen++;
    }

    if (contestId !== undefined) {
        values["cid"] = contestId;
        valueLen++;
    }

    if (!sid || valueLen == 0) {
        res.status(400).send("invalid submission info");
        return;
    }

    if (invalidAPIKey(req, res))
        return;

    let sidExists = await dblink.submission.submissionExistsPromise(sid);
    if (!sidExists) {
        res.status(409).send("submission not exists");
        return;
    }


    let dbResult;
    try {
        dbResult = await dblink.submission.setSubmissionPromise(sid, values);
    } catch(e) {
        console.log(e);
        res.status(500).json(e);
    }

    if (dbResult)
        res.status(200).send("success");
    else
        res.status(500).send("operation failed");

    return;
});

module.exports = router;
