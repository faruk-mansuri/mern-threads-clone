import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { app, server } from './socket/socket.js';
// const app = express();

import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// routers
import AuthRouter from './routes/AuthRoute.js';
import UserRouter from './routes/UserRoute.js';
import PostRouter from './routes/PostRoute.js';
import MessageRoute from './routes/MessageRoute.js';
import ConversationRoute from './routes/ConversationRoute.js';

// public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, './client/dist')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true })); //use to parse nested object
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cookieParser());
// app.use(helmet());
app.use(mongoSanitize());

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'TEST USER' });
});

app.get('/', (req, res, next) => {
  console.log('req', req);
  next();
});

app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/users', authenticateUser, UserRouter);
app.use('/api/v1/posts', authenticateUser, PostRouter);
app.use('/api/v1/messages', authenticateUser, MessageRoute);
app.use('/api/v1/conversations', authenticateUser, ConversationRoute);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'route not found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGO_URL);
  server.listen(port, console.log(`server is listening on port ${port}... `));
} catch (err) {
  console.log(err);
  process.exit(1);
}
