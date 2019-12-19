const config = {
    weekNumber: "15",                            // for building path
    gradeId: "91",
    cid: {
        Mon: "193",
        Tue: "194"
    },
    studentNumber: {
        Mon: 81,                             // for calculating average
        Tue: 48
    },
    scale: {
        Mon: {
            problemList: [
                "50105"
            ],                                  // can be an arrya of problems
            passLimit: 60,                      // quilified students have score higher than this
            passScale: 1.0,                     // scale for student qualified
            failScale: 0.5,                     // scale for student not qualified
            studentClass: 2,                    // class 2 for Mon, class 1 for Tue
            deadline: "2019-12-15 10:30:00"     // "yyyy-mm-dd HH:ii:ss"
        },
        Tue: {
            problemList: [
                "50105"
            ],
            passLimit: 60,
            passScale: 1.0,
            failScale: 0.5,
            studentClass: 1,
            deadline: "2019-12-16 15:30:00"
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
