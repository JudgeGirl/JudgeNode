var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var markdown = require('../lib/components/plugin/markdown');
var fs = require('fs');


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
    let status = {
        message: "alive",
        "contest mode": _config.CONTEST.MODE,
        uid: uid || false
    };

    dblink.api.waitingNumber()
        .then(result => {
            status["waiting number"] = result;
        })
        .then(() => dblink.helper.getIsAdminPromise(uid))
        .then(isAdmin => {
            status["is admin"] = isAdmin;
        })
        .then(() => {
            res.json(status);
        })
        .catch(err => res.json(err));
});

router.post('/auth', (req, res, next) => {
    const uid = req.session.uid;
    const user = req.body.user;
    const password = req.body.password;

    let result = {};

    dblink.helper.getIsAdminPromise(uid)
        .then(isAdmin => {
            if (!isAdmin) {
                res.status(401).json({});
                return;
            }
        })
        .then(() => dblink.user.verifyPassword(user, password))
        .then(userData => {
            result.status = 0;
            result.user = userData;

            res.json(result);
        })
        .catch(err => {
            result.status = -1;
            result.error = err;

            res.status(401).json(result);
        });
});

module.exports = router;
