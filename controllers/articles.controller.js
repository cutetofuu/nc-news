const {
  fetchArticles,
  fetchOneArticle,
  fetchArticleComments,
  selectArticleById,
  addComment,
  selectUsername,
  updateArticle,
  selectTopic,
  addArticle,
  removeArticle,
  removeCommentByArticleId,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;

  const articlesPromise = fetchArticles(topic, sort_by, order, limit, p);
  const checkTopic = selectTopic(topic);

  Promise.all([articlesPromise, checkTopic])
    .then((promisesResult) => {
      const articles = promisesResult[0];
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
  const { limit, p } = req.query;

  const commentsPromise = fetchArticleComments(article_id, limit, p);
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

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;

  addArticle(newArticle)
    .then((result) => {
      const { article_id } = result;
      return fetchOneArticle(article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;

  removeCommentByArticleId(article_id)
    .then(() => {
      return removeArticle(article_id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
