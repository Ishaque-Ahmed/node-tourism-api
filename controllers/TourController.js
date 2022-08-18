const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';

    next();
};

exports.getAllTour = catchAsync(async (req, res, next) => {
    //Execute Query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();
    const tours = await features.query;

    //Send Response
    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findById(id); // Tour.findOne({_id: req.params.id})

    if (!tour) {
        return next(new AppError('No tour found with this Id', 404));
    }

    res.status(200).json({
        status: 'Success',
        data: {
            tour,
        },
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tours: newTour,
        },
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('No tour found with this Id', 404));
    }
    res.status(200).json({
        status: 'succes',
        data: {
            tour,
        },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
        return next(new AppError('No tour found with this Id', 404));
    }
    res.status(204).json({
        status: 'deleted',
        data: null,
    });
});

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
        status: 'Success',
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
        status: 'Success Monthly Plan',
        data: {
            plan,
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
