const db = require("../db/connection");

exports.fetchArticles = () => {
  return db
    .query(
      `
          SELECT 
              articles.author,
              articles.title,
              articles.article_id,
              articles.topic,
              articles.created_at,
              articles.votes,
              articles.article_img_url,
              COUNT(comments.article_id)::INTEGER AS comment_count
          FROM articles
          LEFT JOIN comments ON articles.article_id = comments.article_id
          GROUP BY articles.article_id
          ORDER BY articles.created_at DESC
      `
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchOneArticle = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM articles
    WHERE article_id = $1
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "No article found" });
      } else {
        return rows[0];
      }
    });
};

exports.fetchArticleComments = (article_id) => {
  return db
    .query(
      `
        SELECT 
            comments.comment_id,
            comments.votes,
            comments.created_at,
            comments.author,
            articles.body,
            articles.article_id
        FROM comments
        JOIN articles ON comments.article_id = articles.article_id
        WHERE articles.article_id = $1
    `,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};
