var mysql = require('mysql'),
    config = require('../config').config;

var connection = require('../mysql').connection;

const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const dbQuery = cmd => {
    return new Promise((resolve, reject) => {
        connection.query(cmd, [], (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
};

function createGuildPromise(title, icon) {
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
}

function getGidByTitlePromise(title) {
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
}

function getGuildPromise(gid) {
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

function insertUser(uid, gid) {
    return new Promise((resolve, reject) => {
        const cmd = "UPDATE users set gid = ? where uid = ?";
        connection.query(cmd, [gid, uid], function(err, result) {
            if (err) {
                reject(`Failed to set guild for a user: (${uid}, ${gid}).`);
                return;
            }

            resolve(result);
        });
    });
}

module.exports = {
    createGuild: async function(title, icon) {
        let gidResult = await getGidByTitlePromise(title);
        if (gidResult.length != 0)
            throw "duplicated title";

        await createGuildPromise(title, icon);
        gidResult = await getGidByTitlePromise(title);
        let gid = gidResult[0].gid

        return gid;
    }
};
