
const express = require('express');
const _ = require('lodash');

const app5 = express();

app5.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from app 5',
    data: _.range(1, 100)
  });
});

app5.listen(3005, () => {
  console.log('App 5 running on port 3005');
});

module.exports = app5;
