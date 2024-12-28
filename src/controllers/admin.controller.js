//controller for admin registration
import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Admin } from '../models/admin.model.js';
import { validatefields } from '../utils/validatereqfields.util.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '../utils/jwttoken.util.js';
import { HTTP_STATUS_CODES } from '../constants.js';
import Joi from 'joi';

const registerAdmin = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    let validParams = validatefields({ fullname, email, username, password });
    if (validParams.parameterisNull) {
        throw new Apierror(
            401,
            validParams.parameterName + ' is null or undefined'
        );
    }

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
            throw new Apierror(402, 'Username already Exists');
        } else {
            throw new Apierror(402, error.message);
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
            })
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
        admin = await Admin.findOne({ username });
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
            throw new Apierror(HTTP_STATUS_CODES.UNAUTHORIZED.code, 'Wrong Password');
        }
    }
    //generating access token
    const jwtToken = await signAccessToken({
        adminId: admin._id.toString(),
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
    try {
        let admin = await Admin.findById(req.user);
        admin=admin.toJSON();
        return res.status(200).json(new Apiresponse(admin, 200));
    } catch (error) {
        throw new Apierror(441, error.message);
    }
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
        throw new Apierror(401, error.message);
    }

    const exists = await Admin.findOne({
        username: username,
        is_deleted: false,
    })
        .lean()
        .select('refreshToken _id username');

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
        adminId: exists._id.toString(),
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

export { registerAdmin, loginAdmin, getCurrentAdmin, regenerateAccessToken };
