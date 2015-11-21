module.exports = {
	render: function(data) {
		data = data.replace(/\n/g, "\\n");
		var html = '';
		var countId = new Date().getTime();
		html += '<div id="seq-diagram-' + countId + '"></div>';
		html += '<script>';
		html += 'var diagram = Diagram.parse("' + data + '");';
		html += '$("#seq-diagram-' + countId + '").sequenceDiagram();';
		html += '</script>';

		html = '</code></pre>' + html + '<pre><code>';
		return html;
	}
};