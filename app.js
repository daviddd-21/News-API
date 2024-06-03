const express = require("express");
const {
  getTopics,
  getAPI,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  deleteCommentById,
  getUsers,
  getUserByUsername,
  getCommentById,
  patchCommentById,
} = require("./controllers/controllers");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getAPI);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);
app.get("/api/comments/:comment_id", getCommentById);
app.patch("/api/comments/:comment_id", patchCommentById);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUserByUsername);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Username or article does not exist" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Missing some required information" });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
