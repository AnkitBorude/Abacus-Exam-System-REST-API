import winston, { format } from "winston";
import process from 'node:process';
//accessing the log file path from the enviroment variable
let filepath=process.env.COMBINED_LOG_PATH;
export const productionLogger=()=>{
    let logger=  winston.createLogger({
        level:'debug',
        transports: [
            new winston.transports.File({filename:filepath})],
        format:format.combine(
            format.timestamp(),
            format.json()
        )
    });
    return logger;
};