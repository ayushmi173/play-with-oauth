import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { COLORS } from '../utils/helpers';
import { MONGO_DB_LOCAL_URI } from '../utils/config';

import { GoogleSheetAuthModel, SalesforceAuthModel } from '../schema';

let database: Connection;

export const dbConnect = () => {
  const uri = MONGO_DB_LOCAL_URI;

  if (database) {
    return;
  }

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  database = mongoose.connection;
  // When mentioned database is available and successfully connects
  database.once('open', async () => {
    console.log(COLORS.FgCyan, 'Database is connected successfully 🆙');
  });

  // In case of any error
  database.on('error', () => {
    console.error(
      COLORS.FgRed,
      `❌😤 Error connecting to database. Check Whether mongoDB
        installed or you can try to give opensource Mongo Atlas database`
    );
  });

  return {
    GoogleSheetAuthModel,
    SalesforceAuthModel,
  };
};

// Safer way to get disconnected
export const dbDisconnect = () => {
  if (!database) {
    return;
  }

  mongoose.disconnect();
};
