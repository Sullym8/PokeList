const express = require("express");
const app = express();

const bodyParser = require("body-parser")
const { MongoClient, ServerApiVersion } = require('mongodb');

const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "./.env") }) 


// const uri = process.env.MONGO_CONNECTION_STRING;
// const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};

process.stdin.setEncoding('utf-8');
if (process.argv.length != 3) {
    process.stdout.write("Usage app.js portNumber");
    process.exit(1);
}

let port = process.argv[2];
app.use(bodyParser.urlencoded({extended:false}));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/templates'));


app.get("/", (request, response) => {
    response.render("home")
})

app.get("/vote", (req, res) => {
    res.render("vote")
})

app.get("/tierlist", (req, res) => {
    res.render("tierlist")
})

app.listen(port);
console.log(`Web server started and running at http://localhost:${port}`);

process.stdout.write("Stop to shutdown the server: ");

process.stdin.on('readable', function() {
    let input = process.stdin.read()
    if (input !== null) {
        let command = input.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server");
            process.exit(0)
        } else {
            process.stdout.write(`Invalid command: ${command}\n`);
        }
        process.stdout.write("Stop to shutdown the server: ");
        process.stdin.resume()
    }

})


