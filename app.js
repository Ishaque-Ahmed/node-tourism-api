const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');

const app = express();

// Middlewares
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    console.log('production');
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((res, req, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Routes

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

//handling routing errors
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} in the server.`));
});

//EXPRESS ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
