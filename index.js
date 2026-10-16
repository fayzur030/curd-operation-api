import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
const app = express()
const port = process.env.PORT || 5000
import 'dotenv/config'

//middleware
app.use(cors())
app.use(express.json())

const client = new MongoClient(
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-qe7yfvo-shard-00-00.xvyrvpb.mongodb.net:27017,ac-qe7yfvo-shard-00-01.xvyrvpb.mongodb.net:27017,ac-qe7yfvo-shard-00-02.xvyrvpb.mongodb.net:27017/?ssl=true&replicaSet=atlas-5tj82y-shard-0&authSource=admin`
)

export async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('You successfully connected to MongoDB!')
    return client
  } catch (err) {
    console.dir(err)
  }
}

const connectedClient = await connectToMongoDB()
const db = connectedClient.db('curd-operation')
const users = db.collection('users')

app.get('/', (req, res) => {
  res.send('simple curd server is ruining ')
})

app.get('/users', async (req, res) => {
  const cursor = users.find({})
  const allUsers = await cursor.toArray()
  res.send(allUsers)
})

//find one user
app.get('/users/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await users.findOne(query)
  res.send(result)
})

//delete user
app.delete('/users/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await users.deleteOne(query)
  res.send(result)
})

//update
app.patch('/users/:id', async (req, res) => {
  const id = req.params.id
  const updateUser = req.body
  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true }
  const updateDoc = {
    $set: {
      name: updateUser.name,
      email: updateUser.email,
    },
  }

  const result = await users.updateOne(filter, updateDoc, options)
  res.send(result)
})

// post

app.post('/users', async (req, res) => {
  const newUser = req.body
  console.log('Add new user from client side', newUser)
  const result = users.insertOne(newUser)
  res.send(result)
})

app.listen(port, () => {
  console.log(`Simple curd server is ruining on port ${port}`)
})
