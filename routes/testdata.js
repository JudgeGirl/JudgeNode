var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');

router.get('/download/:pid', function(req, res, next) {
    var pid = req.params.pid;
    dblink.problemManager.problemContent(pid, function(pcontent, pinfo, psubmit) {
        var ttl = pinfo && pinfo[0] && pinfo[0].ttl;
        dblink.problemManager.downloadList(pid, function(file_list) {
            res.render('layout', {
                layout: 'testdata_download',
                subtitle: 'Testdata',
                user: req.session,
                problemtitle: pid + '. ' + ttl,
                pid: pid,
                downloadList: file_list
            });
            next();
        });
    });
});

// router.get('/manage', function(req, res, next) {
//     var uid = req.session.uid;
//     dblink.helper.isAdmin(uid, function(isadmin) {
//         if (isadmin) {
//             res.render('layout', {
//                 layout: 'testdata_manage',
//                 subtitle: 'Testdata',
//                 user: req.session
//             });
//         } else {
//             res.redirect(loginURL);
//         }
//     });
// });

module.exports = router;
