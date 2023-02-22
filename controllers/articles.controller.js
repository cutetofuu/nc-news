const {
  fetchArticles,
  fetchOneArticle,
  fetchArticleComments,
  selectArticleById,
  addComment,
  selectUsername,
  updateArticle,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { topic, sort_by } = req.query;
  fetchArticles(topic, sort_by)
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

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;

  selectArticleById(article_id)
    .then(() => {
      return selectUsername(newComment);
    })
    .then(() => {
      return addComment(article_id, newComment);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;

  updateArticle(inc_votes, article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
