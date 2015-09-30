## How to Use ##

### First ###

List all members in `account.txt`, format following below:

```
[student_id]
```

For example:


```
B02902040
B03902018
B04902002
B04902004
```

### Second ###

Insert [student_id, random_password] into database

```
$ node add_student.js
```

`add_student.js` will create `user.txt`, then copy the user list (JSON foramt) into user.js

### Third ###

After creating all accounts, send a e-mail to each student.

```
$ node user.js
```


