//initializing the enviroment variables
import dotenv from "dotenv";
const result=dotenv.config({
    override:true
});

import {app} from "./app.js";
import { getConnection } from "./db/db.connection.js";
import { startLocalmongoDBserver } from "./utils/localhost-mongodb.start.js";
import os from 'node:os';
import config from 'config';
try{

    console.log("Starting Server Initialization...");
    if(!process.env.APPLICATION_PORT){throw new Error("Enviroment variable Application Port not found");}
    if(result.error){throw new Error("Error while loading enviroment variables")}
  
      logServerStart();
      console.log(config.get("Application.Port"));
      console.log('Database Connection Initialization');
      console.log('='.repeat(50));

          //start localhost mongodb service
      await startLocalmongoDBserver();
          //connecting to database
      await getConnection();
      
      console.log('='.repeat(50));
    
    
    app.listen(process.env.APPLICATION_PORT,()=>{
        console.log(`Server is running on port ${process.env.APPLICATION_PORT}`);
      console.log(`http://localhost:${process.env.APPLICATION_PORT}`);
      console.log('-'.repeat(50));
     
    })
    
    app.get('/echo', (req, res) => {
        res.json({...req.body,echoed:true});
      })


}
catch(error)
{
    console.log(error);//printing error on log/
    process.exit(1);//shutdowing the node js process directly
}

function logServerStart() {
    console.log('='.repeat(50));
    console.log(`Server Startup - ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    //console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Node.js Version: ${process.version}`);
    console.log(`OS: ${os.type()} ${os.release()}`);
    console.log(`Processor Architecture: ${os.arch()}`);
    console.log(`Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Available Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log('='.repeat(50));
  }