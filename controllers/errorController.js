const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
    const message = `Duplicate Field value name: ${err.keyValue.name}, use another value.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data, ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid Token, Please login Again', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired, Please login Again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        err: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProduction = (err, res) => {
    // OPERATIONAL / TRUSTED ERROR: send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    //Programming or other unknown error: dont't leak error details to client
    else {
        //Log error
        console.error('Error: ', err);
        //Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong in production',
        });
    }
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err };
        // console.log('generated error full:  ', err);
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);

        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
        if (err.name === 'JsonWebTokenError') err = handleJWTError();

        sendErrorProduction(err, res);
    }

    next();
};
