exports.checkServer = (req, res, next) => {
  res.status(200).send({ msg: "Server is working fine" });
};
