const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://80days:${process.env.MONGODB}@cluster0.mvauvqp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next)=> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}


const serviceFun = async () => {
    try {
        const servicesCollection = client.db('80days').collection('serviceslist')
        const servicesdetailsCollection = client.db('80days').collection('servicesdetails')
        const myservicesCollection = client.db('80days').collection('myservices')
        const myreviewsCollection = client.db('80days').collection('myreviews')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })
        app.get('/', async (req, res) => {
            const cursor = servicesCollection.find({}).limit(3)
            const orders = await cursor.toArray();
            res.send(orders);
        })
        app.get('/services', async (req, res)=>{
            const result = await servicesdetailsCollection.find({}).toArray()
            res.send(result)
        })
        app.get('/services/:id', async (req, res)=>{
            const id = ObjectId(req.params.id)
            const result = await servicesdetailsCollection.find({_id: id}).toArray()
            res.send(result)
        })
        app.post('/servicesadd', async (req, res)=>{
            const data = req.body
            const result = await myservicesCollection.insertOne(data)
            res.send(result)
        })
        app.get('/myservices/:id', async (req, res)=>{
            const id = req.params.id
            const result = await myservicesCollection.find({user_id: id}).toArray()
            res.send(result)
        })
        app.post('/commentadd', async (req, res)=>{
            const data = req.body
            const result = await myreviewsCollection.insertOne(data)
            res.send(result)
        })
        app.get('/commentget/:id', async (req, res)=>{
            const id = req.params.id
            console.log(id)
            const result = await myreviewsCollection.find({service_id: id}).toArray()
            res.send(result)
        })
        app.delete('/commentdelete/:id', async (req, res)=>{
            const id = ObjectId(req.params.id)
            const result = await myreviewsCollection.deleteOne({_id: id})
            res.send(result)
        })
        app.get('/myreviews/:id', async (req, res)=>{
            const id = req.params.id
            const result = await myreviewsCollection.find({user_id: id}).toArray()
            res.send(result)
        })
    }
    finally{

    }
}

serviceFun().catch(err => console.error(err))

app.listen(port)