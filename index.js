const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Re Shop Server is Running.");
});

const uri = `mongodb+srv://dbuser:K0Xd2F1usJV6yUUb@cluster0.nslo89v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    app.get("/home", (req, res) => {
      res.send("Response sending");
    });

    await client.connect();

    const phonesCollection = client.db("phoneResaleDB").collection("phones");
    const usersCollection = client.db("phoneResaleDB").collection("users");
    const brandsCollection = client.db("phoneResaleDB").collection("brands");
    const bookingCollection = client.db("phoneResaleDB").collection("bookings");

    app.get("/products", async (req, res) => {
      const products = await phonesCollection.find().toArray();
      res.send(products);
    });

    app.get("/category/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/brands", async (req, res) => {
      const query = {};
      const result = await brandsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = usersCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { userId: id };
      const result = await usersCollection.findOne(query);
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
          name: user.displayName,
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

    //add a phone
    app.post("/phones", async (req, res) => {
      const phone = req.body;
      const result = await phonesCollection.insertOne(phone);
      res.send(result);
    });

    // get all bookings
    app.get("/bookings", async (req, res) => {
      const query = {};
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    // get bookings of a user
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      //console.log(decodedEmail)
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const bookings = await bookingCollection.insertOne(booking);
      res.send(bookings);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`Server is Running on Port ${port}`);
});
