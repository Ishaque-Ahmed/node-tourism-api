const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const reviewRouter = require('./routes/ReviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/BookingRoutes');

const app = express();

app.enable('trust proxy');

// Setting up template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Implementing cors
app.use(cors());
// Access-Control-Allow Origin: *
// API -> toursim-api.com Frontend-> tourism-react.com
/*
app.use(
    cors({
        origin: 'tourism-react.com',
    })
);
*/

app.options('*', cors());
// app.options('/api/v1/tours/:id'.cors());

// Serving Static Files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

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
// app.use(helmet());
const scriptSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://*.cloudflare.com',
    'https://js.stripe.com/v3/',
    'https://checkout.stripe.com',
];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/',
    'https://*.cloudflare.com',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:52191',
    '*.stripe.com',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", ...fontSrcUrls],
            frameSrc: ['*.stripe.com', '*.stripe.network'],
        },
    })
);

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
// Cookie parser -> Reading cookie
app.use(cookieParser());

// Form parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

// Compressing before deployment
app.use(compression());
// For Testing
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// PUG routes

// Routes
app.use('/', viewRouter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);
app.use(`/api/v1/bookings`, bookingRouter);

//handling routing errors
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} in the server.`));
});

//EXPRESS ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
