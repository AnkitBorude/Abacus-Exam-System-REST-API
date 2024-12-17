import Joi from "joi";

let questionValidationschema = Joi.object({
    minNumber: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .required()
      .messages({
        'number.base': 'minNumber must be a number.',
        'number.min': 'minNumber must be at least 1.',
        'number.max': 'minNumber cannot exceed 999.',
      }),
  
    maxNumber: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .greater(Joi.ref('minNumber'))
      .required()
      .messages({
        'number.base': 'maxNumber must be a number.',
        'number.min': 'maxNumber must be at least 1.',
        'number.max': 'maxNumber cannot exceed 999.',
        'number.greater': 'maxNumber must be greater than minNumber.',
      }),
  
    maxTerms: Joi.number()
      .integer()
      .min(2)
      .max(8)
      .required()
      .messages({
        'number.base': 'maxTerms must be a number.',
        'number.min': 'maxTerms must be at least 2.',
        'number.max': 'maxTerms cannot exceed 8.',
      }),
  
    total_questions: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .required()
      .messages({
        'number.base': 'total_questions must be a number.',
        'number.min': 'total_questions must be at least 1.',
        'number.max': 'total_questions cannot exceed 500.',
      }),
  
    total_marks_per_question: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'total_marks_per_question must be a number.',
        'number.min': 'total_marks_per_question must be at least 1.',
        'number.max': 'total_marks_per_question cannot exceed 10.',
      }),
  
    operators: Joi.array()
      .items(
        Joi.string()
          .valid('+', '-', '/', '*')
          .required()
          .messages({
            'any.only': 'operators can only include + (plus sign) , - (minus sign/ hyphen), / (forward slash), or * (star/ asterisk).',
          })
      )
      .min(1)
      .max(4)
      .unique()
      .required()
      .messages({
        'array.base': 'operators must be an array of strings.',
        'array.min': 'operators must contain at least one operator.',
        'array.max': 'operators cannot contain more than four operators.',
        'array.unique': 'operators must contain unique values only.',
      }),
  }).options({ allowUnknown: false }
  );

const questionValidation=(req,res,next)=>{

    const {error}=questionValidationschema.validate(req.body);
    if(error)
    {
        //attaching the error message to req object
        req.validationError=error.details[0].message;
    }
    next();
}

export {questionValidation,questionValidationschema};