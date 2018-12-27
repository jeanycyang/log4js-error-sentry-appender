const { levels } = require('log4js');
const Sentry = require('@sentry/node');

function errorSentryAppender() {
  return (loggingEvent) => {
    const { level, data, context } = loggingEvent;
    if (level.level >= levels.ERROR.level) {
      const levelStr = level.levelStr.toLowerCase();
      const [error] = data;
      Sentry.configureScope((scope) => {
        if (context.user) scope.setUser(context.user);
        scope.setLevel(levelStr);
      });
      Sentry.captureException(error);
    }
  };
}

function configure(config, layouts) {
  let layout = layouts.colouredLayout;

  // sentry config reference: https://docs.sentry.io/error-reporting/configuration/?platform=node
  const { sentryConfig } = config;

  if (!sentryConfig.dsn) {
    throw new Error('Must provide Sentry DSN!');
  }

  Sentry.init(sentryConfig);

  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return errorSentryAppender(layout);
}

exports.errorSentryAppender = errorSentryAppender;
exports.configure = configure;
