class ScoreboardTable {
    constructor(problems, grade, rowScore, userLookupTable) {
        // summary distribution chart
        //   frequency of (scr)
        //
        // distribution chart
        //   frequency of (pid, scr)
        //
        // score table
        //   frequency of (pid, scr), average, user amount
        //
        // student table
        //   score of (pid, lng)

        this.problems = problems;
        this.grade = grade;

        let problemNumber = problems.length;

        // problemScoreCount: (pid, score)
        let problemScoreCount = {};
        for (let i = 0; i < problemNumber; i++) {
            let col = {};
            let pid = problems[i].pid;

            for (let j = 0; j < rowScore.length; j++) {
                let currentRowScore = rowScore[j]['max_res'];
                col[currentRowScore] = 0;
            }

            problemScoreCount[pid] = col;
        }

        let pidList = [];
        problems.forEach(row => pidList.push(row['pid']))

        let studentTotalScore = {};
        let problemScoreList = {};
        grade.forEach(studentMaxScore => {
            let uid = studentMaxScore.uid;
            let pid = studentMaxScore.pid;
            let score = studentMaxScore['MAX(scr)'];

            // skip submissions with invalid pid
            if (!pidList.includes(pid)) return;

            problemScoreCount[pid][score] += 1;

            if (!(uid in studentTotalScore))
                studentTotalScore[uid] = 0;

            if (!(pid in problemScoreList))
                problemScoreList[pid] = [];

            score = parseFloat(score);

            studentTotalScore[uid] += score;
            problemScoreList[pid].push(score);
        })

        // build problem score distribution data
        let problemScoreDistribution = [];
        for (let i = 0; i < problemNumber; i++) {
            let title = problems[i].ttl;
            let pid = problems[i].pid;
            let scoreCount = problemScoreCount[pid];
            let chartData = [];
            for (let score in scoreCount) {
                let user = scoreCount[score];
                if (user <= 0)
                    continue;

                chartData.push({ score: parseInt(score), user });
            }

            if (chartData.length == 0) {
                chartData.push({ score: 100, user: 0 });
            }

            problemScoreDistribution.push({
                title,
                pid,
                scoreCount,
                chartData
            });
        }
        this.problemScoreDistribution = problemScoreDistribution;

        // build score table
        let totalUser = userLookupTable.length;
        let tableCols = [];
        for (let i = 0; i < problemNumber; i++) {
            let title = problems[i].ttl;
            let pid = problems[i].pid;

            let average, noSubmit;
            if (!(pid in problemScoreList)) {
                // no submission for the pid
                average = 0;
                noSubmit = totalUser;
            } else {
                average = problemScoreList[pid].reduce((a, b) => a + b, 0) / problemScoreList[pid].length;
                noSubmit = totalUser - problemScoreList[pid].length;
            }

            let scoreList = Object.values(problemScoreCount[pid]).reverse();
            tableCols.push({ title, pid, scoreList, average , noSubmit});
        }

        let totalScoreFrequency = {};
        let totalScoreList = [];
        for (let uid in studentTotalScore) {
            let totalScore = studentTotalScore[uid];
            totalScoreList.push(totalScore);

            if (!(totalScore in totalScoreFrequency))
                totalScoreFrequency[totalScore] = 0;

            totalScoreFrequency[totalScore] += 1;
        }

        let totalAverage;
        if (totalScoreList.length == 0)
            totalAverage = 0;
        else
            totalAverage = totalScoreList.reduce((a, b) => a + b, 0) / totalScoreList.length;
        this.scoreTable = {
            tableCols,
            totalUser,
            totalAverage
        };

        this.summaryChartData = null;
        if (problemNumber > 1) {
            let summaryChartData = [];
            for (let score in totalScoreFrequency) {
                summaryChartData.push({ score: parseInt(score), user: totalScoreFrequency[score] });
            }
            this.summaryChartData = summaryChartData;
        }
    }

    getProblemScoreDistribution() {
        return this.problemScoreDistribution;
    }

    getSummaryChartData() {
        return this.summaryChartData;
    }

    getScoreTable() {
        return this.scoreTable;
    }
}

module.exports = ScoreboardTable;
