const config = {
    weekNumber: "18",                            // for building path
    gradeId: "94",
    cid: {
        Mon: "199",
        Tue: "200"
    },
    studentNumber: {
        Mon: 69,                                // for calculating average
        Tue: 40
    },
    merge: {
        Mon: [],                            // we merge scores of two problems for some exam
        Tue: []                             // leave empty array([]) if not needed
    },
    scale: {
        Mon: {
            problemList: [
                "50149"
            ],                                  // can be an array of problems
            passLimit: 60,                      // quilified students have score higher than this
            passScale: 1.0,                     // scale for student qualified
            failScale: 0.5,                     // scale for student not qualified
            studentClass: 2,                    // class 2 for Mon, class 1 for Tue
            deadline: "2020-01-05 10:30:00"     // "yyyy-mm-dd HH:ii:ss"
        },
        Tue: {
            problemList: [
                "50149"
            ],
            passLimit: 60,
            passScale: 1.0,
            failScale: 0.5,
            studentClass: 1,
            deadline: "2020-01-06 15:30:00"
        },
        filename: "scaleTable.csv"
    },
    result: {
        filename: "result.csv"
    },
    scaledResult: {
        filename: "scaledResult.csv"
    },
    courseYear: "2019",     // for building path
    finalEid: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 89, 90, 91, 92, 93, 94]            // collection of all cid
};

config.path = `c${config.courseYear}/w${config.weekNumber}`;

module.exports = config;
