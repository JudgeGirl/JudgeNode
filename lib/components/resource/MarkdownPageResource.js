class MarkdownPageResource {
    constructor(htmlResource, markdownResource) {
        this.htmlResource = htmlResource;
        this.markdownResource = markdownResource;
    }

    getMD(key) {
        return this.markdownResource.get(key);
    }

    setMD(key, content) {
        return this.markdownResource.set(key, content);
    }

    getHTML(key) {
        return this.htmlResource.get(key);
    }

    setHTML(key, content) {
        return this.htmlResource.set(key, content);
    }
}


module.exports = MarkdownPageResource;
