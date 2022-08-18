const mongoose = require('mongoose');

const dotEnv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception: Shutting down app');
    console.log(err.name, err.message);
    process.exit(1);
});

dotEnv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
    `<PASSWORD>`,
    process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => console.log('DB connection succesful'));
//// console.log(con.connections);

const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}....`);
});

//Unhandled Rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection: Shutting down app');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
