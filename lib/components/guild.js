var connection = require('../mysql').connection;

const promises = {
    createGuild: function(title, icon) {
        return new Promise((resolve, reject) => {
            const cmd = "INSERT INTO guilds (name, icon) VALUES (?, ?);";
            connection.query(cmd, [title, icon], function(err, result) {
                if (err) {
                    reject(`Failed to list submissions: ${err}.`);
                    return;
                }

                resolve({});
            });
        });
    },
    getGidByTitle: function(title) {
        return new Promise((resolve, reject) => {
            const cmd = "SELECT gid FROM guilds where name = ? ORDER BY GID DESC LIMIT 1;";
            connection.query(cmd, [title], function(err, result) {
                if (err) {
                    reject(`Failed to list submissions: ${err}.`);
                    return;
                }

                resolve(result);
            });
        });
    },
    getGuild: function(gid) {
        return new Promise((resolve, reject) => {
            const cmd = "SELECT * FROM guilds where gid = ?;";
            connection.query(cmd, [gid], function(err, result) {
                if (err) {
                    reject(`Failed to get guild: ${gid}`);
                    return;
                }

                resolve(result);
            });
        });
    }
}

module.exports = {
    createGuild: async function(title, icon) {
        let gidResult = await promises.getGidByTitle(title);
        if (gidResult.length != 0)
            throw "duplicated title";

        await promises.createGuild(title, icon);
        gidResult = await promises.getGidByTitle(title);
        let gid = gidResult[0].gid

        return gid;
    },
    promises
};
