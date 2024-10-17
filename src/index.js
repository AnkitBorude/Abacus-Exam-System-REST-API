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
   
    console.log(config);
      logServerStart();
      //
      console.log('='.repeat(50));

          //start localhost mongodb service 
          if(config.util.getEnv('NODE_ENV')=="development")
          {
           
            console.log("Development Server: Executing MongoDB  service startup script")
            await startLocalmongoDBserver();
          }
          else
          {
            console.log("Production Server: Manually Attempt to start MongoDB server");
          }
      
          //connecting to database
      await getConnection();
      
      console.log('='.repeat(50));
    
    
    app.listen(config.get("Application.Port"),()=>{
        console.log(`Server is running on port ${config.get("Application.Port")}`);
      console.log(`http://localhost:${config.get("Application.Port")}`);
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