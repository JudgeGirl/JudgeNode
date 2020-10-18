var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');

router.get('/:sid', function(req, res, next) {
    var sid = req.params.sid;


    dblink.report.getBySidPromise(sid).then(reportRow => {
        let report = reportRow[0].content
        report = report.replace(/(?:\r\n|\r|\n)/g, '<br>');

        res.render('layout', {
            layout: 'report',
            report_raw: report
        });
    }).catch(error => {
        res.render('error', {
            message: error,
            error: {
                status: "",
                stack: ""
            }
        })
    });

});

module.exports = router;
