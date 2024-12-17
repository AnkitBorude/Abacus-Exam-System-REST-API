import Joi from "joi";
import { questionValidationschema } from "./questionValidation.middleware.js";

// Joi schema for exam validation
const examValidationschema = Joi.object({
  title: Joi.string()
    .pattern(/^[a-zA-Z0-9#: ]+$/)
    .min(3)
    .max(100)
    .messages({
      'string.base': 'title must be a string.',
      'string.pattern.base': 'title can only contain alphanumeric characters, spaces, #, and :.',
      'string.min': 'title must be at least 3 characters long.',
      'string.max': 'title cannot exceed 100 characters.',
    }),

  duration: Joi.number()
    .integer()
    .min(1)
    .max(360)
    .messages({
      'number.base': 'duration must be a number.',
      'number.min': 'duration must be at least 1.',
      'number.max': 'duration cannot exceed 360.',
    }),

  level: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .messages({
      'number.base': 'level must be a number.',
      'number.min': 'level must be at least 1.',
      'number.max': 'level cannot exceed 10.',
    }),

  is_active: Joi.boolean()
    .messages({
      'boolean.base': 'is_active must be a boolean value (true or false).',
    }),

  isSingleAttempt: Joi.boolean()
    .messages({
      'boolean.base': 'isSingleAttempt must be a boolean value (true or false).',
    }),
}).options({allowUnknown:false});

const examValidation=(req,res,next)=>{
    //things to keep in mind
    //if the exam post
    // request need to merge the question and exam schema and make all the fields required

    if(req.method==="POST")
    {
        //make the all exam schema fields as required
        let examPostvalidationSchema=examValidationschema.fork(
            Object.keys(examValidationschema.describe().keys),
            (schemaObj)=> schemaObj.required());
        //merge the examPostScehma and Question Schema
        let finalValidationSchema=examPostvalidationSchema.concat(questionValidationschema);
        const {error}=finalValidationSchema.validate(req.body);
        if(error)
        {
            //attaching the error message to req object
            req.validationError=error.details[0].message;
        }
        next();
    }
    else
    {
        //handling the exam patch request
        const {error}=examValidationschema.validate(req.body);
        if(error)
        {
            req.validationError=error.details[0].message;
        }
        next();
    }

    //if the exam patch
    //only validate with basic examschema
}

export {examValidation}