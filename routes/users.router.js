const { getUsers, getOneUser } = require("../controllers/users.controller");
const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getOneUser);

module.exports = usersRouter;
