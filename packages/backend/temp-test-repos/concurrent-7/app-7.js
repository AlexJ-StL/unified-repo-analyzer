
const express = require('express');
const _ = require('lodash');

const app7 = express();

app7.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from app 7',
    data: _.range(1, 100)
  });
});

app7.listen(3007, () => {
  console.log('App 7 running on port 3007');
});

module.exports = app7;
