const express = require("express");
const app = express();

const bodyParser = require("body-parser")
const { MongoClient, ServerApiVersion } = require('mongodb');

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") }) 


const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, 
    collectionVotes: process.env.MONGO_COLLECTION_VOTES, 
    collectionCount: process.env.MONGO_COLLECTION_COUNT};

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

app.post("/processVote", async (req, res) => {
    addPokemonVote(req.body);
    // console.log(req.body);
    res.redirect("/tierlist");
})

app.get("/tierlist", async (req, res) => {
    let table = await generateTierList();
    res.render("tierlist", {table});
})

app.listen(port);
console.log(`Web server started and running at http://localhost:${port}`);

process.stdout.write("Stop to shutdown the server: \n");

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

async function addPokemonVote(body) {
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        let result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVotes).findOne({uid: body.uid});
        if (result === null) {
            await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVotes).insertOne(body);
            let result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionCount).findOne({currPokemon: body.currPokemon});
            if (result === null ) {
                await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionCount).insertOne({currPokemon: body.currPokemon, count: 1, url: body.url})
            } else {
                await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionCount).findOneAndUpdate({currPokemon: body.currPokemon}, 
                    {$inc: {count: 1}})
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function generateTierList() {
    let s_tier = [];
    let a_tier = [];
    let b_tier = [];
    let c_tier = [];
    let d_tier = [];
    let e_tier = [];
    let output = "<table><tr><th>Tier</th><th>Pokemon</th></tr>";
    
    const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        let totalVotes = Number(await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVotes).countDocuments({}));
        let totalCount = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionCount).find().toArray();

        totalCount.map(pokemon => {
            let percentage = Number(pokemon.count) / totalVotes;
            console.log(`${pokemon.currPokemon} ${percentage}`)
            if (percentage > 0.834) {
                s_tier.push(pokemon.url);
            } else if (percentage > 0.668) {
                a_tier.push(pokemon.url);
            } else if (percentage > 0.502) {
                b_tier.push(pokemon.url);
            } else if (percentage > 0.336) {
                c_tier.push(pokemon.url)
            } else if (percentage > 0.16) {
                d_tier.push(pokemon.url)
            } else {
                e_tier.push(pokemon.url);
            }
        })

        

        output += "<tr><td>S Tier</td>";
        s_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "<tr><td>A Tier</td>";
        a_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "<tr><td>B Tier</td>";
        b_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "<tr><td>C Tier</td>";
        c_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "<tr><td>D Tier</td>";
        d_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "<tr><td>E Tier</td>";
        e_tier.forEach(pokemon => {
            output += `<td><img src = '${pokemon}'></td>`
        })
        output += "</tr>"

        output += "</table>"
        return output;
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

