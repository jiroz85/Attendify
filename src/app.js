const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { env } = require("./config/env");
const { logger } = require("./config/logger");

const { notFoundHandler } = require("./middleware/notFoundHandler");
const { errorHandler } = require("./middleware/errorHandler");

const { authRoutes } = require("./routes/authRoutes");
const { userRoutes } = require("./routes/userRoutes");
const { adminRoutes } = require("./routes/adminRoutes");
const { teacherRoutes } = require("./routes/teacherRoutes");
const { studentRoutes } = require("./routes/studentRoutes");
const { attendanceRoutes } = require("./routes/attendanceRoutes");

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors(
    typeof env.corsOrigin === "string" && env.corsOrigin.trim() === "*"
      ? { origin: true, credentials: false }
      : {
          origin: Array.isArray(env.corsOrigin)
            ? env.corsOrigin
            : env.corsOrigin.includes(",")
              ? env.corsOrigin.split(",").map((origin) => origin.trim())
              : env.corsOrigin,
          credentials: true,
        },
  ),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);
app.use("/attendance", attendanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
