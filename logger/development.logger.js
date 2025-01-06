import winston, { format } from "winston";
export const developmentLogger=()=>{
    let logger=  winston.createLogger({
        level:'debug',
        transports: [new winston.transports.Console({format:format.colorize()}),
            new winston.transports.File({filename:'application.log'}),
            new winston.transports.File({filename:'error.log',level:'error',format:format.align()})],
        format:format.combine(
            format.timestamp(),
            format.json()
        )
    });
    return logger;
};