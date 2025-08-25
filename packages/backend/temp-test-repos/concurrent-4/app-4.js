
const express = require('express');
const _ = require('lodash');

const app4 = express();

app4.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from app 4',
    data: _.range(1, 100)
  });
});

app4.listen(3004, () => {
  console.log('App 4 running on port 3004');
});

module.exports = app4;
