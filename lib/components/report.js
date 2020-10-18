var connection = require('../mysql').connection;

module.exports = {
    getBySidPromise: sid => {
        return new Promise((resolve, reject) => {
            let cmd = "select * from reports where sid = ?;"
            let dbCallback = (err, result) => {
                if (err)
                    reject(err);
                else if(result.length == 0)
                    reject('No report found.');
                else
                    resolve(result);
            }
            connection.query(cmd, [sid], dbCallback);
        });
    }
};
