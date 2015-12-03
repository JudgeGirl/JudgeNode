module.exports = {
	render: function(data) {
		data = data.replace(/\n/g, "\\n");
		var html = '';
		var countId = new Date().getTime();
		html += '<div id="diagram-' + countId + '"></div>';
		html += '<script>';
		html += 'var diagram = flowchart.parse("' + data + '");';
		html += 'diagram.drawSVG("diagram-' + countId + '");';
		html += '</script>';

		html = '</code></pre>' + html + '<pre><code>';
		return html;
	}
};