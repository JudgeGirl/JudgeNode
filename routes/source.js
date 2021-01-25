var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var markdown = require('../lib/components/plugin/markdown');
const { StatusCodes } = require('http-status-codes');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

router.get('/:sid', function(req, res, next) {
    var sid = req.params.sid;
    dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
        res.type('text/plain');
        var text = '';
        for (var i in source_code)
            text += source_code[i].code + '\n';
        res.send(text);
    });
});
router.get('/highlight/:sid', function(req, res, next) {
    var sid = req.params.sid;
    var uid = req.session.uid;

    loggerFactory.getLogger(module.id).silly(`Fetching highlight. sid: ${sid}. uid: ${uid}`);

    dblink.helper.isAdmin(uid, function(isadmin) {
        dblink.submission.source_result(sid, req.session.uid, req.session["class"], function(source_result_json) {

            if (source_result_json["state"] == "ERROR") {
                loggerFactory.getLogger(module.id).silly(`source_result_json. sid: ${sid}. uid: ${uid}.`, { source_result_json });

                res.status(StatusCodes.NOT_ACCEPTABLE)
                    .render('error', {
                    message: source_result_json['message'],
                    error: {},
                    user: null
                });

                return;
            }

            dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
                var text = '';
                for (var i in source_code) {
                    text += '## ' + source_code[i].title + ' ##\n';
                    text += '```cpp\n' + source_code[i].code + '\n```\n';
                }
                dblink.submission.list({
                    sid: sid
                }, isadmin, function(slist) {
                    res.render('layout', {
                        layout: 'highlight',
                        user: req.session,
                        sid: sid,
                        source_result: source_result_json,
                        html_code: markdown.post_marked(text),
                        subs_info: slist && slist.length > 0 ? slist[0] : null
                    });
                });
            });
        });
    });
});

module.exports = router;
