import express from 'express';
import bodyParser from 'body-parser';

import router from './router.js';

const app = express();
app.use(bodyParser.json());


// Router

app.use('/', router);

// Start the server

let port = process.env.PORT || 3000;

const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('port:')) {
    port = parseInt(arg.split(':')[1], 10);
  }
});

app.listen(port, () => {
  console.log('Server is running on port', port);
});