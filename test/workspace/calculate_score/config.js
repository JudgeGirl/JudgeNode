const config = {
    weekNumber: "17",                            // for building path
    gradeId: "93",
    cid: {
        Mon: "197",
        Tue: "198"
    },
    studentNumber: {
        Mon: 73,                                // for calculating average
        Tue: 47
    },
    merge: {
        Mon: [0, 1],                            // we merge scores of two problems for some exam
        Tue: [0, 1]                             // leave empty array([]) if not needed
    },
    scale: {
        Mon: {
            problemList: [
                "50148"
            ],                                  // can be an array of problems
            passLimit: 60,                      // quilified students have score higher than this
            passScale: 1.0,                     // scale for student qualified
            failScale: 0.5,                     // scale for student not qualified
            studentClass: 2,                    // class 2 for Mon, class 1 for Tue
            deadline: "2019-12-29 10:30:00"     // "yyyy-mm-dd HH:ii:ss"
        },
        Tue: {
            problemList: [
                "50148"
            ],
            passLimit: 60,
            passScale: 1.0,
            failScale: 0.5,
            studentClass: 1,
            deadline: "2019-12-30 15:30:00"
        },
        filename: "scaleTable.csv"
    },
    result: {
        filename: "result.csv"
    },
    scaledResult: {
        filename: "scaledResult.csv"
    },
    courseYear: "2019"       // for building path
};

config.path = `c${config.courseYear}/w${config.weekNumber}`;

module.exports = config;
