const Tour = require('../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else
        cb(new AppError('Not an image, please upload only images', 400), false);
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourimages = upload.fields([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 3,
    },
]);
// upload.single('imageCover');
// upload.array('images', 3);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) next();
    // 1) CoverImage
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const fileName = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${fileName}`);

            req.body.images.push(fileName);
        })
    );

    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';

    next();
};

// exports.getAllTour = catchAsync(async (req, res, next) => {
//     //Execute Query
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limit()
//         .paginate();
//     const tours = await features.query;

//     //Send Response
//     res.status(200).json({
//         status: 'Success',
//         results: tours.length,
//         data: {
//             tours,
//         },
//     });
// });
exports.getAllTour = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                // _id: '$difficulty',
                _id: { $toUpper: '$difficulty' },
                // _id: '$ratingsAverage',
                numOfTours: { $sum: 1 },
                numOfRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numofTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numofTourStarts: -1 },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

// `/tours-within/:distance/center/:latlng/unit/:unit`
// tours-within/233/center/-40,45/unit/km
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(
            new AppError(
                'Please Provide latitude and langitude in the proper format.',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        return next(
            new AppError(
                'Please Provide latitude and langitude in the proper format.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------

// exports.getTour = catchAsync(async (req, res, next) => {
//     const id = req.params.id;
//     const tour = await Tour.findById(id).populate('reviews');
//     // Tour.findOne({_id: req.params.id})

//     if (!tour) {
//         return next(new AppError('No tour found with this Id', 404));
//     }

//     res.status(200).json({
//         status: 'Success',
//         data: {
//             tour,
//         },
//     });
// });
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tours: newTour,
//         },
//     });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const id = req.params.id;
//     const tour = await Tour.findByIdAndUpdate(id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     if (!tour) {
//         return next(new AppError('No tour found with this Id', 404));
//     }
//     res.status(200).json({
//         status: 'succes',
//         data: {
//             tour,
//         },
//     });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const id = req.params.id;
//     const tour = await Tour.findByIdAndDelete(id);

//     if (!tour) {
//         return next(new AppError('No tour found with this Id', 404));
//     }
//     res.status(204).json({
//         status: 'deleted',
//         data: null,
//     });
// });

//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------

//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);

// tours.push(newTour);

// fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     err => {
//         res.status(201).json({
//             status: 'succes',
//             data: {
//                 tour: newTour
//             }
//         });
//     }
// )

// exports.checkId = (req, res, next, val) => {
//     // console.log(`Tour id is = ${val}`);

//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'failed',
//             message: 'INVALID ID'
//         });
//     }
//     next();
// };

//const fs = require('fs');

// exports.checkBody = (req, res, next) => {
//     const { name, price } = req.body;
//     if (!name || !price) {
//         return res.status(400).json({
//             status: 'failed',
//             message: 'Missing name or price'
//         });
//     }
//     next();
// };

// exports.getTour = (req, res) => {
//     // const id = req.params.id * 1;
//     // const tour = tours.find(cur => cur.id === id);
//     // res.status(200).json({
//     //     status: 'success',
//     //     data: {
//     //         tour
//     //     }
//     // });
// };

// exports.getTour = (req, res) => {
//     // const id = req.params.id * 1;
//     // const tour = tours.find(cur => cur.id === id);
//     // res.status(200).json({
//     //     status: 'success',
//     //     data: {
//     //         tour
//     //     }
//     // });
// };
// exports.updateTour = (req, res) => {
//     // const id = req.params.id * 1;
//     res.status(200).json({
//         status: 'succes',
//         data: {
//             tour: '<updated tour here...>'
//         }
//     });
// };
// exports.deleteTour = (req, res) => {
//     // const id = req.params.id * 1;
//     res.status(204).json({
//         status: 'succes',
//         data: null
//     });
// };

// const query = Tour.find()
//     .where('duration')
//     .equals(5)
//     .where('difficulty')
//     .equals('easy');

//Filtering
//console.log(req.query);
//Build Query

// 1) A-> Filtering

// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach(el => delete queryObj[el]);

// // 1) B-> Advanced Filtering

// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(
//     /\b(gte|gt|lt|lte)\b/g,
//     matched => `$${matched}`
// );

//{difficulty: 'easy', duration: {$gte: 5}}
//{ difficulty: 'easy', duration: { gte: '5' } }

// let query = Tour.find(JSON.parse(queryStr));

// 3) Sorting

// if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     query = query.sort(sortBy);
// } else {
//     query = query.sort('_id');
// }

// 4) Limiting Fields

// if (req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
// } else {
//     query = query.select('-__v');
// }

// 5) Pagination

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// //console.log(page, limit, skip);
// // Page = 1, Limit = 10 : 1-10->page 1 ; 11-20->page 2 ; 21-30->Page 3
// query = query.skip(skip).limit(limit);
// if (req.query.page) {
//     const numberOfTours = await Tour.countDocuments();
//     if (skip >= numberOfTours) throw new Error('Page does not exists.');
// }
