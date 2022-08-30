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

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            err: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // Rendered Website
    console.error('Error: ', err);
    return res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: err.message,
    });
};

const sendErrorProduction = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // OPERATIONAL / TRUSTED ERROR: send message to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        //Programming or other unknown error: dont't leak error details to client
        console.error('Error: ', err);
        //Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong in production',
        });
    }
    // Renderer website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'something went wrong',
            msg: err.message,
        });
    }
    //Programming or other unknown error: dont't leak error details to client
    //Log error
    console.error('Error: ', err);
    //Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: 'Please try again later',
    });
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err };
        // console.log('generated error full:  ', err);
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);

        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
        if (err.name === 'JsonWebTokenError') err = handleJWTError();

        sendErrorProduction(err, req, res);
    }

    next();
};
