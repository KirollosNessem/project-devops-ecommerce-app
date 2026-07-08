const mongoose = require("mongoose");
const fs = require("fs");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
});

const Product = mongoose.model("Product", productSchema);

mongoose
  .connect(
    "mongodb+srv://keronesim:ZJ2xNLSCoSWDtUlj@cloud.f6r1wrp.mongodb.net/ecommerce_db?retryWrites=true&w=majority"
  )
  .then(async () => {
    console.log("Connected");

    const products = JSON.parse(fs.readFileSync("./products.json", "utf8"));

    // إزالة الـ ObjectId الموجود في الملف
    const cleanedProducts = products.map((p) => ({
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
    }));

    await Product.deleteMany({});
    await Product.insertMany(cleanedProducts);

    console.log(`Inserted ${cleanedProducts.length} products`);

    process.exit();
  })
  .catch(console.error);
