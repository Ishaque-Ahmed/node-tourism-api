const mongoose = require('mongoose');

const dotEnv = require('dotenv');

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
app.listen(port, () => {
    console.log(`App running on port ${port}....`);
});
