const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new AppError('No document found with this Id', 404));
        }
        res.status(204).json({
            status: 'deleted',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const document = await Model.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!document) {
            return next(new AppError('No document found with this Id', 404));
        }
        res.status(200).json({
            status: 'succes',
            data: {
                data: document,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: document,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const id = req.params.id;
        let query = Model.findById(id);
        if (popOptions) query = query.populate(popOptions);
        const document = await query;

        // const document = await Model.findById(id).populate('reviews');
        // Tour.findOne({_id: req.params.id})

        if (!document) {
            return next(new AppError('No document found with this Id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: document,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // For GetAllReview: To Allow for nested get reviews on tours
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        //Execute Query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limit()
            .paginate();
        //const documents = await features.query.explain();
        const documents = await features.query;

        //Send Response
        res.status(200).json({
            status: 'success',
            results: documents.length,
            data: {
                data: documents,
            },
        });
    });
