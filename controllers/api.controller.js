const fs = require("fs/promises");

exports.getEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((file) => {
      res.status(200).send(file);
    })
    .catch((err) => {
      next(err);
    });
};
