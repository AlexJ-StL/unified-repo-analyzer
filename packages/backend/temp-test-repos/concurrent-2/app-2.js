
const express = require('express');
const _ = require('lodash');

const app2 = express();

app2.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from app 2',
    data: _.range(1, 100)
  });
});

app2.listen(3002, () => {
  console.log('App 2 running on port 3002');
});

module.exports = app2;
