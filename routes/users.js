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
    let uid = req.session.uid;
    let showPrivate = true;

    dblink.user.info(uid, function(user) {
        res.render('layout', {
            layout: 'user',
            subtitle: 'User',
            user: req.session,
            userinfo: user
        });
    }, showPrivate);
});

router.get('/:uid', function(req, res, next) {
    let uid = req.params.uid;
    let selfId = req.session.uid;
    let isTestMode = config.CONTEST.MODE == true;
    let hasNoClass = req.session['class'] == null;
    let toForbidden = () => {
        res.render('layout', {
            layout: 'forbidden',
            subtitle: 'Forbidden',
            sysmsg: 'This page is forbidden during a test.'
        });
    };

    if (!isTestMode || hasNoClass) {
        let displayUser = function(user) {
            res.render('layout', {
                layout: 'user',
                subtitle: 'User',
                user: req.session,
                userinfo: user
            });
        };

        let callback = function(isAdmin) {
            let showPrivate = isAdmin || uid == selfId;

            if (isTestMode && !isAdmin)
                toForbidden();

            dblink.user.info(uid, displayUser, showPrivate);
        };

        dblink.helper.isAdmin(selfId, callback);
    } else
        toForbidden();
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
