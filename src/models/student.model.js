import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from 'config';
import { MIN_USERNAME_LENGTH } from '../constants.js';
import { generatePublicId } from '../utils/publicId/generatePublicid.util.js';
const studentSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            minLength: MIN_USERNAME_LENGTH,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            lowecase: true,
            trim: true,
        },
        level: {
            type: String,
            required: true,
        },
        sclass: {
            type: String,
            required: true,
        },
        phone_no: {
            type: String,
            match: [/^\d{10}$/],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        refreshToken: {
            type: String,
            default: ' ',
        },
        public_id: {
            type: String,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true }
);

studentSchema.set('toJSON', {
    //doc: The original Mongoose document (before conversion).
    //This includes all the data and Mongoose-specific features (like methods and virtuals).
    //ret: The plain JavaScript object (the result of converting the Mongoose document).
    // This is the object that will be transformed and returned.

    transform: (doc, rec) => {
        //avoiding this value to be sent along the response back
        rec.student_id = rec.public_id;
        delete rec._id;
        delete rec.__v;
        delete rec.createdAt;
        delete rec.updatedAt;
        delete rec.refreshToken;
        delete rec.password;
        delete rec.username;
        delete rec.public_id;
        return rec;
    },
});

studentSchema.pre('save', async function (next) {
    try {
        //encrypt the password
        if (!this.isModified('password')) {
            return next();
        }
        this.password = await bcrypt.hash(
            this.password,
            config.get('Password.saltingRounds')
        );
        next();
    } catch (error) {
        return next(error);
    }
});
studentSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.public_id = generatePublicId('student');
        next();
    }
    return next();
});

studentSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const Student = mongoose.model('Student', studentSchema);
