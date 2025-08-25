
const express = require('express');
const _ = require('lodash');

const app0 = express();

app0.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from app 0',
    data: _.range(1, 100)
  });
});

app0.listen(3000, () => {
  console.log('App 0 running on port 3000');
});

module.exports = app0;
