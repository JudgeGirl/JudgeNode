const ResourceConverter = require('./ResourceConverter');

class FilterListConverter extends ResourceConverter {
    constructor(filterList) {
        super();

        this.filterList = filterList;
    }

    convert(data) {
        if (!Array.isArray(data))
            throw new Error('Only takes array.');

        return data.filter(element => !(this.filterList.includes(element)));
    }
}

module.exports = FilterListConverter;
