const express = require('express');
const _ = require('lodash');

const app3 = express();

app3.get('/', (_req, res) => {
  res.json({
    message: 'Hello from app 3',
    data: _.range(1, 100),
  });
});

app3.listen(3003, () => {
  console.log('App 3 running on port 3003');
});

module.exports = app3;
