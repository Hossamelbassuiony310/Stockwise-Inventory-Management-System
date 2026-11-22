
const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/products', (req, res) => {
  res.render('products/index');
});

app.get('/products/new', (req, res) => {
  res.render('products/form');
});

app.get('/categories', (req, res) => {
  res.render('categories/index');
});

app.get('/customers', (req, res) => {
  res.render('customers/index');
});

app.get('/suppliers', (req, res) => {
  res.render('suppliers/index');
});

app.get('/orders', (req, res) => {
  res.render('orders/index');
});

app.get('/orders/:id', (req, res) => {
  res.render('orders/invoice');
});

app.listen(5000, () => {
  console.log('Preview: http://localhost:5000');
});
