const ResourceConverter = require('./ResourceConverter');

class ToJsonConverter extends ResourceConverter {
    convert(data) {
        return JSON.stringify(data);
    }
}

module.exports = ToJsonConverter;
