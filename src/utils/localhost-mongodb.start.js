import { exec } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
const scriptPath =
    '/home/ankit-borude/Desktop/abacus-exam-backend/scripts/mongodb-localhost-start-script.sh';

async function startLocalmongoDBserver() {
    //step 1:check for scriptPath variable is defined or not and has value;
    //step 2: check whether the file exists at the scriptpath
    //step 3: check whether the script has proper file extension
    //step 4: execute file through child process
    return new Promise((resolve, reject) => {
        console.log(
            chalk.yellowBright(
                'Stating Localhost MongoDB service..Initiating Check Sequence...'
            )
        );
        console.log(
            chalk.blueBright('1 Checking scriptpath variable exists...')
        );
        if (typeof scriptPath != 'string') {
            reject(
                'scriptpath variable is not defined or have invalid datatype'
            );
            return;
        }
        console.log(chalk.blueBright('2 Checking mongodb script file path...'));
        if (!fs.existsSync(scriptPath)) {
            reject('mongodb startup script file does not exists...');
            return;
        }
        console.log(chalk.blueBright('3 Checking for valid script file...'));
        if (!path.extname(scriptPath)) {
            reject('Invalid Shell Script ...');
            return;
        }
        console.log(
            chalk.blueBright(
                '4 Spawning a child process for mongodb startup script...'
            )
        );
        exec(`sudo ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.log(chalk.redBright(`Error: ${error.message}`));
                reject(error.message);
            }
            if (stderr) {
                console.log(chalk.redBright(stderr));
                reject(stderr);
            }
            console.log(chalk.green(`stdout: ${stdout}`));
            resolve(stdout);
        });
        console.log(chalk.greenBright('OK'));
    });
}
export { startLocalmongoDBserver };
