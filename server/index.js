const express = require('express');
const morgan = require('morgan');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const router = require('./router');

const app = express();

app.set('port', 3000);

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use('/api/post', parser.json());
app.use('/api/post', parser.urlencoded({ extended: false }))

app.use('/api', router);

app.use(express.static(path.join(__dirname, '../client/dist')))

app.listen(app.get('port'), (error) => {
  if(error) {
    console.error('Error on server', error);
  } else {
    console.log('Listening on port:', app.get('port'))
  }
});