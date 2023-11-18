const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middle Ware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7gpv70.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const menuCollection = client.db("bistro-boss").collection("menu");
        const reviewsCollection = client.db("bistro-boss").collection("reviews");
        const cartsCollection = client.db("bistro-boss").collection("carts");

        // Service Related Api 
        // Menu Api 
        app.get("/menu", async (req, res) => {
            res.send(await menuCollection.find().toArray());
        });

        // Reviews API 

        app.get("/reviews", async (req, res) => {
            res.send(await reviewsCollection.find().toArray());
        })
        // Shopping Carts Related API 
        // Insert Data in Carts Table 

        app.get("/carts", async (req, res) => {
            const product = req.body;
            const result = await cartsCollection.insertOne(product);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Bistro Boss Restuarant Server is Running");
})
app.listen(port, () => {
    console.log("Boss is Running on Port ", port);
})

