var students = {"B02202027":"jkgNHztfYvNw","B02202057":"ouiH3GrXZR2w","B02209041":"kqs5CYGeezGF", /*"CS9562272":"twRnJckqPDiL",*/ "B03305004":"6RABIH2YavIr","B03902130":"vsyfjBiGchtq","B03204030":"vX5CgffCpm1r","B03204004":"0mmj33tbhhUG","B03401095":"lfN3BQ2BaMK2","B01302148":"IhgETuJbEMyY"};

var sendmail = require('sendmail')();

for( var i in students ){
sendmail({
    from: 'dplabta@gmail.com',
    to: i + '@csie.ntu.edu.tw, ' + i + '@ntu.edu.tw' ,
    subject: '計算機程式設計課 批改娘系統帳號密碼',
    content:
'歡迎修習計算機程式設計課本課程，可以先上去批改娘系統上去做做題目：http://judgegirl.csie.org。\n您的帳>號：'
+ i + '\n您的密碼：' + students[i] + '\n\nTA',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});
}

