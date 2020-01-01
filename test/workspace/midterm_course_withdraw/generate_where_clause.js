const studentList = require('./student_list');

// console.log(studentList.class1);

function listToWhereIn(studentList, classRestriction) {
    // lgn in student list
    studentList = studentList.map(uid => `"${uid}"`);
    let whereClause = studentList.join(', ');
    whereClause = `lgn not in (${whereClause})`;

    // add class restriction (exclude strong)
    whereClause = `class = ${classRestriction} && ${whereClause}`;

    return whereClause;
}

console.log(listToWhereIn(studentList.class2, 2));

process.exit(0);
