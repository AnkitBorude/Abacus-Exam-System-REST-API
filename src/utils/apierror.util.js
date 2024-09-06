class Apierror extends Error{
    constructor(statusCode,message)
    {
        super(message);
        this.statusCode=statusCode;
        this.message=message;
        this.time=new Date();
    }
}
export default Apierror;