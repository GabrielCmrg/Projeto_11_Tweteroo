import express, { response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
console.log("Server initiated with cors.");
app.use(express.json());

const users = [];
const tweets = [];

app.post("/sign-up", (request, response) => {
    console.log("POST request made to route /sign-up");
    const user = request.body;
    users.push(user);
    console.log("User saved!");
    response.send("OK");
    response.status(200);
    console.log("Response sent!");
});

app.post("/tweets", (request, response) => {
    console.log("POST request made to route /tweets");
    const tweet = request.body;
    tweets.push(tweet);
    console.log("Tweet saved!");
    response.send("OK");
    response.status(200);
    console.log("Response sent!");
});

app.get("/tweets", (request, response) => {
    console.log("GET request made to route /tweets");
    const lastTweets = tweets.slice(-10);
    console.log("Got last 10 tweets.");
    const formattedTweets = lastTweets.map(tweet => {
        return {...tweet, avatar: users.find(user => user.username === tweet.username).avatar};
    });
    console.log("Added avatar key to tweets.");
    response.send(formattedTweets);
    response.status(200);
    console.log("Response sent!");
});

app.listen(5000, () => {
    console.log("Server initiated at:\nhttp://127.0.0.1:5000\nhttp://localhost:5000")
});