const { levels } = require('log4js');
const Sentry = require('@sentry/node');

function errorSentryAppender(layout,
  {
    useCategoryAsFingerprint = false,
    useSecondArgumentAsExtra = false,
  }) {
  return (loggingEvent) => {
    const { level, data, context, categoryName, pid } = loggingEvent;
    if (level.level >= levels.ERROR.level) {
      const levelStr = level.levelStr.toLowerCase();
      const [error, extra] = data;
      Sentry.configureScope((scope) => {
        if (context.user) scope.setUser(context.user);
        if (useCategoryAsFingerprint) {
          if (error.name) {
            scope.setFingerprint([categoryName, error.name]);
          } else {
            scope.setFingerprint([categoryName]);
          }
        }
        scope.setTag('category', categoryName);
        scope.setLevel(levelStr);
        scope.setExtra('pid', pid);
        if (useSecondArgumentAsExtra && extra && typeof extra === 'object') {
          Object.keys(extra).forEach(key => {
            scope.setExtra(key, extra[key]);
          });
        }
      });
      Sentry.captureException(error);
    }
  };
}

function configure(config, layouts) {
  let layout = layouts.colouredLayout;

  // sentry config reference: https://docs.sentry.io/error-reporting/configuration/?platform=node
  const { sentryConfig, useCategoryAsFingerprint, useSecondArgumentAsExtra } = config;

  if (!sentryConfig.dsn) {
    throw new Error('Must provide Sentry DSN!');
  }

  Sentry.init(sentryConfig);

  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return errorSentryAppender(layout, { useCategoryAsFingerprint, useSecondArgumentAsExtra });
}

exports.errorSentryAppender = errorSentryAppender;
exports.configure = configure;
