import winston from 'winston';

const niveles = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const loggerDev = winston.createLogger({
  levels: niveles,
  transports: [
    new winston.transports.Console({
      level: 'debug',
    }),
  ],
});

const loggerProd = winston.createLogger({
  levels: niveles,
  transports: [
    new winston.transports.File({
      filename: './errors.log',
      level: 'error',
    }),
  ],
});

/* Logger for each enviroment */
const logger = process.env.NODE_ENV === 'produccion' ? loggerProd : loggerDev;

//Middleware
const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.http(
    `${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`
  );
  next();
};

export default addLogger;
