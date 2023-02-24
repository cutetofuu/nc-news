const db = require("../db/connection");

exports.fetchArticles = (topic, sort_by, order) => {
  const validSortByOptions = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
  ];
  const validOrderOptions = ["asc", "desc"];

  if (sort_by && !validSortByOptions.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort by option given" });
  }

  if (order && !validOrderOptions.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order option given" });
  }

  let queryString = `
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
    LEFT JOIN comments ON articles.article_id = comments.article_id`;
  const queryParams = [];

  if (topic) {
    queryString += ` WHERE articles.topic = $1`;
    queryParams.push(topic);
  }

  queryString += ` GROUP BY articles.article_id`;

  if (sort_by) {
    queryString += ` ORDER BY articles.${sort_by}`;
  } else {
    queryString += ` ORDER BY articles.created_at`;
  }

  if (order) {
    queryString += ` ${order}`;
  } else {
    queryString += ` DESC`;
  }

  return db.query(queryString, queryParams).then(({ rows }) => {
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

exports.fetchArticleComments = (article_id, limit, p) => {
  const validNumericOptionsRegex = /\d+/;

  if (limit && !validNumericOptionsRegex.test(limit)) {
    return Promise.reject({ status: 400, msg: "Invalid limit option given" });
  }

  if (p && !validNumericOptionsRegex.test(p)) {
    return Promise.reject({ status: 400, msg: "Invalid page option given" });
  }

  let queryString = `
    SELECT 
        comments.comment_id,
        comments.votes,
        comments.created_at,
        comments.author,
        comments.body,
        articles.article_id
    FROM comments
    JOIN articles ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    ORDER BY comments.created_at DESC
  `;

  if (limit) {
    queryString += ` LIMIT ${limit}`;
    if (p > 1) {
      queryString += ` OFFSET ${limit * (p - 1)}`;
    }
  } else {
    queryString += ` LIMIT 10`;
    if (p > 1) {
      queryString += ` OFFSET ${10 * (p - 1)}`;
    }
  }

  return db.query(queryString, [article_id]).then(({ rows }) => {
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

exports.selectTopic = (topic) => {
  let queryString = `SELECT * FROM topics`;
  const queryParams = [];

  if (topic !== undefined) {
    queryString += ` WHERE topics.slug = $1`;
    queryParams.push(topic);
  }

  return db.query(queryString, queryParams).then((result) => {
    const { rowCount } = result;
    if (rowCount === 0) {
      return Promise.reject({ status: 404, msg: "Topic not found" });
    } else {
      return rowCount[0];
    }
  });
};

exports.addArticle = (newArticle) => {
  const {
    author,
    title,
    body,
    topic,
    article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  } = newArticle;

  return db
    .query(
      `
    INSERT INTO articles
      (author, title, body, topic, article_img_url)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
  `,
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
