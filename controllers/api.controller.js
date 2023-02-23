const fs = require("fs/promises");

exports.getEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((file) => {
      const parsedFile = JSON.parse(file);
      res.status(200).send({ parsedFile });
    })
    .catch((err) => {
      next(err);
    });
};
