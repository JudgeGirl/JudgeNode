var url = require('url');
var config = require('../../../config').config;

function urlForHelper(path){
  path = path || '/';

  var root = config.HOST.root;
  var data = url.parse(path);

  // Exit if this is an external path
  if (data.protocol || path.substring(0, 2) === '//'){
    return path;
  }

  // Prepend root path
  if(path === '/') {
    return root;
  } else if (path[0] !== '/'){
    return root + path;
  }

  return path;
}

module.exports = urlForHelper;