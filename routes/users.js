var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var config = require('../lib/config').config;
var MAU = require('../lib/components/modify-and-upload');
var multer = require('multer');
var fs = require('fs');
var utils = require('../lib/components/utils');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './files/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname) //Appending .jpg
    }
})
var upload = multer({
    dest: './files/',
    limits: {
        fileSize: 1024 * 1024
    },
    storage: storage
});

/* GET users page */
router.get('/', function(req, res, next) {
    var uid = req.session.uid;
    dblink.user.info(uid, function(user) {
        res.render('layout', {
            layout: 'user',
            subtitle: 'User',
            user: req.session,
            userinfo: user
        });
    });
});
router.get('/:uid', function(req, res, next) {
    var uid = req.params.uid;
    dblink.user.info(uid, function(user) {
        res.render('layout', {
            layout: 'user',
            subtitle: 'User',
            user: req.session,
            userinfo: user
        });
    });
});

/*  */
router.post('/upload/avatar',
    upload.fields([{
        name: 'avatar',
        maxCount: 1
    }]),
    function(req, res, next) {
        var uid = req.session.uid;
        if (uid == undefined || uid == null) {
            res.redirect(utils.url_for('login'));
        } else {
            var mau = new MAU(req.files['avatar'][0], uid, function(err, newImagePath) {
                res.redirect(utils.url_for('/'));
            });
        }
    });

module.exports = router;
