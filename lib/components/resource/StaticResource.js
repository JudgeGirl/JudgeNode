const Resource = require('./Resource');

class StaticResource extends Resource {
    constructor(content) {
        super();

        this.content = content;
    }

    getImplementation() {
        return new Promise(resolve => {
            resolve(this.content);
        });
    }

    setImplementation(key, content) {
        return new Promise(resolve => {
            this.content = content;
            resolve(true);
        });
    }
}

module.exports = StaticResource;
