const express = require("express");
const { checkServer, getTopics } = require("./controllers/topics.controller");
const {
  handle500Statuses,
} = require("./controllers/error-handling.controller");

const app = express();

app.get("/api", checkServer);

app.get("/api/topics", getTopics);

app.use(handle500Statuses);

module.exports = app;
