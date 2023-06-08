const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oikc1wt.mongodb.net/?retryWrites=true&w=majority`;

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

        const usersCollection = client.db("sportDB").collection('users')


        // user related api
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })
        // users api to save email & role
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body;
            const query = { email: email }
            const options = { upsert: true }
            const updateDog = {
                $set: user
            }
            const result = await usersCollection.updateOne(query, updateDog, options)
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDog = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollection.updateOne(filter, updateDog)
            console.log(result);
            res.send(result)
        })

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDog = {
                $set: {
                    role: "instructor"
                }
            }
            const result = await usersCollection.updateOne(filter, updateDog)
            console.log(result);
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Sports academies is running')
})
app.listen(port, () => {
    console.log(`Sports academies is running in port : ${port}`)
})