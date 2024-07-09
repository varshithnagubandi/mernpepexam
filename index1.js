const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

const mongoURI =
  "mongodb+srv://vvvarshithnagubandi:vvv123@cluster0.kfhorcu.mongodb.net/pepexam";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));


const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Product = mongoose.model("Product", productSchema);

app.get("/products", async (req, res) => {
  try {
    const minPrice = parseFloat(req.query.minPrice);

    if (isNaN(minPrice)) {
      return res.status(400).send("Invalid minPrice query parameter");
    }

    const products = await Product.find({ price: { $gt: minPrice } }).sort({
      price: -1,
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
