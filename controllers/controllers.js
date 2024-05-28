const { selectTopics, getAPI } = require("../models/models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getAPI = (req, res, next) => {
  getAPI()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch(next);
};
