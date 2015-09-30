var students = {"B03501025":"cegxM6wiuUl2","B02902019":"NfYycOdBib0S","B03902084":"xb1W2yv1Dzez","B03303087":"oGp5miM1rtfh","B02902095":"If5EcXDzEWln"};

var sendmail = require('sendmail')();

for( var i in students ){
sendmail({
    from: 'dplabta@gmail.com',
    to: i + '@csie.ntu.edu.tw, ' + i + '@ntu.edu.tw' ,
    subject: '計算機程式設計課 批改娘系統帳號密碼',
    content:
'歡迎修習計算機程式設計課本課程，可以先上去批改娘系統上去做做題目：http://judgegirl.csie.org。\n您的帳號：'
+ i + '\n您的密碼：' + students[i] + '\n\nTA',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});
}

