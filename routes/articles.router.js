const articlesRouter = require("express").Router();
const {
  getArticles,
  getOneArticle,
  patchArticle,
  getArticleComments,
  postComment,
  postArticle,
} = require("../controllers/articles.controller");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter.route("/:article_id").get(getOneArticle).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
