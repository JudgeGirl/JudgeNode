const {
    finish,
    logErr
} = require("../tool");

const config = require("./config.js");
const { exec } = require('child_process');
const colors = require('colors');


// main
(function() {
    let cmd = `grep -wc "0.5" ${config.path}/${config.scale.filename}`;
    exec(cmd, (err, stdout, stderr) =>  {
        if (err) logErr(err)

        failedNum = stdout.trim()["red"];

        finish(null, `students failed to pass classifier: ${failedNum}.`);
    });

    // finish(null, cmd);
    // finish(null, 'hello world!' + file);
})();
