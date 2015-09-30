var sendmail = require('sendmail')();
 
sendmail({
    from: 'sinmaplewing@gmail.com',
    to: 'sinmaplewing@gmail.com',
    subject: '計算機程式設計課 批改娘系統帳號密碼',
    content: '歡迎修習計算機程式設計課本課程，可以先上去批改娘系統上去做做題目：http://judgegirl.csie.org。\n您的帳號：' + '\n您的密碼：' + '\n\nTA',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});
