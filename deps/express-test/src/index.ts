import express from 'express';

const app = express();
app.post('/', (req, res) => {
  req.body; // isso aqui tem que virar um ReadableStream
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
