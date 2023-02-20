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
    `
    )
    .then(({ rows }) => {
      return rows;
    });
};
