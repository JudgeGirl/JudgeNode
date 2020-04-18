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
        "test mode": _config.CONTEST.MODE,
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
    const api_key = req.header("Api-Key");

    if (!api_key || api_key != _config.Privilege.API_key) {
        res.status(401).json({});
        return;
    }

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
    const api_key = req.header("Api-Key");
    if (!api_key || api_key != _config.Privilege.API_key) {
        res.status(401).json({});
        return;
    }

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

module.exports = router;
