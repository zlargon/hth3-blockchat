const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;

// CORS
function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain);

// public static files
app.use('/', express.static(__dirname + '/public'));


// HTTPs Server
https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, () => {
  console.log(`Example app listening on port ${port}! Go to https://localhost:${port}/`);
})

// app.listen(port, (err) => {
//   if (err) {
//     return console.log('something bad happened', err);
//   }
//   console.log(`server is listening on ${port}`);
// });
