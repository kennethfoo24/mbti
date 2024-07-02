const express = require('express');
const bodyParser = require('body-parser');
const tracer = require('dd-trace').init();
const app = express();
const port = 3000;
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.json(),
  transports: [new transports.Console()]
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Simple helper to wrap route handlers with tracing
const wrapHandler = (resourceName, handler) => {
    return tracer.wrap('custom.trace', { resource: resourceName }, handler);
};

// Function to simulate errors with stack trace
const simulateError = (message) => {
  try {
    throw new Error(message);
  } catch (error) {
    return error;
  }
};

let userData = {
  username: '',
  mbtiType: ''
};

app.get('/', wrapHandler('mbti-home', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
  console.log("This log is just in plain text, and will not be trace-log correlated");
  logger.info('This is just an info log written in JSON.');
}));

// Endpoint to simulate 200 OK response
app.get('/success', wrapHandler('mbti-success', (req, res) => {
  logger.info('Handling success request');
  logger.info('Duplicate Message 2 Handling success request');
  logger.info('Duplicate Message 3 Handling success request');
  res.status(200).json({ message: 'Success' });
}));

// Endpoint to simulate 400 Bad Request error
app.get('/bad-request', wrapHandler('mbti-bad-request', (req, res) => {
  const error = simulateError('This is a mockup error message for a bad request. The request could not be understood by the server due to malformed syntax.');
  logger.warn(`Handling bad request: ${error.message}`, { stack: error.stack });
  logger.warn(`Duplicate Message 2 Handling bad request: ${error.message}`, { stack: error.stack });
  logger.warn(`Duplicate Message 3 Handling bad request: ${error.message}`, { stack: error.stack });
  res.status(400).json({ message: 'Bad Request', error: error.message });
}));

// Endpoint to simulate 500 Internal Server Error
app.get('/server-error', wrapHandler('mbti-error', (req, res) => {
  try {
  const error = simulateError('This is a mockup error message for an internal server error. An unexpected condition was encountered.');
  logger.error(`Handling server error: ${error.message}`, { stack: error.stack });
  logger.error(`Duplicate Message 2 Handling server error: ${error.message}`, { stack: error.stack });
  logger.error(`Duplicate Message 3 Handling server error: ${error.message}`, { stack: error.stack });
  res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } catch (e) {
    span.setTag('error', e);
    const error = simulateError('This is a mockup error message for an internal server error. An unexpected condition was encountered.');
    logger.error(`Handling server error: ${error.message}`, { stack: error.stack });
    logger.error(`Duplicate Message 2 Handling server error: ${error.message}`, { stack: error.stack });
    logger.error(`Duplicate Message 3 Handling server error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}));

app.post('/submit', wrapHandler('mbti-submit', (req, res) => {
  const { username } = req.body;
  userData.username = username;
  res.send(`Username: ${username}<br>Submitted MBTI type: ${userData.mbtiType}`);
  logger.error('This is an ERROR log written in JSON. username submitted !',{fruit: 'apple' });
}));

app.post('/update-mbti', wrapHandler('mbti-update', (req, res) => {
  const { mbtiType } = req.body;
  userData.mbtiType = mbtiType;
  res.send({ success: true });
  logger.info('This is just an info log written in JSON to update-mbti');
}));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  logger.info(`Server is running on http://localhost:${port}`);
});
