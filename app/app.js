require('dotenv').config();
import express from 'express';
import cors from 'cors'
import router from './routes'
import morgan from 'morgan'

export default function APP() {
  const app = express();
  app.set('port', process.env.SERVER_PORT);

// Logging and parsing
  app.use(morgan(
    process.env.NODE_ENV === 'development'
      ? 'dev'
      : 'tiny'
  ));
  app.use(cors());
  app.use(express.json());

  app.use(router());
  app.listen(app.get('port'), function () {
    console.log('Listening on', app.get('port'));
  });

  return app;
};
