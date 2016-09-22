var fs = require('graceful-fs');

function ModifyAndUpload(img, uid, callback){
  this.img = img;
  this.uid = uid;
  this.callback = callback;
  this.init();
}

ModifyAndUpload.prototype = {

  modifyImage: function(){
    var that = this;
    console.log(that.originalImagePath);
    fs.writeFileSync(that.newThumbPath, fs.readFileSync(that.originalImagePath));
    that.callback(null, that.publicPathOfThumb); 
  },

  init: function(){
    var saveFolder = './public/images/avatar/';
    this.originalImagePath = this.img.destination + this.img.filename;
    this.newThumbPath = saveFolder + 'thumb--' + this.uid ;
    this.publicPathOfThumb = '/images/finished/thumb--' + this.uid;    
    this.modifyImage();
  }

};

module.exports = ModifyAndUpload;