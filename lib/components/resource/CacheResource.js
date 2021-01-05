'use strict';

const Resource = require('./Resource');

class CacheResource extends Resource {
    get(key) {
        throw "Not implemented";
    }

    set(key, content) {
        throw "Not implemented";
    }

    invalid(key) {
        throw "Not implemented";
    }
}

module.exports = CacheResource;
