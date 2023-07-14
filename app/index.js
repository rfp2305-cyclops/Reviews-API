require('dotenv').config();
import express from 'express';
import path from 'path'
import cors from 'cors'
import router from './routes'
import morgan from 'morgan'

const app = express();

// Set what we are listening on.
app.set('port', process.env.SERVER_PORT);

// Logging and parsing
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Set up our routes
app.use(router);

app.listen(app.get('port'));
console.log('Listening on', app.get('port'));

export default app;
