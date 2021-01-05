'use strict';

const FileResource = require("./FileResource");
const RedisResource = require("./RedisResource");
const ResourceManager = require("./ResourceManager");
const PageContextDecorator = require("./PageContextDecorator");
const config = require('../../config').config;

const file = config.RESOURCE.public.contest;
const cacheKey = 'cache-contest';

const baseResource = new FileResource(file);
const cacheResource = new RedisResource(cacheKey);

let contestResource = new ResourceManager(baseResource, cacheResource);
contestResource = new PageContextDecorator(contestResource);

module.exports = contestResource;
