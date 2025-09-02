const express = require('express');
const _ = require('lodash');

const app1 = express();

app1.get('/', (_req, res) => {
  res.json({
    message: 'Hello from app 1',
    data: _.range(1, 100),
  });
});

app1.listen(3001, () => {
  console.log('App 1 running on port 3001');
});

module.exports = app1;
