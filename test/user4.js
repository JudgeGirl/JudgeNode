var students = {"B03902014":"s7EQLmpNAu9j","B03902096":"EJVbxxQkHxKl","B03B02011":"TlykofhHhkxO","B03902002":"mPsVUSFD0ixn","B03902032":"9hHacWREr1lA","B03902099":"CNfSPQnDgXE2","B03902112":"92iSd9njL9ch","B03902031":"Rc0frxoGNkxu","B03902065":"pfbfA2y30Vy1","B03902037":"UMa4Jp3A14hV","B02902027":"nODJwbdo3yML","B02902045":"tFgIxNYC128l","B03502040":"JwHh6rQRFiV2","B03902020":"FAXItGDl8T15","B03902098":"fTS29bLpfQ0S","B03902123":"6SmEpR6M2lAq","R03944048":"rBff6N5v2APg","B03902067":"3XkCipXKhqXD","B03901078":"CN38kzLFcL80","B03902058":"fzxFvchtrKve","B03902103":"sSqmRe9cFyig","B03902001":"8NUk5UAIsqhc","B03902126":"XyVfbjmrqmbE","B03902093":"tGdgOjyJ1Xei","B03902026":"XzsdCQN01lcy","B04902019":"6my7lucR0dSh","B03902041":"Afp1ZMSPerMo"};

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

