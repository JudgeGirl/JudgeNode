function toTemplate(rawTemplate) {
    return rawTemplate.replace('{}', '${this.key}');
}

function applyTemplate(template, term) {
    let functionCode = `return \`${template}\`;`;

    return new Function(functionCode).call({ key:term });
}

module.exports = { toTemplate, applyTemplate };
