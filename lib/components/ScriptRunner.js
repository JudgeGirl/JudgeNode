let { exec } = require('child_process');

class ScriptRunner {
    constructor(command, workingDirectory) {
        this.command = command;
        this.workingDirectory = workingDirectory;
    }

    run() {
        return new Promise(resolve => {
            let options = { cwd: this.workingDirectory }

            const process = exec(this.command, options, function(error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: '+ error.code);
                    console.log('Signal received: ' + error.signal);
                }

                console.log('Child Process STDOUT: \n'+ stdout);
                if (stderr !== "")
                    console.log('Child Process STDERR: \n'+ stderr);
            });

            process.on('exit', function (code) {
                console.log('Child process exited with exit code '+ code);
                resolve(code);
            });
        });
    }
}

module.exports = {
    getSendStyleCheckTaskRunner: sid => {
        let command = `poetry run python scripts/send_style_check_task/send_by_sid.py ${sid}`;
        let workingDirectory = '/home/judgesister/Judge-sender';
        return new ScriptRunner(command, workingDirectory);
    }
}
