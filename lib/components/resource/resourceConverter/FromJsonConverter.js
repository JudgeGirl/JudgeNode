const ResourceConverter = require('./ResourceConverter');

class FromJsonConverter extends ResourceConverter {
    convert(data) {
        return JSON.parse(data);
    }
}

module.exports = FromJsonConverter;
