var sendmail = require('sendmail')();

/*
	nodejs mailuser.js <list file>
    example:
        nodejs mailuser.js students.lst
*/

var mysql = require('mysql'),
    fs = require('fs'),
    crypto = require('crypto'),
    randomstring = require("randomstring");
var assert = require('assert');

var connection = require('../../lib/mysql').connection;

var args = process.argv.slice(2);

assert(args.length == 1, 'Usage: $ nodejs emailuser.js <list file>');

var listfile = args[0];

var logs = (fs.readFileSync(listfile).toString()).split("\n");

function emailbody(lgn, pwd) {
	var ret = '';
	ret += '各位同學好：\n';
	ret += '    計算機程式設計 C2016 即將開始，本課程將使用線上評測系統進行練習與考試，\n';
	ret += '登入系統帳號密碼如下 (注意大小寫)，登入後記得修改密碼，以免造成第一次上課考試無法使用\n';
	ret += '\n';
	ret += '    帳號: ' + lgn + "\n";
	ret += '    密碼: ' + pwd + "\n";
	ret += '\n';
	ret += '課程網址: https://sites.google.com/site/ntucsiec2016/\n';
	ret += '系統網址: https://judgegirl.csie.org/\n';
	ret += '\n';
	ret += '請同學在正式開始上課前，熟悉一下系統操作。\n';
	ret += '\n\n';
	ret += '尚未決定好的助教群代表 上\n';
	return ret;
}


for (var i = 0; i < logs.length; i++) {
	var fields = logs[i].split(" ");
	if (fields[0] != '[Create]')
		continue;
	var lgn = fields[1],
	    pwd = fields[2],
	    emailaddr = lgn.toLowerCase() + '@ntu.edu.tw';
	console.log(emailaddr);
	console.log(emailbody(lgn, pwd));
	var content = {
		from: 'dplabta@gmail.com',
		to: emailaddr,
		subject: '[計算機程式設計 C Programming] 系統帳密 System Account',
		content: emailbody(lgn, pwd)
	};
	sendmail(content, function(err, reply) {
		console.log(err && err.stack);
		console.dir(reply);
		console.log('[INFO] Sent');
	});
}
