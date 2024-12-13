class Apierror extends Error {
    constructor(statusCode, message) {
        super('Application Error');
        this.statusCode = statusCode;
        this.message = message;
        this.time = new Date();
    }
}
export default Apierror;
