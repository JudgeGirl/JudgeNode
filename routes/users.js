var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var config = require('../lib/config').config;
var MAU = require('../lib/components/modify-and-upload');
var multer = require('multer');
var utils = require('../lib/components/utils');
var helper = require('./helper');

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

/* sovled list */
router.get('/solved-list', function(req, res, next) {
    let uid = req.session.uid;

    if (uid == undefined) {
        res.redirect(utils.url_for('/'));
        return;
    }

    res.redirect(utils.url_for(`/user/${uid}/solved-list`));
});

router.get('/:uid/solved-list', async function(req, res, next) {
    let uid = req.params.uid;
    let selfId = req.session.uid;
    let isTestMode = config.CONTEST.MODE == true;
    let hasNoClass = req.session['class'] == null;
    let isAdmin = await dblink.user.promises.isAdmin(selfId);

    // identity check
    let uidAvailable = uid.match(/^[0-9]+$/) !== null;
    if (!uidAvailable) {
        return helper.renderForbidden({
            res,
            message: "Invalid uid."
        })
    }

    // fetch user
    let user = await dblink.user.promises.getUser(uid);
    if (user.length == 1)
        user = user[0];
    else {
        return helper.renderForbidden({
            res,
            message: "Invalid user."
        })
    }

    // mode check
    if (isTestMode && !isAdmin) {
        return res.render('layout', {
            layout: 'forbidden',
            subtitle: 'Forbidden',
            sysmsg: 'This page is not availabe during examination.'
        });
    }

    // display mode: private/public
    let privateMode = false;
    if (isAdmin)
        privateMode = true;
    else if (!hasNoClass && uid == selfId)
        privateMode = true;

    let solvedList = await dblink.user.promises.getSolvedList(uid, privateMode);

    return res.render('layout', {
        layout: 'solved_list',
        lgn: user["lgn"],
        uid: uid,
        solvedList
    });
});

/* GET users page */
router.get('/', function(req, res, next) {
    let uid = req.session.uid;

    if (uid == undefined) {
        res.redirect(utils.url_for('/'));
        return;
    }

    res.redirect(utils.url_for(`/user/${uid}`));
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
            sysmsg: '考試中，禁止查詢其他 users。'
        });
    };

    if (!isTestMode || hasNoClass) {
        let displayUser = function(user) {

            if (user.info === undefined) {
                return res.render('error', {
                    message: 'User not found.',
                    error: {},
                    user: null
                });
            }

            return res.render('layout', {
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
