const express = require('express');
const app = express();
const routes = require('./log.routes');

app.use(express.json());
app.use('/logs', routes);

module.exports = app;
