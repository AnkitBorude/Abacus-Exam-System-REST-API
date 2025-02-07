import config from 'config';
import { developmentLogger
 } from "./development.logger.js";
 import { productionLogger } from "./production.logger.js";
let logger=null;
   if (config.util.getEnv('NODE_ENV') == 'development') {
    
    logger= developmentLogger();
   }
   else if(config.util.getEnv('NODE_ENV') == 'production')
   {
    logger=productionLogger();
   }
   else
   {
    throw  new Error("No suitable enviroment variable found cannot implement logging service");
   }

export {logger};