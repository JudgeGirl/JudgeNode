var students = {"B02902040":"mdHhImFc4RHX","B03902018":"rZGeeTX51VE1","B04902002":"mPlzfx06uGeZ","B04902004":"1CvjXSpxKBmd","B04902006":"mbgV3Q5EQb3T","B04902008":"C487nyGiXuj0","B04902010":"6VK9O4Bu1OkA","B04902012":"8d9Jt5u5rN6B","B04902014":"Vcps0S5ioceQ","B04902016":"BdtDdE4KsD1E","B04902018":"BrX1IxiraePg","B04902020":"ggNx31pKMEE4","B04902022":"zCaAgzKxKCgb","B04902024":"jMG677jpJFBO","B04902026":"1dwPqMfqEHI8","B04902028":"zTyb3if4s82t","B04902030":"6ydESwZBeFYR","B04902032":"YhUV3BHM3ZAR","B04902034":"1H6DTCEAmYRM","B04902036":"UilIKrKJqQi8","B04902038":"Ds0MuJ03pgh7","B04902040":"hpeb6De8ohKx","B04902042":"PnpfbVA3Gymn","B04902044":"ARPUlAn7YESI","B04902046":"XuFu0KvXrrFl","B04902048":"VA2F3lUsgcE4","B04902050":"zxjwlKesuztL","B04902052":"sNz4bz9lyIMi","B04902054":"2GuaM6DcICWh","B04902056":"Ng5EwjMQ8Jjl","B04902058":"dcqUuKnrC1K1","B04902060":"jApLk7saNzDC","B04902062":"0Hgo2nJWi0FY","B04902064":"dDWyAcoPOANJ","B04902066":"AtB4ObW0fNoy","B04902068":"hUrHPXXeCJ1t","B04902070":"rfem2rl0pW9R","B04902072":"TumoOJVAkodg","B04902074":"BEX4vMwhaLSA","B04902076":"SvsUiksQrnzL","B04902078":"FEnGqq730DdV","B04902080":"D4Mffb7X6BaU","B04902082":"vv56JehCKflD","B04902084":"J3YWTh3HDbsE","B04902086":"v78hbWQt5sGB","B04902088":"DAJBumzdCD3T","B04902090":"8NFF2SNbn7Uf","B04902092":"1Z3n87hgtHP6","B04902094":"Q63P4E1XU9f0","B04902096":"yINtyA2TLtsb","B04902098":"MF6oJt6bzEht","B04902100":"7YiO3zOOjuGy","B04902102":"pzltINSEJu5o","B04902104":"eTo0s4lr0EW1","B04902106":"3JvkBMkgVxwb","B04902108":"07ZwIKkcmAYM","B04902110":"guEEixQpC95r","B04902112":"DVyWiTmCfvWl","B04902114":"kxvA68F5koUK","B04902116":"ufx2ihpNQEXE","B04902118":"7vJbXOe0hsTy","B04902120":"RQuOe2IW749Z","B04902122":"erTle9Lq6Thb","B04902124":"kWEoNPNZaFgf","B04902126":"Ih8r7kWaKtE0","B04902128":"nOmUQPHvKNdQ","T04902112":"YdpuNwGk9Mv5","B03902016":"NxuinzHA6Zrp","B03902026":"8lvfF80mLtJC","B03902052":"2oGBaZLxEwzP","B03902056":"BhTLsHdh6HgW","B03902088":"pSfauSSzmdZP","B03902114":"P39VIkuH9hM9","B01902136":"xQga93oN5iJL","B02902080":"EMQXolCadxts","B02902110":"FVexfFJSw2zS","B02902120":"9s7fg4rBgrNB","B02902122":"2SyZydsb7vSQ","B02902128":"k3lAVnnDqLw8","B00902094":"46WDwsclfNww"};

var sendmail = require('sendmail')();

for( var i in students ){
sendmail({
    from: 'sinmaplewing@gmail.com',
    to: i + '@csie.ntu.edu.tw, ' + i + '@ntu.edu.tw' ,
    subject: '計算機程式設計課 批改娘系統帳號密碼',
    content: '歡迎修習計算機程式設計課本課程，可以先上去批改娘系統上去做做題目：http://judgegirl.csie.org。\n您的帳號：' + i + '\n您的密碼：' + students[i] + '\n\nTA',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});
}



