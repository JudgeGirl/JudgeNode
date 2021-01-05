'use strict';

const FileResource = require("./FileResource");
const RedisResource = require("./RedisResource");
const ResourceManager = require("./ResourceManager");
const PageContextDecorator = require("./PageContextDecorator");
const config = require('../../config').config;

const file = config.RESOURCE.public.problem;
const cacheKey = 'cache-problem';

const baseResource = new FileResource(file);
const cacheResource = new RedisResource(cacheKey);

let probleResource = new ResourceManager(baseResource, cacheResource);
probleResource = new PageContextDecorator(probleResource);

module.exports = probleResource;
