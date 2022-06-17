import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
console.log("Server initiated with cors.");
app.use(express.json());

app.listen(5000, () => {
    console.log("Server initiated at:\nhttp://127.0.0.1:5000\nhttp://localhost:5000")
});