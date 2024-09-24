const asyncHandler=(fn)=>{
    return async (req,res,next)=>{
        try{
            await fn(req,res,next);
        }
        catch(error)
        {
            res.status(error.statusCode || 500).json(
                {
                    error:error.message,
                    statusCode:error.statusCode,
                    timestamp:error.time,
                    success:false
                }
            )
        }
    }
}
export default asyncHandler;