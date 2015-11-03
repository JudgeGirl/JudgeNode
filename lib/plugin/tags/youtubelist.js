/**
* Youtube tag
*
* Syntax:
*   {% youtubelist list_id %}
*/


exports.parse = function (str, line, parser, types, options) {
  var matched = false;
  parser.on('*', function (token) {
    if (matched) {
      throw new Error('Unexpected token ' + token.match + '.');
    }
    matched = true;
    return true;
  });

  return true;
};

exports.compile = function (compiler, args, content, parents, options, blockName) {
	var id = args[0].toString();
	id = id.replace(/"/g, '');

	var html = '<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=' + id + '" frameborder="0" allowfullscreen></iframe></div>';
	var result = html;
	result = result
      .replace(/\\/g, '\\\\')
      .replace(/\n|\r/g, '\\n')
      .replace(/"/g, '\\"');
	return '_output += "' + result + '";';
};

exports.ends = false;
exports.blockLevel = false;

