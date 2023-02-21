const {
  fetchArticles,
  fetchOneArticle,
  fetchArticleComments,
  selectArticleById,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOneArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchOneArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  const commentsPromise = fetchArticleComments(article_id);
  const checkArticle = selectArticleById(article_id);

  Promise.all([commentsPromise, checkArticle])
    .then((promisesResult) => {
      const comments = promisesResult[0];
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
