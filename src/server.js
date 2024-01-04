const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const route = require('./routes');

// Connect DB
// db.connect((err) => {
//     if (err) throw err;
//     console.log('Mysql Connected...');
// });
// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(morgan('dev'));

app.use(cors());

route(app);

app.listen(4000, () => {
    console.log(`Server Started at ${4000}`);
});
