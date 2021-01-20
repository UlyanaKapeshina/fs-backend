const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const PORT = 8080;
const HOST = "localhost";

const app = express();
const photosRoutes = require("./routes/photos");

app.use(morgan("combined"));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/photos", photosRoutes);
app.use("/**", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(404);
  res.end(JSON.stringify({ error: "NOT_FOUND" }));
});

app.listen(PORT, HOST, () => {
  console.log(`server start on http://${HOST}:${PORT}`);
});
app.use((err, req, res, next) => {
  const { message } = err;
  res.json({ status: "ERROR", message });
});
