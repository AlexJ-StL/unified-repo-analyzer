const express = require('express');
const _ = require('lodash');

const app9 = express();

app9.get('/', (_req, res) => {
  res.json({
    message: 'Hello from app 9',
    data: _.range(1, 100),
  });
});

app9.listen(3009, () => {
  console.log('App 9 running on port 3009');
});

module.exports = app9;
