const app = require("./app");
const { PORT = 9090 } = process.env;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
