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
    SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.body,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.article_id)::INTEGER AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
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
        ORDER BY comments.created_at DESC
    `,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticleById = (article_id) => {
  let queryString = `SELECT * FROM articles`;
  const queryParams = [];

  if (article_id !== undefined) {
    queryString += ` WHERE article_id = $1`;
    queryParams.push(article_id);
  }

  return db.query(queryString, queryParams).then((result) => {
    const { rowCount } = result;
    if (rowCount === 0) {
      return Promise.reject({ status: 404, msg: "No article found" });
    } else {
      return result.rows[0];
    }
  });
};

exports.addComment = (article_id, newComment) => {
  const { body, username } = newComment;

  return db
    .query(
      `
    INSERT INTO comments
      (body, article_id, author)
    VALUES
      ($1, $2, $3)
    RETURNING *
    `,
      [body, article_id, username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.selectUsername = (newComment) => {
  const { username } = newComment;

  let queryString = `SELECT * FROM users`;
  const queryParams = [];

  if (username !== undefined) {
    queryString += ` WHERE username = $1`;
    queryParams.push(username);
  }

  return db.query(queryString, queryParams).then((result) => {
    const { rowCount } = result;
    if (rowCount === 0) {
      return Promise.reject({ status: 404, msg: "Username does not exist" });
    } else {
      return result.rows[0];
    }
  });
};

exports.updateArticle = (inc_votes, article_id) => {
  return db
    .query(
      `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *
  `,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "No article found" });
      } else {
        return rows[0];
      }
    });
};
