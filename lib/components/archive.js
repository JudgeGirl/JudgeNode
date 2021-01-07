var mysql = require('mysql'),
    fs = require('graceful-fs'),
    path = require("path"),
    crypto = require('crypto'),
    escape = require('escape-html'),
    config = require('../config').config;
const { resourceFactory } = require('./resource/ResourceFactory');

var connection = require('../mysql').connection;

module.exports = {
    list: async function(callback) {
        try {
            let announcementResource = resourceFactory.createAnnouncementResource();
            let html = await announcementResource.getHTML();

            callback(html.toString());
        } catch (err) {
            console.log(err);
            callback('err');
        }
    }
};
