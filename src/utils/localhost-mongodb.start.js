
import {exec}from 'child_process';

const scriptPath ="/home/ankit-borude/Desktop/abacus-exam-backend/scripts/mongodb-localhost-start-script.sh";

async function startLocalmongoDBserver() {
    return new Promise((resolve,reject)=>{
        console.log("Stating Localhost MongoDB service");
        exec(`sudo ${scriptPath}`,(error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error.message);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                    reject(stderr);
            }
            console.log(`stdout: ${stdout}`);
                resolve(stdout);
        });
    }); 
}
export {startLocalmongoDBserver};