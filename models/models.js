const db = require("../db/connection");
const fs = require("fs/promises");
const format = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, articles.body, CAST(COUNT(comments.article_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id",
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (queries) => {
  const { topic, sort_by = "created_at", order = "DESC" } = queries;
  const queryParams = [];
  let topicQuery = "";
  const validSortBy = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["ASC", "DESC"];
  if (topic) {
    topicQuery = "WHERE topic = $1";
    queryParams.push(topic);
  }
  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  return db
    .query(
      `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, CAST(COUNT(comments.article_id) AS INT) AS comment_count from articles LEFT JOIN comments ON articles.article_id = comments.article_id ${topicQuery} GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url ORDER BY ${sort_by} ${order};`,
      queryParams
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows;
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows;
    });
};

exports.insertComment = (article_id, username, body) => {
  const formatComment = [[body, article_id, username, 0]];
  const query = format(
    "INSERT INTO comments(body, article_id, author, votes) VALUES %L RETURNING *;",
    formatComment
  );
  return db.query(query).then(({ rows }) => {
    return rows[0];
  });
};

exports.updateArticleById = (article_id, inc_votes) => {
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;",
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.deleteCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.selectUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectCommentById = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [comment_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};
exports.updateCommentById = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.insertArticle = (article) => {
  const {
    author,
    title,
    body,
    topic,
    article_img_url = "anything for now",
  } = article;
  return db
    .query(
      "INSERT INTO articles(title, topic, author, body, article_img_url) VALUES($1, $2, $3, $4, $5) RETURNING article_id, author, title, topic, created_at, votes, article_img_url, body",
      [title, topic, author, body, article_img_url]
    )
    .then(({ rows }) => {
      const insertedRow = rows[0];
      insertedRow.comment_count = 0;
      return insertedRow;
    });
};

exports.insertTopic = (topic) => {
  const { slug, description } = topic;
  return db
    .query("INSERT INTO topics(slug, description) VALUES($1, $2) RETURNING *", [
      slug,
      description,
    ])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.deleteArticleById = (article_id) => {
  return db
    .query("DELETE FROM articles WHERE article_id = $1 RETURNING *", [
      article_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.insertUser = (user) => {
  const { username, name, avatar_url, password } = user;
  return db
    .query(
      "INSERT INTO users(username, name, avatar_url, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, name, avatar_url, password]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
