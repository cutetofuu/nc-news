const express = require("express");
const { checkServer, getTopics } = require("./controllers/topics.controller");
const {
  getArticles,
  getOneArticle,
  postComment,
} = require("./controllers/articles.controller");
const {
  handlePSQL400s,
  handleCustomErrors,
  handle500Statuses,
} = require("./controllers/error-handling.controller");

const app = express();

app.use(express.json());

app.get("/api", checkServer);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getOneArticle);

app.post("/api/articles/:article_id/comments", postComment);

app.use(handlePSQL400s);

app.use(handleCustomErrors);

app.use(handle500Statuses);

module.exports = app;
