import Joi from "joi";
import Apierror from "../apierror.util.js";
import { HTTP_STATUS_CODES } from "../../constants.js";

 const resultBodySchema = Joi.object({
        time_taken: Joi.number().integer().required().min(1).max(360).messages({
            'number.base': 'duration must be a number.',
            'number.min': 'duration must be at least 1.',
            'number.max': 'duration cannot exceed 360.',
        }),
        score: Joi.number().integer().min(1).max(5000).required().messages({
            'number.base': 'total_questions must be a number.',
            'number.min': 'total_questions must be at least 1.',
            'number.max': 'total_questions cannot exceed 5000.',
        }),
        total_correct: Joi.number()
            .integer()
            .min(1)
            .max(500)
            .required()
            .messages({
                'number.base': 'total_correct must be a number.',
                'number.min': 'total_correct must be at least 1.',
                'number.max': 'total_correct cannot exceed 500.',
            }),
        date_completed: Joi.string().required().isoDate(),
        exam: Joi.string().required(),
    })
        .options({ allowUnknown: false });

export const validateResultBody=(body)=>{

    const {error}=resultBodySchema.validate(body);
    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }
}

export const validateResultDatawithExam=(body,exam)=>{

    if(!exam.is_active)
        {
            throw new Apierror(HTTP_STATUS_CODES.BAD_REQUEST.code,"Cannot create result of InActive Exam");
        }
        if (body.time_taken > exam.duration) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                `Time Taken cannot be greater than exam duration of ${exam.duration}`
            );
        }
    
        if (body.score > exam.total_marks) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Score cannot be greater than Exam Total Marks '
            );
        }
    
        if (body.total_correct > exam.total_questions) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Total Correct cannot be greater than Total Questions'
            );
        }
    
        if (body.total_correct * exam.total_marks_per_question != body.score) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                `Invalid score marks per question are ${exam.total_marks_per_question}`
            );
        }
}
