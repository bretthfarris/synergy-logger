const debug = require('debug');
const winston = require('winston');
winston.level = process.env.LOG_LEVEL;

const errorStackTracerFormat = winston.format(info => {
  if (info.meta && info.meta instanceof Error) {
    info.message = `${info.message} ${info.meta.stack}`;
  }
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' }
});

logger.add(
  new winston.transports.File({
    name: 'error-file',
    filename: process.env.PWD + '/logs/error.log', 
    level: 'error', 
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A ZZ'
      }),
      errorStackTracerFormat(),
      winston.format.json()
    ) 
  })
);

logger.add(
  new winston.transports.File({
    name: 'combined-file',
    filename: process.env.PWD + '/logs/combined.log', 
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A ZZ'
      }),
      winston.format.json()
    ),
  })
);
 
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    name: 'console',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A ZZ'
      }),
      winston.format.json()
    )
  }));
}

module.exports = logger;