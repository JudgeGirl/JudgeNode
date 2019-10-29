const config = {
    weekNumber: "11",                            // for building path
    gradeId: "80",
    cid: {
        Mon: "185",
        Tue: "186"
    },
    studentNumber: {
        Mon: 103,                             // for calculating average
        Tue: 57
    },
    scale: {
        Mon: {
            problemList: [
                "50134"
            ],                                  // can be an arrya of problems
            passLimit: 60,                      // quilified students have score higher than this
            passScale: 1.0,                     // scale for student qualified
            failScale: 0.5,                     // scale for student not qualified
            studentClass: 2,                    // class 2 for Mon, class 1 for Tue
            deadline: "2019-11-17 10:30:00"     // "yyyy-mm-dd HH:ii:ss"
        },
        Tue: {
            problemList: [
                "50134"
            ],
            passLimit: 60,
            passScale: 1.0,
            failScale: 0.5,
            studentClass: 1,
            deadline: "2019-11-18 15:30:00"
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
