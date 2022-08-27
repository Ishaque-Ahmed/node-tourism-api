const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const reviewRouter = require('./routes/ReviewRoutes');

const app = express();

//  Global Middlewares
// console.log(process.env.NODE_ENV);

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('Development in Progress :)');
} else {
    console.log('Production :');
}
// Set security HTTP
app.use(helmet());

// Limit Requests from API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this ip, try again in an hour',
});

app.use('/api', limiter);

// Body parser -> Reading data from body into req.body
app.use(
    express.json({
        limit: '10kb',
    })
);

// Data Sanitization against NOSQL query injections
app.use(mongoSanitize()); // Filters out $ and . signs in body and params

// Data sanitization against XSS
app.use(xss()); // Clean malicious code from html

// Prevent Parameter Pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'price',
            'difficulty',
        ],
    })
);

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// For Testing
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

// Routes

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);

//handling routing errors
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} in the server.`));
});

//EXPRESS ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
