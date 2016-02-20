var students = {"B03611034":"YZ0ux7vgPFrD","B03902091":"ycJddAHUMJYY","B03902095":"cEwZKgD3ZlQI","B03902097":"X6vR1kbxQgR4","B04902001":"qtPlvsRf4Zgn","B04902003":"jyD48XyiXf5l","B04902005":"cATVk2a3ChHZ","B04902007":"h99vFO2Gl2tf","B04902009":"1gykxxOvBCBa","B04902011":"YfyaDyceNgIR","B04902013":"3OHVMZ5BcdlB","B04902015":"tJqfWObtEif2","B04902017":"TDgd04Q40fsi","B04902021":"RLff7PF1aHwD","B04902023":"Zgw3kRdgG6Vw","B04902025":"JnR2sPUKU5b5","B04902027":"ojVKsN0EFyZH","B04902029":"hqLa9vAhoBDb","B04902031":"UR7icZbU0ho0","B04902033":"v41A9K3jH8cH","B04902035":"G3HScoNOSKEP","B04902037":"5Yw5qk3aP5Wv","B04902039":"ZCLePgip4531","B04902041":"QbeGcBvKrvqF","B04902043":"QyFoFUNfWgiQ","B04902045":"QL7cNvg9tZe5","B04902047":"EZPy1QkCfhfG","B04902049":"fnbNLQn4MM0e","B04902051":"zadT8cJ7A8V2","B04902053":"5Lmt6r0UsYDJ","B04902055":"Q783cmOELnCc","B04902057":"SXfEUcA63bHt","B04902059":"0zn8B5LcE6dJ","B04902061":"oHhkUFvhoed6","B04902063":"vTlVrEws2WH8","B04902065":"0wLPyTK0mDh7","B04902067":"kWrVEJ38zsQh","B04902069":"2wIUGrVJkyWG","B04902071":"55UNFx14r4rh","B04902073":"DZ2tn0bIy2LU","B04902075":"GJbJgjg6VCXx","B04902077":"MjiKSA2lL8av","B04902079":"ljeZmAcRszWi","B04902081":"YigVZM92WIYh","B04902083":"A0clNqdpf0Ma","B04902085":"8lxTv6zNbGW4","B04902087":"K0o0oBXPBjFb","B04902089":"x3wZ7UOmu3JB","B04902091":"4VGi148VOPMm","B04902093":"QYPdXgJwHZD8","B04902095":"Lhzox7SQDiy0","B04902097":"xrdq3B82jneb","B04902099":"92J5stic0WI8","B04902101":"BmRe7IFsIy2S","B04902103":"vy0mDKK2Xx5A","B04902105":"0IwJHqQcBrON","B04902107":"ENRXFTzUbt2D","B04902109":"p96liqRvEo1a","B04902111":"99QkmvXSY7BL","B04902113":"75UVefnvItKx","B04902115":"9YcjySSVyc5l","B04902117":"406e1qfzjjSK","B04902119":"L3rLYVwIde6Y","B04902121":"pNH4WU6MTdDJ","B04902123":"ft5qDGAR6rVn","B04902125":"UypNXKdyJWnI","B04902127":"iii77H9yvK0O","B03902117":"uDRsqVTNEKI2","B03902121":"8ZXlNiZWwnNj","B03902125":"z9YHugjyGHiD","B03902127":"BPFPE5TMzsO9","B01902121":"KVUsvCmSWx71"};

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
