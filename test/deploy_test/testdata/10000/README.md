## strict compare ##

### subtasks.py ##

格式 
```
[
	[配分, [輸入檔名, 輸出檔名, 限制秒數 (秒為單位), 記憶體限制 (Bytes 為單位), 輸出檔案大小限制 (Bytes 為單位)]]
	[, []]
]
```

### Example 1 ###
```
[
 [  100, [ '0.in',  '0.out', 1, 64 << 20, 64 << 10]]
]
```

### Example 2 ###
```
[
 [  0, [ '0.in',  '0.out', 1, 64 << 20, 64 << 10]]
 [  100, [ '1.in',  '1.out', 1, 64 << 20, 64 << 10]]
]
```

### special ###

比較兩個檔案的差異，防止在 windows 上面生測資所導致的 `\r` 問題，因此不直接使用 diff，而是額外寫一個 python 檔案，藉由 `quit(1)` 回報比較兩個檔案錯誤。

其中 `sys.argv[1]` 為輸入測資、`sys.argv[2]` 為輸出測資、`sys.argv[3]` 為使用者根據輸入測資的輸出。

```
#!/usr/bin/env python3
import sys

def rstrip(s):
	while s and (s[-1] == '\r' or s[-1] == '\n'): s = s[:-1]
	return s

fa, fb = open(sys.argv[2]), open(sys.argv[3])
while True:
	la, lb = fa.readline(), fb.readline()
	if la:
		if not lb or rstrip(la) != rstrip(lb): quit(1)
	elif lb:
		quit(1)
	else:
		break
```
