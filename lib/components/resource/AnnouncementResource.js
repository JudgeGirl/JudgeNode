'use strict';

const FileResource = require("./FileResource");
const RedisResource = require("./RedisResource");
const ResourceManager = require("./ResourceManager");
const PageContextDecorator = require("./PageContextDecorator");
const config = require('../../config').config;

const file = config.RESOURCE.public.announcement;
const cacheKey = 'cache-announcement';

const baseResource = new FileResource(file);
const cacheResource = new RedisResource(cacheKey);

let announcementResource = new ResourceManager(baseResource, cacheResource);
announcementResource = new PageContextDecorator(announcementResource, '', '');

// Override the get key funcitons so that the key will only be announcement.
announcementResource.getHTMLKey = function() {
    return this.buildKey('announcement', this.htmlPrefix, '.html');
}
announcementResource.getMDKey = function() {
    return this.buildKey('announcement', this.mdPrefix, '.md');
}

module.exports = announcementResource;
