var swig = require('swig');
    youtubetag = require('./tags/youtube');

swig.setTag('youtube', youtubetag.parse, youtubetag.compile, youtubetag.ends, youtubetag.blockLevel);
// 
console.log(swig.render('{% youtube "W0Y5q27mF8A" %}', { locals: { foo: true }}));