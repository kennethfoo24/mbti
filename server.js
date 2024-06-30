const express = require('express');
const bodyParser = require('body-parser');
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

let userData = {
  username: '',
  mbtiType: ''
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
  console.log("This log is just in plain text, and will not be trace-log correlated");
  logger.info('This is just an info log written in JSON.');
});

app.post('/submit', (req, res) => {
  const { username } = req.body;
  userData.username = username;
  res.send(`Username: ${username}<br>Submitted MBTI type: ${userData.mbtiType}`);
  logger.error('This is an ERROR log written in JSON. username submitted !',{fruit: 'apple' });
});

app.post('/update-mbti', (req, res) => {
  const { mbtiType } = req.body;
  userData.mbtiType = mbtiType;
  res.send({ success: true });
  logger.info('This is just an info log written in JSON to update-mbti');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  logger.info(`Server is running on http://localhost:${port}`);
});
