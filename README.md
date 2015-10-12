## JudgeNode ##

### Tutorial ###

1. Install Nodejs & Express4.x & MySQL
2. Download this repository
3. create the file named `_config.yml`

### About config ###

In `_config.yml`, the default setting as below,

```
# JUDGE_PATH/submission /testdata /source
JUDGE_PATH: c:/Users/morris821028/Desktop/github/
# JUDGE_PATH: /home/c2014/judgesister/

# MODE: limits user open previous source code & submit problem which not in contest.
CONTEST:
    MODE: true
    SUBMIT_LIMIT: 15

# DATABASE Setting, MySQL
DATABASE:
    host: '140.112.xxx.xxx'
    user: 'c2015'
    password: 'xxxxxxxxxxx'
    port: '3306'
    dbname: 'xxxxxxxxxxxxx'
```

### MySQL Scheme Setting ###

* [Judge-MySQL](https://github.com/JudgeGirl/Judge-MySQL)

If there are encode & decode problem, maybe change the character set and command like these,

```sql
ALTER DATABASE databasename CHARACTER SET utf8 COLLATE utf8_unicode_ci;
ALTER TABLE tablename CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```