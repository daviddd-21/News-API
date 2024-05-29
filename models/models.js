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

exports.getAPI = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((endpoints) => {
      return endpoints;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, CAST(COUNT(comments.article_id) AS INT) AS comment_count from articles JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url ORDER BY articles.created_at DESC"
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
