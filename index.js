const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorized Access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send({ error: true, message: 'Unauthorized Access' })
        }
        req.decoded = decoded;
        next();
    })
}


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
        client.connect();

        const usersCollection = client.db("sportDB").collection('users')
        const classesCollection = client.db('sportDB').collection("allClass")


        // JWT
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        // admin related api
        // user collection
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            console.log(email);
        })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })
        // users api to save email & role
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const exitingUser = await usersCollection.findOne(query)
            if (exitingUser) {
                return res.send({ message: "Is User Already Exist" })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })


        // app.get('/users/role/:email', verifyJWT, async (req, res) => {
        //     const email = res.params.email;
        //     const query = { email: email };
        //     const user = await usersCollection.findOne(query)
        //     const result = { admin: user?.role === 'admin' }
        //     res.send(result)
        // })

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

        // class collection
        app.get('/allclass', async (req, res) => {
            const result = await classesCollection.find().toArray();
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