const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.47zrhkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect(); // Ensure the connection is established

    const allMobilesCollection = client.db("mobile-store").collection("all-mobile");

    // Get all mobiles with pagination
    app.get("/allmobile", async (req, res) => {
      const { page = 1, limit = 10 } = req.query;

      try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const mobiles = await allMobilesCollection
          .find({})
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();
          
        const totalMobiles = await allMobilesCollection.countDocuments();
        const totalPages = Math.ceil(totalMobiles / limit);

        res.json({
          mobiles,
          totalPages,
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Search functionality
    app.get("/search", async (req, res) => {
        const searchQuery = req.query.q;
        try {
          const products = await allMobilesCollection.find({
            name: { $regex: searchQuery, $options: 'i' }
          }).toArray();
          res.json(products);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error running the server:", error);
  } finally {
    // Do not close client here, it should be managed elsewhere
  }
}

run();


app.get("/", (req, res) => {
    res.send("Mobile Store Server is running!");
  });

  app.listen(port, () => {
    console.log(`Mobile Store is running on Port:${port}`);
  });