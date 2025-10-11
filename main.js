import express from "express";

console.log("Starting FreelanceFlow backend...");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("frontend"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
