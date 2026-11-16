import express from "express";

const app = express();

/**
 * Disable the "x-powered-by" header to enhance security by not revealing the server technology used.
 */
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
