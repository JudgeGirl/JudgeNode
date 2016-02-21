## Judge Node ##

### 安裝 ###

1. 安裝 Nodejs & MySQL `apt-get install nodejs mysql-server`
2. 下載這一份 repository `git clone https://github.com/JudgeGirl/JudgeNode`
3. 複製設定檔案，並且產生 https 需要的相關文件  
```
$ cp _DEFAULTconfig.yml _config.yml
$ openssl genrsa -out privatekey.pem 1024
$ openssl req -new -key privatekey.pem -out certrequest.csr
$ openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```
4. 確定 Judge 的目錄如下所示：  
```
root@ubuntu:/home/judgesister# tree -L 1
.
├── JudgeNode (可以放置別處)
├── Judge-sender (一定要與 source, submission, testdata 位置相當)
├── Judge-template (提供範例，可不用下載)
├── source
├── submission
└── testdata
```
5. 如果不手動建立，可以參考以下的做法建立
```
$ mkdir /home/judgesister/source
$ mkdir /home/judgesister/submission
$ mkdir /home/judgesister/testdata
$ cp -r /home/judgesister/Judge-template/default/source/* /home/judgesister/source/
```
6. 安裝 JudgeNode 相關套件  
```
$ cd JudgeNode
$ npm install
$ bower install
$ gulp build
```
7. 測試用的啟動模式 `npm start` / 公開用的啟動模式 `./start`

### 關於設定檔 ###

在 `_config.yml` 中，預設檔案配置如下：

```
# order is important, don't change or alternate, otherwise please change all testdata/xxx/judge
# lang: ['*', 'C', 'C++', 'C# 3.0', 'Python 3', 'Scala 2']
# compiler: [, 'g++ -std=c++98 -O2', 'mcs -langversion:3', 'python3', 'scalac -optimise'],
# WT: 0, CE: 1, OLE: 2, MLE: 3, RE: 4, TLE: 5, WA: 6, AC: 7, SAVING: 8, PE: -1,
JUDGE:
    path: 'c:/Users/morris821028/Desktop/github/'
    lang: ['*', 'C']
    compiler_arg: ['none', 'gcc -std=c99 -O2']
    result_message: ['Waiting', 'Compilation Error', 'Output Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Time Limit Exceeded', 'Wrong Answer', 'Accepted', 'Uploading...', 'Presentation Error']

# JUDGE_PATH/submission /testdata /source
# JUDGE_PATH: /home/c2014/judgesister/

# MODE: limits user open previous source code & submit problem which not in contest.
CONTEST:
    MODE: false
    SUBMIT_LIMIT: 15
    VALID_IP: ["::ffff:140.112.16.155", "::ffff:140.112.16.156", "::ffff:140.112.16.158", "::1", "::ffff:127.0.0.1"]

# DATABASE Setting, MySQL
DATABASE:
    host: '140.112.xxx.xxx'
    user: 'xxxxxxxxxxxxxxx'
    password: 'xxxxxxxxxxx'
    port: '3306'
    database: 'xxxxxxxxxxxxx'

# WEBSITE API HOST
HOST:
    TITLE: 'Judge Girl'
    IP: 'localhost'
    testdata: 'https://github.com/JudgeGirl/JG-testdata/blob/master/practice/'
    social:
        youtube: 'https://www.youtube.com/playlist?list=PLOvZ8aEg7xDkpKHk3hAwQxLAlpZ1Q3wKH'
        github: 'https://github.com/pangfengliu/programmingtasks/issues'
        facebook: 'https://www.facebook.com/%E6%89%B9%E6%94%B9%E5%A8%98%E7%B2%89%E7%B5%B2%E5%9C%98-257246016760/timeline/'
        googlesite: 'https://sites.google.com/site/ntucsiec2015/announcement'
    footer:
        text: 'TA 曹又霖、顏志軒、林蔚城、陳威甯'
        license: 'Instructor <a title="劉邦鋒" href="/">Pangfeng Liu</a>, Web designer <a title="許祐程" href="/">Akira</a>, <a title="王盛平" href="/">Peer4321</a>, <a title="曹又霖" href="https://github.com/sinmaplewing">Maplewing</a>, <a title="楊翔雲" href="https://github.com/morris821028">Morris</a>'
# Disqus
Disqus:
    shortname: 'ntucsiecprogramming'
```

### 公開用的啟動模式 ###

網站可能會因為某些 Bug 而掛掉，若需要不斷地重新開啟，執行目錄下的 `./start` 可以每隔 10 秒嘗試重新啟動，如果要強制關閉，請按 `CTRL + C` 終止網站啟動。在這種模式下，Debug 工作會變得非常困難。

```
$ ./start
```

* 如果 `CTRL + C` 沒有反應，按照下面步驟。  
```
$ root@ubuntu:/home/judgesister/JudgeNode# ps aux | grep start
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      5671  0.0  0.0   4448   780 pts/3    S+   Feb20   0:00 /bin/sh ./start <<<<Judge-sender
root     19296  0.0  0.0  27236  8028 pts/4    S+   12:04   0:00 python3 ./start <<<<JudgeNode
$ kill -9 <JudgeNode-PID>
```