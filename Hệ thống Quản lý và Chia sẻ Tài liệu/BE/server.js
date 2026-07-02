require('./bootstrap');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./app/route');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

app.use(router);

// app.use('/v1/auth', require('./app/v1/auth/route'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})