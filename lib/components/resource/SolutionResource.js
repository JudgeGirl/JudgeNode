'use strict';

const FileResource = require("./FileResource");
const RedisResource = require("./RedisResource");
const ResourceManager = require("./ResourceManager");
const PageContextDecorator = require("./PageContextDecorator");
const config = require('../../config').config;

const file = config.RESOURCE.public.solution;
const cacheKey = 'cache-solution';

const baseResource = new FileResource(file);
const cacheResource = new RedisResource(cacheKey);

let solutionResource = new ResourceManager(baseResource, cacheResource);
solutionResource = new PageContextDecorator(solutionResource);

module.exports = solutionResource;
