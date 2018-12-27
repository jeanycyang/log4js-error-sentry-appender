# log4js-error-sentry-appender

[![npm version](https://badge.fury.io/js/error-sentry-appender.svg)](https://badge.fury.io/js/error-sentry-appender)

How to Use
-
#### set up your log4js config
```javascript
  log4js.configure({
    appenders: {
      stdout: {
        type: 'stdout',
      },
      sentry: {
        type: 'error-sentry-appender',
        sentryConfig: {
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV || 'development',
          // for more config options, see: https://docs.sentry.io/error-reporting/configuration/?platform=node
        },
      },
      sentryFilter: { type: 'logLevelFilter', level: 'error', appender: 'sentry' },
    },
    categories: {
      default: {
        appenders: ['stdout', 'sentryFilter'],
        level: 'debug',
      },
    },
  });
```

#### in your code:
just pass error as the first argument of `log.error` or `log.fatal`
```javascript
const log = log4js.getLogger('someJob');

...

  try {
    if (!job.data) throw new Error('NOT_INVALID');
    log.info('job starts');
    ...
    return Promise.resolve(result);
  } catch (error) {
    log.error(error);
    throw error;
  }
```

Example
-
https://github.com/jeanycyang/express-log4js-sentry