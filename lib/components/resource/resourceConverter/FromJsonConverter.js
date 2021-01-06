const ResourceConverter = require('./ResourceConverter');

class ToJsonConverter extends ResourceConverter {
    convert(data) {
        return JSON.parse(data);
    }
}

module.exports = ToJsonConverter;
