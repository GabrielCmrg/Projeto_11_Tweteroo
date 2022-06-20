import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
console.log("Server initiated with cors.");
app.use(express.json());

const users = [];
const tweets = [];

app.post("/sign-up", (req, res) => {
    console.log("POST request made to route /sign-up");
    const user = req.body;

    // cheks if the body is an object
    if (typeof(user) !== "object" || Array.isArray(user) || user === null) {
        console.log("Request body with invalid formats.");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if there is other keys or if a key is invalid
    const { username, avatar, ...rest } = user;
    if (Object.keys(rest).length > 0 || typeof(username) !== "string" || typeof(avatar) !== "string") {
        console.log("Invalid keys received");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if username and avatar keys are filled
    if (username.trim().length === 0 || avatar.trim().length === 0) {
        console.log("username or avatar keys are empty");
        res.status(400);
        res.send("Todos os campos são obrigatórios!");
        console.log("Response sent!");
        return;
    }

    users.push(user);
    console.log("User saved!");
    res.status(201);
    res.send("OK");
    console.log("Response sent!");
});

app.post("/tweets", (req, res) => {
    console.log("POST request made to route /tweets");
    const tweetToSend = req.body;

    // cheks if the body is an object
    if (typeof(tweetToSend) !== "object" || Array.isArray(tweetToSend) || tweetToSend === null) {
        console.log("Request body with invalid formats.");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if there is other keys or if a key is invalid
    const { username, tweet, ...rest } = tweetToSend;
    if (Object.keys(rest).length > 0 || typeof(username) !== "string" || typeof(tweet) !== "string") {
        console.log("Invalid keys received");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if username and tweet keys are filled
    if (username.trim().length === 0 || tweet.trim().length === 0) {
        console.log("username or tweet keys are empty");
        res.status(400);
        res.send("Todos os campos são obrigatórios!");
        console.log("Response sent!");
        return;
    }

    tweets.unshift(tweetToSend);
    console.log("Tweet saved!");
    res.status(201);
    res.send("OK");
    console.log("Response sent!");
});

app.get("/tweets", (req, res) => {
    console.log("GET request made to route /tweets");
    const pageQuery = req.query.page;
    if (pageQuery === undefined) {
        console.log("Pagination query not found, assuming page 1");
        const page = 1;
    } else {
        console.log("Pagination query found, trying to convert to number");
        const page = parseInt(pageQuery);
        if (isNaN(page) || page < 2) {
            console.log("Pagination is not a number or is lesser than 2");
            res.status(400);
            res.send("Informe uma página válida!");
            console.log("Response sent!");
        }
    }
    const tweetsToSend = tweets.slice(10 * (page - 1), 10 * page);
    console.log(`Got last ${(page - 1) * 10} to ${page * 10 - 1} tweets.`);
    const formattedTweets = tweetsToSend.map(tweet => {
        return {...tweet, avatar: users.find(user => user.username === tweet.username).avatar};
    });
    console.log("Added avatar key to tweets.");
    res.send(formattedTweets);
    res.status(200);
    console.log("Response sent!");
});

app.get("/tweets/:username", (req, res) => {
    const username = req.params.username;
    console.log("GET request made to route /tweets/" + username);
    const thisUser = users.find(user => user.username === username);

    // checks if user exists
    if (thisUser === undefined) {
        console.log(username + " not found");
        res.sendStatus(404);
        return;
    }

    const avatar = thisUser.avatar;
    const thisUserTweets = tweets.filter(tweet => tweet.username === username);
    console.log("Got user's tweets");
    const formattedTweets = thisUserTweets.map(tweet => {
        return {...tweet, avatar};
    });
    console.log("Added avatar key to tweets.");
    res.status(200);
    res.send(formattedTweets);
    console.log("Response sent!");
});

app.listen(5000, () => {
    console.log("Server initiated at:\nhttp://127.0.0.1:5000\nhttp://localhost:5000")
});