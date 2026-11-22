const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');

    app.listen(PORT, () => {
      console.log(`Stockwise server is running on port ${PORT}`);
      console.log(`Get started by visiting: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });