import express from "express";
import authRouter from "../auth.router";
import linksRouter from "../links.router";
import analyticsRouter from "../analytics.router";
import apiKeysRouter from "../api-keys.router";

const v1Router = express.Router();

v1Router.use("/auth", authRouter);
v1Router.use("/links", linksRouter);
v1Router.use("/analytics", analyticsRouter);
v1Router.use("/api-keys", apiKeysRouter);

v1Router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default v1Router;
