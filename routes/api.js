var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var markdown = require('../lib/components/plugin/markdown');
var fs = require('fs');


router.get('/submissions?', function(req, res, next) {
    dblink.api.list(req.query, function(result) {
        res.json(result);
    });
});

router.get('/result?', function(req, res, next) {
    var sid = req.query.sid;
    if (sid == undefined || sid == null) sid = 0;
    dblink.api.result(sid, function(result) {
        res.json(result);
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

module.exports = router;
