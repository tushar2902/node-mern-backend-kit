const path = require('path');
const express = require('express');
const session = require('express-session');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const cors = require('cors');

require('dotenv').config();

/**
 * Create Express server.
 */
const app = express();

if (process.env.NODE_ENV !== 'production') {
  const apiDoc = require('./api-docs');
  app.use('/api-docs', apiDoc);
}

// GZIP compress resources served
app.use(compression());

app.use(cors());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
);
/**
 * Start Express server.
 */
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), () => {
  console.log(
    '%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});

/**
 * Express configuration.
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');

app.use(
  '/',
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'pug');

// application specific logging, throwing an error, or other logic here
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('req body', req.body);
    console.log('req query', req.query);
    // console.log('authorization', req.headers);
  }
  next();
});
// Routes
const indexRouter = require('./routes/index');

app.use('/', indexRouter);
require('./models/helpers/InitializeConnectionHelper')(server, app);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

module.exports = app;
