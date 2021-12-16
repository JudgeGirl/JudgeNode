const renderDebug = function(res, obj) {
    let debugMessage = JSON.stringify(obj);

    return res.render(
        'error2',
        {
            title: "Debug",
            message: "",
            status: "",
            extraMessage: debugMessage
        }
    );
};

const renderError = function({
    res,
    title = "NOT FOUND",
    message = "Error.",
    status = "",
    extraMessage = "",
    httpCode = 500
}={}) {
    res.status(httpCode);
    return res.render('error2', { title, message, status, extraMessage });
}

const renderForbidden = function({
    res,
    message = ""
}={}) {
    return res.render('layout', {
        layout: 'forbidden',
        sysmsg: message
    });
}

const isLegalArgument = function(type, value) {
    if (type == "lgn")
        return /^[ a-zA-Z0-9_]+$/.test(value);

    if (type == "sid")
        return /^[0-9]+$/.test(value);
}

const isLegalLgn = function(lgn) {
    return isLegalArgument("lgn", lgn);
}

const renderInvalidArgurment = function(type, res) {
    type = type.charAt(0).toUpperCase() + type.slice(1);
    return renderError({
        res,
        title: `Invalid ${type}`,
        message: ""
    });
}

module.exports = {
    renderDebug,
    renderError,
    renderForbidden,
    renderInvalidArgurment,
    isLegalLgn,
    isLegalArgument
};
