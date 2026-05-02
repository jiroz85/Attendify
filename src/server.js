const http = require("http");

const { app } = require("./app");
const { env } = require("./config/env");
const { logger } = require("./config/logger");
const { assertDbConnection } = require("./config/db");

const server = http.createServer(app);

async function start() {
  try {
    await assertDbConnection();
    logger.info("Postgres connection OK");
  } catch (err) {
    logger.error("Postgres connection failed", err);
    process.exit(1);
  }

  server.listen(env.port, () => {
    logger.info(`API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start();

server.on("error", (err) => {
  logger.error("Server error", err);
  process.exit(1);
});
