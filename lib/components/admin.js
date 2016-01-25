var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../config').config;
	message = require('./message');
var markdown = require('./plugin/markdown');

var connection = require('../mysql').connection;

module.exports = {
	load_announcement: function(callback) {
		var md_path = config.JUDGE.path + "source/md/archive/archive.md";
		fs.readFile(md_path, 'utf8', function(err, buf_data) {
			if (err)	return callback('');
			callback(buf_data.toString());	
		});
	},
	update_announcement: function(md_text, callback) {
		var md_path = config.JUDGE.path + "source/md/archive/archive.md";
		var html_path = config.JUDGE.path + "source/archive/archive.html";
		var html = markdown.post_marked(md_text);
		fs.writeFile(md_path, md_text, function(err) {
		    if(err)
		        return console.log(err);
		    console.log("The file was saved!");
		}); 
		fs.writeFile(html_path, html, function(err) {
		    if(err)
		        return console.log(err);
		    console.log("The file was saved!");
		}); 
		callback();
	},
	load_problemlist: function(callback) {
		var cmd = 'SELECT * FROM problems ORDER BY ts DESC, pid';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	load_problem_content: function(pid, callback) {
		var md_path = config.JUDGE.path + "source/md/problem/" + pid + ".md";
		var cmd = 'SELECT * FROM problems WHERE pid = ?';
		var pconfig = {};
		connection.query(cmd, [pid], function(err, result) {
			pconfig.config = result[0];
			var cmd = 'SELECT * FROM problem_dependency WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				pconfig.dependency = result;
				fs.readFile(md_path, 'utf8', function(err, buf_data) {
					if (err)
						pconfig.md = '';
					else
						pconfig.md = buf_data.toString();
					return callback(pconfig);
				});
			});
		});
	},
	load_problem_solution: function(pid, callback) {
		var md_path = config.JUDGE.path + "source/md/solution/" + pid + ".md";
		var cmd = 'SELECT * FROM problems WHERE pid = ?';
		fs.readFile(md_path, 'utf8', function(err, buf_data) {
			if (err)	return callback('');
			return callback(buf_data.toString());
		});
	},
	update_problem_content: function(pconfig, callback) {
		var pid = pconfig.pid, md_text = pconfig.md;
		var md_path = config.JUDGE.path + "source/md/problem/" + pid + ".md";
		var html_path = config.JUDGE.path + "source/problem/" + pid + ".html";
		var html = markdown.post_marked(md_text);
		fs.writeFile(md_path, md_text, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		}); 
		fs.writeFile(html_path, html, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		});
		var cmd = 'UPDATE problems SET pub = ?, ttl = ?, level = ?, porder = ?, ts = ? WHERE pid = ?';
		connection.query(cmd, [pconfig.pub, pconfig.ttl, pconfig.level, pconfig.porder, new Date().getTime(), pid], function(err, result) {
			var cmd = 'DELETE FROM problem_dependency WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
				for (var i in pconfig.dependency) {
					connection.query(cmd, [pid, pconfig.dependency[i]], function(err, result) {

					});
				}
			});
		});
		callback();
	},
	update_problem_solution: function(pconfig, callback) {
		var pid = pconfig.pid, md_text = pconfig.solution_md;
		var md_path = config.JUDGE.path + "source/md/solution/" + pid + ".md";
		var html_path = config.JUDGE.path + "source/solution/" + pid + ".html";
		var html = markdown.post_marked(md_text);
		fs.writeFile(md_path, md_text, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		}); 
		fs.writeFile(html_path, html, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		});
	},
	load_contestlist: function(callback) {
		var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests ORDER BY cid DESC';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	load_contest_config: function(cid, callback) {
		var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
		var c_config = {};
		connection.query(cmd, [cid], function(err, result) {
			c_config.problem = result;
			var cmd = 'SELECT uid, lgn, class FROM contest_user NATURAL JOIN users WHERE cid = ?';
			connection.query(cmd, [cid], function(err, result) {
				c_config.user = result;
				var cmd = 'SELECT * FROM contests WHERE cid = ?';
				connection.query(cmd, [cid], function(err, result) {
					c_config.config = result[0];
					var cmd = 'SELECT pid FROM contest_special WHERE cid = ?';
					connection.query(cmd, [cid], function(err, result) {
						c_config.refproblem = result;
						var md_path = config.JUDGE.path + "source/md/contest/" + cid + ".md";
						fs.readFile(md_path, 'utf8', function(err, buf_data) {
							if (err)	
								c_config.rule = message.contest_rule_default;
							else
								c_config.rule = buf_data.toString();
							callback(c_config);
						});
					});
				});
			});
		});
	},
	update_contest_config: function(c_config, callback) {
		var cmd = 'UPDATE contests SET pub = ?, ttl = ?, ts1 = ?, ts2 = ? WHERE cid = ?';
		connection.query(cmd, [c_config.pub, c_config.ttl, c_config.ts1, c_config.ts2, c_config.cid], function(err, result) {
			var cmd = 'DELETE FROM contest_problem WHERE cid = ?';
			connection.query(cmd, [c_config.cid], function(err, result) {
				var cmd = 'INSERT INTO contest_problem SET cid = ?, pid = ?';
				for (var i in c_config.pid) {
					connection.query(cmd, [c_config.cid, c_config.pid[i]], function(err, result) {

					});
				}
			});
		});
		cmd = 'DELETE FROM contest_special WHERE cid = ?';
		connection.query(cmd, [c_config.cid], function(err, result) {
			var cmd = 'INSERT INTO contest_special SET cid = ?, pid = ?';
			for (var i in c_config.refpid) {
				connection.query(cmd, [c_config.cid, c_config.refpid[i]], function(err, result) {

				});
			}
		});
		cmd = 'DELETE FROM contest_user WHERE cid = ?';
		connection.query(cmd, [c_config.cid], function(err, result) {
			for (var i in c_config.participants) {
				var value = parseInt(c_config.participants[i]);
				if (value == 0) {
					var cmd = 'SELECT uid FROM users WHERE class IS NULL';
					connection.query(cmd, [], function(err, result) {
						var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
						for (var i = 0; i < result.length; i++) {
							connection.query(cmd, [c_config.cid, result[i].uid], function(err, result) {
							});
						}
					});
				} else {
					var cmd = 'SELECT uid FROM users WHERE class = ?';
					connection.query(cmd, [value], function(err, result) {
						var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
						for (var i = 0; i < result.length; i++) {
							connection.query(cmd, [c_config.cid, result[i].uid], function(err, result) {
							});
						}
					});
				}
			}
		});
		var cid = c_config.cid, md_text = c_config.rule;
		var md_path = config.JUDGE.path + "source/md/contest/" + cid + ".md";
		var html_path = config.JUDGE.path + "source/contest/" + cid + ".html";
		var html = markdown.post_marked(md_text);
		fs.writeFile(md_path, md_text, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		}); 
		fs.writeFile(html_path, html, function(err) {
		    if(err)	console.log(err);
		    console.log("The file was saved!");
		});
		callback();
	},
	load_accountlist: function(callback) {
		var cmd = 'SELECT * FROM users WHERE class IS NOT NULL';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	update_account: function(config, callback) {
		/* 
		var config = {
			uid : req.params.uid,
			pwd : req.body.pwd,
			class: req.body.class,
			email: req.body.email
		};
		*/
		var pwd = crypto.createHash('sha1').update(config.pwd).digest('hex');
		var cmd = 'UPDATE users SET pwd = ?, class = ?, email = ? WHERE uid = ?';
		connection.query(cmd, [pwd, config.class, config.email, config.uid], function(err, result) {
			callback();
		});
	},
	create_problem_content: function(pconfig, callback) {
		var pid = parseInt(pconfig.pid), md_text = pconfig.md;
		var md_path = config.JUDGE.path + "source/md/problem/" + pid + ".md";
		var html_path = config.JUDGE.path + "source/problem/" + pid + ".html";
		var html = markdown.post_marked(md_text);
		fs.writeFile(md_path, md_text, function(err) {
		    if(err)
		        return console.log(err);
		    console.log("The file was saved!");
		}); 
		fs.writeFile(html_path, html, function(err) {
		    if(err)
		        return console.log(err);
		    console.log("The file was saved!");
		});
		var cmd = 'INSERT INTO problems SET pub = ?, ttl = ?, level = ?, porder = ?, pid = ?, ts = ?';
		connection.query(cmd, [pconfig.pub, pconfig.ttl, pconfig.level, pconfig.porder, pid, new Date().getTime()], function(err, result) {
			console.log(err);
			if (err)
				return callback();
			var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
			for (var i in pconfig.dependency) {
				connection.query(cmd, [pid, pconfig.dependency[i]], function(err, result) {

				});
			}
			callback();
		});
	},
	create_contest_config: function(config, callback) {
		var cmd = 'INSERT INTO contests SET pub = ?, ttl = ?, ts1 = ?, ts2 = ?';
		connection.query(cmd, [config.pub, config.ttl, config.ts1, config.ts2], function(err, result) {
			if (err)
				return callback();
			var cid = result.insertId;
			config.cid = cid;
			connection.query(cmd, [config.cid], function(err, result) {
				var cmd = 'INSERT INTO contest_problem SET cid = ?, pid = ?';
				for (var i in config.pid) {
					connection.query(cmd, [config.cid, config.pid[i]], function(err, result) {

					});
				}
			});
			for (var i in config.participants) {
				var value = parseInt(config.participants[i]);
				if (value == 0) {
					var cmd = 'SELECT uid FROM users WHERE class IS NULL';
					connection.query(cmd, [], function(err, result) {
						var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
						for (var i = 0; i < result.length; i++) {
							connection.query(cmd, [config.cid, result[i].uid], function(err, result) {
							});
						}
					});
				} else {
					var cmd = 'SELECT uid FROM users WHERE class = ?';
					connection.query(cmd, [value], function(err, result) {
						var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
						for (var i = 0; i < result.length; i++) {
							connection.query(cmd, [config.cid, result[i].uid], function(err, result) {
							});
						}
					});
				}
			}
			callback();
		});
	},
	create_account: function(config, callback) {
		var cmd = 'SELECT uid FROM users WHERE lgn = ?';
		connection.query(cmd, [config.lgn], function(err, result) {
			if (err || result.length > 0) {
				return callback(0);
			} 
			var val = {
				ts1 : Date.now(),
				ts2 : Date.now(),
				lgn : config.lgn,
				pwd : crypto.createHash('sha1').update(config.pwd).digest('hex'),
				motto : escape(''),
				email : config.email,
				nname : '',
				ename : '',
				class : parseInt(config.class)
			};
			var cmd = 'INSERT INTO users SET ?';
			connection.query(cmd, [val], function(err, result) {
				if (err) {
					console.log(err);
					return callback(0);
				}
				callback(1);
			});
		});
	},
	load_scores: function(callback) {
		var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams ORDER BY lgn';
		var res = {};
		connection.query(cmd, [], function(err, result) {
			if (err)	return callback(res);
			res.tbody = result;
			var cmd = 'SELECT * FROM exams';
			connection.query(cmd, [], function(err, result) {
				res.thead = result;
				var cmd = 'SELECT uid, lgn FROM users';
				connection.query(cmd, [], function(err, result) {
					res.user = result;
					callback(res);
				});
			});
		});
	},
	update_scores: function(uid, exam, callback) {
		uid = parseInt(uid);
		for (var i in exam) {
			var updatesingle = function(uid, eid, s) {
				var cmd = 'DELETE FROM exam_scores WHERE eid = ? AND uid = ?';
				connection.query(cmd, [eid, uid], function(err, result) {
					if (s != -1) {
						var cmd = 'INSERT INTO exam_scores (uid, eid, score) VALUES (?, ?, ?)';
						connection.query(cmd, [uid, eid, s], function(err, result) {
							if (err)
								console.log(err);
						});
					}
				});
			};
			var eid = parseInt(i), s = parseInt(exam[i]);
			updatesingle(uid, eid, s);
		}
		callback();
	},
	create_exam_scores: function(ttl, callback) {
		var cmd = 'INSERT INTO exams (ttl) VALUES (?)';
		connection.query(cmd, [ttl], function(err, result) {
			if (err) {
				console.log(err);
			}
			callback();
		});
	},
	load_gradettl: function(eid, callback) {
		eid = parseInt(eid);
		var cmd = 'SELECT * FROM exams WHERE eid = ?';
		connection.query(cmd, [eid], function(err, result) {
			if (result && result.length > 0)
				callback(result[0]);
			else
				callback(null);
		});
	},
	update_gradettl: function(eid, ttl, callback) {
		eid = parseInt(eid);
		var cmd = 'UPDATE exams SET ttl = ? WHERE eid = ?';
		connection.query(cmd, [ttl, eid], function(err, result) {
			console.log(err);
			callback();
		});
	}
};
