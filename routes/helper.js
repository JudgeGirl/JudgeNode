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
    extraMessage = ""
}={}) {
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

module.exports = {
    renderDebug,
    renderError,
    renderForbidden
};
