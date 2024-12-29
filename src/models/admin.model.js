import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from 'config';
import { generatePublicId } from '../utils/publicId/generatePublicid.util.js';

const adminSchema = new mongoose.Schema(
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
            minLength: 8,
            maxLength: 16,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
            default: ' ',
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        public_id:{
            type:String,
            trim:true,
            unique:true
        }
    },
    { timestamps: true }
);

adminSchema.set('toJSON', {
    //doc: The original Mongoose document (before conversion).
    //This includes all the data and Mongoose-specific features (like methods and virtuals).
    //ret: The plain JavaScript object (the result of converting the Mongoose document).
    // This is the object that will be transformed and returned.

    transform: (doc, rec) => {
        //avoiding this value to be sent along the response back
        rec.admin_id = rec.public_id;
        delete rec._id;
        delete rec.__v;
        delete rec.public_id;
        delete rec.createdAt;
        delete rec.updatedAt;
        delete rec.refreshToken;
        delete rec.password;
        delete rec.username;
        delete rec.is_deleted;
        delete rec.deletedAt;

        return rec;
    },
});
adminSchema.pre('save', async function (next) {
    try {
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

adminSchema.pre("save",async function (next) {
    if(this.isNew)
    {
        this.public_id=generatePublicId("admin");
        next();
    }
   return next();
});
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const Admin = mongoose.model('Admin', adminSchema);
