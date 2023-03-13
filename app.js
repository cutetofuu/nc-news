const express = require("express");
const apiRouter = require("./routes/api.router");
const {
  handle404NonExistentPaths,
  handlePSQL400s,
  handleCustomErrors,
  handle500Statuses,
} = require("./controllers/error-handling.controller");
const cors = require("cors");

app.use(cors());

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use(handle404NonExistentPaths);

app.use(handlePSQL400s);

app.use(handleCustomErrors);

app.use(handle500Statuses);

module.exports = app;
