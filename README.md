## JudgeNode ##

### Tutorial ###

1. Install Nodejs & Express4.x & MySQL
2. Download this repository
3. create the file named `_config.yml`

### About config ###

In `_config.yml`, the default setting as below,

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
    VALID_IP: ["::ffff:140.112.16.155", "::ffff:140.112.16.156", "::ffff:140.112.16.158", "::1"]

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
    IP: '140.112.31.208'
    testdata: 'https://github.com/JudgeGirl/JG-testdata/blob/master/practice/'
    social:
        youtube: 'https://www.youtube.com/playlist?list=PLOvZ8aEg7xDkpKHk3hAwQxLAlpZ1Q3wKH'
        github: 'https://github.com/pangfengliu/programmingtasks/issues'
        facebook: 'https://www.facebook.com/%E6%89%B9%E6%94%B9%E5%A8%98%E7%B2%89%E7%B5%B2%E5%9C%98-257246016760/timeline/'
        googlesite: 'https://sites.google.com/site/ntucsiec2015/announcement'
    footer:
        text: 'What do you want to do ?'
        license: 'so ?'

# Disqus
Disqus:
    shortname: 'ntucsiecprogramming'
```

### Auto Restart ###

If you want server not crash in seldom situation, run `./start` as infinite loop to call `npm start`. In this situation, your debug work will be harder.

```
$ ./start
```

#### How to stop auto restart ####

```
$ ps aux | grep start
root      3232  0.0  0.0 106096  1148 pts/2    S+   Oct12   0:00 /bin/sh ./start
root      5960  0.0  0.0 103256   856 pts/0    S+   13:33   0:00 grep start
root     25866  0.0  0.0   3920   340 pts/4    S+   Sep22   0:00 ./start
$ kill -9 25866
```


### MySQL Scheme Setting ###

* [Judge-MySQL](https://github.com/JudgeGirl/Judge-MySQL)

If there are encode & decode problem, maybe change the character set and command like these,

```sql
ALTER DATABASE databasename CHARACTER SET utf8 COLLATE utf8_unicode_ci;
ALTER TABLE tablename CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```