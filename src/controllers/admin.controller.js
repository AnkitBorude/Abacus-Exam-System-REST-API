//controller for admin registration
import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Admin } from '../models/admin.model.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '../utils/jwttoken.util.js';
import { HTTP_STATUS_CODES } from '../constants.js';
import Joi from 'joi';
import { isValidpublicId } from '../utils/publicId/validid.util.js';
import { Result } from '../models/result.model.js';
import { Exam } from '../models/exam.model.js';

const registerAdmin = asyncHandler(async (req, res) => {
    if (req.validationError) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            req.validationError
        );
    }

    const { fullname, email, username, password } = req.body;
   
   

    try {
        const admin = await Admin.create({
            fullname,
            email,
            username,
            password,
        });
        await admin.save();
        res.json(new Apiresponse('Admin Registration Successfull', 200));
    } catch (error) {
        if (
            error.code === 11000 &&
            error.keyPattern &&
            error.keyPattern.username
        ) {
            throw new Apierror(HTTP_STATUS_CODES.CONFLICT.code, 'Username already Exists');
        } else {
            throw new Apierror(HTTP_STATUS_CODES.BAD_REQUEST.code, error.message);
        }
    }
});
const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const { error } = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).max(128).required().messages({
            'string.min': 'password must be at least 8 characters long.',
            'string.max': 'password must not exceed 128 characters.',
        }),
    })
        .options({ allowUnknown: false })
        .validate(req.body);
    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }

    let admin; //extracting the admin from the db
    try {
        admin = await Admin.findOne({ username }).select(
            'username password public_id is_deleted'
        );
    } catch (error) {
        throw new Apierror(HTTP_STATUS_CODES.BAD_REQUEST.code, error.message);
    }
    if (!admin || admin.is_deleted) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'Admin Account not found with given username'
        );
    }
    //comparing password
    if (!(await admin.comparePassword(password))) {
        if (admin.password != password) {
            //implemented temporary for old legacy passwords until all passwords are not reseted and rehashed
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Wrong Password'
            );
        }
    }
    //generating access token
    const jwtToken = await signAccessToken({
        adminId: admin.public_id,
        role: 'admin',
        username: admin.username,
    });

    const refreshToken = await signRefreshToken({
        //sending student username intot the refresh token
        username: admin.username,
        role: 'admin',
    });

    admin.refreshToken = refreshToken;
    await admin.save();
    res.status(200).json(
        new Apiresponse(
            { message: 'Login Successfull', token: jwtToken, refreshToken },
            200
        )
    );
});
const getCurrentAdmin = asyncHandler(async (req, res) => {
 
        let admin = await Admin.findOne({ public_id: req.user }).select(
            'is_deleted'
        );
        if(admin.is_deleted)
        {
            throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code,"Admin Not Found");
        }
        admin = admin.toJSON();
        return res.status(200).json(new Apiresponse(admin, 200));
});

const regenerateAccessToken = asyncHandler(async (req, res) => {
    //check whether the body is not empty
    //validate body has valid refreshToken using joi
    //access refresh token and decode token
    //check wehther the decoded username exists in the database
    //if yes then match the refresh token
    //regenerate access token and send back as response

    let username = null;
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Request body cannot be empty.'
        );
    }

    const { error } = Joi.object({
        refreshToken: Joi.string().required().messages({
            'string.empty': 'Refresh token is required',
            'any.required': 'Refresh token is required',
        }),
    })
        .options({ allowUnknown: false })
        .validate(req.body);
    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }

    try {
        username = await verifyRefreshToken(req.body.refreshToken);
    } catch (error) {
        throw new Apierror(HTTP_STATUS_CODES.UNAUTHORIZED.code, error.message);
    }

    const exists = await Admin.findOne({
        username: username,
        is_deleted: false,
    })
        .lean()
        .select('refreshToken username public_id');

    if (!exists) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Admin Not Found');
    }
    if (exists.refreshToken != req.body.refreshToken) {
        throw new Apierror(
            HTTP_STATUS_CODES.FORBIDDEN.code,
            'Refresh Token does not match use valid token'
        );
    }

    const accessToken = await signAccessToken({
        adminId: exists.public_id,
        role: 'admin',
        username: exists.username,
    });

    res.status(200).json(
        new Apiresponse({
            message: 'New token generated successfully..',
            token: accessToken,
        })
    );
});

const updateAdmin=asyncHandler(async (req,res)=>{

    if(req.role=="admin")
    {
        let adminId=req.user;
        if (req.validationError) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                req.validationError
            );
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Request body cannot be empty.'
            );
        }
        if (!isValidpublicId(adminId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Student Id'
            );
        }
        let admin = await Admin.findOne({
            public_id: adminId,
            is_deleted: false,
        })
            .lean()
            .select('public_id');
        if (!admin) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Admin Not Found'
            );
        }
        const updatesTobeDone = Object.keys(req.body);
        await Admin.updateOne(
            { public_id: admin.public_id },
            { $set: { ...req.body } },
            { runValidators: true }
        );

        res.status(200).json(
            new Apiresponse(
                `Admin ${updatesTobeDone.join(' , ')} attributes has been updated Successfully`,
                200
            )
        );
    }
    else
    {
        //throw forbidden error here\
        throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code, 'Forbidden cannot update admin details');
    }
});

const deleteAdmin=asyncHandler(async (req,res)=>{

    if(req.role=="admin")
    {
        let adminId=req.user;
        if (!isValidpublicId(adminId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Student Id'
            );
        }

        let admin = await Admin.findOne({
            public_id: adminId,
            is_deleted: false,
        })
            .select('_id public_id is_deleted deletedAt username');
        if (!admin) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Admin Not Found'
            );
        }
          
            //now check whether the admin has creates any exam
                //if the exam is created then find if there exists at lea

            const examExists = await Exam.find({ created_by: admin._id }).lean().select('_id');
            if(examExists.length===0)
            {
                 //no exam exists
                //hard delete
                console.log("No exam exists hard deleting admin");
                await Admin.deleteOne({ public_id: adminId });
                return res.status(200).json(
                  new Apiresponse(`Admin deleted Permantely`, 200)
              );
            }
                //there exists an exam
                const examIds = examExists.map(exam => exam._id);
                const resultCounts=await Result.countDocuments({ exam: { $in: examIds } });
                if(resultCounts>0)
                {
                    console.log("There are associated "+resultCounts+"Thus soft deleting admin");
                    //soft delete admin
                    admin.is_deleted = true;
                    admin.deletedAt = new Date();
                    //making the soft deleted students username reusable
                    admin.username = admin.username + 'deletedAt' + Date.now();
                    await admin.save();
                    res.status(200).json(
                        new Apiresponse(`Admin deleted Successfully`, 200)
                    );
                }
                else
                {
                    //then delete all exams and then admin
                    console.log("No Students attempted the exam thus deleting created exams and admin");
                    await Exam.deleteMany({created_by:admin._id});
                    await Admin.deleteOne({ public_id: adminId });
                    res.status(200).json(
                        new Apiresponse(`Admin deleted Permantenly`, 200)
                    );
                }
          
    }else{

        throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code, 'Forbidden cannot delete admin');
    }
});
export { registerAdmin, loginAdmin, getCurrentAdmin, regenerateAccessToken,updateAdmin,deleteAdmin };
