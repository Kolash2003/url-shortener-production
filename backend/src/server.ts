import express from "express";
import cors from "cors";
import { serverConfig } from "./config";
import v1Router from "./routers/v1/index.router";
import redirectRouter from "./routers/redirect.router";
import { appErrorHandler, genericErrorHandler } from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachCorrelationIdMiddleware);

// API routes
app.use("/api/v1", v1Router);

// Short link redirect (must be last to not intercept API routes)
app.use("/", redirectRouter);

// Error handling
app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, () => {
  logger.info(`Server running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop.`);
});

// Prevent silent crashes
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

export default app;
