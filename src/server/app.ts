import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { dbConnect } from '../database/databaseConfig';

class App {
  public app: express.Application;

  constructor() {
    this.mongoSetupConnect();
    this.app = express();
    this.config();
  }

  private config(): void {
    // support application/json type post data
    this.app.use(express.json());

    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.set('views', '../views');
    this.app.set('view engine', 'pug');
  }

  private mongoSetupConnect(): void {
    dbConnect();
  }
}
export default new App().app;
