import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
console.log("Server cors enabled.");
app.use(express.json());
console.log("Server json enabled.");

let database;
if (fs.existsSync(".database.json")) {
    database = JSON.parse(fs.readFileSync(".database.json", "utf-8"));
} else {
    database = {users: [], tweets: []};
    fs.writeFileSync(".database.json", JSON.stringify(database, null, 2));
}

const users = database.users;
const tweets = database.tweets;

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

    // create or update user
    const savedUser = users.find(user => user.username === username);
    if (savedUser === undefined) {
        console.log("User is not in database");
        users.push(user);
        database = {users, tweets};
        fs.writeFileSync(".database.json", JSON.stringify(database, null, 2));
        console.log("User saved!");
        res.status(201);
        res.send("OK");
        console.log("Response sent!");
    } else {
        console.log("User is already in database");
        users[users.indexOf(savedUser)].avatar = avatar;
        database = {users, tweets};
        fs.writeFileSync(".database.json", JSON.stringify(database, null, 2));
        console.log("Updated user's avatar!");
        res.status(201);
        res.send("OK");
        console.log("Response sent!");
    }
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
    const { tweet, ...rest } = tweetToSend;
    if (Object.keys(rest).length > 0 || typeof(tweet) !== "string") {
        console.log("Invalid keys received");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if username header is invalid
    const username = req.headers.user;
    if  (typeof(username) !== "string") {
        console.log("Invalid user header received");
        res.sendStatus(400);
        console.log("Response sent!");
        return;
    }

    // checks if user and tweet are filled
    if (username.trim().length === 0 || tweet.trim().length === 0) {
        console.log("user header or tweet key are empty");
        res.status(400);
        res.send("Todos os campos são obrigatórios!");
        console.log("Response sent!");
        return;
    }

    // checks if user exists before saving
    const savedUser = users.find(user => user.username === username);
    if (savedUser === undefined) {
        console.log("User is not in database");
        res.status(400);
        res.send("This user do not exist, please sign-up");
        console.log("Response sent!");
        return;
    }

    const tweetToSave = {username, tweet};
    tweets.unshift(tweetToSave);
    database = {users, tweets};
    fs.writeFileSync(".database.json", JSON.stringify(database, null, 2));
    console.log("Tweet saved!");
    res.status(201);
    res.send("OK");
    console.log("Response sent!");
});

app.get("/tweets", (req, res) => {
    console.log("GET request made to route /tweets");
    const pageQuery = req.query.page;
    let page;
    if (pageQuery === undefined) {
        console.log("Pagination query not found, assuming page 1");
        page = 1;
    } else {
        console.log("Pagination query found, trying to convert to number");
        page = parseInt(pageQuery);
        if (isNaN(page) || page < 2) {
            console.log("Pagination is not a number or is lesser than 2");
            res.status(400);
            res.send("Informe uma página válida!");
            console.log("Response sent!");
            return;
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