var marked = require('marked');
var hl = require('node-syntaxhighlighter');
var renderer = new marked.Renderer();
var terminal = require('./terminaldemo');
var flowchart = require('./flowchart');
var sequencediagram = require('./sequencediagram');
var alias = [
    ['latex', 'tex'],
    ['html', 'xml'],
    ['js', 'javascript'],
    ['coffee', 'coffeescript'],
    ['rb', 'ruby'],
    ['py', 'python'],
    ['pl', 'perl']
];
var swig = require('swig'),
    youtubetag = require('./tags/youtube'), 
    youtubelisttag = require('./tags/youtubelist');

swig.setTag('youtube', youtubetag.parse, youtubetag.compile, youtubetag.ends, youtubetag.blockLevel);
swig.setTag('youtubelist', youtubelisttag.parse, youtubelisttag.compile, youtubelisttag.ends, youtubelisttag.blockLevel);


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
	highlight: function (code, lang) {
        var clip_html = '<span class="fw-code-copy-button pure-button"><i class="fa fa-clipboard"></i></span>';
        if (!lang || lang == 'plain') {
            return clip_html + hl.highlight(code, hl.getLanguage('cpp'), {gutter: false});
        }
        if (lang == 'terminal')
            return terminal.render(code);
        if (lang == 'flowchart')
            return flowchart.render(code);
        if (lang == 'sequencediagram')
            return sequencediagram.render(code);
        alias.some(function(v) {
            if (lang == v[0]) {
                lang = v[1];
                return true;
            }
        });
        var result;
        try {
            result = clip_html + hl.highlight(code, hl.getLanguage(lang), {gutter: true});
        } catch(e) {
            console.log('Warning: Unknown highlight language ' + lang + '!');
            result = clip_html + hl.highlight(code, hl.getLanguage('cpp'), {gutter: false});
        }
        return result;
  	}
});
function latex_filter(text) {
    var out = text.replace(/(\${1,2})((?:\\.|[^$])*)\1/g, function(m) {
        m = m.replace(/_/g, '\\_')
             .replace(/</g, '\\lt ')
             .replace(/\|/g, '\\vert ')
             .replace(/\[/g, '\\lbrack ')
             .replace(/\\{/g, '\\lbrace ')
             .replace(/\\}/g, '\\rbrace ')
             .replace(/\\\\/g, '\\\\\\\\');
        return m;
    });
    return out;
};
module.exports = {
	post_marked: function(text) {
        try {
            text = swig.render(text);
        } catch (e) {
        }
		text = latex_filter(text);
		return marked(text);
	}
};