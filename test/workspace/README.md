## README ##

```
$ ./run.sh [week_id] [mon_cid] [tue_cid] [grade_id]
$ nodejs uploadcsv.js [grade_id] w7/week7result.csv
```


### 小考 ###

```
$ nodejs downloadcsv.js [cid] week7mon
$ nodejs downloadcsv.js [cid] week7tue
$ nodejs balance.js week7mon_0.csv week7tue_0.csv result.csv
$ nodejs uploadcsv.js [grade_id] result.csv
```

### 期中期末考 ###

```
$ node balance -W [_csvfile_]+ -B [_csvfile_]+ -o _outputfile
```
