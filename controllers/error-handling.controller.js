exports.handlePSQL400s = (err, req, res, next) => {
  const psqlErrorCodes = ["22P02", "23502", "23503", "42601"];
  if (psqlErrorCodes.includes(err.code)) {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500Statuses = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
