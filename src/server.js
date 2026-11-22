const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Stockwise server is running on port ${PORT}`);
  console.log(`Get started by visiting: http://localhost:${PORT}`);
});
