## README ##

### 小考 ###

```
1. 設定 config.js

2. 下載兩班原始成績
$ nodejs downloadcsv.js

3. 調整分數使兩班平均相等
$ nodejs balance.js

4. 計算考試分數係數(由是否有完成指定題目)
$ nodejs buildScaleTable.js

5. 係數套用到考試分數
$ nodejs applyScale.js

6. 上傳考試分數
$ nodejs uploadcsv.js
```

### 期中期末考 ###

```
$ node balance -W [_csvfile_]+ -B [_csvfile_]+ -o _outputfile
```
