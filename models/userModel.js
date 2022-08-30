const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please give us your Email address'],
        unique: true,
        lowercase: true, //transfroms to lower case
        validate: [validator.isEmail, 'Invalid email address'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Password is must'],
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your Password'],
        validate: {
            //This only works on save or create
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password does not match',
        },
    },
    passwordChangeAt: {
        type: Date,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    //Only run this function -> password modified
    if (!this.isModified('password')) return next();
    //hash pw with cost - 12
    this.password = await bcrypt.hash(this.password, 12);
    //delete pw confirm
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangeAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );
        // console.log(changedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp; // 100 < 200
    }

    // False means that not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
    // console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
