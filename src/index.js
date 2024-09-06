//initializing the enviroment variables
import dotenv from "dotenv";
const result=dotenv.config({
    override:true
});

import {app} from "./app.js";
import { getConnection } from "./db/db.connection.js";

try{

    console.log("Starting server...");
    if(!process.env.APPLICATION_PORT){throw new Error("Enviroment variable Application Port not found");}
    if(result.error){throw new Error("Error while loading enviroment variables")}
    app.get('/test', (req, res) => {
        res.send('hello world')
      })
      //connecting to database
    await getConnection();
    
    app.listen(process.env.APPLICATION_PORT,()=>{
        console.log("Server Listening on",process.env.APPLICATION_PORT);
    })
    


}
catch(error)
{
    console.log(error);//printing error on log/
    process.exit(1);//shutdowing the node js process directly
}