const { Router } = require('express');
const router = Router();

const { loggerFactory } = require('lib/components/logger/LoggerFactory');
const utils = require('../lib/components/utils');
const dblink = require('../lib/components/dblink');
const multer = require('multer');
const fs = require('fs');
var _config = require('../lib/config').config;

var upload = multer({
  dest: 'files/',
  onFileUploadStart: function(file, req, res) {
      if (req.files.file.length > 64 * 1024)
          return false;
      return true;
  },
  limits: {
      fileSize: 64 * 1024
  }
});

function submitStep(req, res, uid, pid, cid, lng) {
  dblink.problemManager.sourceList(pid, function (source_list) {
    if (source_list.length === 0)
      source_list.push("source");
    let size = 0;
    for (let i = 0; i < source_list.length; i++) {
      let file_size = 0;
      if (req.files['code' + i] == null || req.files['code' + i] == undefined ||
        req.files['code' + i][0] == null || req.files['code' + i][0] == undefined) {
        if (req.body['paste_code' + i].length > 65536 || req.body['paste_code' + i].trim().length == 0) {
          loggerFactory.getLogger(module.id).debug('NOT FOUND FILE ' + i);
          return res.redirect(utils.url_for('/'));
        } else {
          file_size = req.body['paste_code' + i].length;
        }
      } else {
        file_size = req.files['code' + i][0].size;
      }
      size += file_size;
    }

    /**
     * JUDGE result8 : SAVING
     */
    const subinfo = {
      uid: uid,
      cid: cid,
      pid: pid,
      ts: Date.now(),
      lng: lng,
      len: size,
      scr: 0,
      res: 8,
      cpu: 0,
      mem: 0
    };

    loggerFactory.getLogger(module.id).info(`User ${req.session.lgn}(${req.ip}) submits to problem ${pid}.`, { subinfo });
    dblink.judge.insert_submission(subinfo, function (sid) {
      for (var i = 0; i < source_list.length; i++) {
        if (req.files['code' + i] == null || req.files['code' + i] == undefined ||
          req.files['code' + i][0] == null || req.files['code' + i][0] == undefined) {
          fs.writeFileSync(_config.JUDGE.path + "submission/" + sid + "-" + i, req.body['paste_code' + i]);
        } else {
          fs.writeFileSync(_config.JUDGE.path + "submission/" + sid + "-" + i, fs.readFileSync(req.files['code' + i][0].path));
          fs.unlinkSync(req.files['code' + i][0].path);
        }
      }

      dblink.judge.update_waiting_submission(sid, function (err) {
        if (cid === "0")
          return res.redirect(utils.url_for('live'));
        else
          return res.redirect(utils.url_for('live?cid=' + cid));
      });
    });
  });
};

function submitFunction(req, res, next) {
  if (req.session.uid === undefined || req.session.uid < 0)
    return res.redirect(utils.url_for('/login'));

  const uid = req.session.uid,
    pid = req.body.pid,
    cid = req.body.cid,
    lng = req.body.lng;

  if (lng == undefined) // multi file
    lng = 0;
  if (lng != 0)
    req.session.submit_lng = lng;

  dblink.helper.cansubmit(cid, pid, uid, function (canSubmit) {
    if (req.session['class'] == null)
      canSubmit = true;
    if (!canSubmit)
      return res.redirect(utils.url_for('/'));
    submitStep(req, res, uid, pid, cid, lng);
  });
}

router.post(
  '/',
  upload.fields([{
    name: 'code0',
    maxCount: 1
  }, {
    name: 'code1',
    maxCount: 1
  }, {
    name: 'code2',
    maxCount: 1
  }, {
    name: 'code3',
    maxCount: 1
  }, {
    name: 'code4',
    maxCount: 1
  }, {
    name: 'code5',
    maxCount: 1
  }, {
    name: 'code6',
    maxCount: 1
  }, {
    name: 'code7',
    maxCount: 1
  }]),
  submitFunction
);

module.exports = router;
