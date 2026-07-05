require('./bootstrap');
require('./model/associations');

const express = require('express');
const cors = require('cors');
const v1 = require('./app/v1/route')
const bodyParser = require('body-parser');

const router = require('./app/route');

const app = express();
const port = 8000;

const path = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use('/v1', v1);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})