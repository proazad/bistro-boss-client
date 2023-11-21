const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middle Ware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = client.db("bistro-boss").collection("users");
        const reviewsCollection = client.db("bistro-boss").collection("reviews");
        const cartsCollection = client.db("bistro-boss").collection("carts");

        // JWT Related API 
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
            res.send({ token });
        })

        // Middleware 
        const verifyToken = async (req, res, next) => {
            console.log("Token from Verify ", req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: "Unauthorized Access" });
            }
            const token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "Unauthorized Access" });
                }
                req.decoded = jwt.decode;
                next();
            })

        }
        // User Related application 
        // Get all User 
        app.get("/users", verifyToken, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        // Create New User 
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existinguser = await usersCollection.findOne(query);
            if (existinguser) {
                return res.send({ message: "user already Exist", insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        // Update User / Make Admin 
        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const UpdateDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollection.updateOne(filter, UpdateDoc);
            res.send(result)
        })
        // Delete User 
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const user = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(user);
            res.send(result);
        })


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
        // Get Carts Data 
        app.get("/carts", async (req, res) => {
            const email = req.query.email;
            const query = { useremail: email }
            const result = await cartsCollection.find(query).toArray();
            res.send(result);
        })
        // Insert Data in Carts Table 
        app.post("/carts", async (req, res) => {
            const product = req.body;
            const result = await cartsCollection.insertOne(product);
            res.send(result);
        })
        // Delete Data From User Cart            
        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollection.deleteOne(query);
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

