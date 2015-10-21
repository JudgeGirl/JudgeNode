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

TITLE: 'Judge Girl'
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
    user: 'xxxxxxxxxx'
    password: 'xxxxxxxxx'
    port: '3306'
    dbname: 'xxxxxxxxx'

# WEBSITE API HOST
HOST:
    IP: '140.112.31.208'

# Disqus
Disqus:
    shortname: 'ntucsiecprogramming'
```

### MySQL Scheme Setting ###

* [Judge-MySQL](https://github.com/JudgeGirl/Judge-MySQL)

If there are encode & decode problem, maybe change the character set and command like these,

```sql
ALTER DATABASE databasename CHARACTER SET utf8 COLLATE utf8_unicode_ci;
ALTER TABLE tablename CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```