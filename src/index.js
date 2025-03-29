import './config/env.config.js'
import express from 'express';
import bodyParser from 'body-parser';

import router from './router.js';

import { connectWithRetry } from './services/db.service.js';

// Importing environment variables
const app = express();
app.use(bodyParser.json());

// Router
app.use('/api', router);
app.use((req, res) => {
  res.status(404).send({
    message: 'Route not found',
    errors: ['Route not found'],
  });
});

// Connect to MongoDB
connectWithRetry()

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

export default app;