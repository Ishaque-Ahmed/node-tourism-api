const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection succesful'));

// READ JSON FILE
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('data susccesfully loaded');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// DELETE ALL DATA FROM DB
const deleteAllDataCollection = async () => {
    try {
        await Tour.deleteMany();
        console.log('data deleted susccesfully loaded');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteAllDataCollection();
}

console.log(process.argv);
