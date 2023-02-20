const express = require("express");
const { checkServer, getTopics } = require("./controllers/topics.controller");
const {
  handle500Statuses,
} = require("./controllers/error-handling.controller");
const { getOneArticle } = require("./controllers/articles.controller");

const app = express();

app.get("/api", checkServer);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getOneArticle);

app.use(handle500Statuses);

module.exports = app;
