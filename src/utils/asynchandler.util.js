import chalk from "chalk";
const asyncHandler=(fn)=>{
    return async (req,res,next)=>{
        try{
            await fn(req,res,next);
        }
        catch(error)
        {
            if(error.statusCode==null)
            {
            console.log(chalk.redBright("Internal Server error"+error.stack));
            }
            res.status(error.statusCode || 500).json(
                {
                   
                    error:error.message,
                    statusCode:error.statusCode,
                    timestamp:new Date(),
                    success:false
                }
            )
        }
    }
}
export default asyncHandler;