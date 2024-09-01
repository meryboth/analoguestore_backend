import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import { Server as socketIo } from 'socket.io';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import './database.js';
import productsRouter from './routes/product.router.js';
import viewsRouter from './routes/views.router.js';
import cartRouter from './routes/cart.router.js';
import sessionRouter from './routes/session.router.js';
import userRouter from './routes/user.router.js';
import emailRouter from './routes/email.router.js';
import messageRouter from './routes/message.router.js';
import ticketRouter from './routes/ticket.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import notFoundHandler from './middlewares/notfoundHandler.js';
import config from './config/config.js';
import cors from 'cors';
import compression from 'express-compression';
import errorHandler from './middlewares/errorHandler.js';
import addLogger from './utils/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { MessageModel } from './models/message.model.js';

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentacion de la App Ecommerce Analogue',
      description:
        'App especializada en la venta de productos analógicos de diseño',
    },
  },
  apis: ['./src/docs/*.yaml'],
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(addLogger);
app.use(express.static('./src/public'));
app.use(cookieParser());
app.use(
  session({
    secret: 'secretCoder',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(cors());
app.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);
initializePassport();

app.use('/api/products', productsRouter);
app.use('/api/sessions', sessionRouter); // Incluye aquí tu ruta de autenticación
app.use('/api/carts', cartRouter);
app.use('/api/users', userRouter);
app.use('/email', emailRouter);
app.use('/api/messages', messageRouter);
app.use('/api/tickets', ticketRouter);
// Cualquier ruta no encontrada pasará por este middleware
app.use('*', notFoundHandler);
app.use(errorHandler);

app.get('/loggertest', (req, res) => {
  req.logger.http('Mensaje HTTP');
  req.logger.info('Mensaje INFO');
  req.logger.warning('Mensaje WARNING');
  req.logger.error('Mensaje ERROR');

  res.send('Logs generados');
});

console.log('Server time:', new Date());

const PORT = config.port;
const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new socketIo(httpServer, {
  cors: {
    origin: `${config.front_url}`,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', async (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  try {
    // Recupera y envía los mensajes actuales desde la base de datos
    const messages = await MessageModel.find().sort({ timestamp: 1 });
    socket.emit('messagesLogs', messages);
  } catch (error) {
    console.error('Error fetching messages on connection:', error);
  }

  socket.on('message', async (data) => {
    console.log('Mensaje recibido:', data);
    try {
      const newMessage = new MessageModel(data);
      await newMessage.save();

      // Emite el nuevo mensaje a todos los clientes conectados
      const messages = await MessageModel.find().sort({ timestamp: 1 });
      io.emit('messagesLogs', messages);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});
