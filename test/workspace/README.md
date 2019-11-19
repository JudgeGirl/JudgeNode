## README ##

### 注意事項 ###

* 一次考試如果有超過一個題目須注意。下載下來的成績會用 \_{i}.csv 結尾。
目前腳本一次只計算一題的分數，所以只有\_0.csv 的成績會被使用。因此如果
是要計算第二個題目，需要在下載原始成績之後把\_1.csv 改成 \_0.csv。

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
