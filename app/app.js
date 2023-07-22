require('dotenv').config();
import express from 'express';
import cors from 'cors';
import router from './routes';
import morgan from 'morgan';

export default function APP(pid) {
  const app = express();
  app.set('port', process.env.SERVER_PORT);
  app.set('pid', pid);

  app.use(morgan(
    process.env.NODE_ENV === 'development'
      ? 'dev'
      : 'tiny'
  ));
  app.use(cors());
  app.use(express.json());

  app.use(router());
  app.listen(app.get('port'), function () {
    let pid = app.get('pid');
    console.log(
      pid ? pid + ' ' : '',
      'Listening on', app.get('port')
    );
  });

  return app;
};
