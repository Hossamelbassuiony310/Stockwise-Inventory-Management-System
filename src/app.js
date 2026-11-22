const express = require('express');
const path = require('path');

const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Temporary Test Route
app.get('/', (req, res) => {
  res.render('dashboard');
});

module.exports = app;
