import winston, { createLogger, transports } from "winston";
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const customLogger = winston.createLogger({
    level: level,
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ]
})

    customLogger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  
  export default customLogger