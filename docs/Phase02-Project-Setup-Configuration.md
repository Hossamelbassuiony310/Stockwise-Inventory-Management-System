# Phase 02 --- Project Setup & Configuration

**Project:** Stockwise --- Inventory Management System\
**Phase:** 02\
**Status:** Completed\
**Application Type:** Server-Side Rendered (SSR) Web Application

------------------------------------------------------------------------

## 1. Phase Overview

The goal of this phase was to prepare the Stockwise project for backend
development.

During this phase, the Node.js project was initialized, dependencies
were installed, the project structure was prepared, Express and EJS were
configured, frontend assets were served, environment variables were
configured, and Sequelize was connected to MySQL running in Docker.

The existing frontend starter was preserved.

## 2. Technology Stack

  Technology   Version / Usage
  ------------ ---------------------------------
  Node.js      v20.15.0
  npm          v10.7.0
  Express.js   v5.3.0
  EJS          v7.0.2
  Sequelize    v6.37.8
  MySQL2       v3.24.6
  MySQL        8.4.8 (Docker image: `mysql:8`)
  dotenv       v18.0.10
  nodemon      v3.1.14

## 3. Project Initialization

The Node.js project was initialized using npm. The following scripts are
configured in `package.json`:

``` json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

-   `npm run dev`: starts the application with Nodemon during
    development.
-   `npm start`: starts the application with Node.js.

## 4. Project Folder Structure

``` text
Stockwise-Inventory-Management-System/
├── docs/
│   ├── img/
│   │   └── mermaid-diagram.png
│   ├── Phase01-Final-MySQL-Database-Design.md
│   └── Phase02-Project-Setup-Configuration.md
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── views/
│   ├── categories/
│   │   └── index.ejs
│   ├── customers/
│   │   └── index.ejs
│   ├── orders/
│   │   ├── index.ejs
│   │   └── invoice.ejs
│   ├── products/
│   │   ├── form.ejs
│   │   └── index.ejs
│   ├── suppliers/
│   │   └── index.ejs
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── layout-end.ejs
│   │   ├── layout-start.ejs
│   │   ├── sidebar.ejs
│   │   └── topbar.ejs
│   └── dashboard.ejs
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

The `controllers`, `middlewares`, `models`, `routes`, `services`, and
`utils` directories were prepared to organize backend code in later
phases.

## 5. Express Configuration

### `src/app.js`

``` javascript
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
```

Key points:

-   EJS is configured as the view engine.
-   The `views` directory is configured using an absolute path.
-   Express parses JSON and URL-encoded request bodies.
-   The `public` directory serves static assets such as CSS and
    JavaScript.
-   The root route renders the existing dashboard. This is a temporary
    test route from the setup phase.

## 6. Environment Configuration

Environment variables are stored in `.env` and loaded using `dotenv`.

Example `.env.example`:

``` env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockwise_db
DB_USER=stockwise_user
DB_PASSWORD=
```

Important notes:

-   `.env` contains the actual local configuration and must not be
    committed to Git.
-   `.env.example` documents the required variable names without real
    secrets.
-   `.gitignore` excludes `.env`.
-   Database passwords must not be hardcoded in application source
    files.

## 7. MySQL Docker Container

MySQL runs in Docker, while the Node.js application runs directly on the
Ubuntu host.

  Setting                         Value
  ------------------------------- ------------------------
  Container name                  `stockwise-mysql`
  Image                           `mysql:8`
  MySQL server version verified   8.4.8
  Database                        `stockwise_db`
  Application user                `stockwise_user`
  Host binding                    `127.0.0.1:3306`
  Container data directory        `/var/lib/mysql`
  Docker volume                   `stockwise_mysql_data`

The host port is bound to `127.0.0.1`, so MySQL is exposed locally
rather than on every network interface.

The application connects using:

``` env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockwise_db
DB_USER=stockwise_user
DB_PASSWORD=YOUR_APP_PASSWORD
```

The actual password belongs in the local `.env` file only.

### Verify the container

``` bash
docker ps --filter name=stockwise-mysql
```

### Connect to MySQL

``` bash
docker exec -it stockwise-mysql mysql -u stockwise_user -p stockwise_db
```

After entering the password, verify the selected database:

``` sql
SELECT DATABASE();
```

Expected result:

``` text
stockwise_db
```

## 8. Sequelize Configuration

### `src/config/database.js`

``` javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
```

Configuration details:

-   Database name, username, and password are read from environment
    variables.
-   `host` and `port` identify the MySQL server.
-   `dialect: 'mysql'` configures Sequelize to use MySQL.
-   `logging: false` disables SQL query logging in the terminal.
-   The Sequelize instance is exported for use by the application.

## 9. Server Startup and Database Authentication

### `src/server.js`

Environment variables are loaded before importing the application and
database configuration. The database connection is tested before the
HTTP server starts.

``` javascript
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');

    app.listen(PORT, () => {
      console.log(`Stockwise server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
```

`sequelize.authenticate()` checks whether Sequelize can establish a
connection using the configured database credentials. Express starts
only after the authentication promise resolves successfully.

## 10. Running the Application

Start the development server:

``` bash
npm run dev
```

Successful startup output observed during testing:

``` text
[nodemon] starting `node src/server.js`
◇ injected env (7) from .env
Database connection has been established successfully.
Stockwise server is running on port 5000
Get started by visiting: http://localhost:5000
```

Open the application:

``` text
http://localhost:5000
```

## 11. Testing and Verification

The following checks were completed successfully:

  Test                                  Result
  ------------------------------------- --------
  MySQL Docker container is running     Passed
  Login using `stockwise_user`          Passed
  Selected database is `stockwise_db`   Passed
  Sequelize authentication              Passed
  Express server startup                Passed
  Dashboard renders in the browser      Passed
  CSS and frontend JavaScript load      Passed
  Sidebar menu toggle works             Passed
  HTTP request using `curl -I`          Passed

HTTP response observed:

``` http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
```

This confirms that the application responded successfully and returned
HTML.

## 12. Phase Completion

**Phase 02 --- Project Setup & Configuration is completed.**

At the end of this phase:

-   The Node.js project is initialized.
-   Required dependencies are installed.
-   The backend folder structure is ready.
-   Express and EJS are configured.
-   Existing frontend assets are served by Express.
-   Environment variables are configured.
-   MySQL is running in Docker.
-   Sequelize successfully authenticates with MySQL.
-   The application starts on port `5000`.
-   The dashboard is accessible and the HTTP response is successful.

### Next Phase

**Phase 03 --- Database Models & Relationships**

The next phase will translate the approved database design into
Sequelize models and define the relationships between those models.

------------------------------------------------------------------------

**Project:** Stockwise --- Inventory Management System\
**Documentation:** Phase 02 --- Project Setup & Configuration\
**Status:** Completed
