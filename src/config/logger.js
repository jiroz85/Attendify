const logger = {
  info: (msg, meta) => {
    if (meta) {
      // eslint-disable-next-line no-console
      console.log(msg, meta);
      return;
    }
    // eslint-disable-next-line no-console
    console.log(msg);
  },
  warn: (msg, meta) => {
    if (meta) {
      // eslint-disable-next-line no-console
      console.warn(msg, meta);
      return;
    }
    // eslint-disable-next-line no-console
    console.warn(msg);
  },
  error: (msg, meta) => {
    if (meta) {
      // eslint-disable-next-line no-console
      console.error(msg, meta);
      return;
    }
    // eslint-disable-next-line no-console
    console.error(msg);
  },
};

module.exports = { logger };
