const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PUSS}@cluster0.vz2xh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const foodsCollection = client.db("restaurant").collection("foods");
    const purchaseCollection = client
      .db("restaurant")
      .collection("food_purchase");

    // ✅ Get All Foods
    app.get("/foods", async (req, res) => {
      try {
        const result = await foodsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).send({ error: "Failed to fetch foods" });
      }
    });

    // ✅ Get a Single Food by ID
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(400).send({ error: "Invalid ID format" });
      }
    });

    // ✅ Get Foods Added by Logged-in User
    app.get("/my-foods", async (req, res) => {
      try {
        const userEmail = req.query.email; // Get user email from query
        let query = {};
        if (userEmail) {
          query = { sellerEmail: userEmail }; // Ensure this matches the field in your DB
        }
        const result = await foodsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user foods:", error);
        res.status(500).send({ error: "Failed to fetch user foods" });
      }
    });

    // ✅ Add a New Food Item
    app.post("/foods", async (req, res) => {
      try {
        const newFood = req.body;
        const result = await foodsCollection.insertOne(newFood);

        if (result.insertedId) {
          res.send({ success: true, message: "Food item added successfully!" });
        } else {
          res
            .status(500)
            .send({ success: false, message: "Failed to add food item" });
        }
      } catch (error) {
        console.error("Error adding food item:", error);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // ✅ Foods Purchase (Order Placement)
    app.post("/food-purchase", async (req, res) => {
      try {
        const purchase = req.body;
        const result = await purchaseCollection.insertOne(purchase);

        if (result.insertedId) {
          res.send({ success: true, message: "Order placed successfully!" });
        } else {
          res
            .status(500)
            .send({ success: false, message: "Failed to place order" });
        }
      } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Eating good food is essential for good health");
});

app.listen(port, () => {
  console.log(`Server running at: ${port}`);
});
