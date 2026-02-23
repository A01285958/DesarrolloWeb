import express from "express";

const app = express();
const port = 4001;

app.use("/", express.static("PUBLIC"));

app.listen(port, console.log("http://localhost:" + port)); 

