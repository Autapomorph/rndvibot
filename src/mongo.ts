import mongoose from 'mongoose';

import { logger } from 'logger.js';

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to database');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from database');
});

mongoose.connection.on('error', error => {
  logger.error(error);
  process.exit(1);
});

export const connectMongo = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    return mongoose.connection;
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export const disconnectMongo = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};
