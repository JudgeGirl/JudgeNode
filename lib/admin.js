var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../lib/const');
var marked = require('marked');
var hl = require('node-syntaxhighlighter');
var renderer = new marked.Renderer();

renderer.heading = function(text, level) {
	var escapeText = text.toLowerCase().replace(/[^\w]+/g, '-');
	return '<h' + level + ' class="content-subhead">' + text + '</h' + level + '>';
}
renderer.table = function(header, body) {
	return '<table class="pure-table pure-table-bordered"><thead>' + header + '</thead><tbody>' + body + '</tbody></table>';
};
renderer.image = function(href, title, text) {
	return '<div class="pure-u-g"><div class="pure-u-5-5">' +
		'<a clss="" title=' + text + ' href=' + href + '><img class="pure-img-responsive" src="' + href + '" alt="' + text + '">' +
		'</img></a><span class="caption">' + text + '</span></div></div>';
};

marked.setOptions({
	renderer: renderer,
	highlight: function (code) {
		return hl.highlight(code, hl.getLanguage('cpp'), {gutter: false});
  	}
});

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

module.exports = {
	load_announcement: function(callback) {
		var md_path = "source/md/archive/archive.md";
		fs.readFile(md_path, 'utf8', function(err, buf_data) {
			callback(buf_data.toString());	
		});
	},
	update_announcement: function(md_text, callback) {
		var md_path = "source/md/archive/archive.md";
		var html_path = "source/archive/archive.html";
		var html = marked(md_text);
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
		var cmd = 'SELECT * FROM problems ORDER BY pid';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	load_problem_content: function(pid, callback) {
		var md_path = "source/md/problem/" + pid + ".md";
		var cmd = 'SELECT * FROM problems WHERE pid = ?';
		var config = {};
		connection.query(cmd, [pid], function(err, result) {
			config.config = result[0];
			var cmd = 'SELECT * FROM problem_dependency WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				config.dependency = result;
				fs.readFile(md_path, 'utf8', function(err, buf_data) {
					config.md = buf_data.toString();
					callback(config);
				});
			});
		});
	},
	update_problem_content: function(config, callback) {
		var pid = config.pid, md_text = config.md;
		var md_path = "source/md/problem/" + pid + ".md";
		var html_path = "source/problem/" + pid + ".html";
		var html = marked(md_text);
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
		var cmd = 'UPDATE problems SET pub = ?, ttl = ?, level = ?, porder = ? WHERE pid = ?';
		connection.query(cmd, [config.pub, config.ttl, config.level, config.porder, pid], function(err, result) {
			var cmd = 'DELETE FROM problem_dependency WHERE pid = ?';
			connection.query(cmd, [pid], function(err, result) {
				var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
				for (var i in config.dependency) {
					connection.query(cmd, [pid, config.dependency[i]], function(err, result) {

					});
				}
			});
		});
		callback();
	},
	load_contestlist: function(callback) {
		var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests ORDER BY cid DESC';
		connection.query(cmd, [], function(err, result) {
			callback(result);
		});
	},
	load_contest_config: function(cid, callback) {
		var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
		var config = {};
		connection.query(cmd, [cid], function(err, result) {
			config.problem = result;
			var cmd = 'SELECT uid, lgn, class FROM contest_user NATURAL JOIN users WHERE cid = ?';
			connection.query(cmd, [cid], function(err, result) {
				config.user = result;
				var cmd = 'SELECT * FROM contests WHERE cid = ?';
				connection.query(cmd, [cid], function(err, result) {
					config.config = result[0];
					callback(config);
				});
			});
		});
	},
	update_contest_config: function(config, callback) {
		var cmd = 'UPDATE contests SET pub = ?, ttl = ?, ts1 = ?, ts2 = ? WHERE cid = ?';
		connection.query(cmd, [config.pub, config.ttl, config.ts1, config.ts2, config.cid], function(err, result) {
			var cmd = 'DELETE FROM contest_problem WHERE cid = ?';
			connection.query(cmd, [config.cid], function(err, result) {
				var cmd = 'INSERT INTO contest_problem SET cid = ?, pid = ?';
				for (var i in config.pid) {
					connection.query(cmd, [config.cid, config.pid[i]], function(err, result) {

					});
				}
			});
		});
		cmd = 'DELETE FROM contest_user WHERE cid = ?';
		connection.query(cmd, [config.cid], function(err, result) {
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
	create_problem_content: function(config, callback) {
		var pid = parseInt(config.pid), md_text = config.md;
		var md_path = "source/md/problem/" + pid + ".md";
		var html_path = "source/problem/" + pid + ".html";
		var html = marked(md_text);
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
		var cmd = 'INSERT INTO problems SET pub = ?, ttl = ?, level = ?, porder = ?, pid = ?';
		connection.query(cmd, [config.pub, config.ttl, config.level, config.porder, pid], function(err, result) {
			console.log(err);
			if (err)
				return callback();
			var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
			for (var i in config.dependency) {
				connection.query(cmd, [pid, config.dependency[i]], function(err, result) {

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
	}
};
