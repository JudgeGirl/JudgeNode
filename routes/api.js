var express = require('express');
var router = express.Router();
let { exec } = require('child_process');
const { StatusCodes } = require('http-status-codes');

const { loggerFactory } = require('lib/components/logger/LoggerFactory');
const passwordGenerator = require('../lib/components/passwordGenerator');
const _config = require('../lib/config').config;
const dblink = require('../lib/components/dblink');

let invalidAPIKey = (req, res) => {
    const apiKey = req.header("Api-Key");
    if (!apiKey || apiKey != _config.Privilege.API_key) {
        const url = req.originalUrl;

        if (!apiKey) {
            loggerFactory.getLogger(module.id).info('Trying to access api without the api key.', { url });
        } else {
            loggerFactory.getLogger(module.id).info('Recevied an invalid api key.', { apiKey, url });
        }

        res.status(StatusCodes.UNAUTHORIZED).json("api key required");
        return true;
    }

    return false;
}

let rejectNonAdmin = async function(req, res) {
    let uid = req.session.uid;
    let isAdmin = await dblink.helper.getIsAdminPromise(uid);

    if (!isAdmin) {
        res.status(StatusCodes.UNAUTHORIZED).json("administrator only");
        return false;
    }

    return true;
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
                res.status(StatusCodes.NOT_FOUND).json("user does not exist");
            } else
                return dblink.user.verifyPasswordPromise(user, password);
        })
        .then(userData => {
            res.json(userData);
        })
        .catch(err => {
            if (err == "invalid user or password") {

                res.status(StatusCodes.BAD_REQUEST).json("Wrong password");
            } else {

                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
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
                res.status(StatusCodes.NOT_FOUND).json({});
            } else if (userList.length > 1) {
                res.status(StatusCodes.BAD_REQUEST).json("Duplicated uid");
            } else {
                res.status(StatusCodes.OK).json(userList[0]);
            }
        }).catch(err => {
            const logger = loggerFactory.getLogger(module.id);
            logger.debug(new Error(`Error while getting the user info with uid ${uid}.`), { err });
            logger.debug(err);

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        })
});

router.get('/user', function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    if (req.query.name !== undefined) {
        dblink.user.promises.getUserByLoginName(req.query.name)
            .then(userList => {
                if (userList.length == 0) {
                    res.status(StatusCodes.NOT_FOUND).json({});
                } else if (userList.length > 1) {
                    res.status(StatusCodes.BAD_REQUEST).json("Duplicated uid");
                } else {
                    res.status(StatusCodes.OK).json(userList[0]);
                }
            }).catch(err => {
                loggerFactory.getLogger(module.id).info(new Error('Error while getting the user info.'), { err });
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
            })
    } else {
        res.status(StatusCodes.NOT_FOUND).json({});
    }
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
        res.status(StatusCodes.BAD_REQUEST).send("Invalid user info.");
        return;
    }

    let userExists = await dblink.user.userExistsPromise(name);
    if (userExists) {
        res.status(StatusCodes.CONFLICT).send("User already exists.");
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
    } catch(err) {
        const logger = loggerFactory.getLogger(module.id);
        logger.debug(new Error('Failed to create user with api.'));
        logger.debug(err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
        return;
    }

    res.status(StatusCodes.CREATED).json(user);
    return;
});

/**
* Create a new guild.
*/
router.post('/guild', async function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    let isAdmin = await rejectNonAdmin(req, res);
    if (!isAdmin)
        return;

    let title = req.body.title;
    let icon = req.body.icon;

    if (!title || !icon) {
        res.status(StatusCodes.BAD_REQUEST).json({});
        return;
    }

    const logger = loggerFactory.getLogger(module.id);
    logger.info(`Create a guild: (${title}, ${icon}) by ${req.session.uid}`);

    try {
        let gid = await dblink.guild.createGuild(title, icon);
        res.status(StatusCodes.OK).json({ gid: gid });
    } catch(err) {
        let errorMessage = `Failed to create guild: ("${title}", "${icon}")`;

        logger.info(errorMessage);
        logger.info(err.message);
        logger.debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
});

/**
* Clear members of a guild.
*/
router.delete('/guild/:gid/clear', async function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    let isAdmin = await rejectNonAdmin(req, res);
    if (!isAdmin)
        return;

    let gid = req.params.gid;

    if (!gid) {
        res.status(StatusCodes.BAD_REQUEST).json({});
        return;
    }

    const logger = loggerFactory.getLogger(module.id);
    logger.info(`Clear members in the guild: (${gid}) by ${req.session.uid}`);

    try {
        await dblink.user.unsetGidByGid(gid);
        res.status(StatusCodes.OK).json({ gid: gid });
    } catch(err) {
        let errorMessage = `Failed to clear members in the guild: ("${gid}")`;

        logger.info(errorMessage);
        logger.info(err.message);
        logger.debug(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
});

/**
* Update guild id for an user with its login name.
*/
router.put('/user/guild', async function(req, res, next) {
    let gid = req.body.gid;
    let lgn = req.body.lgn;

    if (!lgn) {
        res.status(StatusCodes.BAD_REQUEST).json("require lgn");
        return;
    }

    let isAdmin = await rejectNonAdmin(req, res);
    if (!isAdmin)
        return;

    if (invalidAPIKey(req, res))
        return;

    const logger = loggerFactory.getLogger(module.id);
    logger.info(`Set guild of an user: (${lgn}, ${gid}) by ${req.session.uid}`);

    try {
        let lgnList = await dblink.user.promises.getUserByLoginName(lgn);
        if (lgnList.length !== 1)
            throw Error(`invalid user with lgn ${lgn}`);
        let uid = lgnList[0].uid;

        if (gid == undefined || gid == "") {
            // unset user's gid
            await dblink.user.unsetGid(uid);
        } else {
            // set user's gid
            let guildList = await dblink.guild.promises.getGuild(gid);
            if (guildList.length !== 1)
                throw Error(`invalid guild number: ${guildList.length}`);

            await dblink.user.setGid(uid, gid);
        }

        res.status(StatusCodes.OK).json({});
    } catch (err) {
        logger.warn(`Failed to add user ${lgn} into the guild.`);
        logger.warn(err.message);
        logger.debug(err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
        return;
    }
});

/**
* Update guild id for an user with its uid.
*/
router.put('/user/:uid/guild', async function(req, res, next) {
    let uid = req.params.uid;
    let gid = req.body.gid;

    if (!uid) {
        res.status(StatusCodes.BAD_REQUEST).json({});
        return;
    }

    let isAdmin = await rejectNonAdmin(req, res);
    if (!isAdmin)
        return;

    if (invalidAPIKey(req, res))
        return;

    const logger = loggerFactory.getLogger(module.id);
    logger.info(`Set guild of an user: (${uid}, ${gid}) by ${req.session.uid}`);

    try {
        // uid check
        let userExists = dblink.user.promises.userExistsByUid(uid);
        if (!userExists)
            throw Error(`user ${uid} not exists`);

        if (gid == undefined || gid == "") {
            await dblink.user.unsetGid(uid);
        } else {
            // guild check
            let guildList = await dblink.guild.promises.getGuild(gid);
            if (guildList.length !== 1)
                throw Error(`invalid guild number: ${guildList.length}`);

            await dblink.user.setGid(uid, gid);
        }

        res.status(StatusCodes.OK).json({});
    } catch (err) {
        const logger = loggerFactory.getLogger(module.id);
        logger.info(new Error(`Failed insert a user into a guild.`));
        logger.info(err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
        return;
    }
});


router.post('/user/password/reset', async function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    const uid = req.body.uid;
    if (!uid) {
        res.status(StatusCodes.BAD_REQUEST).send("Uid required.");
        return;
    }

    const userExists = await dblink.user.promises.userExistsByUid(uid);
    if (!userExists) {
        res.status(StatusCodes.NOT_FOUND).send("User not exists.");
        return;
    }

    const password = passwordGenerator.generate();
    try {
        const dbResult = await dblink.user.promises.setPassword(uid, password);
        if (!dbResult) {
            loggerFactory.getLogger(module.id).debug(new Error(`Wrong result.`));
        }
    } catch (err) {
        const logger = loggerFactory.getLogger(module.id);
        logger.debug(new Error(`Failed to reset password of user with uid ${uid}.`));
        logger.debug(err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
        return;
    }

    const user = {
        uid,
        password
    };

    res.status(StatusCodes.OK).json(user);
    return;
});

/*
 *      Simulates account creation. Won't actually create any account.
 */
router.post('/user-test', async function(req, res, next) {
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

    let user = {
        name: name,
        email: email,
        'class': type,
        password: password,
    };

    res.status(StatusCodes.CREATED).json(user);
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
        res.status(StatusCodes.BAD_REQUEST).send("Invalid submission info");
        return;
    }

    if (invalidAPIKey(req, res))
        return;

    let sidExists = await dblink.submission.submissionExistsPromise(sid);
    if (!sidExists) {
        res.status(StatusCodes.CONFLICT).send("Submission not exists");
        return;
    }


    let dbResult;
    try {
        dbResult = await dblink.submission.setSubmissionPromise(sid, values);
    } catch(err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }

    if (dbResult)
        res.status(StatusCodes.OK).send("success");
    else
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("operation failed");

    return;
});

/**
* Force update style check report for a submission.
*/
router.put('/report/:sid', async function(req, res, next) {
    if (invalidAPIKey(req, res))
        return;

    let isAdmin = await rejectNonAdmin(req, res);
    if (!isAdmin)
        return;

    // wow. such dirty code
    let sid = req.params.sid;
    let command = `poetry run python scripts/send_style_check_task.py ${sid}`;
    let cwd = '/home/judgesister/Judge-sender';

    let options = { cwd: cwd }
    const process = exec(command, options, function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }

        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
    });

    process.on('exit', function (code) {
        console.log('Child process exited with exit code '+code);
        if (code == 0)
            res.status(StatusCodes.OK).json('success');
        else
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json('failed');
    });

});

module.exports = router;
