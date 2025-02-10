import winston, { format } from "winston";
//accessing the log file path from the enviroment variable

export const productionLogger=()=>{
    let logger=  winston.createLogger({
        level:'debug',
        //transporting to console to be easily collectible by docker container
        transports: [
            new winston.transports.Console({
                stderrLevels:['error']
            })
        ],
        exceptionHandlers: [
            new winston.transports.Console()
        ],
        format:format.combine(
            format.timestamp(),
            format.json()
        ),
        exitOnError: false
    });
    return logger;
};