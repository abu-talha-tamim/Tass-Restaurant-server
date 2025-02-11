const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Eating good food is essential for good health");
});

app.listen(port, () => {
  console.log(`Food is processing at: ${port}`);
});
