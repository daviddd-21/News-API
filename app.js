const express = require("express");
const {
  getTopics,
  getAPI,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("./controllers/controllers");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getAPI);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code) {
    if (err.code === "23503") {
      res.status(400).send({ msg: "Username or article does not exist" });
      next(err);
    }
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
