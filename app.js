const express = require("express");
const { checkServer, getTopics } = require("./controllers/topics.controller");
const {
  getArticles,
  getOneArticle,
  getArticleComments,
  postComment,
  patchArticle,
} = require("./controllers/articles.controller");
const { getUsers } = require("./controllers/users.controller");
const { deleteComment } = require("./controllers/comments.controller");
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

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/users", getUsers);

app.delete("/api/comments/:comment_id", deleteComment);

app.use(handlePSQL400s);

app.use(handleCustomErrors);

app.use(handle500Statuses);

module.exports = app;
