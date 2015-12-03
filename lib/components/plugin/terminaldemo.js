var yaml = require('js-yaml');

var terminal = {
	lights: '<div class="lights"><div class="light red"><div class="glyph"></div><div class="shine"></div><div class="glow"></div></div><div class="light yellow"><div class="glyph"></div><div class="shine"></div><div class="glow"></div></div><div class="light green"><div class="glyph"></div><div class="shine"></div><div class="glow"></div></div></div>',
	titleheader: '<div class="title"><div class="folder"><div class="tab"></div><div class="body"></div></div>',
	titlefooter: '</div>',
	bubble: '<div class="bubble"><div class="shine"></div><div class="glow"></div></div>',
	toolbarheader: '<div class="toolbar"><div class="top">',
	toolbarfooter: '</div></div>',
	bodyheader: '<div class="tbody">',
	bodyfooter: '</div>'
};
function typedsetting(tagId, config) {
	var html = '';
	var setting = config.setting;
	html += '$("#' + tagId + ' .content").typed({';
	html += 'strings: [';
	for (var row in config.sentence) {
		var str = config.sentence[row];
		str = str.replace(/\\lt /g, '<');
		console.log(str);
		html += '"' + str +'", ';
	}
	html += '],'
	if (setting.contentType != undefined)
		html += 'contentType: "' + config.setting.contentType + '",';
	else
		html += 'contentType: "html",';
	if (setting.typeSpeed != undefined)
		html += 'typeSpeed: ' + setting.typeSpeed + ",";
	else
		html += 'typeSpeed: -1000,';
	if (setting.backSpeed != undefined)
		html += 'backSpeed: ' + setting.backSpeed + ",";
	else
		html += 'backSpeed: -5000,';
	if (setting.backSpeed != undefined)
		html += 'backSpeed: ' + setting.backSpeed + ",";
	else
		html += 'backSpeed: -5000,';
	if (setting.loop != undefined)
		html += 'loop: ' + setting.loop + ",";
	else
		html += 'loop: false,';
	html += '})';
	return html;
}
module.exports = {
	render: function(yml) {
		var _config = yaml.safeLoad(yml);
		var html = '';
		var countId = new Date().getTime();
		html += '<div class="terminal-window" id="terminal' + countId + '">';
		html += terminal.toolbarheader;
		html += terminal.lights;
		html += terminal.titleheader;
		html += _config.title;
		html += terminal.titlefooter;
		html += terminal.bubble;
		html += terminal.toolbarfooter;
		html += terminal.bodyheader;
		html += '<div class="content"></div>';
		html += terminal.bodyfooter;
		html += '</div>';
		html += '<script>' + typedsetting('terminal' + countId, _config) + '</script>';

		html = '</code></pre>' + html + '<pre><code>';
		console.log('WTF');
		console.log(_config);
		return html;
	}
};