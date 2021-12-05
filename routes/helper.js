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

const isLegalLgn = function(lgn) {
    return /^[ a-zA-Z0-9_]+$/.test(lgn);
}

module.exports = {
    renderDebug,
    renderError,
    renderForbidden,
    isLegalLgn
};
