const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: res.requestTime
        // results: tours.length,
        // data: {
        //     tours
        // }
    });
};

exports.getTour = (req, res) => {
    // const id = req.params.id * 1;
    // const tour = tours.find(cur => cur.id === id);
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         tour
    //     }
    // });
};

exports.createTour = (req, res) => {
    res.status(204).json({
        status: 'succes'
    });
};

exports.updateTour = (req, res) => {
    // const id = req.params.id * 1;
    res.status(200).json({
        status: 'succes',
        data: {
            tour: '<updated tour here...>'
        }
    });
};

exports.deleteTour = (req, res) => {
    // const id = req.params.id * 1;
    res.status(204).json({
        status: 'succes',
        data: null
    });
};

//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
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
