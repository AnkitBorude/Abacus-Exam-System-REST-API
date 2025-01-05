import Joi from 'joi';

let adminValidationschema = Joi.object({
    fullname: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/) // Allows only letters and spaces
        .min(3)
        .max(50)
        .messages({
            'string.pattern.base':
                'fullname must only contain alphabets and spaces.',
        }),
    email: Joi.string().email(),
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().min(8).max(128).messages({
        'string.min': 'password must be at least 8 characters long.',
        'string.max': 'password must not exceed 128 characters.',
    }),
}).options({ allowUnknown: false });

const adminValidation=(req,res,next)=>{
    let validationSchema = null;
    if (req.method === 'POST') {
        //making all the fields required if the request is post else the default optional is
        validationSchema = adminValidationschema.fork(
            Object.keys(adminValidationschema.describe().keys),
            (schemaObj) => schemaObj.required()
        );
    } else {
        validationSchema = adminValidationschema;
    }

    const { error } = validationSchema.validate(req.body);
    if (error) {
        //attaching the error message to req object
        req.validationError = error.details[0].message;
    }
    next();
}
export {adminValidation};