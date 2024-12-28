import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Result } from '../models/result.model.js';
import { getPdf } from './pdf.controller.js';
import mongoose from 'mongoose';
import { flattenObject } from '../utils/flattenObject.util.js';
import { Pdftemplet } from '../pdftemplets/pdf.class.js';
import { HTTP_STATUS_CODES } from '../constants.js';
import Joi from 'joi';

const createResult = asyncHandler(async (req, res) => {
    const { score, time_taken, total_correct, date_completed, exam } = req.body;
   
    //validating the result
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Request body cannot be empty.'
        );
    }

    const { error } = Joi.object({
         time_taken: Joi.number().integer().min(1).max(360).messages({
                'number.base': 'duration must be a number.',
                'number.min': 'duration must be at least 1.',
                'number.max': 'duration cannot exceed 360.',
            }),
        score: Joi.number()
                .integer()
                .min(1)
                .max(5000)
                .required()
                .messages({
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
            date_completed:Joi.string().required().isoDate(),
            exam:Joi.string()
            .pattern(/^[a-zA-Z0-9]+$/) // Alphanumeric validation
            .required()
    }).options({ allowUnknown: false })
        .validate(req.body);

    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }

    const result = new Result({
        score,
        time_taken,
        total_correct,
        date_completed, //will store the date in UTC thus will make need to append +5:30 each time
        exam,
        student: req.user,
    });
    await result.save();
    return res
        .status(200)
        .json(new Apiresponse('Result created Successfully', 200));
});

const getResult = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.resultId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Result Id'
        );
    }
    let resultId = new mongoose.Types.ObjectId(req.params.resultId);
    let result = await Result.findById(resultId)
        .populate(
            'student exam',
            'fullname username email sclass level phone_no title duration total_questions total_marks total_marks_per_question'
        )
        .select('-_id -__v')
        .select('+createdAt');
    if (!result) {
        throw new Apierror(HTTP_STATUS_CODES.GONE.code, 'Result Not Found');
    }
    //check if the given route is the pdf route then
    //process the pdf
    let jsonResult = result.toJSON();
    delete jsonResult.student.student_id;
    if (req.query.format == 'pdf') {
        let myarray = flattenObject(jsonResult);
        //capitalizign the first word and replacing the_ and . with space.
        for (let item of myarray) {
            let userpoint = item[0];
            const firstLetter = userpoint.charAt(0);
            const firstLetterCap = firstLetter.toUpperCase();
            const remainingLetters = userpoint.slice(1);
            let capitalizedWord = firstLetterCap + remainingLetters;
            capitalizedWord = capitalizedWord
                .replaceAll('.', ' ')
                .replaceAll('_', ' ');
            item[0] = capitalizedWord;
        }
        if (result.createdAt != null || result.createdAt != undefined) {
            let date = new Date(result.createdAt).toLocaleDateString();
            let time = new Date(result.createdAt).toLocaleTimeString();

            myarray.push(['Result Date', date + ' ' + time]);
        }
        let templet = new Pdftemplet(
            'Student Result',
            result.exam.title,
            req.username,
            resultId,
            null,
            myarray
        );

        getPdf(req, res, templet);
    } else {
        res.status(200).json(new Apiresponse(result.toJSON(), 200));
    }
});

const deleteResult = asyncHandler(async (req, res) => {
    let resultId = req.params.resultId;
    if (!mongoose.Types.ObjectId.isValid(resultId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Result Id'
        );
    }
    resultId = new mongoose.Types.ObjectId(resultId);
    let result = await Result.findById(resultId);
    if (!result) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'Result Not found'
        );
    }

    await Result.deleteOne({ _id: result._id });
    res.status(200).json(new Apiresponse(`Result Deleted Successfully`, 200));
});
export { createResult, getResult, deleteResult };
