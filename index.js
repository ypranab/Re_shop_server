const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Phone Re Shop Server is Running.");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nslo89v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const phonesCollection = client.db("phoneResaleDB").collection("phones");
    const usersCollection = client.db("phoneResaleDB").collection("users");
	const brandsCollection = client.db("phoneResaleDB").collection("brands");
    const bookingCollection = client.db("phoneResaleDB").collection("bookings");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/products", async (req, res) => {
      const products = await phonesCollection.find().toArray();
      res.send(products);
    });
	
	app.get('/category/:brand', async (req, res) => {
            const brand = req.params.brand
            const query = { brand: brand }
            const result = await phonesCollection.find(query).toArray();
            res.send(result)
    });
	
	app.get('/brands', async (req, res) => {
            const query = {  }
            const result = await brandsCollection.find(query).toArray();
            res.send(result)
        })

    app.get("/users", async (req, res) => {
      const query = usersCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // Add a new user to the collection
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Update user by id
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      console.log({ user });
      const updatedUser = {
        $set: {
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          photoUrl: user.photoUrl,
          address: user.address,
          //isAdmin: user.isAdmin,
        },
      };

      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
    });

    // Delete user by id
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is Running on Port ${port}`);
});
