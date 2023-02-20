const { fetchTopics } = require("../models/topics.models");

exports.checkServer = (req, res, next) => {
  res.status(200).send({ msg: "Server is working fine" });
};

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
