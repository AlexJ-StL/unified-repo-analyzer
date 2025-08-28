
const express = require('express');
const _ = require('lodash');

const app6 = express();

app6.get('/', (req, res) => {
  res.json({
    message: 'Hello from app 6',
    data: _.range(1, 100)
  });
});

app6.listen(3006, () => {
  console.log('App 6 running on port 3006');
});

module.exports = app6;
