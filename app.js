const express = require("express");
const {
  getTopics,
  getAPI,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
} = require("./controllers/controllers");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getAPI);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code) {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
