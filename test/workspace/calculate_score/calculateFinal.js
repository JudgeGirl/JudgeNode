const config = require("./config");

const {
    printResult,
    finishWithMessage,
    finishWithError
} = require("../tool");

const {
    getFinalScore,
    getUserByUid,
    getUserByClassList
} = require("../db");

function toGPA(finalGrade) {
	if (finalGrade >= 90)
		return 'A+';
	if (finalGrade >= 85)
		return 'A';
	if (finalGrade >= 80)
		return 'A-';
	if (finalGrade >= 77)
		return 'B+';
	if (finalGrade >= 73)
		return 'B';
	if (finalGrade >= 70)
		return 'B-';
	if (finalGrade >= 67)
		return 'C+';
	if (finalGrade >= 63)
		return 'C';
	if (finalGrade >= 60)
		return 'C-';
	return 'F';
}

function toRawFinalScore(sum, examCount) {
    let finalGrade = sum * 108 / (100 * examCount);
    finalGrade = finalGrade >= 100 ? 100 : finalGrade;

    return finalGrade;
}

function buildGrade(userScore) {
    let sum = 0.0;
    let absence = 0;
    let attended = 0;
    let approvedLeave = 0;
    let scoreNum = userScore.scoreList.length;

    if (scoreNum > 18)
        throw `too many score record. user: ${$userScore.user.uid}, number of record: ${scoreNum}`;

    for (let row of userScore.scoreList) {
        let score = row.score;

        if (score == -1) {
            absence++;
            continue;
        }

        if (score == -2) {
            approvedLeave++;
            continue;
        }

        if (score < 0 || score > 100)
            throw `invalid score. user: ${userScore.user.uid}, score: ${score}`;


        attended++;
        sum += row.score;
    }

    let rawFinalGrade = toRawFinalScore(sum, 18 - approvedLeave);

    let finalGrade = Math.ceil(rawFinalGrade);

    let result = {
        uid: userScore.user.uid,
        lgn: userScore.user.lgn,
        totalScore: sum,
        rawFinalGrade,
        finalGrade,
        GPA: toGPA(finalGrade),
        attended,
        absence,
        approvedLeave
    }

    return result;
}

const filterUserData = queryResult => {
    if (queryResult.length != 1)
        throw `invalide query queryResult number. ${queryResult.length}`;

    const filter = ({ uid, lgn, class: _class }) => ({ uid, lgn, class: _class });

    return filter(queryResult[0]);
};

const filterScoreData = queryResult => {
    if (queryResult.length > 18)
        throw `invalide query queryResult number. ${queryResult.length}`;

    const filter = ({eid, score}) => ({eid, score});

    return queryResult.map(filter);
};

const filterUid = queryResult => {
    const filter = row => row.uid;

    return queryResult.map(filter);
};

const buildUserScore = user => {
    return scoreList => {
        return {
            user,
            scoreList
        };
    };
}

function buildStrongUserTable(user, eidList) {
    let scoreList = [];
    for (let eid in eidList)
        scoreList.push({
            eid,
            score: 100
        });

    let userTable = { user, scoreList };

    return new Promise(resolve => {
        resolve(userTable);
    });
}

function outputGradeTable(gradeTable) {
    let header = ['uid', 'lgn', 'GPA', 'raw final grade', 'final grade'];
    header = header.join(', ');
    console.log(header);
    for (let row of gradeTable) {
        let finalGradePresentation = row.rawFinalGrade.toFixed(2);
        console.log(`${row.uid}, ${row.lgn}, ${row.GPA}, ${finalGradePresentation}, ${row.finalGrade}`);
    }
}

async function main(config) {
    const uidList = await getUserByClassList([1, 2, 5]).then(filterUid).catch(finishWithError);
    let taskList = uidList.map(uid => getUserByUid(uid).then(filterUserData).catch(finishWithError));
    const userList = await Promise.all(taskList);

    taskList = [];
    for (let user of userList) {
        let task;
        if (user.class == '5') {
            task = buildStrongUserTable(user, config.finalEid);
        } else {
            task = getFinalScore(config.finalEid, user.uid)
                .then(filterScoreData)
                .then(buildUserScore(user))
                .catch(finishWithError);
        }

        taskList.push(task);
    }

    const userScoreList = await Promise.all(taskList);
    let gradeTable = userScoreList.map(buildGrade);

    gradeTable = gradeTable.sort((a, b) => a.lgn > b.lgn ? 1 : -1);

    outputGradeTable(gradeTable);

    process.exit(0);
}


main(config);
