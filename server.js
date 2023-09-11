import express from 'express';

const PORT = process.env.PORT || 5163;

const app = express();
app.use(express.static('./public'));

const displayPort = function () {
  console.log('Listening on ' + PORT)
}

app.listen(PORT, displayPort);