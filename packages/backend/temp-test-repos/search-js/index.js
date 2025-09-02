const express = require('express');
const _ = require('lodash');

const app = express();

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
