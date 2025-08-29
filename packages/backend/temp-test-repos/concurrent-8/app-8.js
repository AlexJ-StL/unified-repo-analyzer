
const express = require('express');
const _ = require('lodash');

const app8 = express();

app8.get('/', (req, res) => {
  res.json({
    message: 'Hello from app 8',
    data: _.range(1, 100)
  });
});

app8.listen(3008, () => {
  console.log('App 8 running on port 3008');
});

module.exports = app8;
